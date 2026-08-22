# 시크릿 로테이션 대장 + 만료 임박 어드민 알림

> 상태: **설계 — 착수 대기** (2026-08-21) · 짝 PR: Api(테이블 마이그레이션) 먼저 → web(UI·알림)
> 배경: 2026-08 운영 장애 — Apple client secret(JWT, 최대 6개월)이 만료돼 애플 로그인이 조용히 죽음.
> 갱신은 수동인데 기록·리마인드가 없어서 만료를 알 수 없었다.

## 목표

1. **기록**: 어드민이 시크릿을 갱신할 때마다 어드민 페이지(운영 탭)에서 갱신일·만료일을 기록
2. **알림**: 만료 임박(D-30) 시 **앱을 연 어드민에게만** 모달 alert — 사람이 캘린더를 기억할 필요 없게

Apple 전용이 아니라 **key 필드로 일반화** — Kakao client secret 로테이션(security-backlog #2), service_role 키(#3)도 같은 대장에 얹는다.

## 설계 (기존 패턴 재사용 — 조사 완료 2026-08-21)

| 결정 | 근거 |
|---|---|
| 저장은 새 테이블 `secret_rotation`, **RLS select/insert 모두 `is_admin`** | 어드민 쓰기 두 관례 중 "직접 insert + RLS" 패턴(공지 `NoticeManager` 방식). admin edge function은 폐기 이력(Api backlog PR C) — 로직 없는 순수 기록이라 함수 불필요. **단 select도 잠금**(시크릿 메타데이터는 일반 사용자에게 노출할 이유 없음 — `using(true)` 관례의 예외) |
| 트리거·RPC 없음 | Api CLAUDE.md "로직은 앱에, DB에는 권한과 데이터만" |
| 알림은 **NoticeDialog 구조 복제** 신규 전역 컴포넌트 | `NoticeDialog`가 "전역 마운트 + 진입 시 useEffect 조건 판정 + Dialog + localStorage 1회 처리"로 요구와 동형. notice 테이블 재사용은 부적합(target에 어드민 개념 없음) |
| 어드민 판정은 `myProfile?.is_admin` | `AdminPage.tsx:28` 확립 패턴. 하드코딩 이메일(MainPage:71) 안 씀 |
| 만료 판정은 클라이언트에서 (`getISOTodayDate(n)` + ISO 비교) | `src/lib/utils.ts` 유틸 재사용, 서버 로직 불필요 |

## 파일 매니페스트

### Api (선행 PR)

| 파일 | 내용 |
|---|---|
| `supabase/migrations/<ts>_add_secret_rotation.sql` (신규) | `secret_rotation` 테이블: `id uuid pk` · `key text not null`(예: `apple_client_secret`) · `rotated_at timestamptz not null` · `expires_at timestamptz not null` · `memo text` · `created_by uuid references profiles` · `created_at`. RLS: select·insert 모두 `is_admin` (update/delete 없음 — append-only 대장). `rls_auto_enable`가 RLS 켜줌 |
| Api `npm run supabase-sync` | 타입 재생성 |
| `docs/backlog.md` | 자기 단계 한 줄 + 이 계획서 링크 |

### web (후행 PR — Api merge 후)

| 파일 | 내용 |
|---|---|
| `supabase/types/database.ts` | `npm run supabase-sync` 재생성 (`secret_rotation` 타입) |
| `src/apis/secretRotation.ts` (신규) | `fetchLatestRotations(): 키별 최신 1건` · `createRotation(key, rotatedAt, expiresAt, memo)` — 직접 insert(RLS가 강제), 실패 시 Sentry + null 반환 관례 |
| `src/pages/AdminPage/tabs/OperationsTab.tsx` | "시크릿 로테이션 대장" 섹션 추가: 키 선택(`apple_client_secret`·`kakao_client_secret`·기타 입력) + 갱신일(기본 오늘) + 만료일(**Apple 선택 시 +180일 자동 기본값**, 수정 가능) + 메모 → 기록. 아래에 키별 최신 기록·D-day 표시(뱃지 색: 여유 green / D-30 amber / 만료 red — `NoticeManager.noticeStatus()` 패턴) |
| `src/components/admin/SecretExpiryAlert.tsx` (신규) | NoticeDialog 구조 복제: 전역 마운트, `useEffect`에서 ① `myProfile?.is_admin` 아니면 return ② `fetchLatestRotations()` ③ 만료 D-30 이내(또는 만료 지남) 키가 있으면 Dialog 노출("Apple client secret 만료 D-12 — 갱신 후 운영 탭에 기록") ④ localStorage `seenSecretAlert:<key>:<expires_at>:<날짜>` 로 **하루 1회** 제한 |
| `src/App.tsx` | `<SecretExpiryAlert />` 전역 마운트 (`:335` NoticeDialog 형제) |
| `docs/backlog.md` · `docs/security-backlog.md` | 항목 갱신(이 작업 PR에 포함) |

## 알림 정책

- 임계: **D-30부터** 노출, 만료 지나면 문구 강조(빨강). 하루 1회(localStorage), 갱신 기록이 새로 들어오면(만료일 바뀜) 키가 달라져 자동 리셋
- 대상: `is_admin` 사용자만. 일반 사용자는 쿼리 자체가 RLS로 빈 결과 → 부작용 없음

## 첫 데이터 (도입 시)

Apple secret **이번 수동 갱신을 첫 기록으로 입력**(갱신일 = 실제 재발급일, 만료 = +180일). Kakao secret 로테이션(security-backlog #2 잔여)도 하면 그때 기록.

## 검증

1. 로컬: `db reset` 재생 무오류 → 시드 어드민 계정으로 기록 생성 → 일반 계정으로 select 빈 결과(RLS) 확인
2. 만료일을 D-10으로 조작 기록 → 어드민 로그인 시 alert 노출, 일반 계정 미노출, 같은 날 재진입 시 미재노출
3. `npm run lint` + `npm run build`
4. merge 순서: **Api 먼저 → web**

## 관련

- [security-backlog.md](../security-backlog.md) #2(Kakao secret)·#3(service_role) — 같은 대장 사용 예정
- Apple secret 수동 재발급: 원료(.p8)와 절차 요약은 **워크스페이스 `secrets/README.md`**(레포 밖, 커밋 안 됨) — 필요물: .p8·Team ID·Key ID·Services ID

# PrayU 보안 백로그

마이그레이션 체계 도입 과정(2026-06~07, `supabase-migration-plan.md`)에서 발견·정리된 보안 과제 목록.
여기 항목들은 **운영 중 서비스에 대한 변경**이므로 각각 별도 이슈/PR로, 사람 확인 하에 진행한다.
전체 작업 목록은 [backlog.md](backlog.md) 참조.

## 다루는 범위 (2026-07-27 합의)

**계정 탈취·권한 상승·시크릿 노출처럼 실질 피해가 있는 것**만 과제로 삼는다.
"작성 중인 공지를 볼 수 있다" 수준의 정보 노출은 방어 비용 대비 실익이 없어 감수한다 —
막으려고 DB에 노출 규칙을 넣으면 비즈니스 로직이 앱 밖으로 새는 부작용이 더 크다.

## 1. RLS 전면 정비 — 🔴 최우선

현행 정책 대부분이 `USING (true)` 계열의 무제한 허용이다. 원본 목록은 baseline
(`PrayU-Api/supabase/migrations/20260718075321_initial_baseline.sql`)의 `CREATE POLICY` 구문 참조.

핵심 문제 패턴:
- **그룹 격리 부재**: `group`/`member`/`pray`/`pray_card` 의 SELECT 가 `TO authenticated USING (true)` — 로그인만 하면 **소속 무관 전체 그룹의 기도 데이터를 조회 가능**. 기도제목은 민감 정보다
- `bible_card`·`group_union` 등의 UPDATE 도 `USING (true)` (역할만 authenticated)
- 설계 방향: `member` 조인 기반 멤버십 정책으로 재작성 (예: "내가 속한 그룹의 pray_card 만 SELECT")
- 성능 유의: RLS 서브쿼리 도입 시 기존 인덱스(멤버십 조회 경로)와 함께 검토

진행 방식: 테이블별 마이그레이션으로 쪼개서 로컬 → staging에서 앱 전 플로우 회귀 확인 후 prod.
`rls_auto_enable` event trigger(신규 테이블 RLS 자동 활성화)는 prod에 이미 존재 — 유지.

## 2. Kakao client secret 프론트 노출 — 🔴

`VITE_KAKAO_CLIENT_SECRET_KEY` 가 web 번들에 포함된다 (`KakaoTokenRepo.fetchKakaoToken` 이
브라우저에서 직접 kauth.kakao.com 토큰 교환). 조치:
1. 토큰 교환을 Edge Function 으로 이전 (secret 은 함수 시크릿으로)
2. Kakao 콘솔에서 client secret 로테이션 (기존 값은 노출된 것으로 간주)
3. web 에서 `VITE_KAKAO_CLIENT_SECRET_KEY` 제거

## 3. service_role 키(legacy JWT) 로테이션 — ⚠️ 결합 주의

- prod `cron.job` 명령(오늘의기도 리마인더 `net.http_post`)에 **prod service_role JWT 가 하드코딩**돼 있다
- fcm webhook 쪽 하드코딩은 제거 완료 (`drop_legacy_fcm_webhook`)
- **로테이션 시 cron.job 명령 갱신을 동시에** 하지 않으면 리마인더 알림이 죽는다
- 장기적으로는 cron 이 Vault 에서 키를 읽도록 개선 검토

## 4. 어드민 권한 체계 — 이메일 하드코딩 제거

- `AdminPage.tsx` 의 하드코딩 이메일 체크
- `profiles` 의 `admin can update profiles` 정책도 이메일 배열 하드코딩
- 방향: DB 롤 또는 custom claim 기반 권한으로 통일 (1번 RLS 정비와 함께 설계)

## 8. `premium_expired_at` 자기부여 — 🔴 (신규, 2026-07-27 발견)

`profiles`의 `Users can update own profile.` UPDATE 정책은 **본인 행만 가릴 뿐 컬럼을 제한하지 않는다.**
따라서 사용자가 자기 행의 `premium_expired_at`을 임의 값으로 설정해 **프리미엄(그룹 무제한 생성)을 무료로 얻을 수 있다.**

```sql
-- 로컬 실증 (authenticated 롤 + 본인 JWT claim)
update profiles set premium_expired_at = '9999-12-31' where id = <본인>;  -- 성공
```

같은 원인으로 `is_admin`도 자기부여가 가능했으나, 이는 도입 PR(Api#39)에서 **테이블 단위 UPDATE 권한 회수 + 컬럼 단위 재부여**로 차단했다.
`premium_expired_at`을 함께 잠그지 못한 이유는 **어드민 화면이 클라이언트에서 직접 이 컬럼에 쓰기 때문** — 컬럼 권한을 회수하면 어드민 프리미엄 설정이 먼저 깨진다.

조치 계획: 어드민 개편 PR C에서 어드민 쓰기를 `admin` edge function(service role) 경유로 옮긴 뒤, `is_admin`과 동일한 방식으로 컬럼 권한을 회수한다.
참고: 컬럼 목록이 마이그레이션에 명시되므로 **profiles에 컬럼을 추가할 때 grant 목록에도 추가**해야 한다 (누락 시 해당 컬럼 수정이 즉시 실패해 드러남).

## 완료된 항목

- ✅ fcm_notification_webhook 제거 — service_role 키 하드코딩 지점 1곳 소멸 (2026-07-20, Api#28 파이프라인)
- ✅ bible 무제한 쓰기 정책(update/insert `USING(true)`) 제거 (2026-07-24, Api#32)
- ✅ **5번** QT 엔드포인트 LLM 한도 — `llm_usage_log` 기반 일일 10회 + anon 거부 (2026-07-26, Api#35)
- ✅ **6번** authMiddleware JWT 서명 검증 — `supabase.auth.getUser(jwt)` 위임 검증으로 전환, 위조 JWT 차단 e2e 확인 (2026-07-26, Api#36)
- ✅ **7번** `POST /api/users` 제거 — 공개 anon 계정 생성 경로 소멸 (2026-07-26, Api#37)
- ✅ `is_admin` 자기부여 차단 — profiles 테이블 UPDATE 권한 회수 + 컬럼 단위 재부여 (2026-07-27, Api#39)

## 권장 진행 순서

**8**(프리미엄 자기부여 — 금전적 영향이 직접적, PR C와 묶으면 추가 비용 없음) → 2(Kakao secret — 노출 면적이 가장 공개적) → 1(RLS — 파급 크므로 테이블별 분할) → 4(어드민, 1과 함께) → 3(키 로테이션 — 1·2 마무리 후 일괄)

# 카카오 원탭 로그인 — 세션 핸드오프 릴레이 (B안)

> 상태: **설계 확정 — 구현 승인 대기** (2026-08-22) · 짝 PR: **Api(EF+테이블) 먼저 → web** · 사용자 결정: 앱 업데이트 없이 원탭 복원
> 맥락: [PrayU-App/docs/plans/kakao-app-switch-restore.md](../../../PrayU-App/docs/plans/kakao-app-switch-restore.md) (스파이크·대안 비교) · 사건 전체: [../archive/2026-08-auth-incident-retrospective.md](../archive/2026-08-auth-incident-retrospective.md)

## 왜

signInWithOAuth 전환으로 "버튼 원탭 → 카카오톡" UX가 사라졌다. 스파이크(#511, 2026-08-22) 결과:
**발사·인증은 성립**하나 **복귀가 카카오톡 인앱브라우저에 갇힌다**(implicit 토큰이 도착한 곳에 세션 생성).
유니버설 링크는 302 체인에서 미발화, PKCE는 verifier 부재로 그 컨텍스트에서 교환 불가.

**제약(사용자)**: 앱 업데이트를 강제할 수 없다 → 앱 미개입 해법 필요. 검토한 대안:
- A(자체 IdP + admin 세션 발급): 편법 세션 민팅·identity 불일치·중복 계정 리스크 → 기각
- C(PKCE + `prayu://` + 신버전 앱): 유효하나 앱 업데이트 필수 → 보류
- D(Flutter 네이티브): D1은 id_token 차단 동일 벽, D2는 세션 이중 소유 → 보류
- **B(본 설계)**: 완결된 세션을 "원래 컨텍스트"로 릴레이 — 앱 불필요, **구버전 앱 WebView 도 원탭 혜택**

## 원리

인증은 100% Supabase 정식 흐름 그대로 두고, **"카카오톡 브라우저에 생긴 세션을 원래 탭으로 옮기는 1회용 우체통"** 만 만든다.
카카오 kauth 페이지의 톡 버튼이 폴링으로 복귀를 해결하는 것과 같은 원리를 우리 흐름에 재현하는 것.

```
[원래 탭]  ① secret(32B 랜덤) 생성, nonce = SHA-256(secret)   ← nonce 는 secret 의 커밋(역산 불가)
          ② signInWithOAuth(skipBrowserRedirect) — redirectTo = /login-redirect?handoff=<nonce>&path=…
             + sessionStorage 에 개시 마커 저장
          ③ 카카오톡 발사(#511 의 kakaoTalkLaunch 부활) + "카카오톡에서 로그인해주세요" 대기 UI
          ④ EF claim(secret) 1.5초 간격 폴링 (최대 3분, 취소 가능)
[카카오톡 브라우저]
          ⑤ OAuth 완결 → login-redirect?handoff=…#tokens 도착, supabase-js 가 세션 생성
          ⑥ handoff 있음 + 개시 마커 없음(=다른 컨텍스트) → EF deposit(nonce, access+refresh)
          ⑦ 성공 시 **로컬 저장소 제거 + stopAutoRefresh** → "완료, 원래 화면으로"
             ⚠️ signOut 금지 — scope:'local' 조차 서버 revoke 를 호출해 예치 토큰을 죽인다
             (2026-08-23 staging 검증에서 실증: 양쪽 로그아웃 + "Auth session missing!")
[원래 탭]  ⑧ claim 수신 → setSession() → path 목적지로 이동
```

- **nonce=SHA-256(secret) 커밋 구조**: nonce 는 URL 로 흘러 카카오/Supabase 로그·톡 히스토리에 노출될 수 있으나,
  claim 은 **secret**(원래 탭 메모리에만 존재, 리다이렉트 체인 미탑승)을 요구 → URL 노출이 무해. 사전 등록 호출도 불필요
- **같은 컨텍스트 판별 = sessionStorage 개시 마커**: 톡 미설치 폴백(같은 탭이 웹 플로우 진행) 시 마커가 있으므로
  deposit 없이 일반 로그인으로 계속 — 핸드오프는 "다른 컨텍스트에 도착했을 때만" 발동

## 보안 설계

| 위협 | 방어 |
|---|---|
| nonce 추측 | secret 256bit 랜덤 → nonce 는 그 해시 |
| URL(nonce) 노출로 claim | claim 은 secret 필요 — 해시 역산 불가 |
| 위조 토큰 deposit | EF 가 access_token 을 `auth.getUser()` 로 서버 검증 후에만 저장 |
| 재사용/경합 | claim 즉시 행 삭제(1회용) · nonce 당 deposit 1회(중복 409) · TTL 3분 |
| DB 접근 | `auth_handoff` RLS 전면 잠금(정책 0개 = service role 만) · **하드 삭제**(소프트 삭제 관례의 의도적 예외 — 토큰 잔존 방지) |
| 로그 유출 | nonce·secret·토큰을 Sentry/analytics/console 에 기록 금지 |
| EF 남용 | claim 404 는 무해(빈 조회) · deposit 은 유효 세션 보유자만 가능 |

## 파일 매니페스트

### Api PR (선행)

| 파일 | 내용 |
|---|---|
| `supabase/migrations/<ts>_add_auth_handoff.sql` | `auth_handoff`: `nonce text pk` · `access_token text` · `refresh_token text` · `created_at timestamptz default now()`. RLS enable + 정책 없음. 컬럼 최소(유저ID 미저장) |
| `supabase/functions/auth-handoff/index.ts` | Hono 라우트 2개. `POST /deposit {nonce, access_token, refresh_token}`: nonce 형식(64hex) 검증 → `auth.getUser(access_token)` 서버 검증 → 중복 409 → insert. `POST /claim {secret}`: sha256(secret) 조회 → 3분 내면 토큰 반환+행 삭제, 아니면 404. 두 라우트 모두 만료 행 lazy 삭제 |
| `supabase/config.toml` | `[functions.auth-handoff] verify_jwt = false` — claim 은 비로그인 탭이 호출(주석으로 근거 명시, 신규 엔드포인트 체크리스트 준수: anon 허용을 명시적으로 결정) |
| `docs/backlog.md` | 자기 단계 + 본 계획서 링크 |

### web PR (후행 — Api merge 후)

| 파일 | 내용 |
|---|---|
| `src/lib/kakaoTalkLaunch.ts` (부활) | #511 커밋의 검증된 코드 그대로 (`canLaunchKakaoTalk` · `buildTalkLaunchUrl`) |
| `src/lib/authHandoff.ts` (신규) | `createHandoffPair()`(WebCrypto sha256) · `depositSession(nonce)`(현재 세션 토큰 예치) · `claimSession(secret, {signal})`(폴링→토큰) · 개시 마커 헬퍼 |
| `src/components/auth/KakaoLoginBtn.tsx` | 톡 발사 분기 부활 + 핸드오프: pair 생성→발사→폴링→`setSession`→목적지 이동. 대기 UI("카카오톡에서 로그인해주세요"+취소, 3분 타임아웃 후 재시도 안내). 비대상/실패는 현행 웹 리다이렉트 |
| `src/components/auth/LoginRedirect.tsx` | handoff 파라미터 + **개시 마커 없음**이면: deposit → `signOut({scope:'local'})` → "로그인 완료, 원래 화면으로 돌아가 주세요" 화면(일반 리다이렉트 차단). deposit 실패 시 일반 로그인으로 강하(현 스파이크 (b) 수준) + 안내. 마커 있으면 기존 동작 |

## 실패 모드 (전부 현행 이하로 안 떨어짐)

- 톡 미설치 → 발사 URL 내장 폴백 → 같은 탭 웹 플로우(마커로 일반 진행)
- 톡에서 중단/방치 → 폴링 3분 타임아웃 → 재시도 UI
- deposit 실패 → 톡 브라우저에 로그인된 채 종료(현 (b) 수준) + 안내
- 데스크탑·미지원 인앱브라우저 → 기존 웹 플로우 무변경

## 리스크 (명시)

1. **비전형 자체 설계** — 인증 코어는 무변경이나 토큰이 서버를 초 단위 경유. 위 보안 표가 방어선이며 코드 리뷰 필수
2. **implicit flow 의존** — 톡 브라우저에서 세션이 생겨야 deposit 가능. **PKCE 전환(C안)과 상호배타.** Supabase 가 implicit 을 축소하면 재설계(그때 C안으로)
3. 카카오톡 웹뷰의 JS/스토리지 특성 변수 → 실기기 검증으로만 확정
4. ~~`signOut` scope 실수(global) 시 예치 토큰까지 무효화~~ → **정정(2026-08-23)**: `signOut` 은 **scope 무관하게 서버 revoke** —
   완결 컨텍스트 정리는 반드시 로컬 저장소 제거 + `stopAutoRefresh` 로만 한다 (`clearLocalAuthStorage`). 자동 갱신 중지는
   원래 탭과의 refresh token rotation 경합(무작위 로그아웃) 방지도 겸한다

## 검증 (staging + 사용자 폰 브라우저 — dev 빌드 불필요)

1. 폰 사파리/크롬: 버튼 → 카카오톡 → 승인 → **원래 탭 자동 로그인** (핵심)
2. 카카오톡 미설치(또는 데스크탑): 웹 플로우 폴백 정상
3. 톡에서 3분 방치 → 원래 탭 타임아웃 UI
4. 톡 브라우저 쪽: "완료" 화면 표시 + 그 브라우저에 세션 미잔존(local signOut)
5. **구버전 앱 WebView 에서 1번 반복** — 성립 시 전 사용자 원탭 확정
6. 애플·이메일 로그인 회귀 없음 (flowType 무변경이라 영향 없어야 정상)
7. `auth_handoff` 행이 claim 후 삭제되는지, 만료 행 lazy 정리 확인

- merge 순서: **Api 먼저 → web**. staging 검증 후 prod 는 새 배포 정책(Release 태그)으로

## 후속

- 성공 시: PrayU-App 계획서의 C안(신버전 앱 딥링크)은 **불필요 — 보류 확정**. App 결함(W1 onCreateWindow 등)은 품질 트랙(R1~R3)으로 분리 유지
- 실패 시(카톡 웹뷰 변수): C안으로 회귀

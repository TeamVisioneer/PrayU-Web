# 카카오 로그인 OAuth 전환 (signInWithIdToken → signInWithOAuth)

> 상태: **긴급 · 설계 확정 대기** (2026-08-19) — **운영 카카오 로그인 장애 복구**
> 짝 PR: Api 변경은 원칙적으로 불필요(로그인은 대시보드 provider 설정으로 동작). 단 `handle_new_user` 프로필 생성 검증에서 어긋나면 Api 후속 PR 발생 가능 → 아래 "리스크 3" 참조
> merge 순서: web 단독(Api 변경 없을 시). Api 후속이 필요하면 Api 먼저 → web

## 왜 지금 하나 — 운영 장애 원인

2026-08-19, 운영(prod `qggewtakkrwcclyxtxnz`)에서 카카오 로그인이 전면 실패 중. 증상은
`POST /auth/v1/token?grant_type=id_token` → **400**, 응답 본문:

```json
{"message":"API request is blocked. Only Apple, Google, Firebase issuer allowed."}
```

**Supabase(GoTrue) 서버 정책 변경**이다. `signInWithIdToken`(= id_token grant)이 이제 **Apple/Google/Firebase 발급자만** 허용하고 **Kakao를 차단**한다. 우리 코드·env·대시보드는 무변경이며 호스팅 GoTrue 자동 롤아웃으로 배포 없이 적용됨(그래서 "지난주까진 신규 가입됨 → 이번 주 중단"). 라이브러리 deprecation이 아니라 **서버가 Kakao id_token 흐름 자체를 막은 것**이라 클라이언트에서 되돌릴 수 없다.

진단 근거(확인 완료): kauth.kakao.com 토큰 교환 정상 · id_token의 `aud`=대시보드 Client ID 일치 · `iss=https://kauth.kakao.com` · `exp` 미래 · `nonce` 없음 · provider 토글 ON. 표준 검증 이전 단계에서 **발급자(kakao) 자체를 거부**하는 것이라 위 값들이 모두 정상인데도 400.

## 결정 — Supabase 서버사이드 OAuth로 전환

`signInWithIdToken`(브라우저에서 카카오 토큰 직접 교환 → id_token 주입) 방식을 폐기하고,
**`supabase.auth.signInWithOAuth({ provider: "kakao" })`** (Supabase `/auth/v1/authorize` → 카카오 → Supabase 콜백 → `redirectTo`) 로 전환한다. 이 authorization-code 흐름의 Kakao는 **차단 대상이 아니며 정식 지원**된다.

**핵심 단순화 3가지**(조사로 확인):
1. **애플 버튼이 이미 동일 방식으로 동작 중** — `AppleLoginBtn.tsx:13` 이 `signInWithOAuth({provider:"apple", options:{redirectTo}})` 를 쓰고 `redirectTo`가 `/login-redirect`(PrivateRoute)로 간다. PKCE 교환→세션→PrivateRoute 타이밍이 애플에서 이미 검증됨. **카카오 버튼을 애플 버튼과 동형으로 만들면 된다.**
2. **전환 목표 함수가 이미 존재** — `KakaoTokenRepo.openKakaoLoginPageWithSupabase()`(`KakaoTokenRepo.ts:48`)가 `signInWithOAuth` 구현체인데 **현재 아무도 호출 안 함(dead code)**.
3. **access_token 실사용 활성 기능 없음** — 카카오 access_token이 필요한 두 기능(기도요청 메시지·반응 알림톡)이 **둘 다 feature flag OFF**(`MyPrayCardMenuBtn` `canPrayRequest=false`, `ReactionBtn` `kakaoMessageEnabled=false`). 따라서 **로그인 복구에 `provider_token` 재배선이 당장 불필요** → 1단계에서 제외하고 기능 재활성화 때 붙인다.

**부수 효과(이득)**: 브라우저에서 하던 `kauth.kakao.com` 직접 토큰 교환이 사라져 **`VITE_KAKAO_CLIENT_SECRET_KEY` 프론트 노출 문제(security-backlog #2)가 함께 해소**된다. secret은 Supabase 대시보드 provider 설정에만 존재하게 됨.

## 단계 구분

- **1단계 (이 PR, 긴급): 로그인 복구.** 카카오 로그인을 signInWithOAuth로 교체, 수동 교환/쿠키/콜백 잔재 정리. access_token 기능은 손대지 않음(이미 OFF).
- **2단계 (후속, 기능 재활성화 시): provider_token 재배선.** talk_message/friends 기능을 되살릴 때 `session.provider_token`을 `Kakao.Auth.setAccessToken`에 연결하는 로직 신설. security-backlog #2의 "Edge Function 이전"은 이 전환으로 상당 부분 무효화되므로 그 절도 갱신.

---

## 1단계 파일 매니페스트 (구현 승인용)

| 파일 | 현재 | 전환 조치 |
|---|---|---|
| `src/components/auth/KakaoLoginBtn.tsx` | props `redirectUri,state` 로 `Kakao.Auth.authorize` 직접 호출(`:18`) | **애플 버튼 미러링**. props를 `redirectUrl`로 바꾸고 `signInWithOAuth({provider:"kakao", options:{redirectTo:redirectUrl}})` 호출. 1단계는 `scopes` 생략(친구/메시지 동의 최소화 → 신규 가입 마찰↓). 에러는 `Sentry.captureException` |
| `src/components/auth/LogInDrawer.tsx` | `<KakaoLoginBtn redirectUri=.../auth/kakao/callback state=.../>`(`:38`) | 애플과 동일하게 `redirectUrl={.../login-redirect?path=...&from=...}` 전달. `path`는 redirectTo 쿼리로 보존(Supabase가 `?code`만 덧붙임) |
| `src/components/kakao/KakaoCallback.tsx` | `fetchKakaoToken` + `signInWithIdToken`(`:41,:47`) | **제거.** OAuth는 애플처럼 `/login-redirect`로 직행하므로 이 콜백 라우트 불필요. (state의 groupId/path 파싱은 login-redirect 쿼리로 대체) |
| `src/App.tsx` | `/auth/kakao/callback` 라우트(`:166`), `KakaoCallBack` import(`:29`) | 라우트·import 제거 |
| `src/components/kakao/KakaoTokenRepo.ts` | `fetchKakaoToken`·`refreshKakaoToken`·쿠키 4종·`init`·`openKakaoLoginPageWithKakao`·`openKakaoLoginPageWithSupabase` | 1단계에선 **로그인 경로만** 정리: `openKakaoLoginPageWithSupabase`는 KakaoLoginBtn으로 인라인 흡수 후 제거 가능. **`init`/`openKakaoLoginPageWithKakao`/쿠키/교환 로직은 2단계까지 잔존**(단, 아래 MyPrayCardMenuBtn·SettingDialog 참조가 남아있는 한 삭제 금지). `CLIENT_SECRET` 사용부가 사라지면 필드도 제거 |
| `src/components/profile/SettingDialog.tsx` | 로그아웃 시 `cleanKakaoTokensInCookies()`(`:91`) | 쿠키 방식이 로그인에서 빠지면 이 호출은 무해하나, 쿠키 자체를 폐기하는 시점(2단계 or 잔재 정리)에 제거. **1단계에선 유지**(기존 흐름 보존) |
| `supabase/config.toml`(web 로컬) | `[auth.external.kakao]` | 변경 없음(로컬 signInWithOAuth 테스트용으로 이미 enabled) |

> 1단계 최소 변경 원칙: **KakaoLoginBtn + LogInDrawer + KakaoCallback/라우트 제거**가 핵심. KakaoTokenRepo의 access_token 계열(init/authorize/쿠키)과 KakaoController는 feature flag OFF인 기능 전용이므로 **건드리지 않고 남겨** 2단계로 미룬다(회귀면 축소, 되돌리기 쉬움).

## 사람 확인 · 대시보드/외부 설정 (필수 선행)

1. **Supabase 대시보드 → Authentication → URL Configuration → Redirect URLs** 에 `redirectTo`로 쓸 prod/staging URL(`https://<도메인>/login-redirect*`)이 허용 목록에 있는지 확인. 없으면 콜백이 차단됨. (애플이 이미 login-redirect로 도니 등록돼 있을 가능성 큼 — 확인만)
2. **Kakao provider의 Client Secret이 대시보드에 설정**돼 있는지 — 서버사이드 code 교환에 필요. (id_token 방식은 secret 없이도 됐으므로 값이 비어있을 수 있음 → 채워야 함)
3. **Kakao Developers 콘솔 → Redirect URI** 에 Supabase 콜백(`https://qggewtakkrwcclyxtxnz.supabase.co/auth/v1/callback`)이 등록돼 있는지 확인.

## 리스크

1. **WebView 리다이렉트(최우선 검증)** — Flutter InAppWebView 안에서 Supabase→카카오→콜백 전체 리다이렉트가 도는지 실기기 확인. 카카오톡 앱 전환 스킴(`kakaokompassauth`)은 App에 이미 등록됨. **애플 OAuth가 이미 webview에서 동작하므로 경로 자체는 검증됐지만**, 카카오 로그인 페이지 특유의 앱 전환/복귀는 별도 확인.
2. **path/groupId 등 진입 컨텍스트 보존** — 기존 state 방식 대신 redirectTo 쿼리로 넘긴다. 초대 링크(groupId)·복귀 경로(path)·from 이 login-redirect까지 온전히 전달되는지 확인(`LoginRedirect.tsx` 파싱 지점 점검).
3. **프로필 자동 생성(`handle_new_user`)** — 현 트리거는 `raw_user_meta_data`의 `full_name`/`avatar_url`(및 `kakao_id`)을 profiles로 복사. signInWithOAuth(kakao)가 채우는 user_metadata 키가 기존 id_token 방식과 **다를 수 있음** → **신규 카카오 가입자의 프로필이 정상 생성되는지 로컬에서 반드시 검증**. 어긋나면 트리거 조정(Api 후속 PR). 기존 사용자는 이미 auth.users에 있으니 로그인엔 영향 없음(단 provider identity 매칭 확인).
4. **scope 축소 결정** — 1단계에서 friends/talk_message 동의를 빼면 신규 가입 동의창이 가벼워지나, 2단계에서 기능 재활성화 시 재동의 필요. 기존 사용자 동의는 유지됨. (권장: 1단계 최소 scope)

## 검증 (end-to-end)

1. 로컬 스택: `cd PrayU-Api && ./scripts/dev.sh`, `cd PrayU-web && npm run dev` (`.env` → `127.0.0.1:54321`). 로컬 카카오 OAuth는 Kakao 콘솔에 로컬 콜백 등록 필요 — 여의치 않으면 staging에서 검증.
2. **브라우저**: 로그아웃 상태 → 카카오 로그인 → 카카오 동의 → `/login-redirect` 복귀 → 세션 생성 확인. 신규 계정으로 **profiles row 생성** 확인(리스크 3).
3. **초대/복귀 경로**: groupId 초대 링크 진입 → 카카오 로그인 → 해당 그룹으로 복귀 확인.
4. **실기기 WebView(iOS/Android)**: 로그인 리다이렉트·카카오톡 앱 전환·복귀 회귀 확인(리스크 1).
5. `npm run lint` + `npm run build` 통과. Apple 로그인 회귀 없음 확인.
6. 배포: staging(main merge) 검증 후 prod release. **merge/release는 사용자 지시 시.**

## 결정 로그

- [x] **범위 = 최소 복구만** (2026-08-19) — KakaoLoginBtn 애플 동형 교체 + KakaoCallback/라우트 제거. KakaoTokenRepo 쿠키/교환 잔재는 남김(flag OFF 기능 전용, 2단계).
- [x] **scope = 최소** (2026-08-19) — 1단계는 friends/talk_message 동의 제외. 기능 재활성화(2단계) 때 재동의.
- [ ] 대시보드/콘솔 3개 선행 설정 확인(위 "사람 확인" 절) — **사용자 확인 대기**.

## 관련 문서

- 보안: [security-backlog.md](../security-backlog.md) "2. Kakao client secret 프론트 노출" — 이 전환으로 해소, 절 갱신 필요
- 가입 흐름/트리거: [PrayU-Api/docs/backlog.md](../../../PrayU-Api/docs/backlog.md) "가입 흐름 정리" (handle_new_user, Apple/Kakao 프로필 생성)
- 잠재 버그(전환 중 정리): `KakaoCallback.tsx:47` `if (data)` 가 실패해도 truthy라 `signInWithIdToken` 에러가 Sentry로 안 가고 삼켜짐 — 콜백 제거로 자연 해소

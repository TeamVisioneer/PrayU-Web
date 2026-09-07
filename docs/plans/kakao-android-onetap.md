# 안드로이드 카카오 원탭 복원 (B′) — 카카오톡 로그인 액티비티 직접 호출

주도: web · 짝: Api(`auth-handoff` EF 에 `resolve` 추가) · 앱 변경 **없음**
선행: [archive/kakao-login-handoff.md](../archive/kakao-login-handoff.md)(릴레이) · 사건: [backlog.md](../backlog.md) "2026-09-06 안드로이드 원탭 불가"

## 왜

v0.16.0 의 안드로이드 발사(`intent://inappbrowser`)는 iOS 스킴을 유추한 것이라 동작하지 않았고, v0.16.1 로 안드로이드는 웹 플로우로
내려놓았다. 로그인은 사용자가 익숙한 UX 를 벗어나면 안 된다 — 안드로이드도 "버튼 → 카카오톡 → 자동 복귀"여야 한다.

## SDK 가 실제로 하는 것 (kakao.min.js 2.7.2 실측)

안드로이드 `throughTalk` 은 카카오톡 **로그인 액티비티를 explicit intent 로 직접 연다**:

```
intent:#Intent;
  action=com.kakao.talk.intent.action.CAPRI_LOGGED_IN_ACTIVITY;
  launchFlags=0x08880000;
  S.com.kakao.sdk.talk.appKey=<앱 키>;
  S.com.kakao.sdk.talk.redirectUri=<redirect_uri>;
  S.com.kakao.sdk.talk.kaHeader=<KA 헤더>;
  S.com.kakao.sdk.talk.extraparams=<encodeURIComponent(JSON(authorize 파라미터))>;
  [S.com.kakao.sdk.talk.state=<state>;]
  S.browser_fallback_url=<encodeURIComponent(웹 폴백 URL)>;
end;
```

- `extraparams` = `{ client_id, redirect_uri, response_type:"code", scope?, prompt?, state?, nonce?, auth_tran_id:<랜덤 60자>, is_popup:true }`
- KA 헤더 = `sdk/2.7.2 os/javascript sdk_type/javascript lang/<navigator.language> device/<platform, 공백→_> origin/<encodeURIComponent(location.origin)>`
  → kauth 가 `origin` 을 앱의 **Web 플랫폼 등록 도메인**과 대조한다 (prayu.site · staging.prayu.site 등록 확인 필요)
- 카카오톡이 동의 화면 → 인가코드 발급 → `redirect_uri?code=…&state=…` 를 브라우저로 연다(어느 브라우저인지는 실기기에서 확인, 아래 "복귀")

## 왜 그대로 못 쓰나 → 서버가 `state` 를 대신 꺼내 준다

`redirect_uri` 는 Supabase 콜백(`/auth/v1/callback`)이고, 그 콜백은 GoTrue 가 서명한 `state` 가 있어야 처리된다.
`state` 는 GoTrue 가 `/auth/v1/authorize` 를 처리할 때 만들어 **302 Location 에만** 실어 보내므로 브라우저 JS 는 못 본다(불투명 리다이렉트).

→ **Edge Function 이 같은 authorize URL 을 `redirect: "manual"` 로 호출해 Location(kauth authorize URL)을 읽고, 그 쿼리
(`client_id`·`redirect_uri`·`state`·`scope`…)를 돌려준다.** 클라이언트는 그 값으로 위 intent 를 조립한다.
GoTrue 입장에선 정상 authorize 1회와 동일하고, state 는 어차피 URL 에 노출되는 값이다(implicit flow, 만료 있음).

## 플로우 (안드로이드)

1. 버튼 → `createHandoffPair()` (secret/nonce, 릴레이 기존) → `signInWithOAuth({ skipBrowserRedirect:true, redirectTo: …?handoff=nonce })` → `data.url`
2. **`auth-handoff` EF `resolve`** 에 `data.url` 전달 → `{ clientId, redirectUri, state, scope, prompt }`
3. `buildAndroidTalkIntent(resolved, fallback=data.url)` → `window.location.href = intent`
   - 앱(WebView): 기존 네이티브 `handleIntent` 가 `Intent.parseUri → startActivity` (지금도 카카오톡을 여는 그 경로). 매니페스트 `<queries>` 에 `com.kakao.talk` 이미 있음 → **앱 업데이트 불필요**
   - 크롬/삼성브라우저: 브라우저가 intent 를 처리 (SDK 와 동일)
   - 카카오톡 미설치/실패 → `browser_fallback_url`(=`data.url`) 을 같은 창에 로드 → 개시 마커로 웹 플로우 완결 (기존)
4. 카카오톡 동의 → 카카오톡이 `callback?code&state` 를 연다 → Supabase 가 code 교환(REST 키+secret) → `login-redirect?handoff=nonce#tokens`
5. **복귀 = 릴레이 그대로**: 그 페이지가 어디서 열리든(기본 브라우저·카카오톡 인앱·App Links 로 앱) —
   - 개시 마커 없는 컨텍스트 → 예치 + 완료 카드, 앱의 버튼 화면이 폴링으로 수령 (iOS 와 동일)
   - App Links 로 앱 WebView 에 열리면 마커가 있어 그 자리에서 로그인

## 키 선택 — 실기기에서 결정 (계획상 미확정)

| 조합 | appKey | extraparams.client_id | 근거 |
|---|---|---|---|
| ① | REST 키(resolve 가 준 client_id) | REST 키 | Supabase 와 동일 client_id. 가장 일관 |
| ② | JS 키(`VITE_KAKAO_JAVASCRIPT_KEY`) | REST 키 | SDK 는 appKey 로 JS 키를 보낸다. 카카오톡이 키 종류를 검사할 가능성 대비 |

같은 앱의 키끼리는 code 플로우에서 호환(JS 키로 authorize → REST 키로 교환이 SDK 표준 플로우). ①부터 시도, 실패 시 ②.

## 안전장치

- **타임아웃 폴백 버튼**: 폴링 3분 타임아웃 시 안드로이드에는 "카카오 계정으로 로그인" 보조 버튼을 노출해 웹 플로우로 탈출. v0.16.0 처럼 갇히지 않게
- **환경 플래그 없음** — 대신 실기기 검증 전 출고 금지. staging 은 안드로이드 크롬 `staging.prayu.site` 로 intent·카카오톡·릴레이 전 구간 검증 가능(앱 없이). 앱 경로는 intent 핸들러만 다르고 그건 이미 실증됨
- `resolve` 는 SSRF 방지로 **자기 Supabase 호스트의 `/auth/v1/authorize` 만** 허용

## 파일 매니페스트

### Api
| 파일 | 변경 |
|---|---|
| `supabase/functions/auth-handoff/authHandoffController.ts` | `resolveAuthorize({ authorizeUrl })` 추가: 호스트·경로 검증 → `fetch(url, { redirect:"manual" })` → `Location` 파싱 → `{ clientId, redirectUri, state, scope?, prompt? }`. Location 없음/비 kauth 이면 400 |
| `supabase/functions/auth-handoff/index.ts` | 라우팅에 `resolve` 액션 추가 (deposit/claim 과 동일 형식) |
| `docs/backlog.md` | 한 줄 + 이 문서 링크 |

### web
| 파일 | 변경 |
|---|---|
| `src/lib/authHandoff.ts` | `resolveAuthorize(authorizeUrl)` — EF `resolve` 호출, 타입 `ResolvedAuthorize` |
| `src/lib/kakaoTalkLaunch.ts` | `canLaunchKakaoTalk`: Android 복원(인스타/페북 인앱 제외 유지). `buildTalkLaunchUrl` 의 Android 분기 삭제 → `buildAndroidTalkIntent(resolved, fallbackUrl, appKey)` 신설(위 intent 조립, KA 헤더·`auth_tran_id` 생성). iOS 분기 그대로 |
| `src/components/auth/KakaoLoginBtn.tsx` | `talkLaunchLogin` 에 Android 분기: `resolveAuthorize` → intent. resolve 실패 → 웹 플로우. 타임아웃 시 안드로이드 보조 버튼 |
| `src/env` (해당 위치) | JS 키 env 는 이미 있으면 재사용, 없으면 추가하지 않는다(① 우선) |
| `docs/backlog.md` | 진행 상태 |

## 검증 순서

1. 로컬: EF `resolve` 가 로컬 GoTrue authorize 의 Location 을 파싱하는지 (curl)
2. staging(안드로이드 크롬, 실기기): 버튼 → 카카오톡 동의 → 어느 브라우저로 복귀하는지 기록 → 릴레이 수령 → 로그인. 키 조합 ①/②
3. staging(iOS): 회귀 없음
4. prod: Api release(`resolve`) → web release. 앱은 기존 버전 그대로 리포터(안드로이드)에게 재확인 요청

## 미결·리스크
- 카카오톡이 `callback` 을 여는 브라우저가 카카오톡 인앱이면 완료 카드 문구("로그인하던 화면으로")가 그대로 맞고, 기본 브라우저면 창 하나가 더 남는다 — iOS 와 동일한 수준
- kauth 의 origin 검사: staging.prayu.site 가 Web 플랫폼에 등록돼 있는지 사람 확인
- `launchFlags=0x08880000` 은 SDK 값 그대로 쓴다 (의미 해석보다 동일 재현 우선)

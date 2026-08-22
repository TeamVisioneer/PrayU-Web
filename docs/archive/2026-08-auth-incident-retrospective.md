# 2026-08 로그인 장애 대응 기록 — 카카오·애플 로그인 복구와 구조 개선

> 기간: 2026-08-19 ~ 2026-08-22 · 상태: **완결 기록** (archive — 갱신하지 않음. 후속 작업은 각 backlog/계획서 참조)
> 대상 독자: 이 사건을 처음 접하는 사람. 배경 지식 없이 읽을 수 있도록 개념부터 설명한다.

## 요약 (TL;DR)

운영(prod)에서 **카카오 로그인과 애플 로그인이 동시에, 서로 다른 이유로** 죽어 있었다.

| 장애 | 원인 | 해결 |
|---|---|---|
| 카카오 로그인 400 | Supabase 서버가 `signInWithIdToken`(id_token 방식)을 **Apple/Google/Firebase 전용으로 차단** — 카카오가 막힘. 우리 코드/설정 무변경 상태에서 서버 측 정책 변경으로 발생 | 로그인 방식을 **서버사이드 OAuth**(`signInWithOAuth`)로 전환 (PR #509 → prod v0.15.2) |
| 애플 로그인 무반응 | Supabase에 넣어둔 **Apple client secret(JWT)이 만료** — 애플 정책상 최대 6개월짜리인데 갱신 기록·알림이 없었음 | 새 JWT 재발급 → Supabase Apple provider 교체 (2026-08-22, 다음 만료 2027-02-18) |

대응 과정에서 **배포 사고 1건**(잘못된 기준 커밋으로 hotfix 배포 → 18커밋 유실 → 즉시 복구)이 있었고, 그 재발 방지로 **prod 배포 정책을 태그(Release) 단일 경로로 재설계**했다(PR #510). 또 시크릿 관리 체계(`secrets/`), 만료 알림 기능 계획, App(Flutter) 코드 결함 대장이 만들어졌다.

---

## 1. 배경 지식 — 이걸 알아야 사건이 이해된다

### 1-1. PrayU의 로그인 구조

PrayU는 자체 회원 DB를 만들지 않고 **Supabase Auth**(GoTrue라는 인증 서버)를 쓴다. 사용자는 카카오/애플 계정으로 로그인하고, Supabase가 그 신원을 확인한 뒤 우리 서비스용 세션을 발급한다.

외부 계정으로 로그인시키는 방법은 크게 두 가지다:

- **id_token 직접 주입 (`signInWithIdToken`)** — 우리 프론트가 카카오와 직접 통신해 "이 사람이 누구인지 증명하는 토큰(id_token)"을 받아온 뒤, 그 토큰을 Supabase에 건네며 "검증하고 세션 줘"라고 하는 방식. **사건 전까지 카카오 로그인이 이 방식이었다.**
- **서버사이드 OAuth (`signInWithOAuth`)** — 브라우저가 Supabase → 카카오 → Supabase 순서로 리다이렉트 여행을 하고, 토큰 교환은 전부 **Supabase 서버가** 수행하는 표준 방식. **애플 로그인은 원래 이 방식이었고, 사건 후 카카오도 이 방식이 됐다.**

```
[서버사이드 OAuth 흐름]
우리 웹 ─① signInWithOAuth→ Supabase /authorize ─②→ 카카오/애플 승인 화면
     ─③ 승인, code 전달→ Supabase /auth/v1/callback
     ─④ Supabase가 code+secret으로 토큰 교환, 세션 생성
     ─⑤→ 우리 웹 redirectTo(/login-redirect)로 귀환, JS가 세션 확립
```

### 1-2. 세 개의 앱, 하나의 로그인

PrayU는 세 레포로 구성된다: **PrayU-Api**(Supabase 백엔드), **PrayU-web**(React 프론트), **PrayU-App**(web을 WebView로 감싸는 Flutter 셸). 로그인 코드는 전부 web에 있고, 앱은 그 웹을 표시할 뿐이다 — 그래서 로그인 장애의 수정도 web에서 이뤄졌다.

### 1-3. "코드를 안 바꿨는데 갑자기 깨진다"가 가능한 이유

이번 사건의 공통 패턴이다. 우리 배포 없이도 깨질 수 있는 외부 변수가 셋 있다:

1. **호스팅 Supabase(GoTrue)는 자동 업그레이드된다** — 서버 정책이 바뀌면 우리 배포 없이 즉시 적용된다 (카카오 장애의 원인)
2. **시한부 시크릿** — Apple client secret은 우리가 만들어 넣는 JWT인데 애플이 수명을 최대 180일로 강제한다. 시간이 지나면 저절로 죽는다 (애플 장애의 원인)
3. **외부 콘솔 설정** — 카카오/애플 개발자 콘솔, Supabase 대시보드 설정은 git 밖에 있다

---

## 2. 카카오 로그인 장애 (2026-08-19 발견)

### 증상과 진단

`POST /auth/v1/token?grant_type=id_token` 이 전부 **400**. 진단 과정에서 확인한 것:

- 카카오 토큰 교환(kauth.kakao.com)은 정상 — id_token은 잘 받아오고 있었다
- id_token의 `aud`(대상 앱)·`iss`(발급자)·`exp`(만료)·nonce 전부 정상, Supabase 카카오 provider 토글도 ON
- 즉 **표준 검증 항목이 모두 정상인데 거부** → 서버가 검증 이전 단계에서 자르고 있다는 뜻

결정타는 실패 요청을 curl로 재현해 받은 응답 본문이었다:

```json
{"message":"API request is blocked. Only Apple, Google, Firebase issuer allowed."}
```

**Supabase가 id_token grant 자체를 Apple/Google/Firebase 발급자 전용으로 잠근 것.** 카카오는 이 문으로 더 이상 들어갈 수 없다. 우리 잘못도, 라이브러리 문제도 아니며 클라이언트에서 되돌릴 방법이 없다.

참고: 이 에러가 Sentry에 안 잡혔던 이유도 발견했다 — `KakaoCallback.tsx`가 `if (data)`로 분기하는데 supabase-js는 실패 시에도 truthy한 `{user:null, session:null}`을 돌려줘서 에러 가지가 영영 실행되지 않았다 (조용한 장애의 전형).

### 해결 — signInWithOAuth 전환

이미 정상 동작하던 **애플 로그인 버튼과 동형**으로 카카오 버튼을 교체했다. 핵심 단순화 요인:

1. 목표 함수가 사실상 코드에 이미 있었고(미사용 `openKakaoLoginPageWithSupabase`), 애플이 같은 경로를 검증해준 상태
2. 카카오 access_token이 필요한 기능(친구 초대·알림톡)은 **전부 feature flag OFF**라 로그인 복구에서 분리 가능 → 변경을 2개 파일로 최소화
3. 부수 효과: 브라우저에서 하던 토큰 직접 교환이 사라져 **client secret 번들 노출 문제(security-backlog #2)가 함께 해소**

선행 확인(대시보드): Supabase Redirect URLs 허용, 카카오 provider Client Secret 입력, 카카오 콘솔에 Supabase 콜백(`.../auth/v1/callback`) Redirect URI 등록.

상세 설계: [plans/kakao-oauth-migration.md](../plans/kakao-oauth-migration.md) · PR [#509](https://github.com/TeamVisioneer/PrayU-Web/pull/509)

### 트레이드오프 — 카카오톡 앱 전환 UX 상실

구 방식은 카카오 **JS SDK**가 모바일에서 카카오톡 앱으로 전환(간편로그인)시켜 줬다. 새 방식은 카카오 "웹" 로그인 페이지로 가는 순수 리다이렉트라 그 방아쇠가 사라졌다. Flutter 셸의 스킴 처리(`intent:`만 지원)가 구 방식 전용이었다는 것도 확인됐다. 복원 계획은 App 레포에 있다: `PrayU-App/docs/plans/kakao-app-switch-restore.md` (실기기 검증 필요로 대기 중).

---

## 3. 배포 사고와 배포 정책 재설계

### 사고 — 잘못된 기준 커밋에서 hotfix 배포 (2026-08-19~20)

카카오 수정을 prod로 내보낼 때 **"최신 git 태그 v0.15.0 = 현재 prod"라고 가정**하고 그 태그에서 hotfix 브랜치를 만들었다. 그러나 실제 prod는 태그가 아니라 **`hotfix:` PR로 배포된 커밋(40de50b)** 이었고, v0.15.0은 그 커밋의 조상도 아닌 분기 라인이었다. 결과: **prod가 18커밋 과거로 롤백**된 채 배포됐다 (감사카드·그룹 리마인더 등 실기능 포함).

복구는 명확했다: 진짜 prod(40de50b) 위에 카카오 수정만 cherry-pick한 `v0.15.2`를 만들어 재배포. 유실분 전부 복원 + 수정 유지.

**교훈: "현재 prod가 어떤 커밋인가"에 단일한 답이 없으면 언젠가 이런 사고가 난다.** 당시 prod로 가는 길이 3개(release 발행 / `v*` 브랜치 push / `hotfix:` PR→main)였고, 각각이 서로 다른 "현재 prod"를 만들 수 있었다. 특히 `hotfix:` PR 경로는 미출시 작업이 쌓인 main 전체를 통째로 prod에 내보내는 지뢰였다.

### 재설계 — "모든 prod 배포는 태그를 남긴다" (PR #510)

원리 하나로 정리했다: **prod로 나가는 유일한 길 = GitHub Release(태그) 발행.** 그러면 "최신 Release = 현재 prod"가 항상 참이 되어 애매함이 사라진다.

- 정식 배포: minor Release `vX.Y.0` 발행
- 핫픽스: **최신 태그에서 분기** → 수정 → patch Release `vX.Y.Z` 발행 → main으로 포워드포트
- 버전 정합: `scripts/release.sh`로 package.json 범프를 **릴리스 커밋에 포함**시키고, CI가 **태그≠package.json 버전이면 배포를 실패**시킨다(깜빡해도 조용히 잘못 나가지 않음)
- 이중 배포 방지 `concurrency` 가드 추가 (실제로 중복 트리거 사례 있었음)

절차 상세: [guides/deployment-runbook.md](../guides/deployment-runbook.md)

---

## 4. 애플 로그인 장애 (2026-08-20 발견, 08-22 복구)

### 증상과 원인

"OS 승인창까지는 뜨는데 앱이 무반응." 이는 위 OAuth 흐름의 ④(Supabase↔애플 토큰 교환)가 실패하는 전형이다.

원인은 **Apple client secret 만료**. 애플의 이 secret은 고정 문자열이 아니라 **개발자가 `.p8` 개인키로 직접 서명해 만드는 JWT이며, 애플이 수명을 최대 180일로 강제**한다. 그런데:

- 애플은 만료를 **알려주지 않는다** — 자가 서명 토큰이라 애플은 그 존재 자체를 모른다 (인증서류와 다름)
- Supabase도 알려주지 않는다 — 만료돼도 대시보드에 표시가 없다
- 애플 로그인 버튼은 iOS 앱에서만 노출되어 **수개월간 아무도 눈치채지 못했다**

추가 맥락: 앱 소유 계정 이전(2025-09경)이 있었다. Keys/Certificates/Profiles는 팀 자산이라 이전을 따라가지 않는데, 다행히 새 계정에 키(`SYPTQANH7Q`)·Services ID(`app.com.team.visioneer.prayu`)·Return URL이 모두 재구성돼 있었다. 그 시점에 만든 secret이 180일 뒤(2026-03경) 만료된 것으로 추정된다.

### 해결

의존성 없는 로컬 스크립트(`secrets/apple/generate-apple-jwt.mjs`)로 새 JWT를 서명 → Supabase prod Apple provider의 Secret Key 교체 → 실기기 확인. **다음 만료: 2027-02-18** (갱신 기록: `secrets/README.md` 대장, 캘린더 D-30 알림 병행).

### 재발 방지 (계획)

"수동 갱신 + 사람 기억"이 근본 문제이므로, **시크릿 로테이션 대장 + 만료 임박 알림**을 설계했다: 어드민이 갱신을 기록하는 `secret_rotation` 테이블(Api) + 운영 탭 UI + **만료 D-30부터 어드민에게만 앱 내 모달**(web). Apple 전용이 아니라 key 필드로 일반화해 카카오 secret 등도 같은 대장을 쓴다. → [plans/secret-expiry-admin-alert.md](../plans/secret-expiry-admin-alert.md) (구현 대기)

---

## 5. 곁가지로 정리된 것들

- **App(Flutter) 코드 결함 대장** — 로그인 조사 중 셸 코드의 결함 다수 발견(새 창 미처리, env flavor 미배선, JS 주입 취약 등 21건). 전수 감사 후 `PrayU-App/docs/guides/app-audit-ledger.md`에 기록, R1(WebView 코어)·R2(env flavor)·R3(정리) 로드맵 수립. R1/R2 계획서 작성 완료, 실기기 확보 후 착수 예정
- **시크릿 관리 체계** — 워크스페이스 루트(어느 git 레포에도 속하지 않음)에 `secrets/` 신설: Apple `.p8`·JWT 생성기, **안드로이드 서명 키(key.jks) 백업**(이전엔 로컬 한 벌뿐이었음), 갱신 기록 대장. 권한 700/600, `.gitignore` `*` 이중 방어
- **legacy/ 삭제** — 옛 프로젝트 2개(1.5GB). 원격 push 완료·민감정보 없음·현행 참조 없음 확인 후 제거
- **staging Supabase URL 설정 이슈 발견** — Redirect URLs에 staging 도메인이 없어 로그인 후 vercel.app 도메인으로 폴백. 대시보드 정리 필요 (backlog)

## 6. 남은 작업 (원본은 각 backlog)

| 작업 | 위치 |
|---|---|
| 카카오톡 앱 전환 UX 복원 (R1, 실기기 필요) | `PrayU-App/docs/plans/kakao-app-switch-restore.md` |
| App env flavor 배선 (R2, 시뮬레이터로 가능) | `PrayU-App/docs/plans/r2-env-flavor.md` |
| 시크릿 로테이션 대장 + 어드민 alert 구현 | [plans/secret-expiry-admin-alert.md](../plans/secret-expiry-admin-alert.md) |
| staging Supabase URL Configuration 정리 | [backlog.md](../backlog.md) |
| Apple secret 차기 갱신 (2027-02-18 만료, D-30 알림) | `secrets/README.md` 대장 |

## 7. 이 사건이 남긴 원칙

1. **"코드 무변경"은 알리바이가 아니다** — 호스팅 서비스 정책, 시한부 시크릿, 외부 콘솔은 우리 배포와 무관하게 움직인다. 조용한 장애(silent failure)는 에러 처리 버그와 겹치면 수개월 은폐된다
2. **"현재 prod가 무엇인가"는 항상 단일한 답이 있어야 한다** — 배포 경로가 여러 개면 언젠가 어긋난다. 모든 prod 배포는 태그를 남긴다
3. **만료되는 것은 기록하고, 기록은 알림으로 이어져야 한다** — 사람의 기억은 6개월을 못 간다
4. **에러는 삼키지 않는다** — `if (data)` 한 줄이 진단을 몇 시간 늦췄다. 실패 경로가 실제로 실행되는지 확인한다

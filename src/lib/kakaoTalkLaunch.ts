// 카카오톡 앱 전환(원탭 간편로그인) 발사 유틸.
//
// 배경: 카카오 로그인이 signInWithOAuth(웹 리다이렉트)로 바뀌며 구 JS SDK(throughTalk)가
// 해주던 "버튼 → 카카오톡 앱" 전환이 사라졌다. SDK(kakao.min.js 2.7.2) 소스 분석으로
// 확인한 발사 메커니즘을 재현하되, 실어 보내는 URL 만 Supabase authorize URL 로 바꾼다.
// (카카오톡이 in-app browser 로 그 URL 을 열면 302 를 따라 kauth 로 가 간편로그인이 뜬다)
//
// - iOS:     https://talk-apps.kakao.com/scheme/<enc(kakaotalk://inappbrowser?url=...)>&web=<enc(폴백)>
//            → 유니버설 링크라 WKWebView/사파리 어디서든 OS 가 카카오톡을 연다. 미설치면 web= 으로 폴백
// - Android: ⚠️ 발사하지 않는다 (2026-09-06 hotfix). SDK 는 Android 에서 inappbrowser 를 쓰지 않고
//            카카오톡 로그인 액티비티(CAPRI_LOGGED_IN_ACTIVITY) explicit intent 를 쓴다 — 그 경로는
//            Supabase authorize 의 state 를 클라이언트가 알 수 없어 그대로 재현할 수 없다.
//            아래 intent://inappbrowser 는 iOS 스킴을 유추해 만든 것으로 안드로이드 카카오톡은
//            빈 인앱브라우저만 연다(운영 리포트). 안드로이드는 같은 창 웹 플로우로 로그인한다.
//            복원 계획: docs/backlog.md "안드로이드 카카오 원탭"
//
// 복귀는 세션 핸드오프 릴레이가 담당한다: docs/plans/kakao-login-handoff.md

const TALK_UNIVERSAL_LINK = "https://talk-apps.kakao.com/scheme/";
const TALK_INAPP_SCHEME = "kakaotalk://inappbrowser";
const TALK_ANDROID_PACKAGE = "com.kakao.talk";

const getUA = () => window.navigator.userAgent.toLowerCase();

const isIOS = (ua: string) => /iphone|ipad|ipod/.test(ua);
const isAndroid = (ua: string) => /android/.test(ua);

/**
 * 카카오톡 앱 전환을 시도할 환경인가.
 * iOS 만 (SDK 의 iOS 경로를 재현한 것이고 Android 경로는 재현 불가 — 상단 주석).
 *
 * 카카오톡 인앱브라우저(초대 링크로 진입한 멤버 등)도 제외한다 — 이미 카카오 컨텍스트라
 * 같은 창 웹 플로우가 최선이고(릴레이·완료 화면 불필요, 로그인 후 그 자리에서 계속),
 * 톡 안에서 다시 톡을 여는 스킴은 동작이 보장되지 않는다.
 */
export const canLaunchKakaoTalk = (): boolean => {
  const ua = getUA();
  // Android 는 검증된 발사 경로가 없다 — 웹 플로우로 (파일 상단 주석)
  if (!isIOS(ua)) return false;
  if (/kakaotalk/.test(ua)) return false;
  return true;
};

/**
 * authorize URL 을 카카오톡 앱으로 여는 발사 URL 로 감싼다.
 * @param authorizeUrl Supabase signInWithOAuth({skipBrowserRedirect:true}) 가 준 URL
 * @param webFallbackUrl 카카오톡 미설치/실패 시 이동할 URL (보통 authorizeUrl 그대로)
 */
export const buildTalkLaunchUrl = (
  authorizeUrl: string,
  webFallbackUrl: string,
): string => {
  const scheme = `${TALK_INAPP_SCHEME}?url=${encodeURIComponent(authorizeUrl)}`;

  // 미검증 경로(안드로이드 카카오톡에서 빈 인앱브라우저) — canLaunchKakaoTalk 가 Android 를 막는다
  if (isAndroid(getUA())) {
    return [
      `intent://inappbrowser?url=${encodeURIComponent(authorizeUrl)}#Intent`,
      `scheme=kakaotalk`,
      `package=${TALK_ANDROID_PACKAGE}`,
      `S.browser_fallback_url=${encodeURIComponent(webFallbackUrl)}`,
      `end;`,
    ].join(";");
  }

  return `${TALK_UNIVERSAL_LINK}${encodeURIComponent(scheme)}&web=${encodeURIComponent(webFallbackUrl)}`;
};

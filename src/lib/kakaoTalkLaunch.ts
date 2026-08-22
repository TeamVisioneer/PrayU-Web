// 카카오톡 앱 전환(원탭 간편로그인) 발사 유틸.
//
// 배경: 카카오 로그인이 signInWithOAuth(웹 리다이렉트)로 바뀌며 구 JS SDK(throughTalk)가
// 해주던 "버튼 → 카카오톡 앱" 전환이 사라졌다. SDK(kakao.min.js 2.7.2) 소스 분석으로
// 확인한 발사 메커니즘을 재현하되, 실어 보내는 URL 만 Supabase authorize URL 로 바꾼다.
// (카카오톡이 in-app browser 로 그 URL 을 열면 302 를 따라 kauth 로 가 간편로그인이 뜬다)
//
// - iOS:     https://talk-apps.kakao.com/scheme/<enc(kakaotalk://inappbrowser?url=...)>&web=<enc(폴백)>
//            → 유니버설 링크라 WKWebView/사파리 어디서든 OS 가 카카오톡을 연다. 미설치면 web= 으로 폴백
// - Android: intent://inappbrowser?url=...#Intent;scheme=kakaotalk;package=com.kakao.talk;
//            S.browser_fallback_url=...;end; → 크롬/웹뷰가 앱을 열고, 미설치면 fallback_url 로
//
// 계획·검증: PrayU-App/docs/plans/kakao-app-switch-restore.md ("발사 메커니즘 조사 결과")

const TALK_UNIVERSAL_LINK = "https://talk-apps.kakao.com/scheme/";
const TALK_INAPP_SCHEME = "kakaotalk://inappbrowser";
const TALK_ANDROID_PACKAGE = "com.kakao.talk";

const getUA = () => window.navigator.userAgent.toLowerCase();

const isIOS = (ua: string) => /iphone|ipad|ipod/.test(ua);
const isAndroid = (ua: string) => /android/.test(ua);

/**
 * 카카오톡 앱 전환을 시도할 환경인가.
 * SDK 와 동일 기준: 모바일(iOS/Android)만, Android 인스타/페북 인앱브라우저는 제외.
 */
export const canLaunchKakaoTalk = (): boolean => {
  const ua = getUA();
  if (!isIOS(ua) && !isAndroid(ua)) return false;
  if (isAndroid(ua) && /instagram|fb_iab/.test(ua)) return false;
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

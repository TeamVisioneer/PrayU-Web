// 카카오톡 앱 전환(원탭 간편로그인) 발사 유틸.
//
// 배경: 카카오 로그인이 signInWithOAuth(웹 리다이렉트)로 바뀌며 구 JS SDK(throughTalk)가
// 해주던 "버튼 → 카카오톡 앱" 전환이 사라졌다. SDK(kakao.min.js 2.7.2) 소스 분석으로
// 확인한 발사 메커니즘을 OS 별로 그대로 재현한다. 복귀는 세션 핸드오프 릴레이가 담당한다
// (docs/archive/kakao-login-handoff.md).
//
// - iOS:     https://talk-apps.kakao.com/scheme/<enc(kakaotalk://inappbrowser?url=<authorize URL>)>&web=<enc(폴백)>
//            유니버설 링크라 WKWebView/사파리 어디서든 OS 가 카카오톡을 열고, 톡이 인앱브라우저로
//            authorize URL 을 열어 302 를 따라 kauth 간편로그인이 뜬다. 미설치면 web= 으로 폴백
// - Android: 카카오톡 로그인 액티비티를 explicit intent 로 직접 연다 (SDK 와 동일 —
//            inappbrowser 스킴은 안드로이드 카카오톡이 URL 을 받지 못한다, 2026-09-06 사고).
//            intent 에는 kauth authorize 파라미터(client_id·redirect_uri·state…)가 필요한데
//            state 는 GoTrue 가 302 에만 실어 보내므로 EF `auth-handoff/resolve` 가 대신 읽어 준다.
//            docs/archive/kakao-android-onetap.md

import type { ResolvedAuthorize } from "@/lib/authHandoff";

const TALK_UNIVERSAL_LINK = "https://talk-apps.kakao.com/scheme/";
const TALK_INAPP_SCHEME = "kakaotalk://inappbrowser";
const TALK_ANDROID_PACKAGE = "com.kakao.talk";
const TALK_LOGIN_ACTION = "com.kakao.talk.intent.action.CAPRI_LOGGED_IN_ACTIVITY";
const TALK_LOGIN_LAUNCH_FLAGS = "0x08880000"; // SDK 값 그대로
const SDK_VERSION_FOR_KA = "2.7.2"; // KA 헤더의 sdk/ — 재현 원본 SDK 버전

const getUA = () => window.navigator.userAgent.toLowerCase();

const isIOS = (ua: string) => /iphone|ipad|ipod/.test(ua);
export const isAndroid = (ua: string = getUA()) => /android/.test(ua);

/**
 * 카카오톡 앱 전환을 시도할 환경인가.
 * SDK 와 동일 기준: 모바일(iOS/Android)만, Android 인스타/페북 인앱브라우저는 제외.
 *
 * 카카오톡 인앱브라우저(초대 링크로 진입한 멤버 등)도 제외한다 — 이미 카카오 컨텍스트라
 * 같은 창 웹 플로우가 최선이고(릴레이·완료 화면 불필요, 로그인 후 그 자리에서 계속),
 * 톡 안에서 다시 톡을 여는 스킴은 동작이 보장되지 않는다.
 */
export const canLaunchKakaoTalk = (): boolean => {
  const ua = getUA();
  if (!isIOS(ua) && !isAndroid(ua)) return false;
  if (/kakaotalk/.test(ua)) return false;
  if (isAndroid(ua) && /instagram|fb_iab/.test(ua)) return false;
  return true;
};

/**
 * (iOS) authorize URL 을 카카오톡 앱으로 여는 발사 URL 로 감싼다.
 * @param authorizeUrl Supabase signInWithOAuth({skipBrowserRedirect:true}) 가 준 URL
 * @param webFallbackUrl 카카오톡 미설치/실패 시 이동할 URL (보통 authorizeUrl 그대로)
 */
export const buildTalkLaunchUrl = (
  authorizeUrl: string,
  webFallbackUrl: string,
): string => {
  const scheme = `${TALK_INAPP_SCHEME}?url=${encodeURIComponent(authorizeUrl)}`;
  return `${TALK_UNIVERSAL_LINK}${encodeURIComponent(scheme)}&web=${encodeURIComponent(webFallbackUrl)}`;
};

// SDK 의 KA 헤더 재현 — kauth 가 origin 을 앱의 Web 플랫폼 등록 도메인과 대조한다
const buildKaHeader = () =>
  [
    `sdk/${SDK_VERSION_FOR_KA}`,
    "os/javascript",
    "sdk_type/javascript",
    `lang/${navigator.language}`,
    `device/${(navigator.platform || "unknown").replace(/ /g, "_")}`,
    `origin/${encodeURIComponent(window.location.origin)}`,
  ].join(" ");

const randomAlnum = (length: number) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
};

/**
 * (Android) 카카오톡 로그인 액티비티 intent. SDK 의 throughTalk(Android) 분기 재현.
 * 카카오톡이 동의 후 `redirect_uri?code&state` 를 브라우저로 열면 Supabase 콜백 → 릴레이로 복귀.
 *
 * @param resolved EF resolve 가 준 kauth authorize 파라미터
 * @param webFallbackUrl 카카오톡 미설치 시 브라우저/웹뷰가 로드할 URL (S.browser_fallback_url)
 * @param appKey 카카오톡에 제시할 앱 키. 기본은 Supabase 와 같은 client_id(REST 키).
 *               실기기에서 키 종류 검사에 걸리면 VITE_KAKAO_JS_KEY 로 교체 (계획서 "키 선택")
 */
export const buildAndroidTalkIntent = (
  resolved: ResolvedAuthorize,
  webFallbackUrl: string,
  appKey: string = resolved.client_id,
): string => {
  const extraparams: Record<string, string | boolean> = {
    client_id: resolved.client_id,
    redirect_uri: resolved.redirect_uri,
    response_type: "code",
    state: resolved.state,
    auth_tran_id: randomAlnum(60),
    is_popup: true,
  };
  if (resolved.scope) extraparams.scope = resolved.scope;

  return [
    "intent:#Intent",
    `action=${TALK_LOGIN_ACTION}`,
    `launchFlags=${TALK_LOGIN_LAUNCH_FLAGS}`,
    `package=${TALK_ANDROID_PACKAGE}`,
    `S.com.kakao.sdk.talk.appKey=${appKey}`,
    `S.com.kakao.sdk.talk.redirectUri=${resolved.redirect_uri}`,
    `S.com.kakao.sdk.talk.kaHeader=${buildKaHeader()}`,
    `S.com.kakao.sdk.talk.extraparams=${encodeURIComponent(JSON.stringify(extraparams))}`,
    `S.com.kakao.sdk.talk.state=${resolved.state}`,
    `S.browser_fallback_url=${encodeURIComponent(webFallbackUrl)}`,
    "end;",
  ].join(";");
};

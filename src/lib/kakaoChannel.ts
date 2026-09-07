// 카카오톡 채널 "문의하기" 발사 유틸.
//
// 브라우저: 채널 채팅 웹페이지(pf.kakao.com/<id>/chat)를 새 탭으로 — 기존 동작 그대로.
// 앱(WebView): 페이지를 거치지 않고 카카오톡 채팅방을 **직접** 연다. 이유:
//   - Android 앱은 window.open 을 버린다 (flutter_inappwebview 가 onCreateWindow 미구현 시
//     iOS 는 같은 창에 로드해 주지만 Android 는 무반응 — 플러그인 소스 실측, 2026-09-07)
//   - 같은 창 이동으로 페이지를 띄우면 카카오톡에서 돌아왔을 때 WebView 에 채널 페이지가 남는다
// 발사 형식은 카카오 JS SDK(kakao.min.js 2.7.2) Channel.chat 의 모바일 분기를 재현:
//   iOS     https://talk-apps.kakao.com/scheme/<enc(kakaoplus://plusfriend/chat/<id>?fromtype=web)>&web=<폴백>
//   Android intent://plusfriend/chat/<id>?fromtype=web#Intent;scheme=kakaoplus;package=com.kakao.talk;S.browser_fallback_url=<폴백>;end;
// ⚠️ `?fromtype=web` 필수 — 카카오 채널 페이지(pf.kakao.com CustomChat)가 발사 직전 항상 붙이는 플래그.
//   없으면 iOS 카카오톡이 "비공개 또는 삭제된 채널"을 띄운다 (2026-09-07 실기기: iOS 는 이 플래그 없는
//   변형만 실패, Android 는 유무 무관). 양 플랫폼 동일 형식으로 통일.
// 카카오톡 미설치 시 폴백 = 채널 웹페이지 (앱의 intent 핸들러가 S.browser_fallback_url 을 WebView 에 로드).
// 로그인 원탭 발사(kakaoTalkLaunch.ts)와 같은 OS 메커니즘이라 앱 변경 없이 동작한다.

const TALK_UNIVERSAL_LINK = "https://talk-apps.kakao.com/scheme/";
const TALK_ANDROID_PACKAGE = "com.kakao.talk";

const channelChatUrl = (): string =>
  import.meta.env.VITE_PRAY_KAKAO_CHANNEL_CHAT_URL;

/** https://pf.kakao.com/_XaHDG/chat → _XaHDG */
const channelPublicId = (url: string): string | null => {
  try {
    return new URL(url).pathname.split("/").filter(Boolean)[0] ?? null;
  } catch {
    return null;
  }
};

export const openKakaoChannelChat = () => {
  const url = channelChatUrl();
  const id = channelPublicId(url);
  const isApp = !!window.flutter_inappwebview;
  if (!isApp || !id) {
    window.open(url, "_blank");
    return;
  }
  const ua = window.navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) {
    window.location.href = [
      `intent://plusfriend/chat/${id}?fromtype=web#Intent`,
      "scheme=kakaoplus",
      `package=${TALK_ANDROID_PACKAGE}`,
      `S.browser_fallback_url=${encodeURIComponent(url)}`,
      "end;",
    ].join(";");
    return;
  }
  const scheme = `kakaoplus://plusfriend/chat/${id}?fromtype=web`;
  window.location.href = `${TALK_UNIVERSAL_LINK}${encodeURIComponent(scheme)}&web=${encodeURIComponent(url)}`;
};

// 세션 핸드오프 릴레이 클라이언트 (docs: docs/plans/kakao-login-handoff.md)
//
// 카카오톡 인앱브라우저에서 완결된 Supabase 세션을 "로그인을 시작한 원래 탭"으로
// 옮기는 1회용 우체통(Edge Function `auth-handoff`)의 클라이언트 절반.
//
// - secret(256bit 랜덤)은 원래 탭 메모리에만 존재 — 리다이렉트 체인에 실리지 않는다
// - nonce = SHA-256(secret) 커밋만 redirectTo URL 로 흘러간다 → URL 노출이 무해
// - 개시 마커(sessionStorage): 톡 미설치 폴백처럼 "같은 탭"이 흐름을 이어갈 때
//   login-redirect 가 예치(deposit) 대신 일반 로그인으로 진행하기 위한 컨텍스트 표식
// ⚠️ secret/nonce/토큰을 Sentry·analytics·console 에 절대 기록하지 않는다

const FUNCTIONS_BASE = `${
  import.meta.env.VITE_SUPA_PROJECT_URL
}/functions/v1/auth-handoff`;
const MARKER_KEY = "kakaoHandoffStarted";

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

export interface HandoffTokens {
  access_token: string;
  refresh_token: string;
}

/** EF `resolve` 응답 — kauth authorize URL 의 쿼리 (안드로이드 원탭 intent 재료) */
export interface ResolvedAuthorize {
  client_id: string;
  redirect_uri: string;
  state: string;
  scope?: string;
}

/**
 * (안드로이드 원탭) GoTrue authorize 의 302 Location 은 브라우저 JS 가 볼 수 없어
 * 서버가 대신 읽어 준다. 실패 시 null — 호출부는 웹 플로우로 폴백.
 * docs: docs/archive/kakao-android-onetap.md
 */
export const resolveAuthorize = async (
  redirectTo: string,
): Promise<ResolvedAuthorize | null> => {
  try {
    const res = await fetch(`${FUNCTIONS_BASE}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ redirect_to: redirectTo }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<ResolvedAuthorize>;
    if (!data.client_id || !data.redirect_uri || !data.state) return null;
    return data as ResolvedAuthorize;
  } catch {
    return null;
  }
};

/** secret(원래 탭 보관용)과 nonce(SHA-256 커밋, URL 탑재용) 쌍 생성 */
export const createHandoffPair = async (): Promise<{
  secret: string;
  nonce: string;
}> => {
  const secret = toHex(crypto.getRandomValues(new Uint8Array(32)));
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(secret),
  );
  return { secret, nonce: toHex(new Uint8Array(digest)) };
};

/**
 * (완결 컨텍스트 전용) 서버 세션은 살린 채 이 브라우저의 로컬 세션 저장소만 제거.
 *
 * ⚠️ supabase.auth.signOut({ scope: "local" }) 을 쓰면 안 된다 — scope 가 local 이어도
 * 서버에 현재 세션 revoke 를 요청해서, 방금 예치(deposit)한 토큰까지 무효화된다
 * (2026-08-23 staging 검증에서 실증: 양쪽 다 로그아웃 + "Auth session missing!").
 * 호출부에서 supabase.auth.stopAutoRefresh() 도 함께 불러 이 페이지의 자동 갱신이
 * 원래 탭과 refresh token rotation 경합을 일으키지 않게 한다.
 */
export const clearLocalAuthStorage = () => {
  const ref = new URL(import.meta.env.VITE_SUPA_PROJECT_URL).hostname.split(
    ".",
  )[0];
  localStorage.removeItem(`sb-${ref}-auth-token`);
};

export const markHandoffStarted = () =>
  sessionStorage.setItem(MARKER_KEY, "1");
export const hasHandoffMarker = () =>
  sessionStorage.getItem(MARKER_KEY) === "1";
export const clearHandoffMarker = () => sessionStorage.removeItem(MARKER_KEY);

/** (완결 컨텍스트에서) 현재 세션 토큰을 nonce 로 예치. 성공 여부만 반환 */
export const depositSession = async (
  nonce: string,
  tokens: HandoffTokens,
): Promise<boolean> => {
  try {
    const res = await fetch(`${FUNCTIONS_BASE}/deposit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nonce, ...tokens }),
    });
    return res.ok;
  } catch {
    return false;
  }
};

/**
 * (원래 탭에서) secret 으로 예치된 토큰을 폴링 수령.
 * 타임아웃/취소 시 null — 호출부가 재시도 UI 로 처리한다.
 */
export const claimSession = async (
  secret: string,
  options: { signal?: AbortSignal; intervalMs?: number; timeoutMs?: number } =
    {},
): Promise<HandoffTokens | null> => {
  const { signal, intervalMs = 1500, timeoutMs = 3 * 60 * 1000 } = options;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (signal?.aborted) return null;
    try {
      const res = await fetch(`${FUNCTIONS_BASE}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
        signal,
      });
      if (res.ok) return (await res.json()) as HandoffTokens;
      // 404 = 아직 예치 전 — 폴링 계속
    } catch {
      if (signal?.aborted) return null;
      // 일시 네트워크 오류 — 폴링 계속
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return null;
};

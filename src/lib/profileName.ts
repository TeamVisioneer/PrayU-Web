/**
 * 프로필 표시 이름.
 *
 * 탈퇴한 사용자는 `full_name` 이 **비어 있다** — 개인정보를 지우기 때문이다
 * (PrayU-Api/docs/account-deletion-plan.md). 표시 문자열을 DB 에 넣지 않으므로
 * "(탈퇴유저)" 는 여기서 붙인다. 문구를 바꿔야 할 때 이 파일만 고치면 된다.
 *
 * 기도 기록은 남기기로 했으므로, 탈퇴자가 쓴 기도카드는 다른 사람 화면에 계속 보인다.
 */

const WITHDRAWN = "(탈퇴유저)";
const UNKNOWN = "(알 수 없음)";

interface NamedProfile {
  full_name?: string | null;
  deleted_at?: string | null;
}

export const displayProfileName = (
  profile?: NamedProfile | null,
): string => {
  if (!profile) return UNKNOWN;
  if (profile.deleted_at) return WITHDRAWN;
  return profile.full_name || UNKNOWN;
};

/** 아바타 자리에 쓰는 이니셜. 탈퇴자는 이름이 없으므로 비운다 */
export const profileInitial = (profile?: NamedProfile | null): string => {
  if (!profile || profile.deleted_at) return "";
  return profile.full_name?.charAt(0).toUpperCase() ?? "";
};

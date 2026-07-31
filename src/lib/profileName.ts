/**
 * 탈퇴한 사용자를 화면에서 가린다.
 *
 * 탈퇴해도 `profiles` 행은 **그대로 둔다** — 문의 대응·이상 행위 추적 같은 운영이 필요하고,
 * 지워버리면 되돌릴 수 없기 때문이다 (PrayU-Api/docs/archive/account-deletion-plan.md).
 * 그래서 **노출을 막는 일은 여기, 표시 계층의 몫**이다.
 *
 * 기도 기록도 남으므로 탈퇴자가 쓴 기도카드는 다른 사람 화면에 계속 보인다 —
 * 작성자만 "(탈퇴유저)"로 바뀐다.
 */

const WITHDRAWN = "(탈퇴유저)";
const UNKNOWN = "(알 수 없음)";

interface NamedProfile {
  full_name?: string | null;
  deleted_at?: string | null;
}

interface AvatarProfile {
  avatar_url?: string | null;
  deleted_at?: string | null;
}

export const displayProfileName = (
  profile?: NamedProfile | null,
): string => {
  if (!profile) return UNKNOWN;
  if (profile.deleted_at) return WITHDRAWN;
  return profile.full_name || UNKNOWN;
};

/**
 * 아바타 URL. 탈퇴자는 `null` 이다.
 *
 * 탈퇴해도 `profiles` 행의 값은 **지우지 않는다**(운영 추적을 위해).
 * 따라서 가리는 것은 표시 계층의 몫이다 — 이름과 마찬가지로 사진도 여기서 막는다.
 */
export const profileAvatarUrl = (
  profile?: AvatarProfile | null,
): string | null => {
  if (!profile || profile.deleted_at) return null;
  return profile.avatar_url ?? null;
};

/** 아바타 자리에 쓰는 이니셜. 탈퇴자는 이름을 감추므로 비운다 */
export const profileInitial = (profile?: NamedProfile | null): string => {
  if (!profile || profile.deleted_at) return "";
  return profile.full_name?.charAt(0).toUpperCase() ?? "";
};

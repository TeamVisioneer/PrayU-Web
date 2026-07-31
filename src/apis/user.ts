import * as Sentry from "@sentry/react";
import { supabase } from "../../supabase/client";

export const updateUserMetaData = async (params: { [key: string]: string }) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: params,
    });
    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    return data;
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

/**
 * 회원 탈퇴.
 *
 * 예전에는 여기서 member·pray·pray_card 를 직접 소프트 삭제한 뒤 서버 삭제를 불렀다.
 * 이제 **절차 전체를 서버가 소유한다** (PrayU-Api/docs/account-deletion-plan.md) —
 * 클라이언트가 중간에 끊기면 데이터가 어중간한 상태로 남고, 순서(그룹장 이양 → 나가기 →
 * 익명화 → auth)를 지킬 수 없기 때문이다.
 *
 * **기도 기록은 지우지 않는다.** 지우면 함께 기도한 상대방 화면에서도 사라진다.
 *
 * 대상 사용자는 **토큰에서만** 정해진다 — 클라이언트가 남의 계정을 지정할 수 없다.
 * 실패하면 false — 호출부는 로그아웃하지 말고 사용자에게 알려야 한다.
 */
export const deleteUser = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(
      `${import.meta.env.VITE_SUPA_PROJECT_URL}/functions/v1/api/users`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${session?.access_token}`,
        },
      },
    );

    const { error } = await response.json();
    if (error) {
      Sentry.captureException(`회원 탈퇴 실패 (${response.status}): ${error}`);
      return false;
    }
    return true;
  } catch (error) {
    Sentry.captureException(error);
    return false;
  }
};

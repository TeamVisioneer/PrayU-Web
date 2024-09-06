import { getDomainUrl } from "@/lib/utils";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { KakaoTokenRepo } from "./KakaoTokenRepo";
import { KakaoTokenResponse } from "./Kakao";
import { useNavigate } from "react-router-dom";
import useBaseStore from "@/stores/baseStore";
import useAuth from "@/hooks/useAuth";

const KakaoCallBack = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const baseUrl = getDomainUrl();
  const updateProfile = useBaseStore((state) => state.updateProfile);
  const setIsOpenTodayPrayDrawer = useBaseStore(
    (state) => state.setIsOpenTodayPrayDrawer
  );
  const setIsOpenMyMemberDrawer = useBaseStore(
    (state) => state.setIsOpenMyMemberDrawer
  );
  const parseState = (state: string | null) => {
    const stateObj: { [key: string]: string } = {};
    if (!state) return stateObj;

    // ';'로 구분하여 split하고, 각 key-value를 처리
    const parts = state.split(";");
    parts.forEach((part) => {
      const [key, value] = part.split(":");
      if (key && value) {
        stateObj[key.trim()] = value.trim();
      }
    });
    return stateObj;
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    const state = params.get("state");
    const stateObj = parseState(state);

    const groupPageUrl = stateObj["groupId"]
      ? `/group/${stateObj["groupId"]}`
      : "/group";

    if (code) {
      KakaoTokenRepo.fetchKakaoToken(
        code,
        `${baseUrl}/auth/kakao/callback`
      ).then((response: KakaoTokenResponse | null) => {
        if (user) {
          const kakaoId = user.user_metadata.sub;
          updateProfile(user.id, kakaoId);
        }
        if (response) {
          KakaoTokenRepo.setKakaoTokensInCookie(response);
          window.Kakao.Auth.setAccessToken(response.access_token);
        }
      });
    }
    if (stateObj["from"] == "TodayPrayDrawer") setIsOpenTodayPrayDrawer(true);
    if (stateObj["from"] == "MyPrayCard") setIsOpenMyMemberDrawer(true);
    navigate(groupPageUrl, { replace: true });
  }, [
    navigate,
    location.search,
    baseUrl,
    updateProfile,
    user,
    setIsOpenTodayPrayDrawer,
    setIsOpenMyMemberDrawer,
  ]);
  return null;
};

export default KakaoCallBack;

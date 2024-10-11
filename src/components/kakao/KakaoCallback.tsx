import { getDomainUrl } from "@/lib/utils";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { KakaoTokenRepo } from "./KakaoTokenRepo";
import { KakaoTokenResponse } from "./Kakao";
import { useNavigate } from "react-router-dom";
import useBaseStore from "@/stores/baseStore";
import { supabase } from "../../../supabase/client";

const KakaoCallBack = () => {
  const user = useBaseStore((state) => state.user);
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
    const groupId = stateObj["groupId"] || "";
    const groupPageUrl = groupId ? `/group/${groupId}` : "/group";

    if (code) {
      KakaoTokenRepo.fetchKakaoToken(
        code,
        `${baseUrl}/auth/kakao/callback`
      ).then((response: KakaoTokenResponse | null) => {
        if (user) {
          const kakaoId = user.user_metadata.sub;
          updateProfile(user.id, { kakao_id: kakaoId });
        }
        if (response) {
          KakaoTokenRepo.setKakaoTokensInCookie(response);
          window.Kakao.Auth.setAccessToken(response.access_token);
          if (response.id_token && !user) {
            supabase.auth
              .signInWithIdToken({
                provider: "kakao",
                token: response.id_token,
              })
              .then(({ error }) => {
                if (!error) {
                  window.location.href = `${baseUrl}/login-redirect?groupId=${groupId}`;
                } else {
                  console.error("로그인 실패:", error);
                  navigate("/", { replace: true });
                }
              })
              .catch((err) => {
                console.error("로그인 처리 중 오류 발생:", err);
                navigate("/", { replace: true });
              });
          }
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

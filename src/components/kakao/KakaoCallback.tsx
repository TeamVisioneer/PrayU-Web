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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");

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
    // TODO 그룹 아이디 가져와서 리다이렉트 필요
    navigate("/group", { replace: true });
  }, [navigate, location.search, baseUrl, updateProfile, user]);
  return null;
};

export default KakaoCallBack;

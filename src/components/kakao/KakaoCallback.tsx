import { getDomainUrl } from "@/lib/utils";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { KakaoTokenRepo } from "./KakaoTokenRepo";

const KakaoCallBack = () => {
  const location = useLocation();
  const baseUrl = getDomainUrl();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");

    if (code) {
      KakaoTokenRepo.fetchKakaoToken(
        code,
        `${baseUrl}/auth/kakao/callback`
      ).then((tokenResponse) => {
        if (tokenResponse) {
          KakaoTokenRepo.setKakaoTokensInCookie(tokenResponse);
        }
      });
    }
  }, [location.search, baseUrl]);

  return null;
};

export default KakaoCallBack;

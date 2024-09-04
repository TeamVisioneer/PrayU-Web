import { getDomainUrl } from "@/lib/utils";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { KakaoTokenRepo } from "./KakaoTokenRepo";
import { KakaoTokenResponse } from "./Kakao";

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
      ).then((response: KakaoTokenResponse | null) => {
        if (response) {
          KakaoTokenRepo.setKakaoTokensInCookie(response);
        }
      });
    }
  }, [location.search, baseUrl]);

  return null;
};

export default KakaoCallBack;

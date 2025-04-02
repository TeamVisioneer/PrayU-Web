import { getDomainUrl } from "@/lib/utils";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { KakaoTokenRepo } from "./KakaoTokenRepo";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabase/client";
import * as Sentry from "@sentry/react";

const KakaoCallBack = () => {
  const parseState = (state: string | null) => {
    if (!state) return {};
    const stateObj: { [key: string]: string } = {};
    const parts = state.split(";");
    parts.forEach((part) => {
      const [key, value] = part.split(":");
      if (key && value) stateObj[key.trim()] = value.trim();
    });
    return stateObj;
  };

  const navigate = useNavigate();
  const location = useLocation();
  const baseUrl = getDomainUrl();
  const params = new URLSearchParams(location.search);
  const code = params.get("code");
  const state = params.get("state");
  const stateObj = parseState(state);
  const path = stateObj.path || "";
  const from = stateObj.from || "";

  const encodedPath = encodeURIComponent(path);
  const loginRedirectUrl = `/login-redirect?path=${encodedPath}&from=${from}`;
  const callBackUrl = `${baseUrl}/auth/kakao/callback`;

  useEffect(() => {
    const KakaoLogin = async () => {
      if (!code) {
        navigate("/", { replace: true });
        return;
      }
      const response = await KakaoTokenRepo.fetchKakaoToken(code, callBackUrl);
      if (!response || !response.id_token) {
        navigate("/", { replace: true });
        return;
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "kakao",
        token: response.id_token,
      });
      if (data) {
        navigate(loginRedirectUrl, { replace: true });
      } else if (error) {
        Sentry.captureException(error.message);
        navigate("/", { replace: true });
      }
    };
    KakaoLogin();
  }, [navigate, code, loginRedirectUrl, callBackUrl]);

  return null;
};

export default KakaoCallBack;

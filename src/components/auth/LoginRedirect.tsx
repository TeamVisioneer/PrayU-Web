import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useBaseStore from "@/stores/baseStore";
import useAuth from "@/hooks/useAuth";
import { updateProfilesParams } from "@/apis/profiles";
import { supabase } from "../../../supabase/client";
import {
  clearHandoffMarker,
  depositSession,
  hasHandoffMarker,
} from "@/lib/authHandoff";

const LoginRedirect = () => {
  const { user } = useAuth();
  const updateUserMetaData = useBaseStore((state) => state.updateUserMetaData);
  const navigate = useNavigate();
  const myProfile = useBaseStore((state) => state.myProfile);
  const getProfile = useBaseStore((state) => state.getProfile);
  const updateProfile = useBaseStore((state) => state.updateProfile);
  const setIsOpenMyMemberDrawer = useBaseStore(
    (state) => state.setIsOpenMyMemberDrawer
  );

  const location = useLocation();
  const currentUserId = user!.id;
  const provider = user!.app_metadata.provider;
  const kakaoId = user!.user_metadata.provider_id;

  const params = new URLSearchParams(location.search);
  const path = params.get("path");
  const from = params.get("from");

  // 세션 핸드오프 (docs/plans/kakao-login-handoff.md):
  // handoff 파라미터가 있는데 개시 마커가 없다 = 여기는 "로그인을 시작한 탭"이 아니라
  // 카카오톡 인앱브라우저(완결 컨텍스트)다 → 세션을 예치하고 이 컨텍스트는 로그아웃.
  // 마커가 있으면(톡 미설치 폴백 등 같은 탭 진행) 일반 로그인으로 계속한다.
  const handoffNonce = params.get("handoff");
  const isHandoffDepositContext = !!handoffNonce && !hasHandoffMarker();
  const [handoffState, setHandoffState] = useState<
    "idle" | "deposited" | "failed"
  >("idle");

  useEffect(() => {
    if (!isHandoffDepositContext) {
      if (handoffNonce) clearHandoffMarker();
      return;
    }
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        setHandoffState("failed");
        return;
      }
      const ok = await depositSession(handoffNonce!, {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
      if (ok) {
        // scope 주의: global 이면 예치한 토큰까지 무효화된다 — 이 컨텍스트만 정리
        await supabase.auth.signOut({ scope: "local" });
        setHandoffState("deposited");
      } else {
        // 예치 실패 — 이 컨텍스트에 로그인은 살아있으므로 안내만 (강하 모드)
        setHandoffState("failed");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isHandoffDepositContext) return;
    if (window.flutter_inappwebview?.callHandler) {
      window.flutter_inappwebview.callHandler("onLogin", currentUserId);
    }
    getProfile(currentUserId);
    if (from == "MyPrayCard") setIsOpenMyMemberDrawer(true);
  }, [
    currentUserId,
    getProfile,
    from,
    setIsOpenMyMemberDrawer,
    isHandoffDepositContext,
  ]);

  useEffect(() => {
    if (isHandoffDepositContext) return;
    if (!myProfile) return;
    const updatedProfileData: updateProfilesParams = {};
    const updatedUserMetaData: { [key: string]: string } = {};

    // Kakao provider 관련 프로필 업데이트
    if (provider === "kakao") {
      if (!user?.user_metadata.full_name)
        updatedUserMetaData.full_name = user!.user_metadata.name;
      if (!user?.user_metadata.avatar_url)
        updatedUserMetaData.avatar_url = user!.user_metadata.picture;
      if (!myProfile.full_name)
        updatedProfileData.full_name = user!.user_metadata.name;
      if (!myProfile.avatar_url)
        updatedProfileData.avatar_url = user!.user_metadata.picture;
      if (!myProfile.kakao_id)
        updatedProfileData.kakao_id = user!.user_metadata.kakaoId;
    }

    if (Object.keys(updatedUserMetaData).length > 0) {
      updateUserMetaData(updatedUserMetaData);
    }
    if (Object.keys(updatedProfileData).length > 0) {
      updateProfile(currentUserId, updatedProfileData);
    }
    if (!myProfile.terms_agreed_at) {
      navigate(`/term?path=${path}`, { replace: true });
    } else {
      const decodedPath = decodeURIComponent(path || "/group");
      navigate(decodedPath, { replace: true });
    }
  }, [
    myProfile,
    currentUserId,
    kakaoId,
    provider,
    updateUserMetaData,
    updateProfile,
    navigate,
    path,
    user,
    isHandoffDepositContext,
  ]);

  if (isHandoffDepositContext) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 px-10 text-center">
        <p className="text-base font-semibold">
          {handoffState === "failed"
            ? "로그인이 완료됐어요"
            : "로그인 완료!"}
        </p>
        <p className="text-sm text-gray-500">
          {handoffState === "deposited" &&
            "이 창을 닫고 원래 화면으로 돌아가 주세요."}
          {handoffState === "failed" &&
            "원래 화면에서 로그인되지 않았다면 다시 시도해 주세요."}
          {handoffState === "idle" && "잠시만 기다려 주세요..."}
        </p>
      </div>
    );
  }

  return null;
};

export default LoginRedirect;

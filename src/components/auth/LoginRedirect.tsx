import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useBaseStore from "@/stores/baseStore";
import useAuth from "@/hooks/useAuth";
import { updateProfilesParams } from "@/apis/profiles";
import { supabase } from "../../../supabase/client";
import Lottie from "react-lottie";
import { PulseLoader } from "react-spinners";
import checkAnimation from "@/assets/lottie/check2.json";
import prayuLogo from "@/assets/PrayULogoV3.png";
import {
  clearHandoffMarker,
  clearLocalAuthStorage,
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
        // ⚠️ signOut 은 scope:'local' 이어도 서버 revoke 를 호출해 예치 토큰까지 죽인다
        // (2026-08-23 staging 버그) — 로컬 저장소 제거 + 자동 갱신 중지로만 정리한다.
        // 이 페이지의 메모리 세션은 남지만, 카카오톡 브라우저는 곧 닫히므로 무해.
        supabase.auth.stopAutoRefresh();
        clearLocalAuthStorage();
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
    // 카카오톡 인앱브라우저에 보이는 완료 안내 — 글래스 톤, 체크는 그룹 입장 완료와
    // 동일한 Lottie(check2) 재사용 (사용자 피드백 2026-08-23)
    return (
      <div className="min-h-dvh flex items-center justify-center px-6 bg-gradient-to-b from-prayCardStart/40 via-mainBg to-prayCardMiddle/40">
        <main className="w-full max-w-[320px] rounded-3xl border border-glassBorder/60 bg-surfaceCard/70 shadow-glass px-7 pt-8 pb-8 text-center">
          {handoffState === "idle" ? (
            <div className="flex h-[120px] items-center justify-center">
              <PulseLoader size={10} color="#608CFF" />
            </div>
          ) : (
            <Lottie
              height={120}
              width={120}
              options={{
                loop: false,
                autoplay: true,
                animationData: checkAnimation,
              }}
            />
          )}
          <h1 className="mt-1 text-lg font-bold tracking-tight text-black">
            {handoffState === "idle" ? "로그인 처리 중" : "로그인 완료"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-dark break-keep">
            {handoffState === "deposited" && (
              <>
                이 창은 닫아도 괜찮아요
                <br />
                로그인하던 화면으로 돌아가 주세요
              </>
            )}
            {handoffState === "failed" &&
              "원래 화면에서 로그인되지 않았다면 다시 시도해 주세요"}
            {handoffState === "idle" && "잠시만 기다려 주세요"}
          </p>
          <div className="mt-7 flex items-center justify-center gap-1.5 text-xs font-semibold text-deactivate">
            <img src={prayuLogo} alt="" className="h-4 w-4" />
            PrayU
          </div>
        </main>
      </div>
    );
  }

  return null;
};

export default LoginRedirect;

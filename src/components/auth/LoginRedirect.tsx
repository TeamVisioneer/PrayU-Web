import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useBaseStore from "@/stores/baseStore";
import useAuth from "@/hooks/useAuth";
import { updateProfilesParams } from "@/apis/profiles";

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

  useEffect(() => {
    if (window.flutter_inappwebview?.callHandler) {
      window.flutter_inappwebview.callHandler("onLogin", currentUserId);
    }
    getProfile(currentUserId);
    if (from == "MyPrayCard") setIsOpenMyMemberDrawer(true);
  }, [currentUserId, getProfile, from, setIsOpenMyMemberDrawer]);

  useEffect(() => {
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
  ]);

  return null;
};

export default LoginRedirect;

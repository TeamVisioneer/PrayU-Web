import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useBaseStore from "@/stores/baseStore";
import useAuth from "@/hooks/useAuth";

const LoginRedirect = () => {
  const { user } = useAuth();
  const session = useBaseStore((state) => state.session);
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
  const groupId = params.get("groupId");
  const from = params.get("from");
  const groupPageUrl = groupId ? `/group/${groupId}` : "/group";

  useEffect(() => {
    getProfile(currentUserId);
    if (from == "MyPrayCard") setIsOpenMyMemberDrawer(true);
  }, [currentUserId, getProfile, from, setIsOpenMyMemberDrawer]);

  useEffect(() => {
    if (!myProfile) return;
    if (provider == "kakao") {
      window.Kakao.Auth.setAccessToken(session?.provider_token || "");
      if (!myProfile.kakao_id)
        updateProfile(currentUserId, { kakao_id: kakaoId });
    }

    if (!myProfile.terms_agreed_at)
      navigate(`/term?groupId=${groupId}`, { replace: true });
    else navigate(groupPageUrl, { replace: true });
  }, [
    myProfile,
    currentUserId,
    kakaoId,
    provider,
    updateProfile,
    navigate,
    groupId,
    groupPageUrl,
    session,
  ]);

  return null;
};

export default LoginRedirect;

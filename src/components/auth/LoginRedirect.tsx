import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useBaseStore from "@/stores/baseStore";
import useAuth from "@/hooks/useAuth";

const LoginRedirect = () => {
  const { user } = useAuth();
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

  console.log(user);

  useEffect(() => {
    getProfile(currentUserId);
  }, [currentUserId, getProfile]);

  useEffect(() => {
    if (!myProfile) return;
    if (!myProfile.kakao_id && provider == "kakao") {
      updateProfile(currentUserId, { kakao_id: kakaoId });
    }

    if (from == "MyPrayCard") setIsOpenMyMemberDrawer(true);

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
    from,
    groupId,
    setIsOpenMyMemberDrawer,
    groupPageUrl,
  ]);

  return null;
};

export default LoginRedirect;

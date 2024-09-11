import useAuth from "@/hooks/useAuth";
import useBaseStore from "@/stores/baseStore";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const TermServicePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getProfile = useBaseStore((state) => state.getProfile);
  const profile = useBaseStore((state) => state.profile);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const from = queryParams.get("from");

  useEffect(() => {
    if (user && !profile) {
      getProfile(user.id); // 프로필을 가져오는 함수는 한 번만 호출
    }
  }, [user, profile, getProfile]);

  useEffect(() => {
    if (profile && profile.website !== null) {
      navigate(from!, { replace: true }); // 프로필에 웹사이트가 있으면 리다이렉션
    }
  }, [profile, navigate, from]);

  // 프로필이 로드되지 않았을 때는 아무것도 렌더링하지 않음
  if (!profile) return null;

  return <div>TermServicePage</div>;
};

export default TermServicePage;

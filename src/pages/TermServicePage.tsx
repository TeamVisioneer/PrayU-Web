import { Button } from "@/components/ui/button";
import { PrayTypeDatas } from "@/Enums/prayType";
import useAuth from "@/hooks/useAuth";
import useBaseStore from "@/stores/baseStore";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";

const TermServicePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getProfile = useBaseStore((state) => state.getProfile);
  const profile = useBaseStore((state) => state.profile);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const from = queryParams.get("from");

  const emojiData = PrayTypeDatas["pray"];

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

  return (
    <div className="flex flex-col justify-between items-center h-full">
      <span></span>
      <div className="flex flex-col items-center text-center gap-8">
        <div
          className={`flex justify-center items-center w-[100px] h-[100px] rounded-full ${emojiData.bgColor} opacity-90 ring-4 ring-offset-4 ${emojiData.ringColor}`}
        >
          <img src={emojiData.icon} className="w-[60px] h-[60px]" />
        </div>
        <p className="text-[#B0B3C4]">
          PrayU는 타인을 사랑하고 보호하는
          <br />
          기독교적 원칙을 준수합니다.
        </p>
      </div>

      <div className="flex flex-col w-full gap-5">
        <div className="flex items-center justify-between">
          <p>[필수] 해당 서비스 이용 약관 동의</p>
          <Checkbox />
        </div>

        <Button className="w-full bottom-0 left-0" variant="primary">
          동의하고 시작해요
        </Button>
      </div>
    </div>
  );
};

export default TermServicePage;

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PrayTypeDatas } from "@/Enums/prayType";
import useAuth from "@/hooks/useAuth";
import useBaseStore from "@/stores/baseStore";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { IoIosArrowForward } from "react-icons/io";

const TermServicePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getProfile = useBaseStore((state) => state.getProfile);
  const profile = useBaseStore((state) => state.myProfile);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const from = queryParams.get("from");

  const [isChecked, setIsChecked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const emojiData = PrayTypeDatas["pray"];

  useEffect(() => {
    if (user && !profile) {
      getProfile(user.id);
    }
  }, [user, profile, getProfile]);

  useEffect(() => {
    if (profile && profile.website !== null) {
      navigate(from!, { replace: true });
    }
  }, [profile, navigate, from]);

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
        <div className="w-full h-10 py-2 px-3 bg-white rounded-md flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div
              className="flex items-center gap-2"
              onClick={() =>
                window.open(
                  "https://mmyeong.notion.site/PrayU-ee61275fa48842cda5a5f2ed5b608ec0?pvs=4",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            >
              <p className="text-sm font-medium">
                [필수] 해당 서비스 이용 약관 동의
              </p>
              <IoIosArrowForward className="text-gray-500" />
            </div>
          </div>

          <Checkbox
            className="w-5 h-5 border-2"
            checked={isChecked}
            onCheckedChange={(checked) => setIsChecked(checked === true)}
          />
        </div>

        <Button
          className="w-full bottom-0 left-0"
          variant="primary"
          disabled={!isChecked}
        >
          동의하고 시작해요
        </Button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-4xl h-4/5">
            <h2 className="text-xl font-bold mb-4">서비스 이용 약관</h2>
            <div className="relative w-full h-full">
              <iframe
                src="https://mmyeong.notion.site/PrayU-ee61275fa48842cda5a5f2ed5b608ec0?pvs=4"
                title="서비스 이용 약관"
                className="w-full h-full border-0"
              />
            </div>
            <Button
              className="mt-4"
              variant="secondary"
              onClick={() => setIsModalOpen(false)} // 모달 닫기
            >
              닫기
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TermServicePage;

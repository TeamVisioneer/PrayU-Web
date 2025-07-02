import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PrayTypeDatas } from "@/Enums/prayType";
import useAuth from "@/hooks/useAuth";
import useBaseStore from "@/stores/baseStore";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { IoIosArrowForward } from "react-icons/io";
import { analyticsTrack } from "@/analytics/analytics";
import { getISOToday } from "@/lib/utils";

const TermServicePage: React.FC = () => {
  const getProfile = useBaseStore((state) => state.getProfile);
  const profile = useBaseStore((state) => state.myProfile);
  const updateProfile = useBaseStore((state) => state.updateProfile);

  const createGroup = useBaseStore((state) => state.createGroup);
  const createMember = useBaseStore((state) => state.createMember);
  const groupList = useBaseStore((state) => state.groupList);
  const fetchGroupListByUserId = useBaseStore(
    (state) => state.fetchGroupListByUserId
  );
  const setExternalUrl = useBaseStore((state) => state.setExternalUrl);

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const path = queryParams.get("path");

  const [isChecked, setIsChecked] = useState(false);
  const [isDisabledAgreeBtn, setIsDisabledAgreeBtn] = useState(false);
  const emojiData = PrayTypeDatas["pray"];

  useEffect(() => {
    if (user) fetchGroupListByUserId(user.id);
    if (user && !profile) getProfile(user.id);
  }, [user, profile, getProfile, fetchGroupListByUserId]);

  if (!profile || !groupList) return null;

  const handleCreateGroup = async () => {
    const userName = profile.full_name || user?.user_metadata.name;
    const groupName = userName ? `${userName}의 기도그룹` : "새 기도그룹";
    const targetGroup = await createGroup(profile.id, groupName, "");
    if (!targetGroup) return;

    const myMember = await createMember(targetGroup.id, profile.id, "");
    if (!myMember) return;
    return targetGroup.id;
  };

  const onClickAgreeStart = async () => {
    setIsDisabledAgreeBtn(true);
    analyticsTrack("클릭_동의_완료", {});
    const updatedProfile = await updateProfile(profile.id, {
      terms_agreed_at: getISOToday(),
    });
    if (!updatedProfile) {
      setIsDisabledAgreeBtn(false);
      return;
    }

    if (path) {
      const decodedPath = decodeURIComponent(path);
      navigate(decodedPath, { replace: true });
    } else {
      if (groupList.length > 0)
        window.location.replace(`/group/${groupList[0].id}`);
      else {
        const targetGroupId = await handleCreateGroup();
        if (!targetGroupId) {
          setIsDisabledAgreeBtn(false);
          return;
        }
        window.location.replace("/tutorial");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">
      <div className="flex-1 px-6 py-8 flex flex-col justify-between relative z-10">
        {/* 중앙 컨텐츠 */}
        <div className="flex flex-col items-center text-center space-y-8 flex-1 justify-center">
          {/* 메인 아이콘과 애니메이션 */}
          <div className="relative">
            <div
              className={`flex justify-center items-center w-32 h-32 rounded-3xl ${emojiData.bgColor} opacity-95 shadow-xl transform transition-all duration-700 hover:scale-105`}
            >
              <img src={emojiData.icon} className="w-16 h-16 animate-pulse" />
            </div>
          </div>

          {/* 타이틀과 설명 */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PrayU와 함께하기
            </h1>
            <div className="space-y-2">
              <p className="text-lg text-gray-700 font-medium">
                타인을 사랑하고 보호하는
              </p>
              <p className="text-lg text-gray-700 font-medium">
                기독교적 원칙을 준수합니다
              </p>
            </div>
          </div>
        </div>

        {/* 하단 약관 동의 카드 */}
        <div className="space-y-6">
          {/* 약관 동의 카드 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg">📄</span>
                  </div>
                  <div
                    className="text-left"
                    onClick={() => {
                      analyticsTrack("클릭_동의_서비스이용_자세히", {});
                      setExternalUrl("/term/240909");
                    }}
                  >
                    <p className="font-medium text-gray-800">
                      서비스 이용 약관
                    </p>
                    <p className="text-sm text-gray-500">
                      [필수] 약관에 동의해 주세요
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <IoIosArrowForward className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                  <Checkbox
                    className="w-6 h-6 border-2 border-gray-300 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-500 data-[state=checked]:border-transparent"
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      setIsChecked(checked === true);
                      analyticsTrack("클릭_동의_서비스이용", {});
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 시작 버튼 */}
          <Button
            className={`w-full h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-lg rounded-2xl shadow-lg transform transition-all duration-200 ${
              isChecked && !isDisabledAgreeBtn
                ? "hover:scale-[1.02] hover:shadow-xl"
                : "opacity-50 cursor-not-allowed"
            }`}
            disabled={!isChecked || isDisabledAgreeBtn}
            onClick={() => onClickAgreeStart()}
          >
            {isDisabledAgreeBtn ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>시작하는 중...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>🚀</span>
                <span>동의하고 시작하기</span>
              </div>
            )}
          </Button>

          {/* 하단 부가 정보 */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              PrayU와 함께 소중한 기도의 여정을 시작해보세요
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermServicePage;

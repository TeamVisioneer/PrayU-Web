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
  const createPrayCard = useBaseStore((state) => state.createPrayCard);
  const updatePrayCard = useBaseStore((state) => state.updatePrayCard);
  const groupList = useBaseStore((state) => state.groupList);
  const fetchGroupListByUserId = useBaseStore(
    (state) => state.fetchGroupListByUserId
  );

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const groupId = queryParams.get("groupId");

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
    const targetGroup = await createGroup(profile.id, groupName, "intro");
    if (!targetGroup) return;
    const myMember = await createMember(targetGroup.id, profile.id, "");
    if (!myMember) return;

    const prayCardId = localStorage.getItem("prayCardId");
    if (prayCardId) {
      await updatePrayCard(prayCardId, {
        group_id: targetGroup.id,
        user_id: profile.id,
      });
    } else {
      await createPrayCard(targetGroup.id, profile.id, "");
    }
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

    if (groupId) navigate(`/group/${groupId}`, { replace: true });
    else {
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
        <div className="w-full h-11 py-2 px-3 bg-white rounded-md flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div
              className="flex items-center gap-2"
              onClick={() => {
                analyticsTrack("클릭_동의_서비스이용_자세히", {});
                window.open(
                  "https://mmyeong.notion.site/PrayU-ee61275fa48842cda5a5f2ed5b608ec0?pvs=4",
                  "_blank",
                  "noopener,noreferrer"
                );
              }}
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
            onCheckedChange={(checked) => {
              setIsChecked(checked === true);
              analyticsTrack("클릭_동의_서비스이용", {});
            }}
          />
        </div>

        <Button
          className="w-full h-11 bottom-0 left-0"
          variant="primary"
          disabled={!isChecked || isDisabledAgreeBtn}
          onClick={() => onClickAgreeStart()}
        >
          동의하고 시작해요
        </Button>
      </div>
    </div>
  );
};

export default TermServicePage;

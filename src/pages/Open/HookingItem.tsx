import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import useBaseStore from "@/stores/baseStore";
import { analyticsTrack } from "@/analytics/analytics";

const HookingItem = () => {
  const user = useBaseStore((state) => state.user);
  const createGroup = useBaseStore((state) => state.createGroup);
  const createMember = useBaseStore((state) => state.createMember);
  const createPrayCard = useBaseStore((state) => state.createPrayCard);

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [showTitleText, setShowTitleText] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const [disabledCreateGroupBtn, setDisabledCreateGroupBtn] = useState(false);

  useEffect(() => {
    if (isImageLoaded) {
      const imageTimeout = setTimeout(() => {
        setShowImage(true);
      }, 500);
      const textTimeout = setTimeout(() => {
        setShowTitleText(true);
      }, 1000);
      const buttonTimeout = setTimeout(() => {
        setShowButton(true);
      }, 1500);
      return () => {
        clearTimeout(imageTimeout);
        clearTimeout(textTimeout);
        clearTimeout(buttonTimeout);
      };
    }
  }, [isImageLoaded]);

  const handleCreateGroup = async () => {
    if (!user) return;
    const userName = user.user_metadata.full_name;
    const groupName = userName ? `${userName}의 기도그룹` : "새 기도그룹";
    const targetGroup = await createGroup(user.id, groupName, "intro");
    if (!targetGroup) return;
    const myMember = await createMember(targetGroup.id, user.id, "");
    if (!myMember) return;

    await createPrayCard(targetGroup.id, user.id, "");
    return targetGroup.id;
  };

  const onClickCreateGroupBtn = async () => {
    analyticsTrack("클릭_그룹_생성", { where: "HookingDialog" });
    setDisabledCreateGroupBtn(true);
    const targetGroupId = await handleCreateGroup();
    if (!targetGroupId) {
      setDisabledCreateGroupBtn(false);
      return;
    }
    window.location.replace("/group/" + targetGroupId);
  };

  return (
    <div className="relative flex flex-col gap-4 justify-center items-center min-h-80vh max-h-80vh pb-10">
      <div className="h-[260px] w-full flex flex-col items-center">
        <img
          className={`h-full rounded-2xl transition-opacity duration-1000 ease-in ${
            showImage ? "opacity-100" : "opacity-0"
          }`}
          src={`/images/adsment.png`}
          onLoad={() => setIsImageLoaded(true)}
        />
      </div>
      <div
        className={`flex flex-col justify-center items-center gap-1 transition-opacity duration-1000 ease-in-out ${
          showTitleText ? "opacity-100" : "opacity-0"
        }`}
      >
        <h2 className="text-lg ">앞으로도 그룹원들과</h2>
        <h1 className="text-xl font-bold">지.속.적.으.로.</h1>
        <p className="font-light"># 주일의 기도를, 매일의 기도로!</p>
      </div>
      <section
        className={`flex flex-col items-center gap-4 transition-opacity duration-1000 ease-in-out ${
          showButton ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* <div className="left-0 right-0 text-base p-2 text-center bg-opacity-50 bottom-0 ">
          <p className=" leading-tight gmarket-font">
            <CountUp
              start={0}
              end={totalPrayCount}
              duration={5}
              separator=","
              className="text-indigo-800 font-extrabold text-2xl"
            />{" "}
            번의 기도가
          </p>
          <p className="leading-tight gmarket-font">
            PrayU 를 통해 전달되었어요
          </p>
        </div> */}
        <Button
          variant="primary"
          className="w-60 h-11 text-[0.95rem] rounded-[10px]"
          disabled={disabledCreateGroupBtn}
          onClick={() => onClickCreateGroupBtn()}
        >
          내 그룹 만들기
        </Button>
      </section>
    </div>
  );
};

export default HookingItem;

import inviteIcon from "@/assets/icon-invite.png";
import { PrayType, PrayTypeDatas } from "@/Enums/prayType";
import { SlMenu } from "react-icons/sl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";
import { days, getISOTodayDate, sleep } from "@/lib/utils";
import { analyticsTrack } from "@/analytics/analytics";
import { useNavigate } from "react-router-dom";
import useBaseStore from "@/stores/baseStore";
import completed from "@/assets/completed.svg";
import { MdOutlineTouchApp } from "react-icons/md";
import OtherMemberList from "@/components/member/OtherMemberList";
import { Play } from "lucide-react";
import PrayCard from "@/components/prayCard/PrayCard";
import { dummyPrayCard } from "@/mocks/dummyPrayCard";

const TutorialPage: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [todayPrayType, setTodayPrayType] = useState<PrayType | null>(null);

  const today = getISOTodayDate();
  const todayDt = new Date(today);

  const navigate = useNavigate();
  const user = useBaseStore((state) => state.user);
  const userLoading = useBaseStore((state) => state.userLoading);
  const setIsOpenShareDrawer = useBaseStore(
    (state) => state.setIsOpenShareDrawer
  );

  if (userLoading) return null;

  const TutorialComponentProps = [
    {
      title: "튜토리얼 시작",
      description: [
        "새로운 기도 그룹을 만들어 드렸어요",
        "기도친구를 초대하여 기도제목을 나눌 수 있어요!",
      ],
      textMarginTop: "mt-[230px]",
    },
    {
      title: "내 기도제목 보기",
      description: [
        "기도제목을 기록하는 곳이에요",
        "친구들이 내 기도제목을 보고 기도해 줄 수 있어요!",
      ],
      textMarginTop: "mt-[230px]",
    },
    {
      title: "오늘의 기도",
      description: [
        "친구들의 이번 주 기도제목을 볼 수 있어요",
        "하루에 한 번 매일 친구들에게 기도해 보아요!",
      ],
      textMarginTop: "mt-[230px]",
    },
    {
      title: "기도 반응하기",
      description: [
        "버튼을 눌러 반응을 남겨보세요",
        "친구들에게 기도반응을 전달 할 수 있어요!",
      ],
      textMarginTop: "mt-[230px]",
    },
    {
      title: "친구 초대하기",
      description: [
        "그룹에 친구를 초대해 주세요",
        "함께 기도할 때 서로에게 더욱 힘이 되어요!",
      ],
      textMarginTop: "mt-[230px]",
    },
  ];

  const onClickLeft = () => {
    analyticsTrack("클릭_튜토리얼_이전", {});
    if (index > 0) setIndex(index - 1);
  };

  const onClickRight = (eventOption: { where: string }) => {
    analyticsTrack("클릭_튜토리얼_다음", eventOption);
    if (index === 3 && !todayPrayType) {
      setTodayPrayType(PrayType.PRAY);
      return;
    }
    if (index < TutorialComponentProps.length - 1) setIndex(index + 1);
    if (index == TutorialComponentProps.length - 1) onClickCompletedTutorial();
  };

  const onClickCompletedTutorial = () => {
    analyticsTrack("클릭_튜토리얼_완료", {});
    navigate("/group");
  };

  const userName = user?.user_metadata.full_name || user?.user_metadata.name;
  const TopBar = (
    <div
      className={`flex justify-between items-center bg-mainBg p-2 rounded-md ${
        index === 0 && "z-40"
      }`}
      onClick={() => onClickRight({ where: "TopBar" })}
    >
      <div className="bg-mainBg w-[52px] flex items-center gap-1 text-[14px] p-1 rounded-sm">
        <img src={inviteIcon} className="w-[16px] h-[16px]" />
        <span>초대</span>
      </div>
      <div className="bg-mainBg text-lg font-bold flex items-center gap-1 px-2 rounded-sm">
        <div className="max-w-52 whitespace-nowrap overflow-hidden text-ellipsis">
          {userName ? `${userName}의 기도그룹` : "새 기도그룹"}
        </div>
        <span className="text-sm text-gray-500">1</span>
      </div>
      <div className="w-[52px] flex justify-end">
        <SlMenu size={20} />
      </div>
    </div>
  );

  const MyMemberUI = (
    <div
      className={`w-full flex flex-col gap-3 cursor-pointer bg-white p-[25px] rounded-[15px] ${
        index === 1 && "z-40"
      }`}
      onClick={() => onClickRight({ where: "MyMemberUI" })}
    >
      <div className="flex flex-col gap-1">
        <h3 className="flex font-bold text-lg">내 기도제목</h3>
        <div className="text-left text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
          ✏️ 기도카드를 작성해 보아요
        </div>
      </div>
      <div className="flex gap-2">
        <div className="w-fit flex bg-gray-100 rounded-lg px-[12px] py-2 gap-[16px]">
          {Object.values(PrayType).map((type) => {
            return (
              <div key={type} className="flex items-center gap-1 ">
                <img
                  src={PrayTypeDatas[type].img}
                  alt={PrayTypeDatas[type].emoji}
                  className="w-5 h-5 opacity-90"
                />
                <p className="text-sm text-dark">0</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const Calendar = (
    <div className="flex justify-around">
      {days.map((day, index) => (
        <div key={index} className="w-[10%] flex flex-col items-center gap-1">
          <span
            className={`text-sm ${
              index == todayDt.getDay()
                ? "text-black font-bold"
                : "text-deactivate"
            }`}
          >
            {day}
          </span>
          <div className="w-full aspect-square flex items-center justify-center rounded-sm bg-[#DEE0F1]">
            {index == todayDt.getDay() && (
              <img
                src={PrayTypeDatas[todayPrayType as PrayType]?.reactImg}
                className={
                  todayPrayType
                    ? "w-full h-full rounded-sm"
                    : index == todayDt.getDay()
                    ? "w-full h-full rounded-sm border-[1.5px] border-[#BBBED4]"
                    : ""
                }
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const ReactionBtn = (
    <div className="flex justify-around">
      {Object.values(PrayType).map((type) => {
        const emojiData = PrayTypeDatas[type];
        return (
          <div key={type} className="relative w-1/5 max-w-20">
            <button
              className={`w-full aspect-square rounded-full flex justify-center items-center p-2 duration-1000 ease-in-out ${
                emojiData.bgColor
              } ${
                !todayPrayType
                  ? `opacity-90 ${emojiData.shadowColor} animate-pulse`
                  : todayPrayType == type
                  ? `opacity-90 ring-4 ring-offset-2 ${emojiData.ringColor}`
                  : `opacity-20 ${emojiData.shadowColor}`
              }`}
              onClick={() => {
                setTodayPrayType(type);
                sleep(1200).then(() => {
                  onClickRight({ where: "ReactionBtn" });
                });
              }}
            >
              <img src={emojiData.icon} className="w-3/4 h-3/4" />
            </button>
            {type == PrayType.PRAY && !todayPrayType && (
              <span className="absolute -top-2 -right-3 text-white bg-black text-xs rounded-xl px-2 py-1">
                클릭
              </span>
            )}
          </div>
        );
      })}
    </div>
  );

  const CompletedUI = (
    <div className="relative flex flex-col justify-center items-center h-80vh">
      <div className="flex flex-col gap-4 justify-center items-center">
        <div className="flex flex-col gap-4 items-center ">
          <h1 className="text-2xl font-bold">오늘의 기도 완료</h1>
          <div className="h-[120px] w-[120px] flex flex-col items-center">
            <img className="h-full w-full rounded-2xl" src={completed} />
          </div>
        </div>
        <div className="flex flex-col justify-center items-center text-liteBlack">
          <p>친구들의 기도제목으로</p>
          <p>오늘의 기도를 시작해 보아요</p>
        </div>
        <Button
          variant="primary"
          className={`w-56 h-[46px] text-md rounded-[10px] ${
            index === 4 && "z-40 animate-pulse duration-1000"
          }`}
          onClick={() => {
            onClickRight({ where: "CompletedUI" });
            setIsOpenShareDrawer(true);
          }}
        >
          친구 초대하기
        </Button>
      </div>
    </div>
  );

  const TodayPrayDrawer = (
    <div className="h-full -m-5 flex flex-col justify-end bg-black/50">
      <div className="bg-mainBg rounded-t-2xl px-10 pt-10 h-80vh border-2 border-gray">
        {index == 3 && (
          <div className="flex flex-col gap-2">
            <PrayCard prayCard={dummyPrayCard} />
            <div className={`${index === 3 ? "z-50" : ""}`}>
              <div className="flex flex-col gap-6 p-2 pb-4 mb-5 bg-mainBg rounded-md">
                {Calendar}
                {ReactionBtn}
              </div>
            </div>
          </div>
        )}
        {index == 4 && CompletedUI}
      </div>
    </div>
  );

  const DimUI = (
    <div
      className="fixed inset-x-0 z-30 top-0 mx-auto w-full h-full max-w-[480px] bg-black/80 flex flex-col items-center p-5 text-white gap-10"
      onClick={(e) => {
        const clickedX = e.clientX;
        const windowWidth = window.innerWidth;
        if (clickedX < windowWidth / 2) onClickLeft();
        else onClickRight({ where: "DimUI" });
      }}
    >
      <div
        className={`flex-grow flex flex-col gap-5 text-center ${TutorialComponentProps[index].textMarginTop}`}
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold">
            {TutorialComponentProps[index].title}
          </h1>
          <div className="font-light">
            {TutorialComponentProps[index].description.map((desc, index) => (
              <p key={index}>{desc}</p>
            ))}
          </div>
        </div>
        <footer className="text-white flex justify-around items-center gap-4 h-[32px]">
          {index == 0 && <div className="w-8"></div>}
          <div className="flex flex-col items-center gap-4">
            <div className="flex justify-between items-center gap-4">
              <FaAngleLeft size={24} />
              <span>
                {index + 1} / {TutorialComponentProps.length}
              </span>
              <FaAngleRight size={24} />
            </div>
            <a
              className="text-white/50 cursor-pointer"
              onClick={() => onClickCompletedTutorial()}
            >
              {index == TutorialComponentProps.length - 1 ? "" : "건너뛰기"}
            </a>
          </div>
          {index == 0 && (
            <div className="flex flex-col gap-1 animate-pulse duration-700">
              <MdOutlineTouchApp size={32} />
            </div>
          )}
        </footer>
      </div>
    </div>
  );

  return (
    <div className="p-5 flex flex-col w-full h-full">
      {DimUI}
      {index < 3 ? (
        <div className="flex flex-col w-full h-full gap-5">
          {TopBar}
          <div className="flex flex-col h-full gap-4">
            {MyMemberUI}
            <OtherMemberList />
            <div
              className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 ${
                index === 2 && "z-40 animate-pulse duration-1000"
              }`}
            >
              <Button
                variant="primary"
                className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 px-8 py-5 h-auto rounded-xl active:scale-95"
                onClick={() => {
                  onClickRight({ where: "TodayPrayStartCard" });
                }}
              >
                <div className="flex items-center gap-3">
                  <Play className="h-5 w-5" />
                  <span className="text-lg font-medium">기도 시작하기</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        TodayPrayDrawer
      )}
    </div>
  );
};

export default TutorialPage;

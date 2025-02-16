import useBaseStore from "@/stores/baseStore";
import { PrayType, PrayTypeDatas } from "@/Enums/prayType";
import { getDateDistance } from "@toss/date";
import {
  getISODateYMD,
  getISOOnlyDate,
  getISOTodayDate,
  isCurrentWeek,
} from "@/lib/utils";
import iconUserMono from "@/assets/icon-user-mono.svg";
import { analyticsTrack } from "@/analytics/analytics";
import MyPrayCardMenuBtn from "./MyPrayCardMenuBtn";
import ExpiredPrayCardUI from "./ExpiredPrayCardUI";
import { Skeleton } from "../ui/skeleton";
import { useNavigate } from "react-router-dom";

const MyPrayCardUI: React.FC = () => {
  const navigate = useNavigate();
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const userPrayCardList = useBaseStore((state) => state.userPrayCardList);
  const setIsOpenMyPrayDrawer = useBaseStore(
    (state) => state.setIsOpenMyPrayDrawer
  );
  const inputPrayCardContent = useBaseStore(
    (state) => state.inputPrayCardContent
  );

  if (!userPrayCardList || !targetGroup) {
    return (
      <div className="flex justify-center items-center min-h-80vh max-h-80vh px-10 pt-[68px]">
        <Skeleton className="w-full h-[300px] flex items-center gap-4 p-4 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (
    userPrayCardList &&
    (userPrayCardList.length == 0 ||
      !isCurrentWeek(userPrayCardList[0].created_at))
  ) {
    return <ExpiredPrayCardUI />;
  }

  const prayCard = userPrayCardList[0];
  const createdDateYMD = getISODateYMD(prayCard.created_at);

  const dateDistance = getDateDistance(
    new Date(getISOOnlyDate(prayCard.created_at)),
    new Date(getISOTodayDate())
  );

  const onClickPrayerList = () => {
    setIsOpenMyPrayDrawer(true);
    analyticsTrack("클릭_기도카드_반응결과", { where: "MyPrayCard" });
  };

  const handleEditClick = () => {
    analyticsTrack("클릭_기도카드_수정", {});
    navigate(`/group/${targetGroup.id}/praycard/${prayCard.id}/edit`);
  };

  const MyPrayCardBody = (
    <div className="flex flex-col bg-white rounded-2xl shadow-prayCard flex-grow min-h-full max-h-full">
      <div className="bg-gradient-to-r from-start via-middle via-52% to-end flex flex-col justify-center items-start gap-1 rounded-t-2xl p-5">
        <div className="flex items-center gap-2 w-full">
          <div className="flex gap-2 items-center">
            <p className="text-xl text-white">
              기도 {dateDistance.days + 1}일차
            </p>
          </div>
        </div>
        <p className="text-sm text-white w-full text-left">
          시작일 : {createdDateYMD.year}.{createdDateYMD.month}.
          {createdDateYMD.day}
        </p>
      </div>
      <div className="p-2 flex flex-col flex-grow overflow-y-auto no-scrollbar">
        <p
          onClick={() => handleEditClick()}
          className={`text-sm w-full p-2 overflow-y-auto no-scrollbar border-none whitespace-pre-wrap ${
            inputPrayCardContent ? "text-black" : "text-gray-400"
          }`}
        >
          {inputPrayCardContent ||
            `기도카드를 작성해 보아요 ✏️\n내용은 작성 후에도 수정할 수 있어요 :)\n\n1. PrayU와 함께 기도할 수 있기를\n2. `}
        </p>
        {prayCard.updated_at !== prayCard.created_at && (
          <p className="px-2 text-xs text-gray-400">(편집됨)</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col px-10 gap-2 min-h-70vh max-h-70vh">
      <div className="flex justify-end px-2">
        <MyPrayCardMenuBtn
          handleEditClick={handleEditClick}
          prayCard={prayCard}
        />
      </div>
      {MyPrayCardBody}
      <div
        className="flex justify-center focus:outline-none gap-2 mt-4"
        onClick={() => onClickPrayerList()}
      >
        {Object.values(PrayType).map((type) => (
          <div
            key={type}
            className="w-[60px] py-1 px-2 flex rounded-lg bg-white text-black gap-2"
          >
            <div className="text-sm w-5 h-5">
              <img
                src={PrayTypeDatas[type].img}
                alt={PrayTypeDatas[type].emoji}
                className="w-5 h-5"
              />
            </div>
            <div className="text-sm">
              {prayCard.pray.filter((pray) => pray.pray_type === type).length}
            </div>
          </div>
        ))}
        <div className="bg-white rounded-lg flex justify-center items-center p-1">
          <img className="w-5" src={iconUserMono} alt="user-icon" />
        </div>
      </div>
    </div>
  );
};

export default MyPrayCardUI;

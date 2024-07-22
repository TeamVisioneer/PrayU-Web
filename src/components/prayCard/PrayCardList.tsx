import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { PrayType } from "@/Enums/prayType";
import { getISODate, getISOToday } from "@/lib/utils";
import useBaseStore from "@/stores/baseStore";
import { useEffect } from "react";
import { ClipLoader } from "react-spinners";
import { Pray } from "supabase/types/tables";

interface PrayCardListProps {
  currentUserId: string | undefined;
}

// TODO: PrayData 한번에 가져와서 미리 렌더링 할 수 있도록 수정
const PrayCardList: React.FC<PrayCardListProps> = ({ currentUserId }) => {
  const groupPrayCardList = useBaseStore((state) => state.groupPrayCardList);
  const bulkFetchPrayDataByUserId = useBaseStore(
    (state) => state.bulkFetchPrayDataByUserId
  );
  const prayCardIdPrayDataHash = useBaseStore(
    (state) => state.prayCardIdPrayDataHash
  );
  const createPray = useBaseStore((state) => state.createPray);

  useEffect(() => {
    if (groupPrayCardList) {
      bulkFetchPrayDataByUserId(
        currentUserId,
        groupPrayCardList.map((prayCard) => prayCard.id)
      );
    }
  }, [bulkFetchPrayDataByUserId, currentUserId, groupPrayCardList]);

  if (!prayCardIdPrayDataHash) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color={"#123abc"} loading={true} />
      </div>
    );
  }

  const getEmoji = (prayType: PrayType) => {
    if (prayType === "pray") return { emoji: "🙏", text: "기도해요" };
    if (prayType === "good") return { emoji: "👍", text: "힘내세요" };
    if (prayType === "like") return { emoji: "❤️", text: "응원해요" };
    return { emoji: "", text: "" };
  };

  const generateDates = (
    createdAt: string | undefined,
    prayData: Pray[] | undefined
  ) => {
    if (!createdAt) return [];
    const startDate = getISODate(createdAt);
    const dateList = [];

    for (let i = 0; i < 7; i++) {
      const newDate = new Date(startDate);
      newDate.setDate(new Date(startDate).getDate() + i);
      const newDateString = newDate.toISOString().split("T")[0];

      const pray = prayData?.find((entry) => {
        const prayDate = getISODate(entry.created_at).split("T")[0];
        return prayDate === newDateString;
      });

      const emoji = pray ? getEmoji(pray.pray_type as PrayType)["emoji"] : "";
      dateList.push({ date: newDateString, emoji: emoji });
    }
    return dateList;
  };

  const currentDate = getISOToday().split("T")[0];

  return (
    <Carousel>
      <CarouselContent>
        <CarouselItem className="basis-5/6 pointer-events-none">
          <div className="flex justify-center items-center w-full aspect-square">
            start
          </div>
        </CarouselItem>
        {groupPrayCardList?.map((prayCard) => {
          const prayData = prayCardIdPrayDataHash[prayCard.id];
          const weeklyDays = generateDates(prayCard.created_at, prayData);
          const todayPrayType = prayData?.find(
            (pray) =>
              pray.user_id === currentUserId &&
              new Date(pray.created_at.split("T")[0]) >=
                new Date(getISOToday().split("T")[0])
          )?.pray_type;

          return (
            <CarouselItem key={prayCard.id} className="basis-5/6">
              {/* prayCardBody */}
              <div className="flex flex-col h-50vh p-5 bg-blue-50 rounded-2xl">
                <div className="flex items-center gap-2">
                  <img
                    src={prayCard?.profiles.avatar_url || ""}
                    className="w-5 h-5 rounded-full"
                  />
                  <div className="text-sm">{prayCard?.profiles.full_name}</div>
                </div>
                <div className="flex h-full justify-center items-center">
                  {prayCard?.content}
                </div>
              </div>
              {/* prayCardBody */}

              {/* weeklyCalendar */}
              <div className="flex justify-center space-x-4">
                {weeklyDays.map((date) => {
                  const isToday = date.date === currentDate;
                  const day = new Date(date.date).getDate(); // Extract the day part of the date
                  return (
                    <div key={date.date} className="flex flex-col items-center">
                      <span
                        className={`text-sm ${
                          isToday ? "font-bold text-black" : "text-gray-400"
                        }`}
                      >
                        {day}
                      </span>
                      <div
                        className={`w-8 h-8 flex items-center justify-center rounded ${
                          isToday ? "bg-red-100" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`text-2xl ${
                            isToday ? "text-red-500" : "text-gray-500"
                          }`}
                        >
                          {date.emoji}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* weeklyCalendar */}

              {/* ReactionBtn */}
              <div className="flex justify-center space-x-8">
                {Object.values(PrayType).map((type) => {
                  const { emoji, text } = getEmoji(type as PrayType);
                  return (
                    <button
                      key={type}
                      onClick={() =>
                        createPray(
                          prayCard?.id,
                          currentUserId,
                          type as PrayType
                        )
                      }
                      className={`w-[90px] py-2 px-2 flex flex-col items-center rounded-2xl ${
                        todayPrayType === type
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-purple-100 text-black"
                      }`}
                      disabled={Boolean(todayPrayType)}
                    >
                      <div className="text-2xl">{emoji}</div>
                      <div className="text-sm">{text}</div>
                    </button>
                  );
                })}
              </div>
              {/* ReactionBtn */}
            </CarouselItem>
          );
        })}
        <CarouselItem className="basis-5/6 pointer-events-none">
          <div className="flex justify-center items-center w-full aspect-square">
            end
          </div>
        </CarouselItem>
      </CarouselContent>
    </Carousel>
  );
};

export default PrayCardList;

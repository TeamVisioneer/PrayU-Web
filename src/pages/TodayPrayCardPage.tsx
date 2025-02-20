import Stories from "react-insta-stories";
import useBaseStore from "@/stores/baseStore";
import TodayPrayCompletedItem from "@/components/todayPray/TodayPrayCompletedItem";
import TodayPrayInviteCompletedItem from "@/components/todayPray/TodayPrayInviteCompletedItem";
import DummyPrayCardUI from "@/components/prayCard/DummyPrayCardUI";
import PrayCardUI from "@/components/prayCard/PrayCardUI";
import MyPrayCardUI from "@/components/prayCard/MyPrayCardUI";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { getISOTodayDate, getNextDate, getWeekInfo } from "@/lib/utils";
import ReactionWithCalendar from "@/components/prayCard/ReactionWithCalendar";

const TodayPrayCardPage = () => {
  const { groupId } = useParams();
  const user = useBaseStore((state) => state.user);
  const prayCardCarouselList = useBaseStore(
    (state) => state.prayCardCarouselList
  );
  const memberList = useBaseStore((state) => state.memberList);
  const isPrayToday = useBaseStore((state) => state.isPrayToday);
  const fetchGroupPrayCardList = useBaseStore(
    (state) => state.fetchGroupPrayCardList
  );
  const groupPrayCardList = useBaseStore((state) => state.groupPrayCardList);

  useEffect(() => {
    const todayDt = getISOTodayDate();
    const startDt = getWeekInfo(todayDt).weekDates[0];
    const endDt = getNextDate(getWeekInfo(todayDt).weekDates[6]);
    if (user) fetchGroupPrayCardList(groupId!, user.id, startDt, endDt);
  }, [fetchGroupPrayCardList, groupId, user]);

  interface TestStories {
    content: () => React.ReactNode;
  }

  const testStories: TestStories[] = [
    ...(memberList?.length === 1
      ? [
          {
            content: () => (
              <div className="h-full w-full bg-mainBg flex flex-col items-center justify-center p-4">
                <DummyPrayCardUI
                  profileImage="/images/avatar/avatar_1.png"
                  name="기도 카드"
                  content={`PrayU에서 사용하는 기도카드입니다\n기도카드를 통해 친구들의 기도제목을 한눈에 보아요!`}
                />
              </div>
            ),
          },
        ]
      : []),
    ...(groupPrayCardList?.map((prayCard) => ({
      content: () => (
        <div className="h-full w-full bg-mainBg flex flex-col gap-2 items-center justify-center p-10">
          {prayCard.user_id === user?.id ? (
            <MyPrayCardUI prayCard={prayCard} />
          ) : (
            <PrayCardUI prayCard={prayCard} />
          )}
          <ReactionWithCalendar
            prayCard={prayCard}
            eventOption={{
              where: "TodayPrayCardListDrawer",
              total_member: prayCardCarouselList?.length || 0,
            }}
          />
        </div>
      ),
    })) || []),
    ...(isPrayToday
      ? [
          {
            content: () => (
              <div className="h-full w-full bg-mainBg flex flex-col items-center justify-center p-10">
                {memberList?.length === 1 ? (
                  <TodayPrayInviteCompletedItem />
                ) : (
                  <TodayPrayCompletedItem />
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="h-screen w-full">
      {/* asdf */}
      <Stories
        stories={testStories}
        // defaultInterval={1500}
        width="100%"
        height="100%"
        storyStyles={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};

export default TodayPrayCardPage;

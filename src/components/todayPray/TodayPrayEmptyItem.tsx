import { KakaoShareButton, ExpiredMemberLink } from "../share/KakaoShareBtn";

const TodayPrayEmptyItem = () => {
  return (
    <div className="flex flex-col justify-center items-center px-10 pb-5 gap-4">
      <p className="text-lg font-bold">아직 올라온 기도제목이 없어요 😭</p>
      <div className="h-[300px] w-full flex flex-col items-center">
        <img
          className="h-full rounded-md"
          src="/images/KakaoShareMessage.png"
        />
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-500">
          친구들과 함께 오늘의 기도를 시작해 보아요:)
        </p>
      </div>
      <KakaoShareButton
        className="w-64"
        buttonText="요청 메세지 보내기"
        kakaoLinkObject={ExpiredMemberLink()}
        eventOption={{ where: "PrayCardList" }}
      ></KakaoShareButton>
    </div>
  );
};

export default TodayPrayEmptyItem;

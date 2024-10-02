import { KakaoShareButton, TodayPrayLink } from "../share/KakaoShareBtn";

const TodayPrayEmptyItem = () => {
  return (
    <div className="flex flex-col justify-center items-center px-10 gap-4">
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
        buttonText="카카오톡으로 초대하기"
        kakaoLinkObject={TodayPrayLink()}
        eventOption={{ where: "PrayCardList" }}
      ></KakaoShareButton>
    </div>
  );
};

export default TodayPrayEmptyItem;

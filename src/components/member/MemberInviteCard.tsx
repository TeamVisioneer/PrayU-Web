import { KakaoShareButton } from "../share/KakaoShareBtn";

export const MemberInviteCard = () => {
  return (
    <div className="flex flex-col flex-grow justify-center items-center text-center gap-5  border rounded-2xl shadow-prayCard bg-gradient-to-b from-start/40 via-middle/40 via-30% to-end/40  ">
      <div className="h-[180px] flex justify-center">
        <img
          className="h-full rounded-md shadow-prayCard"
          src="/images/KakaoShare.png"
        />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="font-bold text-xl">그룹원 초대</h1>
        <div className="text-grayText">
          <h1>친구들과 함께 오늘의 기도를 시작해 보아요</h1>
          <h1>기도제목을 공유하고 매일 기도해 주세요</h1>
        </div>
      </div>
      <KakaoShareButton
        groupPageUrl={window.location.href}
        id="paryTodayIntro"
        message="카카오톡으로 초대하기"
        eventOption={{ where: "MemberInviteCard" }}
      ></KakaoShareButton>
    </div>
  );
};

export default MemberInviteCard;

import { KakaoShareButton } from "../KakaoShareBtn";

export const MemberInviteCard = () => {
  return (
    <div className="flex flex-col gap-4 border p-10 rounded-lg shadow-md bg-white items-center h-60vh">
      <img
        src="https://qggewtakkrwcclyxtxnz.supabase.co/storage/v1/object/public/prayu/MainPageIntro2.png"
        className="rounded-md"
      />
      <div className="flex flex-col text-center gap-2">
        <p className="text-lg font-bold">그룹원 초대</p>
        <div>
          <p className="text-sm text-gray-500">그룹원을 초대하고</p>
          <p className="text-sm text-gray-500">오늘의 기도를 시작해 보아요</p>
        </div>
      </div>

      <KakaoShareButton
        groupPageUrl={window.location.href}
        id="paryTodayIntro"
        message="카카오톡으로 초대하기"
      ></KakaoShareButton>
    </div>
  );
};

export default MemberInviteCard;

import { KakaoShareButton } from "../KakaoShareBtn";

export const GroupInviteCard = () => {
  return (
    <div className="flex flex-col gap-4 border p-10 rounded-lg shadow-md bg-white items-center h-60vh">
      <img
        src="https://qggewtakkrwcclyxtxnz.supabase.co/storage/v1/object/public/prayu/MainPageIntro2.png"
        className="rounded-md"
      />
      <div className="flex flex-col gap-2">
        <div className="text-center text-lg font-bold">그룹원 초대</div>
        <div className="text-sm text-gray-500">
          그룹원을 초대하고 오늘의 기도를 시작해 보아요
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

export default GroupInviteCard;

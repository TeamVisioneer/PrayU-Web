import { KakaoShareButton } from "../KakaoShareBtn";

export const MemberInviteCard = () => {
  return (
    <div className="flex flex-col gap-4 border p-6 rounded-lg shadow-md bg-white items-center h-60vh overflow-hidden">
      <div>
        <img src="https://qggewtakkrwcclyxtxnz.supabase.co/storage/v1/object/public/prayu/intro_img_2.png" />
      </div>

      <div className="flex flex-col text-center gap-4">
        <div>
          <p className="text-sm text-gray-500">
            그룹원을 초대하고 오늘의 기도를 시작해 보아요
          </p>
        </div>
        <KakaoShareButton
          groupPageUrl={window.location.href}
          id="paryTodayIntro"
          message="카카오톡으로 초대하기"
        ></KakaoShareButton>
      </div>
    </div>
  );
};

export default MemberInviteCard;

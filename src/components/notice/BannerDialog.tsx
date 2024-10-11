import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useBaseStore from "@/stores/baseStore";
import { KakaoShareButton, PlayListShareLink } from "../share/KakaoShareBtn";
import OpenShareDrawerBtn from "../share/OpenShareDrawerBtn";
import { getDateDistance } from "node_modules/@toss/date/dist/date";

const BannerDialog = () => {
  const bannerDialogContentType = useBaseStore(
    (state) => state.bannerDialogContentType
  );
  const isOpenBannerDialog = useBaseStore((state) => state.isOpenBannerDialog);
  const setIsOpenBannerDialog = useBaseStore(
    (state) => state.setIsOpenBannerDialog
  );

  const targetGroup = useBaseStore((state) => state.targetGroup);
  const memberList = useBaseStore((state) => state.memberList);

  if (!targetGroup || !memberList) return null;

  const createdAt = new Date(targetGroup.created_at);
  const deadline = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
  const { hours, minutes } = getDateDistance(new Date(), deadline);

  const RewardContent = (
    <div className="flex flex-col items-center">
      <section className="h-80 w-full flex justify-center">
        <img src="/images/PlayListCover.png" className="h-80" />
      </section>
      <section className="flex flex-col items-center gap-3">
        <h1 className="text-lg font-bold">PrayU PlayList 도착 🎁</h1>
        <div className="text-sm text-gray-400 text-center">
          <p>
            이벤트 마감까지 {hours > 0 ? `${hours} 시간` : `${minutes} 분`}이
            남았어요!
          </p>
          <p>버튼을 통해 PlayList Vol.1 를 받아주세요</p>
        </div>
        <KakaoShareButton
          buttonText="카카오톡으로 전달받기"
          kakaoLinkObject={PlayListShareLink()}
          eventOption={{ where: "BannerDialog" }}
        />
      </section>
    </div>
  );

  const EventContent = (
    <div className="flex flex-col items-center">
      <section className="h-80 w-full flex justify-center">
        <img src="/images/PlayListCover.png" className="h-80" />
      </section>
      <section className="flex flex-col items-center gap-3">
        <h1 className="text-lg font-bold">PrayU 초대 이벤트</h1>
        <div className="text-sm text-gray-400 text-center">
          <p>24시간 내에 그룹원 초대를 완료할 경우</p>
          <p>PrayU PlayList Vol.1 PDF를 제공해 드립니다!</p>
        </div>
        <OpenShareDrawerBtn
          text="친구 초대하기"
          eventOption={{ where: "BannerDialog" }}
        />
      </section>
    </div>
  );

  return (
    <Dialog open={isOpenBannerDialog} onOpenChange={setIsOpenBannerDialog}>
      <DialogContent className="w-11/12 rounded-xl bg-mainBg">
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
          {bannerDialogContentType === "reward"
            ? RewardContent
            : bannerDialogContentType === "invite"
            ? EventContent
            : null}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default BannerDialog;

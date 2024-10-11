import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useBaseStore from "@/stores/baseStore";
import { KakaoShareButton, PlayListShareLink } from "../share/KakaoShareBtn";

const BannerDialog = () => {
  // const bannerDialogContent = useBaseStore(
  //   (state) => state.bannerDialogContent
  // );
  const isOpenBannerDialog = useBaseStore((state) => state.isOpenBannerDialog);
  const setIsOpenBannerDialog = useBaseStore(
    (state) => state.setIsOpenBannerDialog
  );

  const targetGroup = useBaseStore((state) => state.targetGroup);
  const memberList = useBaseStore((state) => state.memberList);

  if (!targetGroup || !memberList) return null;

  return (
    <Dialog open={isOpenBannerDialog} onOpenChange={setIsOpenBannerDialog}>
      <DialogContent className="w-11/12 rounded-xl bg-mainBg">
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center">
          <section className="h-80 w-full flex justify-center">
            <img src="/images/PlayListCover.png" className="h-80" />
          </section>
          <section className="flex flex-col items-center gap-3">
            <h1 className="text-lg font-bold">PrayU PlayList 도착 🎁</h1>
            <div className="text-sm text-gray-400 text-center">
              <p>이 남았어요!</p>
              <p>버튼을 통해 PlayList Vol.1 를 받아주세요</p>
            </div>
            <KakaoShareButton
              buttonText="카카오톡으로 전달받기"
              kakaoLinkObject={PlayListShareLink()}
              eventOption={{ where: "RewardBanner" }}
            />
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BannerDialog;

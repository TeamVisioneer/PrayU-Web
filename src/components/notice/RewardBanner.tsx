import { analyticsTrack } from "@/analytics/analytics";
import useBaseStore from "@/stores/baseStore";
import { getDateDistance } from "@toss/date";
import { LuDownload } from "react-icons/lu";
import { Badge } from "../ui/badge";

const RewardBanner = () => {
  const setBannerDialogData = useBaseStore(
    (state) => state.setBannerDialogData
  );
  const setIsOpenBannerDialog = useBaseStore(
    (state) => state.setIsOpenBannerDialog
  );
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const groupList = useBaseStore((state) => state.groupList);

  if (!targetGroup || !groupList) return null;

  const createdAt = new Date(targetGroup.created_at);
  const deadline = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
  const { hours, minutes, seconds } = getDateDistance(new Date(), deadline);

  if (groupList.length > 1) return null;
  if (hours == 0 && minutes == 0 && seconds == 0) return null;

  const handleDownload = async () => {
    analyticsTrack("클릭_베너_다운로드", {});
    try {
      const fileUrl =
        "https://qggewtakkrwcclyxtxnz.supabase.co/storage/v1/object/public/prayu/PrayUPlayList/PrayU_PlayList_Vol_1.pdf";
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "PrayU_PlayList_Vol_1.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading the PDF file:", error);
    }
  };

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
          <p>버튼을 눌러 PlayList Vol.1 PDF 를 받아주세요</p>
        </div>

        <Badge onClick={handleDownload} className="flex gap-1">
          <span>다운로드</span>
          <LuDownload />
        </Badge>
      </section>
    </div>
  );

  const onClickBanner = () => {
    analyticsTrack("클릭_베너_리워드", {});
    setBannerDialogData(RewardContent);
    setIsOpenBannerDialog(true);
  };

  return (
    <div
      className=" flex flex-col items-center p-2 gap-1 rounded-xl cursor-pointer bg-gradient-to-r from-start via-middle via-52% to-end"
      onClick={() => onClickBanner()}
    >
      <h1 className="text-sm font-bold">PrayU PlayList 도착했어요 🎁</h1>
      <p className="text-xs text-center">지금 바로 클릭하여 확인해보세요!</p>
    </div>
  );
};

export default RewardBanner;

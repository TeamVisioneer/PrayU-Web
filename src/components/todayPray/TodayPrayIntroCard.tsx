import { KakaoShareButton } from "../KakaoShareBtn";
import { getDomainUrl } from "../../lib/utils";

interface IntroProps {
  groupId: string | undefined;
}

export const TodayPrayIntroCard: React.FC<IntroProps> = ({
  groupId: groupId,
}) => {
  const domainUrl = getDomainUrl();
  return (
    <div className="flex flex-col  gap-2 border p-4 rounded-lg shadow-md bg-white justify-center items-center h-60vh">
      <div className="text-center">
        <h1>그룹원들을 초대하여 함께</h1>
        <h1 className="mb-5">기도제목을 공유하고 기도해 보아요</h1>
      </div>

      <img
        src={"/public/PrayCard.png"}
        sizes="
            (max-width: 640px) 100vw,"
        className="rounded-md  w-full"
      />

      <KakaoShareButton
        groupPageUrl={`${domainUrl}/group/${groupId}`}
        id="groupPage"
      ></KakaoShareButton>
    </div>
  );
};

export default TodayPrayIntroCard;

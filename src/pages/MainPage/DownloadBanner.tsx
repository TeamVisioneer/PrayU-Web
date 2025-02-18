import { analyticsTrack } from "@/analytics/analytics";

const DownloadBanner = () => {
  const onClickInstallPrayU = async () => {
    analyticsTrack("클릭_PrayU_설치", { where: "DownloadBanner" });
    if (navigator.userAgent.match(/Android/i)) {
      window.location.href =
        "https://play.google.com/store/apps/details?id=com.team.visioneer.prayu";
    } else if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
      window.location.href =
        "https://itunes.apple.com/kr/app/apple-store/id6711345171";
    } else {
      window.location.href = "https://linktr.ee/prayu.site";
    }
  };

  return (
    <div
      className="w-full bg-purple-100 py-4 px-4"
      onClick={() => onClickInstallPrayU()}
    >
      <div className="flex justify-between items-center max-w-[480px] mx-auto">
        <p className="text-purple-800 font-medium">앱으로 시작하기</p>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors">
          다운로드
        </button>
      </div>
    </div>
  );
};

export default DownloadBanner;

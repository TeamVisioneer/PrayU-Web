import useBaseStore from "@/stores/baseStore";
import { Button } from "@/components/ui/button";
import { analyticsTrack } from "@/analytics/analytics";
import LogInDrawer from "@/components/auth/LogInDrawer";
import { useEffect } from "react";
import CountUp from "react-countup";
import { useNavigate } from "react-router-dom";
import DownloadBanner from "./MainPage/DownloadBanner";
import WeekUpdateDialog from "@/components/notice/WeekUpdateDialog";

const MainPage: React.FC = () => {
  const user = useBaseStore((state) => state.user);
  const navigate = useNavigate();
  const userLoading = useBaseStore((state) => state.userLoading);
  const totalPrayCount = useBaseStore((state) => state.totalPrayCount);
  const fetchTotalPrayCount = useBaseStore(
    (state) => state.fetchTotalPrayCount
  );
  const setIsOpenLoginDrawer = useBaseStore(
    (state) => state.setIsOpenLoginDrawer
  );

  const isApp = useBaseStore((state) => state.isApp);

  useEffect(() => {
    fetchTotalPrayCount();
  }, [fetchTotalPrayCount]);

  const PrayUStartBtn = () => {
    return (
      <Button
        variant="primary"
        className="w-52"
        onClick={() => {
          analyticsTrack("클릭_메인_시작하기", { where: "PrayUStartBtn" });
          if (userLoading) return;
          if (user) navigate("/group");
          else setIsOpenLoginDrawer(true);
        }}
      >
        PrayU 시작하기
      </Button>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center text-center h-full">
      <section className="w-full flex flex-col items-center ">
        <div className="flex flex-col gap-8  items-center justify-center ">
          <div className="h-[80px] w-full flex flex-col items-center object-cover">
            <img className="h-full" src="/images/PrayULogoV3.png" />
          </div>
          <div className="text-2xl font-bold">
            <h1>기도제목을 나누고,</h1>
            <h1>함께 기도하는 공간 PrayU </h1>
          </div>
          <div className="text-lg">
            <p>
              <CountUp
                start={0}
                end={totalPrayCount}
                duration={1.5}
                separator=","
                className="text-mainBtn font-extrabold"
              />{" "}
              번의 기도가
            </p>
            <p>PrayU 를 통해 전달되었어요</p>
          </div>
          <div className="flex flex-col gap-4">
            <PrayUStartBtn />
            {["team.visioneer15@gmail.com", "s2615s@naver.com"].includes(
              user?.user_metadata.email
            ) && (
              <Button
                variant="ghost"
                className="w-52"
                onClick={() => {
                  navigate("/admin");
                }}
              >
                관리자 페이지
              </Button>
            )}
            {/* <Button
              variant="primary"
              className="w-52"
              onClick={() => {
                navigate("/group/mock");
              }}
            >
              목업 페이지
            </Button>
            <Button
              variant="primary"
              className="w-52"
              onClick={async () => {
                if (window.flutter_inappwebview?.callHandler) {
                  await window.flutter_inappwebview.callHandler(
                    "downloadImages",
                    [
                      "https://cguxpeghdqcqfdhvkmyv.supabase.co/storage/v1/object/public/prayu/BibleCard/UserBibleCard/Card_250116165310658.jpeg",
                      "http://prayu.site/images/PrayULogoV3.png",
                    ]
                  );
                }
              }}
            >
              이미지 다운로드 테스트
            </Button>
            <Button
              variant="primary"
              className="w-52"
              onClick={async () => {
                if (window.flutter_inappwebview?.callHandler) {
                  await window.flutter_inappwebview.callHandler(
                    "shareInstagramStory",
                    "https://cguxpeghdqcqfdhvkmyv.supabase.co/storage/v1/object/public/prayu/BibleCard/UserBibleCard/Card_250116165310658.jpeg"
                  );
                }
              }}
            >
              인스타 테스트
            </Button>
            <Button
              variant="primary"
              className="w-52"
              onClick={async () => {
                if (window.flutter_inappwebview?.callHandler) {
                  await window.flutter_inappwebview.callHandler(
                    "openAppSettings"
                  );
                }
              }}
            >
              설정 테스트
            </Button>
            <Button
              variant="primary"
              className="w-52"
              onClick={async () => {
                if (window.flutter_inappwebview?.callHandler) {
                  const version = await window.flutter_inappwebview.callHandler(
                    "getAppVersion"
                  );
                  alert(JSON.stringify(version));
                }
              }}
            >
              앱 버전 테스트
            </Button> */}
          </div>
        </div>

        {!isApp && (
          <div className="fixed bottom-0 w-full max-w-[480px] mx-auto">
            <DownloadBanner />
          </div>
        )}
      </section>

      <LogInDrawer />
      <WeekUpdateDialog />
    </div>
  );
};

export default MainPage;

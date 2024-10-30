import useBaseStore from "@/stores/baseStore";
import { Button } from "@/components/ui/button";
import { analyticsTrack } from "@/analytics/analytics";
import LogInDrawer from "@/components/auth/LogInDrawer";
import MainHeader from "./MainPage/MainHeader";
import { useEffect } from "react";
import CountUp from "react-countup";

const MainPage: React.FC = () => {
  const user = useBaseStore((state) => state.user);
  const userLoading = useBaseStore((state) => state.userLoading);
  const totalPrayCount = useBaseStore((state) => state.totalPrayCount);
  const fetchTotalPrayCount = useBaseStore(
    (state) => state.fetchTotalPrayCount
  );
  const setIsOpenLoginDrawer = useBaseStore(
    (state) => state.setIsOpenLoginDrawer
  );
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
          if (user) window.location.href = "/group";
          else setIsOpenLoginDrawer(true);
        }}
      >
        PrayU 시작하기
      </Button>
    );
  };

  if (userLoading) return null;

  return (
    <div className="flex flex-col items-center justify-center text-center h-full">
      <MainHeader />
      <section className="w-full flex flex-col items-center ">
        <div className="flex flex-col gap-8  items-center justify-center ">
          <div className="h-[80px] w-full flex flex-col items-center object-cover">
            <img className="h-full" src="/images/PrayULogo.png" />
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
          </div>
        </div>
      </section>

      <LogInDrawer />
    </div>
  );
};

export default MainPage;

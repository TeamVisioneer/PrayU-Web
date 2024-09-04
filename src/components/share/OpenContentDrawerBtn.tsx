import React from "react";
import useBaseStore from "@/stores/baseStore";
import { analyticsTrack } from "@/analytics/analytics";

const OpenContentDrawerBtn: React.FC = () => {
  const setIsOpenContentDrawer = useBaseStore(
    (state) => state.setIsOpenContentDrawer
  );
  const setIsOpenTodayPrayDrawer = useBaseStore(
    (state) => state.setIsOpenTodayPrayDrawer
  );
  const onClickOpenContentDrawerBtn = () => {
    window.history.pushState(null, "", window.location.pathname);
    setIsOpenTodayPrayDrawer(false);
    setIsOpenContentDrawer(true);
    analyticsTrack("클릭_컨텐츠_오늘의말씀", {
      where: "OpenContentDrawerBtn",
    });
    analyticsTrack("클릭_오늘의기도_완료", {
      where: "OpenContentDrawerBtn",
    });
  };

  return (
    <p
      className="text-sm text-gray-600 underline p-3"
      onClick={() => onClickOpenContentDrawerBtn()}
    >
      오늘의 말씀 보기
    </p>
  );
};

export default OpenContentDrawerBtn;

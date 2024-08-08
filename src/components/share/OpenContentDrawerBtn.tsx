import React from "react";
import { Button } from "../ui/button";
import useBaseStore from "@/stores/baseStore";

const OpenContentDrawerBtn: React.FC = () => {
  const setIsOpenContentDrawer = useBaseStore(
    (state) => state.setIsOpenContentDrawer
  );
  const setIsOpenTodayPrayDrawer = useBaseStore(
    (state) => state.setIsOpenTodayPrayDrawer
  );
  const onClickOpenContentDrawerBtn = () => {
    setIsOpenTodayPrayDrawer(false);
    setIsOpenContentDrawer(true);
  };

  return (
    <Button className="w-32" onClick={() => onClickOpenContentDrawerBtn()}>
      오늘의 말씀 보기
    </Button>
  );
};

export default OpenContentDrawerBtn;

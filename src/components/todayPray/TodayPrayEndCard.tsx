import MyMemberBtn from "./MyMemberBtn";

export const TodayPrayEndCard = () => {
  return (
    <div className="flex flex-col gap-4 justify-center items-center">
      <h1 className="font-bold text-xl mt-8">기도 완료</h1>{" "}
      <div className="text-grayText text-center">
        <h1>당신의 기도제목을</h1>
        <h1 className="mb-5">확인하세요</h1>
      </div>
      <MyMemberBtn />
    </div>
  );
};

export default TodayPrayEndCard;

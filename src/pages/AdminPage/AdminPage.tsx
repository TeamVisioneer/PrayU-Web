import useAuth from "@/hooks/useAuth";
import MainHeader from "../MainPage/MainHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NotificationSendDialog from "./NotificationDialog";
import useBaseStore from "@/stores/baseStore";
import { useEffect, useState } from "react";
import { getISOTodayDate } from "@/lib/utils";
import { FaLock } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AdminPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const profileCount = useBaseStore((state) => state.profileCount);
  const newUserCount = useBaseStore((state) => state.newUserCount);
  const fetchProfileCount = useBaseStore((state) => state.fetchProfileCount);
  const fetchGroupListByDate = useBaseStore(
    (state) => state.fetchGroupListByDate
  );
  const fetchNewUserCount = useBaseStore((state) => state.fetchNewUserCount);
  const deletePrayCard = useBaseStore((state) => state.deletePrayCard);
  const todayGroupList = useBaseStore((state) => state.todayGroupList);

  const todayDate = getISOTodayDate();

  const [prayCardId, setPrayCardId] = useState("");

  useEffect(() => {
    fetchProfileCount();
    fetchNewUserCount(todayDate);
    fetchGroupListByDate(todayDate);
  }, [fetchProfileCount, fetchGroupListByDate, todayDate, fetchNewUserCount]);

  const onClickDeletePrayCard = async () => {
    await deletePrayCard(prayCardId);
    alert("삭제 완료");
  };

  if (
    !user ||
    !["team.visioneer15@gmail.com", "s2615s@naver.com"].includes(
      user.user_metadata.email
    )
  ) {
    return (
      <div className="h-full w-ful flex flex-col justify-center items-center">
        <MainHeader />
        <div className="flex flex-col gap-3 justify-center items-center">
          <FaLock size={50} />
          <div className="text-gray-500">관리자 계정으로 접근해 주세요</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-grow flex-col gap-10 w-full items-center pt-14 px-5">
      <MainHeader />
      <section className="flex flex-col gap-4 w-full items-start">
        <h1 className="">대시보드</h1>
        <div className="flex gap-2 w-full">
          <Card className="w-1/3 overflow-hidden transition-all duration-200 hover:shadow-lg">
            <CardHeader className="flex flex-row pb-2 space-y-0">
              <CardTitle className="w-full text-sm font-medium text-center">
                누적 유저수
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-center">
                {profileCount}
              </div>
            </CardContent>
          </Card>
          <Card className="w-1/3 overflow-hidden transition-all duration-200 hover:shadow-lg">
            <CardHeader className="flex flex-row justify-between pb-2 space-y-0">
              <CardTitle className="w-full text-sm font-medium text-center">
                신규 유저수
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-center">
                {newUserCount}
              </div>
            </CardContent>
          </Card>
          <Card className="w-1/3 overflow-hidden transition-all duration-200 hover:shadow-lg">
            <CardHeader className="flex flex-row justify-between pb-2 space-y-0">
              <CardTitle className="w-full text-sm font-medium text-center">
                신규 그룹수
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-center">
                {todayGroupList?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      <section className="flex flex-col gap-4 w-full items-start">
        <h1 className="">공지사항 알림 작성</h1>
        <NotificationSendDialog />
      </section>
      <section className="flex flex-col gap-4 w-full items-start">
        <h1 className="">신고 게시물 관리</h1>

        <div className="w-full flex items-center gap-4">
          <Input
            value={prayCardId}
            onChange={(e) => setPrayCardId(e.target.value)}
            placeholder="PrayCard Id"
          />
          <Badge
            onClick={() => onClickDeletePrayCard()}
            className="w-14 flex justify-center p-1 bg-black"
          >
            삭제
          </Badge>
        </div>
        <div></div>
      </section>
      <section className="flex flex-col gap-4 w-full items-start">
        <h1 className="">목업 페이지</h1>
        <div className="w-full flex items-start gap-4">
          <Button
            variant="primaryLight"
            className="w-52"
            onClick={() => {
              navigate("/group/mock");
            }}
          >
            그룹 목업 페이지
          </Button>
          {/* 말씀카드 생성 페이지 */}
          <Button
            variant="primaryLight"
            className="w-52"
            onClick={() => {
              navigate("/bible-card/generator");
            }}
          >
            말씀카드 생성 페이지
          </Button>
          {/* 새 어드민 대시보드 페이지 */}
          <Button
            variant="primaryLight"
            className="w-52"
            onClick={() => {
              navigate("/admin/new");
            }}
          >
            새 어드민 대시보드
          </Button>
        </div>
      </section>
    </div>
  );
};

export default AdminPage;

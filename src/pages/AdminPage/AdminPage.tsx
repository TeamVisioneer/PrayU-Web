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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  User as UserIcon,
} from "lucide-react";

import { Profiles } from "../../../supabase/types/tables";
import {} from "@/apis/profiles";

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
  const fetchProfileListByUserName = useBaseStore(
    (state) => state.fetchProfileListByUserName
  );
  const updateProfile = useBaseStore((state) => state.updateProfile);

  const todayDate = getISOTodayDate();

  const [prayCardId, setPrayCardId] = useState("");
  const [profileKeyword, setProfileKeyword] = useState("");
  const [isSearchingProfiles, setIsSearchingProfiles] = useState(false);
  const [profileSearchResults, setProfileSearchResults] = useState<Profiles[]>(
    []
  );

  // Expiry modal state
  const [isOpenExpiryDialog, setIsOpenExpiryDialog] = useState(false);
  const [targetProfile, setTargetProfile] = useState<Profiles | null>(null);
  const [selectedExpiryOption, setSelectedExpiryOption] = useState<
    "month" | "year" | "forever" | null
  >(null);

  const getPreviewExpiryDate = () => {
    if (!selectedExpiryOption) return null;
    if (selectedExpiryOption === "forever") return "9999-12-31";
    const now = new Date();
    const future = new Date(now);
    if (selectedExpiryOption === "month")
      future.setMonth(future.getMonth() + 1);
    if (selectedExpiryOption === "year")
      future.setFullYear(future.getFullYear() + 1);
    return future.toISOString().split("T")[0];
  };

  const getOptionLabel = (opt: "month" | "year" | "forever") => {
    switch (opt) {
      case "month":
        return "한 달 뒤";
      case "year":
        return "1년 뒤";
      case "forever":
        return "평생";
    }
  };

  useEffect(() => {
    const todayDate = getISOTodayDate();
    fetchProfileCount();
    fetchNewUserCount(todayDate);
    fetchGroupListByDate(todayDate);
  }, [fetchProfileCount, fetchGroupListByDate, fetchNewUserCount]);

  const onClickDeletePrayCard = async () => {
    await deletePrayCard(prayCardId);
    alert("삭제 완료");
  };

  const handleSearchProfiles = async () => {
    setIsSearchingProfiles(true);
    try {
      const data = await fetchProfileListByUserName(profileKeyword, 100);
      setProfileSearchResults(data || []);
    } finally {
      setIsSearchingProfiles(false);
    }
  };

  const handleAssignExpiry = async () => {
    if (!targetProfile || !selectedExpiryOption) {
      alert("프로필 또는 옵션을 선택해 주세요.");
      return;
    }

    const premium_expired_at = getPreviewExpiryDate();

    await updateProfile(targetProfile.id, {
      premium_expired_at: premium_expired_at,
    });
    const profileList = await fetchProfileListByUserName(profileKeyword, 100);
    setProfileSearchResults(profileList || []);
    setIsOpenExpiryDialog(false);
    setSelectedExpiryOption(null);
    setTargetProfile(null);
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
        <h1 className="">프로필 검색 / 프리미엄 만료일 설정</h1>
        <div className="w-full flex flex-col gap-3">
          <div className="flex flex-col md:flex-row gap-3 w-full">
            <div className="flex-1 flex items-center gap-2">
              <Input
                value={profileKeyword}
                onChange={(e) => setProfileKeyword(e.target.value)}
                placeholder="이름 또는 사용자 ID로 검색"
              />
              <Button
                variant="primaryLight"
                className="shrink-0"
                onClick={handleSearchProfiles}
                disabled={
                  isSearchingProfiles || profileKeyword.trim().length === 0
                }
              >
                {isSearchingProfiles ? "검색중..." : "검색"}
              </Button>
            </div>
          </div>

          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">검색 결과</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="border rounded-md overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-medium bg-gray-50 text-gray-600">
                  <div className="col-span-3">사용자</div>
                  <div className="col-span-5">사용자 ID</div>
                  <div className="col-span-3 text-center">플랜 만료</div>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y">
                  {profileSearchResults.length === 0 ? (
                    <div className="px-3 py-6 text-sm text-gray-500 text-center">
                      검색 결과가 없습니다. 키워드를 입력해 검색해 주세요.
                    </div>
                  ) : (
                    profileSearchResults.map((p) => (
                      <div
                        key={p.id}
                        className="grid grid-cols-12 gap-2 px-3 py-2 items-center"
                      >
                        <div className="col-span-3 break-all">
                          <div className="text-sm font-medium">
                            {p.full_name || "(이름 없음)"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {p.created_at.split("T")[0]}
                          </div>
                        </div>
                        <div className="col-span-5 pr-3 text-xs text-gray-400 break-all">
                          {p.id || "-"}
                        </div>
                        <div className="col-span-3 text-sm text-gray-700 flex justify-center">
                          {p.premium_expired_at ? (
                            p.premium_expired_at.split("T")[0]
                          ) : (
                            <Badge
                              onClick={() => {
                                setTargetProfile(p);
                                setSelectedExpiryOption(null);
                                setIsOpenExpiryDialog(true);
                              }}
                              className="px-2 py-1 cursor-pointer bg-black text-white"
                            >
                              지정
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
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
        <div className="w-full flex items-start gap-4 overflow-x-auto">
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

      {/* Expiry Assign Dialog */}
      <Dialog open={isOpenExpiryDialog} onOpenChange={setIsOpenExpiryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>플랜 만료 지정</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>

          {/* Summary */}
          <div className="mt-5 grid grid-cols-1 gap-3 rounded-md border p-3 bg-gray-50">
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {targetProfile?.full_name || "(이름 없음)"}
              </span>
              <span className="text-xs text-gray-400">{targetProfile?.id}</span>
            </div>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-gray-500" />
                <span className="text-gray-500">가입일</span>
                <span className="font-medium ml-auto">
                  {targetProfile?.created_at?.split("T")[0] || "-"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-gray-500" />
                <span className="text-gray-500">현재 날짜</span>
                <span className="font-medium ml-auto">
                  {todayDate.split("T")[0]}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-gray-500" />
                <span className="text-gray-500">변경 후 만료일</span>
                <span className="font-medium ml-auto">
                  {selectedExpiryOption
                    ? getPreviewExpiryDate() || "-"
                    : "옵션 선택 필요"}
                </span>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-wrap gap-2 mt-3">
            {(["month", "year", "forever"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setSelectedExpiryOption(opt)}
                className={`flex-grow px-3 py-2 rounded-md text-sm border transition-colors shadow-sm ${
                  selectedExpiryOption === opt
                    ? "bg-gradient-to-br from-[#608CFF] to-[#4574F1] text-white border-transparent"
                    : "bg-white text-gray-800 hover:bg-gray-50 border-gray-200"
                }`}
              >
                {getOptionLabel(opt)}
              </button>
            ))}
          </div>

          {/* Warning */}
          <div className="my-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
            <p className="text-xs text-amber-700">
              변경 즉시 적용되며 환불/결제 정책에 영향을 줄 수 있습니다.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setIsOpenExpiryDialog(false);
                setSelectedExpiryOption(null);
                setTargetProfile(null);
              }}
            >
              취소
            </Button>
            <Button
              variant="primary"
              disabled={!selectedExpiryOption || !targetProfile}
              onClick={() => {
                handleAssignExpiry();
              }}
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;

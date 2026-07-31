import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import useBaseStore from "@/stores/baseStore";
import NoticeManager from "../NoticeManager";
import { setPremiumExpiry } from "@/apis/admin";
import { Profiles } from "../../../../supabase/types/tables";

type ExpiryOption = "month" | "year" | "forever";

const OperationsTab = () => {
  const fetchProfileListByUserName = useBaseStore(
    (state) => state.fetchProfileListByUserName,
  );
  const deletePrayCard = useBaseStore((state) => state.deletePrayCard);

  const [profileKeyword, setProfileKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Profiles[]>([]);

  const [isOpenExpiryDialog, setIsOpenExpiryDialog] = useState(false);
  const [targetProfile, setTargetProfile] = useState<Profiles | null>(null);
  const [selectedOption, setSelectedOption] = useState<ExpiryOption | null>(
    null,
  );

  const [prayCardId, setPrayCardId] = useState("");

  const getPreviewExpiryDate = () => {
    if (!selectedOption) return null;
    if (selectedOption === "forever") return "9999-12-31";
    const future = new Date();
    if (selectedOption === "month") future.setMonth(future.getMonth() + 1);
    if (selectedOption === "year") future.setFullYear(future.getFullYear() + 1);
    return future.toISOString().split("T")[0];
  };

  const optionLabel = (option: ExpiryOption) =>
    option === "month" ? "한 달 뒤" : option === "year" ? "1년 뒤" : "평생";

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const data = await fetchProfileListByUserName(profileKeyword, 100);
      setSearchResults(data || []);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAssignExpiry = async () => {
    if (!targetProfile || !selectedOption) {
      toast({ description: "프로필과 옵션을 선택해 주세요" });
      return;
    }
    // 실패해도 성공 toast 가 뜨던 문제가 있었다 — 결과를 반드시 본다
    const succeeded = await setPremiumExpiry(
      targetProfile.id,
      getPreviewExpiryDate(),
    );
    if (!succeeded) {
      toast({ description: "프리미엄 만료일 설정에 실패했어요" });
      return;
    }
    const refreshed = await fetchProfileListByUserName(profileKeyword, 100);
    setSearchResults(refreshed || []);
    setIsOpenExpiryDialog(false);
    setSelectedOption(null);
    setTargetProfile(null);
    toast({ description: "프리미엄 만료일을 설정했어요" });
  };

  const handleDeletePrayCard = async () => {
    if (!prayCardId.trim()) return;
    await deletePrayCard(prayCardId.trim());
    setPrayCardId("");
    toast({ description: "기도카드를 삭제했어요" });
  };

  return (
    <div className="flex w-full flex-col gap-8">
      <section className="flex w-full flex-col gap-3">
        <h2 className="text-base font-semibold">공지 관리</h2>
        <NoticeManager />
      </section>

      <section className="flex w-full flex-col gap-3">
        <h2 className="text-base font-semibold">
          유저 검색 · 프리미엄 만료일 설정
        </h2>
        <div className="flex items-center gap-2">
          <Input
            value={profileKeyword}
            onChange={(e) => setProfileKeyword(e.target.value)}
            placeholder="이름 또는 사용자 ID로 검색"
          />
          <Button
            variant="primaryLight"
            className="shrink-0"
            onClick={handleSearch}
            disabled={isSearching || profileKeyword.trim().length === 0}
          >
            {isSearching ? "검색중..." : "검색"}
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">검색 결과</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-12 gap-2 border-b bg-gray-50 px-4 py-2 text-xs font-medium text-gray-600">
              <div className="col-span-4">사용자</div>
              <div className="col-span-5">사용자 ID</div>
              <div className="col-span-3 text-center">플랜 만료</div>
            </div>
            <div className="max-h-72 divide-y overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  검색 결과가 없습니다. 키워드를 입력해 검색해 주세요.
                </div>
              ) : (
                searchResults.map((profile) => (
                  <div
                    key={profile.id}
                    className="grid grid-cols-12 items-center gap-2 px-4 py-2"
                  >
                    <div className="col-span-4 min-w-0">
                      <div className="truncate text-sm font-medium">
                        {profile.full_name || "(이름 없음)"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {profile.created_at.split("T")[0]}
                      </div>
                    </div>
                    <div className="col-span-5 break-all text-xs text-gray-500">
                      {profile.id}
                    </div>
                    <div className="col-span-3 flex justify-center">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setTargetProfile(profile);
                          setSelectedOption(null);
                          setIsOpenExpiryDialog(true);
                        }}
                      >
                        {profile.premium_expired_at
                          ? profile.premium_expired_at.split("T")[0]
                          : "설정"}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="flex w-full flex-col gap-3">
        <h2 className="text-base font-semibold">신고 게시물 삭제</h2>
        <div className="flex items-center gap-2">
          <Input
            value={prayCardId}
            onChange={(e) => setPrayCardId(e.target.value)}
            placeholder="기도카드 ID (신고 알림에 포함됨)"
          />
          <Badge
            onClick={handleDeletePrayCard}
            className="flex w-14 shrink-0 cursor-pointer justify-center bg-black p-1"
          >
            삭제
          </Badge>
        </div>
      </section>

      <Dialog open={isOpenExpiryDialog} onOpenChange={setIsOpenExpiryDialog}>
        <DialogContent className="w-11/12 rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon size={18} />
              프리미엄 만료일 설정
            </DialogTitle>
            <DialogDescription>
              {targetProfile?.full_name || "(이름 없음)"} 님의 플랜 만료일을
              변경합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            {(["month", "year", "forever"] as ExpiryOption[]).map((option) => (
              <button
                key={option}
                onClick={() => setSelectedOption(option)}
                className={`rounded-lg border px-4 py-2 text-left text-sm ${
                  selectedOption === option
                    ? "border-blue-500 bg-blue-50 font-medium text-blue-600"
                    : "border-gray-200"
                }`}
              >
                {optionLabel(option)}
              </button>
            ))}
            {selectedOption && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <AlertTriangle size={12} />
                적용 후 만료일: {getPreviewExpiryDate()}
              </div>
            )}
          </div>

          <DialogFooter className="flex-row justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setIsOpenExpiryDialog(false)}
            >
              취소
            </Button>
            <Button variant="primary" onClick={handleAssignExpiry}>
              적용
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OperationsTab;

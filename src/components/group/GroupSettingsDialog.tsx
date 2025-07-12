import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useBaseStore from "@/stores/baseStore";
import { Input } from "../ui/input";
import { useEffect, useState, useRef } from "react";
import { Button } from "../ui/button";
import { analyticsTrack } from "@/analytics/analytics";
import GroupMemberSettingsBtn from "./GroupMemberSettingsBtn";
import GroupMemberProfileList from "./GroupMemberProfileList";

const GroupSettingsDialog: React.FC = () => {
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const isOpenGroupSettingsDialog = useBaseStore(
    (state) => state.isOpenGroupSettingsDialog
  );
  const setIsOpenGroupSettingsDialog = useBaseStore(
    (state) => state.setIsOpenGroupSettingsDialog
  );
  const inputGroupName = useBaseStore((state) => state.inputGroupName);
  const setGroupName = useBaseStore((state) => state.setGroupName);
  const updateGroup = useBaseStore((state) => state.updateGroup);
  const memberList = useBaseStore((state) => state.memberList);
  const getGroup = useBaseStore((state) => state.getGroup);

  // 선택된 시간을 추적하는 상태
  const [selectedHour, setSelectedHour] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const getSelectedTimeText = () => {
    const hour12 =
      selectedHour === 0
        ? 12
        : selectedHour > 12
        ? selectedHour - 12
        : selectedHour;
    const ampm = selectedHour < 12 ? "오전" : "오후";
    return `${ampm} ${hour12}시`;
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;

    const scrollTop = scrollRef.current.scrollTop;
    const itemHeight = 48; // h-12 = 48px
    const containerHeight = 192; // h-48 = 192px
    const paddingTop = 80; // py-20 = 80px

    // 현재 뷰포트 중앙의 절대 위치
    const viewportCenter = scrollTop + containerHeight / 2;
    // 첫 번째 아이템의 중심 위치
    const firstItemCenter = paddingTop + itemHeight / 2;
    // 선택된 아이템 인덱스 계산
    const selectedIndex = Math.round(
      (viewportCenter - firstItemCenter) / itemHeight
    );

    // 0-23 범위로 제한
    const clampedIndex = Math.max(0, Math.min(23, selectedIndex));
    setSelectedHour(clampedIndex);
  };

  // 초기 스크롤 위치 설정 (오전 12시가 중앙에 오도록)
  useEffect(() => {
    if (scrollRef.current && isOpenGroupSettingsDialog) {
      setTimeout(() => {
        if (scrollRef.current) {
          const itemHeight = 48;
          const containerHeight = 192;
          const paddingTop = 80;

          // 첫 번째 아이템이 중앙에 오는 스크롤 위치 계산
          const firstItemCenter = paddingTop + itemHeight / 2; // 104px
          const initialScrollTop = firstItemCenter - containerHeight / 2; // 104 - 96 = 8px

          scrollRef.current.scrollTop = Math.max(0, initialScrollTop);
          setSelectedHour(0);
        }
      }, 100);
    }
  }, [isOpenGroupSettingsDialog]);

  const onClickSaveGroup = async () => {
    if (!targetGroup) return;
    if (inputGroupName.trim() === "") return;
    analyticsTrack("클릭_그룹_이름변경", { group_name: GroupSettingsDialog });
    const group = await updateGroup(targetGroup.id, { name: inputGroupName });
    if (group) {
      getGroup(targetGroup.id);
      setIsOpenGroupSettingsDialog(false);
    }
  };

  useEffect(() => {
    setGroupName(targetGroup?.name || "");
  }, [setGroupName, targetGroup]);

  if (!memberList || !targetGroup) return null;

  return (
    <Dialog
      open={isOpenGroupSettingsDialog}
      onOpenChange={setIsOpenGroupSettingsDialog}
    >
      <DialogContent className="w-11/12 rounded-xl">
        <DialogHeader>
          <DialogTitle>그룹 설정</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-8 p-4">
          <section className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">그룹명</label>
            <Input
              type="text"
              value={inputGroupName}
              onChange={(e) => setGroupName(e.target.value)}
              maxLength={12}
            />
          </section>

          <section className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                그룹 기도시간
              </label>
              <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                BETA
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              베타 기능으로 알림이 정확하지 않을 수 있습니다
            </p>
            <div className="relative mx-auto w-full max-w-xs">
              {/* scroll 없에기 */}
              <div
                ref={scrollRef}
                className="h-48 overflow-y-auto scrollbar-hide rounded-lg bg-white scroll-smooth snap-y snap-mandatory"
                onScroll={handleScroll}
                style={{
                  perspective: "1000px",
                  maskImage:
                    "linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)",
                }}
              >
                <div className="py-20">
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour12 = i === 0 ? 12 : i > 12 ? i - 12 : i;
                    const ampm = i < 12 ? "오전" : "오후";
                    return (
                      <div
                        key={i}
                        className="h-12 flex items-center justify-center text-lg font-medium cursor-pointer snap-center transition-all duration-200 select-none opacity-40 hover:opacity-60"
                        style={{
                          transform: "scale(0.9)",
                          transformOrigin: "center",
                        }}
                      >
                        {ampm} {hour12}시
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* 중앙 선택된 영역 강조 */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="h-full flex items-center justify-center">
                  <div className="h-12 bg-blue-50/30 border-t-2 border-b-2 border-blue-500/50 rounded-md"></div>
                </div>
              </div>
              {/* 중앙 아이템 강조 오버레이 */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="h-full flex items-center justify-center">
                  <div
                    className="text-xl font-bold text-blue-600 bg-white/90 rounded-lg px-4 py-2 shadow-sm border border-blue-200 whitespace-nowrap"
                    style={{
                      transform: "scale(1.1)",
                      minWidth: "120px",
                    }}
                  >
                    {getSelectedTimeText()}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-700">
                그룹원 ({memberList.length})
              </label>
              <GroupMemberSettingsBtn />
            </div>
            <GroupMemberProfileList
              memberList={memberList}
              targetGroup={targetGroup}
            />
          </section>
          <footer className="flex gap-2 justify-center">
            <Button
              variant="secondary"
              className="w-20"
              onClick={() => setIsOpenGroupSettingsDialog(false)}
            >
              취소
            </Button>
            <Button
              variant="primary"
              className="w-20"
              onClick={() => onClickSaveGroup()}
            >
              확인
            </Button>
          </footer>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupSettingsDialog;

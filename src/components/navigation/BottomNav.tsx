import { useEffect, useState } from "react";
import { matchPath, useLocation, useNavigate } from "react-router-dom";
import { Bell, House, Plus, UserRound, UsersRound } from "lucide-react";
import useBaseStore from "@/stores/baseStore";
import { analyticsTrack } from "@/analytics/analytics";
import CreateActionSheet from "./CreateActionSheet";

/**
 * 하단 네비게이션 (docs/plans/identity/navigation.md).
 *
 * 화면 하단에 **떠 있는 알약(pill)** 형태의 글래스 크롬 — 가장자리에 붙지 않는다.
 *
 * **허용 목록 방식** — 탭 목적지 4개에서만 보인다. 새 라우트의 기본은 "안 보임"이라
 * 공유 랜딩·콜백·작성 플로우 같은 화면에 실수로 얹히지 않는다.
 * 기존 진입 경로(드로워·헤더 버튼)는 그대로 둔다 — 네비는 추가이지 대체가 아니다.
 */
const NAV_VISIBLE_PATHS = ["/", "/group", "/notifications", "/profile/me"];

export const useBottomNavVisible = (): boolean => {
  const location = useLocation();
  const user = useBaseStore((state) => state.user);
  return (
    !!user &&
    NAV_VISIBLE_PATHS.some((path) => matchPath(path, location.pathname))
  );
};

interface TabItemProps {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  badge?: number;
  onClick: () => void;
}

const TabItem = ({ label, icon, active, badge = 0, onClick }: TabItemProps) => (
  <button
    type="button"
    onClick={onClick}
    className="flex h-full flex-1 items-center justify-center"
  >
    <span
      className={`relative flex flex-col items-center gap-0.5 rounded-full px-3.5 py-1 transition-colors ${
        active ? "bg-white/80 text-mainBtn" : "text-deactivate"
      }`}
    >
      <span className="relative">
        {icon}
        {badge > 0 && (
          <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 px-1 text-[0.625rem] font-medium text-white">
            {badge < 10 ? badge : "9+"}
          </span>
        )}
      </span>
      <span className="text-[0.625rem] font-medium">{label}</span>
    </span>
  </button>
);

const BottomNav = () => {
  const visible = useBottomNavVisible();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const user = useBaseStore((state) => state.user);
  const unreadTotal = useBaseStore(
    (state) => state.userNotificationUnreadTotal,
  );
  const fetchNotificationCount = useBaseStore(
    (state) => state.fetchNotificationCount,
  );

  useEffect(() => {
    if (visible && user) fetchNotificationCount(user.id, true);
  }, [visible, user, fetchNotificationCount]);

  if (!visible) return null;

  const isActive = (path: string) => !!matchPath(path, location.pathname);
  const moveTo = (label: string, path: string) => {
    analyticsTrack("클릭_네비_" + label, {});
    navigate(path);
  };

  return (
    <>
      {/* 부유 pill — 하단에서 띄우고 safe-area 만큼 더 올린다.
          glass-chrome: 고정 크롬이라 backdrop-blur 허용 (스크롤 아이템에는 금지) */}
      <div className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] left-1/2 z-40 w-full max-w-app -translate-x-1/2 px-4">
        <nav className="flex h-14 items-stretch rounded-full border border-glassBorder/60 bg-surfaceChrome/75 px-1.5 shadow-glass backdrop-blur-xl">
          <TabItem
            label="홈"
            icon={<House size={21} strokeWidth={isActive("/") ? 2.2 : 1.8} />}
            active={isActive("/")}
            onClick={() => moveTo("홈", "/")}
          />
          <TabItem
            label="그룹"
            icon={
              <UsersRound
                size={21}
                strokeWidth={isActive("/group") ? 2.2 : 1.8}
              />
            }
            active={isActive("/group")}
            onClick={() => moveTo("그룹", "/group")}
          />
          <button
            type="button"
            aria-label="만들기"
            onClick={() => {
              analyticsTrack("클릭_네비_만들기", {});
              setIsSheetOpen(true);
            }}
            className="flex flex-1 items-center justify-center"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-start to-middle text-white shadow-member">
              <Plus size={22} strokeWidth={2.2} />
            </span>
          </button>
          <TabItem
            label="알림"
            icon={
              <Bell
                size={21}
                strokeWidth={isActive("/notifications") ? 2.2 : 1.8}
              />
            }
            active={isActive("/notifications")}
            badge={unreadTotal}
            onClick={() => moveTo("알림", "/notifications")}
          />
          <TabItem
            label="프로필"
            icon={
              <UserRound
                size={21}
                strokeWidth={isActive("/profile/me") ? 2.2 : 1.8}
              />
            }
            active={isActive("/profile/me")}
            onClick={() => moveTo("프로필", "/profile/me")}
          />
        </nav>
      </div>
      <CreateActionSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </>
  );
};

export default BottomNav;

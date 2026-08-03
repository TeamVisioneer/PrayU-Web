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
 * 노출 원칙: **탐색 화면에는 네비, 몰입 화면에는 없다.**
 * 작성 플로우(기도/말씀/감사카드)·오늘의기도·공유 랜딩·콜백·온보딩은 몰입 화면이다.
 * **허용 목록 방식** — 새 라우트의 기본은 "안 보임"이라 몰입 화면에 실수로 얹히지 않는다.
 * 화면별 하단 CTA(그룹의 오늘의기도 등)는 네비 **위에 도킹**한다 — 네비는 추가이지 대체가 아니다.
 */
/** `:groupId` 와일드카드에 걸리지만 몰입 화면인 것들 — 노출 목록보다 먼저 검사한다 */
const NAV_HIDDEN_PATHS = ["/group/new", "/group/limit", "/group/mock"];

const NAV_VISIBLE_PATHS = [
  "/",
  "/group",
  "/group/:groupId",
  "/qt",
  "/thanks-card",
  "/notice",
  "/notifications",
  "/profile/me",
];

export const useBottomNavVisible = (): boolean => {
  const location = useLocation();
  const user = useBaseStore((state) => state.user);
  if (NAV_HIDDEN_PATHS.some((path) => matchPath(path, location.pathname))) {
    return false;
  }
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
    aria-label={label}
    onClick={onClick}
    className="flex h-full flex-1 items-center justify-center"
  >
    <span
      className={`relative flex items-center justify-center rounded-full px-4 py-2 transition-colors ${
        active ? "bg-white text-mainBtn" : "text-dark"
      }`}
    >
      {icon}
      {badge > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 px-1 text-[0.625rem] font-medium text-white">
          {badge < 10 ? badge : "9+"}
        </span>
      )}
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
        <nav className="flex h-14 items-stretch rounded-full border border-glassBorder/80 bg-surfaceChrome/90 px-1.5 shadow-glass backdrop-blur-xl">
          <TabItem
            label="홈"
            icon={<House size={23} strokeWidth={isActive("/") ? 2.2 : 1.8} />}
            active={isActive("/")}
            onClick={() => moveTo("홈", "/")}
          />
          <TabItem
            label="그룹"
            icon={
              <UsersRound
                size={23}
                strokeWidth={
                  isActive("/group") || isActive("/group/:groupId")
                    ? 2.2
                    : 1.8
                }
              />
            }
            active={isActive("/group") || isActive("/group/:groupId")}
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
                size={23}
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
                size={23}
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

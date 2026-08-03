import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  matchPath,
  Navigate,
  useParams,
} from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { AuthProvider } from "./components/auth/AuthProvider";

// 개발용 이메일 로그인 — 개발 빌드에만 존재한다.
// import.meta.env.DEV 는 빌드 시 상수로 치환되므로, prod·staging 번들에서는
// 아래 동적 import 가 통째로 제거된다(별도 청크도 생성되지 않는다).
const DevLoginPage = import.meta.env.DEV
  ? lazy(() => import("./pages/DevLoginPage"))
  : null;
import SlideInPage from "./components/common/SlideInPage";
import PrivateRoute from "./components/auth/PrivateRoute";
import MainPage from "./pages/MainPage";
import GroupPage from "./pages/GroupPage";
import GroupCreatePage from "./pages/GroupCreatePage";
import { analyticsTrack } from "@/analytics/analytics";
import ConfirmAlert from "./components/alert/ConfirmAlert";
import { Toaster } from "./components/ui/toaster";
import PrayCardCreatePage from "./pages/PrayCard/PrayCardCreatePage";
import KakaoInit from "./components/kakao/KakaoInit";
import KakaoCallBack from "./components/kakao/KakaoCallback";
import MyProfilePage from "./pages/MyProfilePage";
import GroupNotFoundPage from "./pages/GroupNotFoundPage";
import GroupListPage from "./pages/GroupListPage";
import GroupLimitPage from "./pages/GropuLimitPage";
import TermServicePage from "./pages/TermService/TermServicePage";
import Term from "./pages/TermService/Term";
import EmailLoginPage from "./pages/EmailLoginPage";
import KakaoShareCallBack from "./components/share/KakaoShareCallBack";
import LoginRedirect from "./components/auth/LoginRedirect";
import StoryPage from "./pages/StoryPage/StoryPage";
import TutorialPage from "./pages/TutorialPage";
import MetaPixelInit from "./analytics/metaPixelInit";
import AdminPage from "./pages/AdminPage/AdminPage";
import UnionWorshipPage from "./pages/Open/UnionWorshipPage";
import BibleCardNewPage from "./pages/BibleCardPage/BibleCardNewPage";
import BibleCardSharePage from "./pages/BibleCardPage/BibleCardSharePage";
import QuietTimePage from "./pages/QuietTimePage";
import NoticePage from "./pages/NoticePage";
import BibleCardGeneratorPage from "./pages/BibleCardPage/BibleCardGeneratorPage";
import PrayCardEditPage from "./pages/PrayCard/PrayCardEditPage";
import NotificationPage from "./components/notification/NotificationPage";
import AppInit from "./AppInit/AppInit";
import {
  OfficePage,
  UnionDetailPage,
  GroupDetailPage,
  CreateUnionPage,
  UnionJoinPage,
} from "./pages/Office";
import GroupJoinPage from "./pages/Group/GroupJoinPage";
import ExternalLinkDialog from "./components/notice/ExternalLinkDialog";
import GroupListDrawer from "./components/group/GroupListDrawer";
import NoticeDialog from "./components/notice/NoticeDialog";
import ReportAlert from "./components/alert/ReportAlert";
import { BottomToaster } from "@/components/ui/bottom-toaster";
import BottomNav, {
  useBottomNavVisible,
} from "@/components/navigation/BottomNav";
import GroupPageMock from "@/mock/GroupPageMock";
import ThanksCardPage from "./pages/ThanksCardPage";
import NewThanksCardPage from "./pages/NewThanksCardPage";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isNavVisible = useBottomNavVisible();

  const fullWidthRoutes: string[] = ["/thanks-card"];

  const isFullWidth = fullWidthRoutes.some((route) =>
    matchPath(route, location.pathname),
  );

  return (
    <div
      className={`mx-auto h-100vh overflow-x-hidden no-scrollbar bg-mainBg ${
        isFullWidth ? "w-full" : "max-w-app"
      } ${
        // 스페이서가 아니라 padding 이어야 한다 — h-full 페이지가 네비 위 공간만큼
        // 줄어들어 "콘텐츠가 안 찼는데 스크롤"이 생기지 않는다
        isNavVisible ? "pb-[calc(4.75rem+env(safe-area-inset-bottom))]" : ""
      }`}
    >
      {children}
      <BottomNav />
    </div>
  );
};

const GroupRedirect = () => {
  const { groupId } = useParams<{ groupId: string }>();
  return <Navigate to={`/office/union/unknown/group/${groupId}`} replace />;
};

const App = () => {
  return (
    <div className="w-screen h-dvh bg-white">
      <AppInit />
      <MetaPixelInit />
      <KakaoInit />
      <BrowserRouter>
        <AuthProvider>
          <AppLayout>
            {(import.meta.env.VITE_ENV === "staging" ||
              import.meta.env.VITE_ENV === "prod") && <AnalyticsTracker />}
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/thanks-card" element={<ThanksCardPage />} />
              <Route
                path="/thanks-card/new"
                element={
                  <SlideInPage>
                    <NewThanksCardPage />
                  </SlideInPage>
                }
              />
              <Route
                path="/login-redirect"
                element={
                  <PrivateRoute>
                    <LoginRedirect />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <PrivateRoute>
                    <AdminPage />
                  </PrivateRoute>
                }
              />
              <Route path="/tutorial" element={<TutorialPage />} />
              {/* 구 말씀카드 플립 페이지 제거 — 옛 링크는 현행 플로우로 안내 */}
              <Route
                path="/bible-card"
                element={<Navigate to="/bible-card/new" replace />}
              />
              <Route path="/bible-card/new" element={<BibleCardNewPage />} />
              <Route
                path="/bible-card/share/:bibleCardId"
                element={<BibleCardSharePage />}
              />
              <Route
                path="/bible-card/generator"
                element={<BibleCardGeneratorPage />}
              />
              <Route path="/qt" element={<QuietTimePage />} />
              <Route
                path="/notice"
                element={
                  <SlideInPage>
                    <NoticePage />
                  </SlideInPage>
                }
              />

              <Route path="/auth/kakao/callback" element={<KakaoCallBack />} />
              <Route
                path="/share/kakao/callback"
                element={<KakaoShareCallBack />}
              />
              <Route
                path="/term"
                element={
                  <PrivateRoute>
                    <TermServicePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/term/:version"
                element={
                  <PrivateRoute>
                    <Term />
                  </PrivateRoute>
                }
              />
              <Route
                path="/praycard/new"
                element={
                  <PrivateRoute>
                    <SlideInPage>
                      <PrayCardCreatePage />
                    </SlideInPage>
                  </PrivateRoute>
                }
              />
              <Route
                path="/group"
                element={
                  <PrivateRoute>
                    <SlideInPage>
                      <GroupListPage />
                    </SlideInPage>
                  </PrivateRoute>
                }
              />
              <Route
                path="/group/new"
                element={
                  <PrivateRoute>
                    <SlideInPage>
                      <GroupCreatePage />
                    </SlideInPage>
                  </PrivateRoute>
                }
              />
              <Route
                path="/group/:groupId"
                element={
                  <PrivateRoute>
                    <GroupPage />
                  </PrivateRoute>
                }
              />
              <Route path="/group/:groupId/join" element={<GroupJoinPage />} />
              <Route
                path="/group/:groupId/praycard/new"
                element={
                  <PrivateRoute>
                    <SlideInPage>
                      <PrayCardCreatePage />
                    </SlideInPage>
                  </PrivateRoute>
                }
              />
              <Route
                path="/group/:groupId/praycard/:praycardId/edit"
                element={
                  <SlideInPage>
                    <PrayCardEditPage />
                  </SlideInPage>
                }
              />
              <Route
                path="/group/open/1027-union"
                element={<UnionWorshipPage />}
              />
              <Route path="/group/mock" element={<GroupPageMock />} />
              {DevLoginPage && (
                <Route
                  path="/dev/login"
                  element={
                    <Suspense fallback={null}>
                      <DevLoginPage />
                    </Suspense>
                  }
                />
              )}
              <Route path="/group/not-found" element={<GroupNotFoundPage />} />
              <Route path="/group/limit" element={<GroupLimitPage />} />
              <Route
                path="/profile/me"
                element={
                  <PrivateRoute>
                    <SlideInPage>
                      <MyProfilePage />
                    </SlideInPage>
                  </PrivateRoute>
                }
              />
              <Route path="/login/email" element={<EmailLoginPage />} />
              <Route path="/story" element={<StoryPage />} />

              <Route
                path="/notifications"
                element={
                  <PrivateRoute>
                    <SlideInPage>
                      <NotificationPage />
                    </SlideInPage>
                  </PrivateRoute>
                }
              />
              <Route
                path="/office/union"
                element={
                  <PrivateRoute>
                    <OfficePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/office/union/:unionId"
                element={
                  <PrivateRoute>
                    <UnionDetailPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/office/union/new"
                element={
                  <PrivateRoute>
                    <CreateUnionPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/office/group/:groupId"
                element={
                  <PrivateRoute>
                    <GroupRedirect />
                  </PrivateRoute>
                }
              />
              <Route
                path="/office/union/:unionId/group/:groupId"
                element={
                  <PrivateRoute>
                    <GroupDetailPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/office/union/:unionId/join"
                element={<UnionJoinPage />}
              />
            </Routes>
          </AppLayout>
        </AuthProvider>
        <BottomToaster />
        <Toaster />
        <ReportAlert />
        <ConfirmAlert />
        <ExternalLinkDialog />
        <GroupListDrawer />
        <NoticeDialog />
      </BrowserRouter>
    </div>
  );
};

const AnalyticsTracker = () => {
  const location = useLocation();
  const from = location.state?.from?.pathname;
  const matchPraycardNew = matchPath(
    "/group/:groupId/praycard/new",
    location.pathname,
  );
  const matchTodayPray = matchPath(
    "/group/:groupId/todaypray",
    location.pathname,
  );
  const matchPraycardEdit = matchPath(
    "/group/:groupId/praycard/:praycardId/edit",
    location.pathname,
  );
  const matchGroupJoin = matchPath("/group/:groupId/join", location.pathname);
  const matchGroup = matchPath("/group/:groupId", location.pathname);
  useEffect(() => {
    switch (location.pathname) {
      case "/":
        analyticsTrack("페이지_메인", {
          title: "Main Page",
          where: from,
        });
        break;
      case "/story":
        analyticsTrack("페이지_스토리", {
          title: "Story Page",
          where: from,
        });
        break;
      case "/term":
        analyticsTrack("페이지_약관", {
          title: "Term Page",
          where: from,
        });
        break;
      case "/term/:version":
        analyticsTrack("페이지_약관_버전", {
          title: "Term Page",
          where: from,
        });
        break;
      case "/tutorial":
        analyticsTrack("페이지_튜토리얼", {
          title: "Tutorial Page",
          where: from,
        });
        break;
      case "/group":
        analyticsTrack("페이지_그룹_리스트", {
          title: "Group List Page",
          where: from,
        });
        break;
      case "/group/new":
        analyticsTrack("페이지_그룹_생성", {
          title: "Group Create Page",
          where: from,
        });
        break;
      case "/group/open/1027-union":
        analyticsTrack("페이지_그룹_1027-union", {
          title: "Group 1027-union Page",
          where: from,
        });
        break;
      case "/group/limit":
        analyticsTrack("페이지_그룹_제한", {
          title: "Group Limit Page",
          where: from,
        });
        break;
      case "/group/not-found":
        analyticsTrack("페이지_그룹_404", {
          title: "Group 404 Page",
          where: from,
        });
        break;
      case "/profile/me":
        analyticsTrack("페이지_프로필_나", {
          title: "PrayCard Create Page",
          where: from,
        });
        break;
      case "/login/email":
        analyticsTrack("페이지_이메일_로그인", {
          title: "Email Login Page",
          where: from,
        });
        break;
      case "/praycard/new":
        analyticsTrack("페이지_기도카드_생성", {
          title: "PrayCard Create Page",
          where: from,
        });
        break;
      case "/bible-card/new":
        analyticsTrack("페이지_말씀카드", {
          title: "Bible Card Page",
          where: from,
        });
        break;
      case "/qt":
        analyticsTrack("페이지_QT", {
          title: "Quiet Time Page",
          where: from,
        });
        break;
      case "/notifications":
        analyticsTrack("페이지_알림", {
          title: "Notification Page",
          where: from,
        });
        break;
      default:
        if (matchGroup) {
          analyticsTrack("페이지_그룹_홈", {
            title: "Group Home Page",
            groupId: matchGroup.params.groupId,
            where: from,
          });
        } else if (matchPraycardNew) {
          analyticsTrack("페이지_기도카드_생성", {
            title: "PrayCard Create Page with Group ID",
            groupId: matchPraycardNew.params.groupId,
            where: from,
          });
        } else if (matchTodayPray) {
          analyticsTrack("페이지_오늘의_기도", {
            title: "Today Pray Page with Group ID",
            groupId: matchTodayPray.params.groupId,
            where: from,
          });
        } else if (matchPraycardEdit) {
          analyticsTrack("페이지_기도카드_수정", {
            title: "PrayCard Edit Page with Group ID",
            groupId: matchPraycardEdit.params.groupId,
            where: from,
          });
        } else if (matchGroupJoin) {
          analyticsTrack("페이지_그룹_참여", {
            title: "Group Join Page",
            groupId: matchGroupJoin.params.groupId,
            where: from,
          });
        }
    }
  }, [
    matchPraycardNew,
    matchTodayPray,
    matchPraycardEdit,
    matchGroupJoin,
    matchGroup,
    location.pathname,
    from,
  ]);

  return null;
};

export default App;

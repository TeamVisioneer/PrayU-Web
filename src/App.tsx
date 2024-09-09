import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  matchPath,
} from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "./components/auth/AuthProvider";
import PrivateRoute from "./components/auth/PrivateRoute";
import MainPage from "./pages/MainPage";
import GroupPage from "./pages/GroupPage";
import GroupCreatePage from "./pages/GroupCreatePage";
import { analytics } from "@/analytics/analytics";
import ConfirmAlert from "./components/alert/ConfirmAlert";
import { Toaster } from "./components/ui/toaster";
import PrayCardCreatePage from "./pages/PrayCardCreatePage";
import KakaoInit from "./components/kakao/KakaoInit";
import KakaoCallBack from "./components/kakao/KakaoCallback";
import MyProfilePage from "./pages/MyProfilePage";
import GroupNotFoundPage from "./pages/GroupNotFoundPage";
import GroupRedirectPage from "./pages/GroupRedirectPage";

const App = () => {
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    setVh();
    window.addEventListener("resize", setVh);
    return () => {
      window.removeEventListener("resize", setVh);
    };
  }, []);
  return (
    <div className="w-screen h-screen bg-mainBg ">
      <div className="mx-auto max-w-[480px] h-full p-5 overflow-x-hidden no-scrollbar">
        <BrowserRouter>
          <AuthProvider>
            {(import.meta.env.VITE_ENV === "staging" ||
              import.meta.env.VITE_ENV === "prod") && <AnalyticsTracker />}
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route
                path="/auth/kakao/callback"
                element={
                  <PrivateRoute>
                    <KakaoCallBack />
                  </PrivateRoute>
                }
              />
              <Route
                path="/group"
                element={
                  <PrivateRoute>
                    <GroupRedirectPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/group/new"
                element={
                  <PrivateRoute>
                    <GroupCreatePage />
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
              <Route
                path="/group/:groupId/praycard/new"
                element={
                  <PrivateRoute>
                    <PrayCardCreatePage />
                  </PrivateRoute>
                }
              />
              <Route path="group/not-found" element={<GroupNotFoundPage />} />
              <Route
                path="/profile/me"
                element={
                  <PrivateRoute>
                    <MyProfilePage />
                  </PrivateRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </div>
      <Toaster />
      <ConfirmAlert />
      <KakaoInit />
    </div>
  );
};

const AnalyticsTracker = () => {
  const location = useLocation();
  const from = location.state?.from?.pathname;
  const matchPraycardNew = matchPath(
    "/group/:groupId/praycard/new",
    location.pathname
  );
  const matchGroup = matchPath("/group/:groupId", location.pathname);
  useEffect(() => {
    switch (location.pathname) {
      case "/":
        analytics.track("페이지_메인", {
          title: "Main Page",
          where: from,
        });
        break;
      case "/group/new":
        analytics.track("페이지_그룹_생성", {
          title: "Group Create Page",
          where: from,
        });
        break;
      case "/profile/me":
        analytics.track("페이지_프로필_나", {
          title: "PrayCard Create Page",
          where: from,
        });
        break;
      default:
        if (matchGroup) {
          analytics.track("페이지_그룹_홈", {
            title: "Group Home Page",
            groupId: matchGroup.params.groupId,
            where: from,
          });
        } else if (matchPraycardNew) {
          analytics.track("페이지_기도카드_생성", {
            title: "PrayCard Create Page with Group ID",
            groupId: matchPraycardNew.params.groupId,
            where: from,
          });
        }
    }
  }, [matchPraycardNew, matchGroup, location.pathname, from]);

  return null;
};

export default App;

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
import KakaoInit from "./components/share/KakaoInit";

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
                path="/group"
                element={
                  <PrivateRoute>
                    <GroupPage />
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
                path="/praycard/new"
                element={
                  <PrivateRoute>
                    <PrayCardCreatePage />
                  </PrivateRoute>
                }
              />
              {/* <Route path="*" element={<NotFound />} /> */}
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
  console.log("from", from);

  useEffect(() => {
    switch (location.pathname) {
      case "/":
        if (from)
          analytics.track("페이지_메인_리다이렉트", {
            title: "Main Page",
            from,
          });
        else analytics.track("페이지_메인", { title: "Main Page" });
        break;
      case "/group/new":
        analytics.track("페이지_그룹_생성", { title: "Group Create Page" });
        break;
      case "/praycard/new":
        analytics.track("페이지_기도카드_생성", {
          title: "PrayCard Create Page",
        });
        break;
      default:
        if (location.pathname.startsWith("/group/")) {
          analytics.track("페이지_그룹_홈", {
            title: "Group Page",
          });
        }
        break;
    }
  }, [location.pathname]);

  return null;
};

export default App;

import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useParams,
} from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "./components/auth/AuthProvider";
import PrivateRoute from "./components/auth/PrivateRoute";
import MainPage from "./pages/MainPage";
import GroupPage from "./pages/GroupPage";
import GroupCreatePage from "./pages/GroupCreatePage";
import { analytics } from "@/analytics/analytics";

const App = () => {
  return (
    <div className="w-screen h-screen bg-mainBg ">
      <div className="mx-auto max-w-[480px] p-5 overflow-hidden">
        <BrowserRouter>
          <AuthProvider>
            <AnalyticsTracker />
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
              {/* <Route path="*" element={<NotFound />} /> */}
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </div>
    </div>
  );
};

const AnalyticsTracker = () => {
  const location = useLocation();
  const { groupId } = useParams();

  useEffect(() => {
    switch (location.pathname) {
      case "/":
        analytics.track("페이지_메인", { title: "Main Page" });
        break;
      case "/group/new":
        analytics.track("페이지_그룹_생성", { title: "Group Create Page" });
        break;
      default:
        if (location.pathname.startsWith("/group/")) {
          analytics.track("페이지_그룹_홈", {
            title: "Group Page",
            groupId: groupId,
          });
        }
        break;
    }
  }, [location, groupId]);

  return null;
};

export default App;

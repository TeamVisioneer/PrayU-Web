import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/auth/AuthProvider";
import PrivateRoute from "./components/auth/PrivateRoute";
import MainPage from "./pages/MainPage";
import GroupPage from "./pages/GroupPage";
import GroupCreatePage from "./pages/GroupCreatePage";

const App = () => {
  return (
    <div className="w-screen h-screen bg-mainBg ">
      <div className="mx-auto max-w-[480px] px-10 pt-10 pb-20">
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<MainPage />}></Route>
              <Route
                path="/group"
                element={
                  <PrivateRoute>
                    <GroupPage />
                  </PrivateRoute>
                }
              ></Route>
              <Route
                path="/group/new"
                element={
                  <PrivateRoute>
                    <GroupCreatePage />
                  </PrivateRoute>
                }
              ></Route>
              <Route
                path="/group/:groupId"
                element={
                  <PrivateRoute>
                    <GroupPage />
                  </PrivateRoute>
                }
              ></Route>
              {/* <Route path="*" element={<NotFound />}></Route> */}
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </div>
    </div>
  );
};

export default App;

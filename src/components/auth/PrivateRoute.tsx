import { ReactNode } from "react";

import { Navigate, useLocation } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import useBaseStore from "../../stores/baseStore";

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, userLoading } = useBaseStore();

  const location = useLocation();

  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={30} color={"#70AAFF"} loading={true} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />; // 로그인되지 않은 경우 리다이렉트
  }

  return children; // 로그인된 경우 자식 컴포넌트 렌더링
};

export default PrivateRoute;

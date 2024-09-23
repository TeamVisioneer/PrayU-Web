import React, { useEffect, useState } from 'react';
import { getDomainUrl } from '@/lib/utils';
import { useLocation } from 'react-router-dom';
import AppleLoginBtn from '@/components/auth/AppleLoginBtn';
import KakaoLoginBtn from '@/components/kakao/KakaoLoginBtn';

const LoginPage: React.FC = () => {
  const location = useLocation();
  const baseUrl = getDomainUrl();
  const pathname = location.state?.from?.pathname || "";
  const pathParts = pathname.split("/");
  const groupId =
      pathParts.length === 3 && pathParts[1] === "group" ? pathParts[2] : "";
  const redirectUrl = `${baseUrl}/term?groupId=${groupId}`;

  const [isIOSApp, setIsIOSApp] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSApp = userAgent.includes("prayu-ios");
    setIsIOSApp(isIOSApp);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen"> 
      <h2>Login</h2>
      <div className="flex flex-col gap-2">
        <KakaoLoginBtn redirectUrl={redirectUrl} />
        {isIOSApp &&  <AppleLoginBtn redirectUrl={redirectUrl} /> }
      </div>
    </div>
  );
};

export default LoginPage;

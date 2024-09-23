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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex flex-col justify-end">
      <div className="relative bg-mainBg p-10 rounded-tl-xl rounded-tr-xl z-20 w-full flex flex-col items-center gap-6">
        <h2 className="text-lg font-bold">PrayU 로그인</h2>
        <div className="h-[300px] flex flex-col items-center opacity-90">
          <img className="h-full" src="/images/intro_square.png" />
        </div>
        <div className="flex flex-col gap-2">
          <KakaoLoginBtn redirectUrl={redirectUrl} />
          {isIOSApp &&  <AppleLoginBtn redirectUrl={redirectUrl} /> }
        </div>
      </div>
    </div>
  )

  
};

export default LoginPage;

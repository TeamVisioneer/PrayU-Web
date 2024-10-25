import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import useBaseStore from "@/stores/baseStore";
import KakaoLoginBtn from "./KakaoLoginBtn";
import AppleLoginBtn from "./AppleLoginBtn";
import { useLocation } from "react-router-dom";
import { getDomainUrl } from "@/lib/utils";
import { useEffect, useState } from "react";
import EmailLoginBtn from "./EmailLoginBtn";

const LogInDrawer = () => {
  const isOpenLoginDrawer = useBaseStore((state) => state.isOpenLoginDrawer);
  const setIsOpenLoginDrawer = useBaseStore(
    (state) => state.setIsOpenLoginDrawer
  );
  const location = useLocation();
  const baseUrl = getDomainUrl();
  const pathname = location.state?.from?.pathname || window.location.pathname;
  const pathParts = pathname.split("/");
  let groupId = "";
  if (pathParts.length === 3 && pathParts[1] === "group") {
    groupId = pathParts[2];
  } else if (
    pathParts.length === 4 &&
    pathParts[1] === "group" &&
    pathParts[2] === "open" &&
    pathParts[3] === "1027-union"
  ) {
    groupId = "9085a291-7eb2-4b00-9f85-0ccd98f433a7";
  }
  const redirectUrl = `${baseUrl}/login-redirect?groupId=${groupId}&from=LogInDrawer`;

  const [isApp, setIsApp] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isApp = userAgent.includes("prayu");
    const isIOS = userAgent.includes("prayu-ios");
    setIsApp(isApp);
    setIsIOS(isIOS);
  }, []);

  const LoginContent = (
    <div className="flex flex-col gap-6 px-10">
      <div className="flex flex-col gap-1">
        <div className="text-xl font-bold">로그인 / 회원가입</div>
        <p className="flex flex-col justify-center font-thin">
          기도제목을 올리고, 서로 함께 반응하며 기도해요
        </p>
      </div>
      <div className="flex flex-col w-full justify-center gap-2">
        <KakaoLoginBtn
          redirectUri={`${baseUrl}/auth/kakao/callback`}
          state={`groupId:${groupId}`}
        />
        {isApp && (
          <>
            {isIOS && <AppleLoginBtn redirectUrl={redirectUrl} />}
            <EmailLoginBtn />
          </>
        )}
      </div>
      <div className="flex flex-col w-full justify-center gap-1 text-sm text-gray-400">
        <hr className="border-gray-300 mb-1" />
        <div className="flex gap-2">
          <p className="font-light">
            로그인 / 회원 관련 궁금하신 사항이 있다면?
          </p>
          <a
            href={`${import.meta.env.VITE_PRAY_KAKAO_CHANNEL_CHAT_URL}`}
            className="text-blue-500 cursor-pointer"
          >
            문의하기
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <Drawer open={isOpenLoginDrawer} onOpenChange={setIsOpenLoginDrawer}>
      <DrawerContent className="bg-mainBg pb-5">
        <DrawerHeader className="p-2">
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        {LoginContent}
      </DrawerContent>
    </Drawer>
  );
};

export default LogInDrawer;

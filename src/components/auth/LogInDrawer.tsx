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
import { useLocation, useNavigate } from "react-router-dom";
import { getDomainUrl } from "@/lib/utils";
import { useEffect, useState } from "react";
import EmailLoginBtn from "./EmailLoginBtn";

const LogInDrawer = () => {
  const user = useBaseStore((state) => state.user);
  const isOpenEmailLoginAccordian = useBaseStore(
    (state) => state.isOpenEmailLoginAccordian
  );
  const isOpenLoginDrawer = useBaseStore((state) => state.isOpenLoginDrawer);
  const setIsOpenLoginDrawer = useBaseStore(
    (state) => state.setIsOpenLoginDrawer
  );
  const location = useLocation();
  const navigate = useNavigate();
  const baseUrl = getDomainUrl();
  const pathname = location.state?.from?.pathname || "";
  const pathParts = pathname.split("/");
  const groupId =
    pathParts.length === 3 && pathParts[1] === "group" ? pathParts[2] : "";
  const redirectUrl = `${baseUrl}/term?groupId=${groupId}`;

  const [isIOSApp, setIsIOSApp] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/group");
    }
  }, [user, navigate]);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSApp = userAgent.includes("prayu-ios");
    setIsIOSApp(isIOSApp);
  }, []);

  const LoginContent = (
    <div className="flex flex-col gap-6 px-10">
      <div className="flex flex-col gap-1">
        <div className="text-lg font-bold">PrayU 로그인</div>
        {
          <p className="flex flex-col justify-center text-gray-700">
            기도제목을 올리고, 서로 함께 반응하며 기도해요
          </p>
        }
      </div>
      <div className="flex flex-col w-full justify-center gap-2">
        {!isOpenEmailLoginAccordian && (
          <KakaoLoginBtn redirectUrl={redirectUrl} />
        )}
        {isIOSApp && (
          <>
            {!isOpenEmailLoginAccordian && (
              <AppleLoginBtn redirectUrl={redirectUrl} />
            )}
            <EmailLoginBtn />
          </>
        )}
      </div>
      <div className="flex flex-col w-full justify-center gap-1 text-sm text-gray-400">
        <hr className="border-gray-300 mb-1" />
        <div className="flex gap-2">
          <p>로그인/회원 관련 궁금하신 사항이 있다면?</p>
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

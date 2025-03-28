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
import EmailLoginBtn from "./EmailLoginBtn";

const LogInDrawer = () => {
  const isApp = useBaseStore((state) => state.isApp);
  const isIOS = useBaseStore((state) => state.isIOS);
  const isOpenLoginDrawer = useBaseStore((state) => state.isOpenLoginDrawer);
  const setIsOpenLoginDrawer = useBaseStore(
    (state) => state.setIsOpenLoginDrawer
  );
  const location = useLocation();
  const baseUrl = getDomainUrl();
  const pathname = location.state?.from?.pathname || location.pathname;
  const pathParts = pathname.split("/");
  let groupId = "";
  let unionId = "";
  if (pathParts.length === 3 && pathParts[1] === "group") {
    groupId = pathParts[2];
  } else if (pathParts.length === 5 && pathParts[1] === "office") {
    unionId = pathParts[3];
  } else if (
    pathParts.length === 4 &&
    pathParts[1] === "group" &&
    pathParts[2] === "open" &&
    pathParts[3] === "1027-union"
  ) {
    groupId = String(import.meta.env.VITE_UNION_WORSHIP_GROUP_ID);
  }
  const redirectUrl = `${baseUrl}/login-redirect?groupId=${groupId}&unionId=${unionId}&from=LogInDrawer`;

  const LoginContent = (
    <div className="flex flex-col gap-6 px-10">
      <div className="flex flex-col gap-1">
        <div className="text-xl font-semibold">로그인 / 회원가입</div>
        <p className="flex flex-col justify-center font-light text-[0.95rem]">
          여러분의 신앙생활은 소중한 개인의 영역입니다.
          <br />
          어떤 정보도 외부에 공유되지 않으니 안심하세요.
        </p>
      </div>
      <div className="flex flex-col w-full justify-center gap-4 pb-3">
        <KakaoLoginBtn
          redirectUri={`${baseUrl}/auth/kakao/callback`}
          state={`groupId:${groupId};unionId:${unionId}`}
        />
        {isApp && (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center w-full">
              <div className="border-t border-gray-300 flex-grow"></div>
              <span className="text-xs font-light px-4">
                다른 방법으로 로그인
              </span>
              <div className="border-t border-gray-300 flex-grow"></div>
            </div>
            <div className="flex justify-center gap-5">
              {isIOS && <AppleLoginBtn redirectUrl={redirectUrl} />}
              <EmailLoginBtn />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Drawer
      open={isOpenLoginDrawer}
      onOpenChange={(open) => {
        setIsOpenLoginDrawer(open);
        if (!open && window.history.state?.open === true) window.history.back();
      }}
    >
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

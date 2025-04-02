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
import EmailLoginBtn from "./EmailLoginBtn";

interface LogInDrawerProps {
  path?: string;
}

const LogInDrawer = ({ path }: LogInDrawerProps) => {
  const isApp = useBaseStore((state) => state.isApp);
  const isIOS = useBaseStore((state) => state.isIOS);
  const isOpenLoginDrawer = useBaseStore((state) => state.isOpenLoginDrawer);
  const setIsOpenLoginDrawer = useBaseStore(
    (state) => state.setIsOpenLoginDrawer
  );

  const baseUrl = window.location.origin;

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
          state={path ? `path:${path}` : ""}
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
              {isIOS && (
                <AppleLoginBtn
                  redirectUrl={
                    path
                      ? `${baseUrl}/login-redirect?path=${path}`
                      : `${baseUrl}/login-redirect`
                  }
                />
              )}
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

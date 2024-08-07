import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { useEffect, useState } from "react";
import { navigateToSectionWithHash } from "@/lib/utils";

import { cn } from "@/lib/utils";

interface DrawerProps {
  onOpenChange: (isDisabled: boolean) => void;
}

const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    {...props}
  />
);
Drawer.displayName = "Drawer";

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay> & DrawerProps
>(({ className, onOpenChange, ...props }, ref) => {
  let isBackKeyPressed = 0;
  const [previousHash, setPreviousHash] = useState(location.hash);

  useEffect(() => {
    const previousHash = location.hash;
    console.log("previousHash", previousHash);

    navigateToSectionWithHash("drawer");
    console.log("컴포넌트가 생성되고 네비게이트돼었습니다.");
    const nowHash = location.hash;
    console.log("nowHash", nowHash);

    return () => {
      if (isBackKeyPressed == 0) {
        window.history.go(-1);
        console.log("컴포넌트가 제거되고 뒤로가기되었습니다.");
      }
    };
  }, []);

  useEffect(() => {
    //아싸리 백키로만 처리를 하든(드로어 중첩되면 이슈 발생 우러...)
    //해시 변화를 감지하여 최상단 글자가 지금 currentHash랑 같든지 등의 처리 유도.를 하든
    // 개선 되어야만 함!!
    const handleHashChange = () => {
      const currentHash = location.hash;

      console.log(
        "백키가 눌러졌으므로 뒤로가기를 따로 안누릅니다.",
        currentHash
      );
      //window.history.go(0);
      isBackKeyPressed = 1;
      onOpenChange(false);

      setPreviousHash(currentHash);
    };

    window.addEventListener("popstate", handleHashChange);

    return () => {
      window.removeEventListener("popstate", handleHashChange);
    };
  }, [previousHash, onOpenChange]);

  return (
    <DrawerPrimitive.Overlay
      ref={ref}
      className={cn("fixed inset-0 z-50 bg-black/80", className)}
      {...props}
    />
  );
});
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> & DrawerProps
>(({ className, children, onOpenChange, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay onOpenChange={onOpenChange} />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
        className
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
);
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};

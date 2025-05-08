import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const BottomToastProvider = ToastPrimitives.Provider;

const BottomToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-4 z-[100] flex max-h-screen w-full flex-col items-center",
      className
    )}
    {...props}
  />
));
BottomToastViewport.displayName = "BottomToastViewport";

const bottomToastVariants = cva(
  "group pointer-events-auto flex items-center gap-2.5 rounded-lg bg-neutral-700/90 py-3 px-4 shadow-md w-auto max-w-[90%] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-bottom-full data-[state=open]:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "text-white",
        success: "text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type IconProps = {
  icon?: React.ReactNode;
};

const BottomToast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof bottomToastVariants> &
    IconProps
>(({ className, variant, icon, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(bottomToastVariants({ variant }), className)}
      {...props}
    >
      {icon}
      {props.children}
    </ToastPrimitives.Root>
  );
});
BottomToast.displayName = "BottomToast";

const BottomToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-7 shrink-0 items-center justify-center rounded-md px-2 text-xs font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
));
BottomToastAction.displayName = "BottomToastAction";

const BottomToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-normal", className)}
    {...props}
  />
));
BottomToastTitle.displayName = "BottomToastTitle";

const BottomToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-xs opacity-90", className)}
    {...props}
  />
));
BottomToastDescription.displayName = "BottomToastDescription";

// Default success icon
const SuccessIcon = () => (
  <div className="flex items-center justify-center rounded-full bg-green-500 w-5 h-5">
    <Check className="h-3 w-3 text-white" />
  </div>
);

type BottomToastProps = React.ComponentPropsWithoutRef<typeof BottomToast>;

type BottomToastActionElement = React.ReactElement<typeof BottomToastAction>;

export {
  type BottomToastProps,
  type BottomToastActionElement,
  BottomToastProvider,
  BottomToastViewport,
  BottomToast,
  BottomToastTitle,
  BottomToastDescription,
  BottomToastAction,
  SuccessIcon,
};

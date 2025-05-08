import {
  BottomToast,
  BottomToastDescription,
  BottomToastProvider,
  BottomToastTitle,
  BottomToastViewport,
  SuccessIcon,
} from "@/components/ui/bottom-toast";
import { useBottomToast } from "@/components/ui/use-bottom-toast";

export function BottomToaster() {
  const { toasts } = useBottomToast();

  return (
    <BottomToastProvider swipeDirection="down" swipeThreshold={10}>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        variant,
        ...props
      }) {
        // Default icon for success variant is the success icon
        const icon = variant === "success" ? <SuccessIcon /> : props.icon;

        return (
          <BottomToast key={id} variant={variant} icon={icon} {...props}>
            <div className="flex-1 min-w-0">
              {title && <BottomToastTitle>{title}</BottomToastTitle>}
              {description && (
                <BottomToastDescription>{description}</BottomToastDescription>
              )}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </BottomToast>
        );
      })}
      <BottomToastViewport />
    </BottomToastProvider>
  );
}

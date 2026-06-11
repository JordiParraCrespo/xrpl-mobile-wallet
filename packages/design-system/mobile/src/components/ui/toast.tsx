import { Check, type LucideIcon } from "lucide-react-native";
import * as React from "react";
import { View } from "react-native";
import { cn } from "../../lib/utils";
import { Icon } from "./icon";
import { Text, TextClassContext } from "./text";

// Toast — transient confirmation pill ("Sent · 25 XRP"). Inverse ink
// pill that floats over content; flat, no shadows. Presentation
// (timing / animation) is left to the consumer.
type ToastProps = React.ComponentProps<typeof View> & {
  /** Lucide icon; defaults to a check mark. */
  icon?: LucideIcon;
};

function Toast({ className, icon = Check, children, ...props }: ToastProps) {
  return (
    <TextClassContext.Provider value="text-inverse-foreground text-sm font-medium">
      <View
        className={cn(
          "bg-inverse flex-row items-center gap-[9px] self-center rounded-full px-[18px] py-3",
          className,
        )}
        {...props}
      >
        <Icon as={icon} size={16} className="text-inverse-foreground" />
        {typeof children === "string" ? <Text>{children}</Text> : children}
      </View>
    </TextClassContext.Provider>
  );
}

export type { ToastProps };
export { Toast };

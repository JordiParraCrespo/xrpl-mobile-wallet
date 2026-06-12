import { ShieldCheck } from "lucide-react-native";
import type * as React from "react";
import { View } from "react-native";
import { cn } from "../../lib/utils";
import { Icon } from "./icon";
import { Text } from "./text";

// SecurityNote — the calm reassurance strip under sensitive inputs
// (passcode keypad, seed entry): shield icon + small muted copy on the
// grouped-tint surface. Informational only, never alarming.
type SecurityNoteProps = Omit<React.ComponentProps<typeof View>, "children"> & {
  children: React.ReactNode;
};

function SecurityNote({ children, className, ...props }: SecurityNoteProps) {
  return (
    <View
      className={cn(
        "flex-row items-start gap-2.5 rounded-md bg-muted px-3.5 py-3",
        className,
      )}
      {...props}
    >
      <Icon
        as={ShieldCheck}
        size={18}
        className="mt-px shrink-0 text-muted-foreground"
      />
      <Text className="flex-1 text-[13px] leading-[19px] text-muted-foreground">
        {children}
      </Text>
    </View>
  );
}

export type { SecurityNoteProps };
export { SecurityNote };

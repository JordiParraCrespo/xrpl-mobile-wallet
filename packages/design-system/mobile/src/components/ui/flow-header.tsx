import { ChevronLeft } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";
import { cn } from "../../lib/utils";
import { Icon } from "./icon";
import { Text } from "./text";

// FlowHeader — the header chrome for the full-screen money flows (add
// money · receive · swap · send). A soft circular back button, a centered
// title with an optional subtitle, and an optional right slot balanced by
// a spacer so the title stays optically centered. Always white-on-dark:
// these flows paint on a near-black surface regardless of app theme, so
// the header pins its own light palette (mirrors the `glass` variants
// elsewhere). The host owns the top safe-area inset.
type FlowHeaderProps = Omit<React.ComponentProps<typeof View>, "children"> & {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  /** Trailing control, e.g. a help or close button. */
  right?: React.ReactNode;
};

function FlowHeader({
  title,
  subtitle,
  onBack,
  right,
  className,
  ...props
}: FlowHeaderProps) {
  return (
    <View
      className={cn("flex-row items-center px-4 pb-2 pt-1", className)}
      {...props}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={onBack}
        className="h-11 w-11 items-center justify-center rounded-full bg-white/10 active:scale-[0.97]"
      >
        <Icon as={ChevronLeft} size={22} className="text-white" />
      </Pressable>
      <View className="flex-1 items-center px-2">
        <Text
          className="text-[17px] font-semibold text-white"
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-0.5 text-[13px] text-white/60" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View className="w-11 items-end">{right}</View>
    </View>
  );
}

export type { FlowHeaderProps };
export { FlowHeader };

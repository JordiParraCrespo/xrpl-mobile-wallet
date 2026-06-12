import { ChevronLeft } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";
import { cn } from "../../lib/utils";
import { Icon } from "./icon";
import { Text } from "./text";

// FlowHeader — the header shared by the full-screen money flows (add
// money · receive · swap · send): a soft circular back button, a centered
// title with an optional destination/meta subtitle, and an optional right
// slot balanced by a spacer so the title stays optically centered.
type FlowHeaderProps = Omit<React.ComponentProps<typeof View>, "children"> & {
  title: string;
  /** Quiet meta line under the title, e.g. "To XRP Ledger · $744.87". */
  subtitle?: string;
  onBack?: () => void;
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
      className={cn(
        "min-h-[44px] w-full flex-row items-center justify-between py-2",
        className,
      )}
      {...props}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={onBack}
        className="bg-secondary h-11 w-11 items-center justify-center rounded-full active:scale-[0.97]"
      >
        <Icon as={ChevronLeft} size={22} className="text-foreground" />
      </Pressable>
      <View className="min-w-0 flex-1 items-center px-2">
        <Text
          numberOfLines={1}
          className="text-foreground text-[17px] font-bold"
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={1}
            className="text-muted-foreground mt-px text-[13px]"
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ?? <View className="w-11" />}
    </View>
  );
}

export type { FlowHeaderProps };
export { FlowHeader };

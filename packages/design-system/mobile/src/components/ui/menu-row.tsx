import { ChevronRight, type LucideIcon } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";
import { cn } from "../../lib/utils";
import { Icon } from "./icon";
import { Text } from "./text";

// MenuRow — "More" sheet / settings menu row. Neutral 42px disc, label +
// sub stack, trailing chevron. Press feedback is a muted background
// shift, matching ListRow.
type MenuRowProps = Omit<React.ComponentProps<typeof Pressable>, "children"> & {
  icon: LucideIcon;
  label: string;
  sub?: string;
};

function MenuRow({ icon, label, sub, className, ...props }: MenuRowProps) {
  return (
    <Pressable
      className={cn(
        "active:bg-muted w-full flex-row items-center gap-3.5 rounded-md px-2.5 py-3",
        className,
      )}
      {...props}
    >
      <View className="bg-secondary h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full">
        <Icon as={icon} size={19} className="text-foreground" />
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <Text numberOfLines={1} className="text-[15px] font-semibold">
          {label}
        </Text>
        {sub ? (
          <Text numberOfLines={1} className="text-muted-foreground text-[13px]">
            {sub}
          </Text>
        ) : null}
      </View>
      <Icon
        as={ChevronRight}
        size={18}
        className="text-muted-foreground shrink-0"
      />
    </Pressable>
  );
}

export type { MenuRowProps };
export { MenuRow };

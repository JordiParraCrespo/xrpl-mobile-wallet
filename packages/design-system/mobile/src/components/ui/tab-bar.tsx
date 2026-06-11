import type { LucideIcon } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";
import { cn } from "../../lib/utils";
import { Icon } from "./icon";
import { Text } from "./text";

// TabBar — the floating pill bottom navigation. A rounded-pill container
// with equal-width tab items (icon over a tiny label); the active item
// sits on a soft pill. `glass` renders the translucent variant used over
// the dark home gradient, and `accessory` hosts the assistant avatar at
// the right edge.
type TabBarItem = {
  key: string;
  label: string;
  icon: LucideIcon;
};

type TabBarProps = Omit<React.ComponentProps<typeof View>, "children"> & {
  items: TabBarItem[];
  activeKey: string;
  onChange: (key: string) => void;
  /** Optional trailing slot (e.g. the assistant avatar). */
  accessory?: React.ReactNode;
  /** Translucent variant for dark / gradient surfaces. */
  glass?: boolean;
};

function TabBar({
  items,
  activeKey,
  onChange,
  accessory,
  glass,
  className,
  ...props
}: TabBarProps) {
  return (
    <View
      accessibilityRole="tablist"
      className={cn(
        "flex-row items-center gap-0.5 rounded-[30px] border p-1.5",
        glass ? "border-white/15 bg-white/10" : "bg-card/90 border-border",
        className,
      )}
      {...props}
    >
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(item.key)}
            className={cn(
              "flex-1 items-center gap-0.5 rounded-[22px] py-2 active:scale-[0.97]",
              active && (glass ? "bg-white/15" : "bg-secondary"),
            )}
          >
            <Icon
              as={item.icon}
              size={22}
              strokeWidth={active ? 2.4 : 2}
              className={
                active
                  ? glass
                    ? "text-white"
                    : "text-foreground"
                  : glass
                    ? "text-white/55"
                    : "text-muted-foreground"
              }
            />
            <Text
              numberOfLines={1}
              className={cn(
                "text-[10px]",
                active ? "font-bold" : "font-medium",
                active
                  ? glass
                    ? "text-white"
                    : "text-foreground"
                  : glass
                    ? "text-white/55"
                    : "text-muted-foreground",
              )}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
      {accessory ? <View className="shrink-0 pl-1">{accessory}</View> : null}
    </View>
  );
}

export type { TabBarItem, TabBarProps };
export { TabBar };

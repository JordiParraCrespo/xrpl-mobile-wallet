import type { LucideIcon } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { cn } from "../../lib/utils";
import { GlassBackdrop } from "./glass-panel";
import { Icon } from "./icon";
import { Text } from "./text";

// TabBar — the floating pill bottom navigation. A rounded-pill container
// with equal-width tab items (icon over a tiny label); the active pill
// springs between items when the selection changes. `glass` renders the
// translucent variant used over the dark home gradient, and `accessory`
// hosts the assistant avatar at the right edge.
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

// Matches the container's gap-0.5 between tab items.
const ITEM_GAP = 2;

/** Tab icon that pops gently (a quick scale pulse) when it becomes active. */
function TabIcon({
  icon,
  active,
  className,
}: {
  icon: LucideIcon;
  active: boolean;
  className: string;
}) {
  const scale = useSharedValue(1);
  const wasActive = React.useRef(active);

  React.useEffect(() => {
    if (active && !wasActive.current) {
      scale.value = withSequence(
        withTiming(1.18, { duration: 110, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 140, easing: Easing.out(Easing.quad) }),
      );
    }
    wasActive.current = active;
  }, [active, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={style}>
      <Icon
        as={icon}
        size={22}
        strokeWidth={active ? 2.4 : 2}
        className={className}
      />
    </Animated.View>
  );
}

function TabBar({
  items,
  activeKey,
  onChange,
  accessory,
  glass,
  className,
  ...props
}: TabBarProps) {
  const [rowWidth, setRowWidth] = React.useState(0);
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.key === activeKey),
  );
  const itemWidth =
    rowWidth > 0
      ? (rowWidth - ITEM_GAP * (items.length - 1)) / items.length
      : 0;

  // The pill's x position; jumps on first layout, springs on tab change.
  const pillX = useSharedValue(0);
  const measured = React.useRef(false);

  React.useEffect(() => {
    if (itemWidth <= 0) return;
    const target = activeIndex * (itemWidth + ITEM_GAP);
    if (!measured.current) {
      measured.current = true;
      pillX.value = target;
      return;
    }
    // Ease-out slide that stops dead on the target — no spring, no overshoot.
    pillX.value = withTiming(target, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [activeIndex, itemWidth, pillX]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
  }));

  return (
    <View
      accessibilityRole="tablist"
      className={cn(
        "flex-row items-center gap-0.5 overflow-hidden rounded-[30px] border p-1.5",
        glass
          ? "border-white/[0.18] bg-white/[0.12]"
          : "bg-card/90 border-border",
        className,
      )}
      {...props}
    >
      {glass ? <GlassBackdrop /> : null}
      <View
        className="relative min-w-0 flex-1 flex-row items-center gap-0.5"
        onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}
      >
        {itemWidth > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[pillStyle, { width: itemWidth }]}
            className={cn(
              "absolute inset-y-0 rounded-[22px]",
              glass ? "bg-white/[0.18]" : "bg-secondary",
            )}
          />
        ) : null}
        {items.map((item) => {
          const active = item.key === activeKey;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => onChange(item.key)}
              className="flex-1 items-center gap-0.5 rounded-[22px] py-2 active:scale-[0.97]"
            >
              <TabIcon
                icon={item.icon}
                active={active}
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
      </View>
      {accessory ? <View className="shrink-0 pl-1">{accessory}</View> : null}
    </View>
  );
}

export type { TabBarItem, TabBarProps };
export { TabBar };

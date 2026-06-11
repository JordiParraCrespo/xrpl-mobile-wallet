import { ChevronDown, type LucideIcon } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";
import { cn } from "../../lib/utils";
import { AssetIcon } from "./asset-icon";
import { GlassBackdrop } from "./glass-panel";
import { Icon } from "./icon";
import { Text } from "./text";

// SelectorPill — account / token selector pill used in the send, swap and
// add-money flows. Leading AssetIcon (token) or small icon disc
// (account), label, trailing chevron. `glass` renders the translucent
// variant for dark / gradient flow surfaces.
type SelectorPillProps = Omit<
  React.ComponentProps<typeof Pressable>,
  "children"
> & {
  label: string;
  /** Leading Lucide icon, rendered on a small neutral disc. */
  icon?: LucideIcon;
  /** Leading token disc — takes precedence over `icon`. */
  asset?: { symbol: string; color?: string };
  /** Translucent variant for dark / gradient surfaces. */
  glass?: boolean;
};

function SelectorPill({
  label,
  icon,
  asset,
  glass,
  className,
  ...props
}: SelectorPillProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={cn(
        "flex-row items-center gap-2 self-start rounded-full border py-1.5 pl-1.5 pr-3.5 active:scale-[0.97]",
        glass
          ? "overflow-hidden border-white/15 bg-white/10"
          : "bg-card border-border",
        className,
      )}
      {...props}
    >
      {glass ? <GlassBackdrop /> : null}
      {asset ? (
        <AssetIcon symbol={asset.symbol} color={asset.color} size={24} />
      ) : (
        <View
          className={cn(
            "h-6 w-6 items-center justify-center rounded-full",
            glass ? "bg-white/15" : "bg-secondary",
          )}
        >
          {icon ? (
            <Icon
              as={icon}
              size={14}
              className={glass ? "text-white" : "text-foreground"}
            />
          ) : null}
        </View>
      )}
      <Text
        numberOfLines={1}
        className={cn(
          "text-[15px] font-semibold",
          glass ? "text-white" : "text-foreground",
        )}
      >
        {label}
      </Text>
      <Icon
        as={ChevronDown}
        size={16}
        className={glass ? "text-white/40" : "text-muted-foreground"}
      />
    </Pressable>
  );
}

export type { SelectorPillProps };
export { SelectorPill };

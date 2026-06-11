import { cva, type VariantProps } from "class-variance-authority";
import { ChevronRight, type LucideIcon } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";
import { cn } from "../../lib/utils";
import { Icon } from "./icon";
import { Text } from "./text";

// FeatureRow — promotional / explainer card row (market features, rewards
// perks, security intros). Leading tinted disc with an icon or a serif
// glyph, title + description stack, optional trailing chevron when
// pressable. Flat card surface with a hairline border — no shadows.
const featureRowDiscVariants = cva("shrink-0 items-center justify-center", {
  variants: {
    tone: {
      brand: "bg-brand-soft",
      positive: "bg-positive-soft",
      warning: "bg-warning-soft",
      info: "bg-info-soft",
      destructive: "bg-destructive-soft",
      neutral: "bg-secondary",
    },
    circle: {
      // Default feature disc: 46px squircle.
      false: "h-[46px] w-[46px] rounded-[14px]",
      // Perk rows use a smaller 38px circle.
      true: "h-[38px] w-[38px] rounded-full",
    },
  },
  defaultVariants: {
    tone: "brand",
    circle: false,
  },
});

const featureRowDiscTextVariants = cva("", {
  variants: {
    tone: {
      brand: "text-brand-soft-foreground",
      positive: "text-positive-soft-foreground",
      warning: "text-warning-soft-foreground",
      info: "text-info-soft-foreground",
      destructive: "text-destructive-soft-foreground",
      neutral: "text-foreground",
    },
  },
  defaultVariants: {
    tone: "brand",
  },
});

type FeatureRowProps = Omit<
  React.ComponentProps<typeof Pressable>,
  "children"
> &
  VariantProps<typeof featureRowDiscVariants> & {
    /** Leading Lucide icon — mutually exclusive with `glyph`. */
    icon?: LucideIcon;
    /** Leading serif glyph (e.g. '✦') rendered in the display face. */
    glyph?: string;
    title: string;
    description?: string;
  };

function FeatureRow({
  icon,
  glyph,
  title,
  description,
  tone,
  circle,
  className,
  ...props
}: FeatureRowProps) {
  const interactive = !!props.onPress;
  return (
    <Pressable
      disabled={!interactive}
      className={cn(
        "bg-card border-border w-full flex-row items-center gap-3.5 rounded-xl border p-4",
        interactive && "active:scale-[0.97]",
        className,
      )}
      {...props}
    >
      <View className={featureRowDiscVariants({ tone, circle })}>
        {icon ? (
          <Icon
            as={icon}
            size={circle ? 18 : 22}
            className={featureRowDiscTextVariants({ tone })}
          />
        ) : (
          <Text
            className={cn(
              "font-display text-[22px] font-normal",
              featureRowDiscTextVariants({ tone }),
            )}
          >
            {glyph}
          </Text>
        )}
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <Text numberOfLines={1} className="text-base font-semibold">
          {title}
        </Text>
        {description ? (
          <Text numberOfLines={2} className="text-muted-foreground text-[13px]">
            {description}
          </Text>
        ) : null}
      </View>
      {interactive ? (
        <Icon
          as={ChevronRight}
          size={20}
          className="text-foreground/25 shrink-0"
        />
      ) : null}
    </Pressable>
  );
}

export type { FeatureRowProps };
export { FeatureRow, featureRowDiscVariants };

import * as Slot from "@rn-primitives/slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Platform, View } from "react-native";
import { cn } from "../../lib/utils";
import { GlassBackdrop } from "./glass-panel";
import { TextClassContext } from "./text";

// Badge — compact status / category label. Semantic tones map to the
// money palette: positive (received), negative (sent / failed), warning
// (pending), info, brand and neutral. Soft (tinted) by default; `solid`
// for emphasis (price deltas, counters); `dot` adds the status dot;
// `glass` is the frosted "COMING SOON" pill used over gradients.
const badgeVariants = cva(
  cn(
    "border-border group shrink-0 flex-row items-center justify-center gap-1.5 overflow-hidden rounded-full border",
    Platform.select({
      web: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive w-fit whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] [&>svg]:pointer-events-none [&>svg]:size-3",
    }),
  ),
  {
    variants: {
      variant: {
        default: cn(
          "bg-primary border-transparent",
          Platform.select({ web: "[a&]:hover:bg-primary/90" }),
        ),
        secondary: cn(
          "bg-secondary border-transparent",
          Platform.select({ web: "[a&]:hover:bg-secondary/90" }),
        ),
        destructive: cn(
          "bg-destructive border-transparent",
          Platform.select({ web: "[a&]:hover:bg-destructive/90" }),
        ),
        outline: Platform.select({
          web: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        }),
        // Soft tinted tones for money movement & status.
        brand: "bg-brand-soft border-transparent",
        positive: "bg-positive-soft border-transparent",
        negative: "bg-destructive-soft border-transparent",
        warning: "bg-warning-soft border-transparent",
        info: "bg-info-soft border-transparent",
        glass: "border-white/65 bg-white/50",
      },
      size: {
        sm: "px-2 py-1",
        md: "px-2.5 py-[5px]",
      },
      solid: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      { variant: "brand", solid: true, class: "bg-brand" },
      { variant: "positive", solid: true, class: "bg-positive" },
      { variant: "negative", solid: true, class: "bg-destructive" },
      { variant: "warning", solid: true, class: "bg-warning" },
      { variant: "info", solid: true, class: "bg-info" },
    ],
    defaultVariants: {
      variant: "default",
      size: "md",
      solid: false,
    },
  },
);

const badgeTextVariants = cva("font-semibold", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      secondary: "text-secondary-foreground",
      destructive: "text-destructive-foreground",
      outline: "text-foreground",
      brand: "text-brand-soft-foreground",
      positive: "text-positive-soft-foreground",
      negative: "text-destructive-soft-foreground",
      warning: "text-warning-soft-foreground",
      info: "text-info-soft-foreground",
      glass: "text-brand-soft-foreground font-bold tracking-[0.6px]",
    },
    size: {
      sm: "text-[11px]",
      md: "text-xs",
    },
    solid: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    { variant: "brand", solid: true, class: "text-brand-foreground" },
    { variant: "positive", solid: true, class: "text-positive-foreground" },
    { variant: "negative", solid: true, class: "text-destructive-foreground" },
    { variant: "warning", solid: true, class: "text-warning-foreground" },
    { variant: "info", solid: true, class: "text-info-foreground" },
  ],
  defaultVariants: {
    variant: "default",
    size: "md",
    solid: false,
  },
});

const badgeDotVariants = cva("h-1.5 w-1.5 rounded-full", {
  variants: {
    variant: {
      default: "bg-primary-foreground",
      secondary: "bg-secondary-foreground",
      destructive: "bg-destructive-foreground",
      outline: "bg-foreground",
      brand: "bg-brand-soft-foreground",
      positive: "bg-positive-soft-foreground",
      negative: "bg-destructive-soft-foreground",
      warning: "bg-warning-soft-foreground",
      info: "bg-info-soft-foreground",
      glass: "bg-brand-soft-foreground",
    },
    solid: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    { variant: "brand", solid: true, class: "bg-brand-foreground" },
    { variant: "positive", solid: true, class: "bg-positive-foreground" },
    { variant: "negative", solid: true, class: "bg-destructive-foreground" },
    { variant: "warning", solid: true, class: "bg-warning-foreground" },
    { variant: "info", solid: true, class: "bg-info-foreground" },
  ],
  defaultVariants: {
    variant: "default",
    solid: false,
  },
});

type BadgeProps = Omit<React.ComponentProps<typeof View>, "children"> & {
  asChild?: boolean;
  /** Leading status dot in the tone color. */
  dot?: boolean;
  children?: React.ReactNode;
} & VariantProps<typeof badgeVariants>;

function Badge({
  className,
  variant,
  size,
  solid,
  dot,
  asChild,
  children,
  ...props
}: BadgeProps) {
  const Component = asChild ? Slot.View : View;
  return (
    <TextClassContext.Provider
      value={badgeTextVariants({ variant, size, solid })}
    >
      <Component
        className={cn(badgeVariants({ variant, size, solid }), className)}
        {...props}
      >
        {variant === "glass" ? <GlassBackdrop /> : null}
        {dot ? <View className={badgeDotVariants({ variant, solid })} /> : null}
        {children}
      </Component>
    </TextClassContext.Provider>
  );
}

export type { BadgeProps };
export { Badge, badgeDotVariants, badgeTextVariants, badgeVariants };

import { cva, type VariantProps } from "class-variance-authority";
import {
  CircleCheck,
  Info,
  type LucideIcon,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react-native";
import * as React from "react";
import { View } from "react-native";
import { cn } from "../../lib/utils";
import { Icon } from "./icon";
import { Text, TextClassContext } from "./text";

// Callout — inline message banner. Calm reassurance (neutral), soft
// semantic tints for success / error / warning / info. Flat, no
// shadows, 12px radius — per the Drops design language.
const calloutVariants = cva(
  "w-full flex-row items-start gap-2.5 rounded-md px-3.5 py-3",
  {
    variants: {
      variant: {
        neutral: "bg-muted",
        positive: "bg-positive-soft border-positive/20 border",
        negative: "bg-destructive-soft border-destructive/20 border",
        warning: "bg-warning-soft border-warning/20 border",
        info: "bg-info-soft border-info/20 border",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

const calloutTextVariants = cva("flex-1 text-[13px] leading-[19px]", {
  variants: {
    variant: {
      neutral: "text-muted-foreground",
      positive: "text-positive-soft-foreground font-medium",
      negative: "text-destructive-soft-foreground font-medium",
      warning: "text-warning-soft-foreground font-medium",
      info: "text-info-soft-foreground font-medium",
    },
  },
  defaultVariants: {
    variant: "neutral",
  },
});

const calloutIconVariants = cva("mt-px shrink-0", {
  variants: {
    variant: {
      neutral: "text-muted-foreground",
      positive: "text-positive-soft-foreground",
      negative: "text-destructive-soft-foreground",
      warning: "text-warning-soft-foreground",
      info: "text-info-soft-foreground",
    },
  },
  defaultVariants: {
    variant: "neutral",
  },
});

const DEFAULT_ICONS: Record<
  NonNullable<VariantProps<typeof calloutVariants>["variant"]>,
  LucideIcon
> = {
  neutral: ShieldCheck,
  positive: CircleCheck,
  negative: TriangleAlert,
  warning: TriangleAlert,
  info: Info,
};

type CalloutProps = React.ComponentProps<typeof View> &
  VariantProps<typeof calloutVariants> & {
    /** Lucide icon override; each variant ships a sensible default. */
    icon?: LucideIcon;
  };

function Callout({
  className,
  variant = "neutral",
  icon,
  children,
  ...props
}: CalloutProps) {
  const IconComponent = icon ?? DEFAULT_ICONS[variant ?? "neutral"];
  return (
    <TextClassContext.Provider value={calloutTextVariants({ variant })}>
      <View className={cn(calloutVariants({ variant }), className)} {...props}>
        <Icon
          as={IconComponent}
          size={18}
          className={calloutIconVariants({ variant })}
        />
        {typeof children === "string" ? <Text>{children}</Text> : children}
      </View>
    </TextClassContext.Provider>
  );
}

export type { CalloutProps };
export { Callout, calloutTextVariants, calloutVariants };

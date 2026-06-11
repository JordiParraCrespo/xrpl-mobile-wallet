import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Pressable, View } from "react-native";
import { cn } from "../../lib/utils";
import { Text } from "./text";

// ActionButton — circular icon button with a label beneath: the
// "Send / Receive / More" cluster on the balance hero. `glass` is a
// translucent white fill for use over the brand gradient (pair the
// surface with expo-blur for the full frosted effect); `soft` sits on
// light surfaces; `brand` is the emphasized money-action.
const actionButtonCircleVariants = cva(
  "h-14 w-14 items-center justify-center rounded-full group-active:scale-[0.97]",
  {
    variants: {
      variant: {
        soft: "bg-secondary",
        brand: "bg-brand",
        glass: "border border-white/25 bg-white/20",
      },
    },
    defaultVariants: {
      variant: "soft",
    },
  },
);

const actionButtonLabelVariants = cva("text-[13px] font-medium", {
  variants: {
    variant: {
      soft: "text-foreground",
      brand: "text-foreground",
      glass: "text-white",
    },
  },
  defaultVariants: {
    variant: "soft",
  },
});

type ActionButtonProps = Omit<
  React.ComponentProps<typeof Pressable>,
  "children"
> &
  VariantProps<typeof actionButtonCircleVariants> & {
    label: string;
    icon: React.ReactNode;
  };

function ActionButton({
  label,
  icon,
  variant,
  className,
  ...props
}: ActionButtonProps) {
  return (
    <Pressable
      className={cn(
        "group items-center gap-2.5",
        props.disabled && "opacity-45",
        className,
      )}
      role="button"
      {...props}
    >
      <View className={actionButtonCircleVariants({ variant })}>{icon}</View>
      <Text className={actionButtonLabelVariants({ variant })}>{label}</Text>
    </Pressable>
  );
}

export type { ActionButtonProps };
export { ActionButton, actionButtonCircleVariants };

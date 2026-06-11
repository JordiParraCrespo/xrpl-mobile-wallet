import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Pressable, View } from "react-native";
import { cn } from "../../lib/utils";
import { GlassBackdrop } from "./glass-panel";
import { Text } from "./text";

// ActionButton — circular icon button with a label beneath: the
// "Send / Receive / More" cluster on the balance hero. `glass` is the
// frosted circle used over the brand gradient (real backdrop blur);
// `soft` sits on light surfaces; `brand` is the emphasized money-action.
const actionButtonCircleVariants = cva(
  "h-14 w-14 items-center justify-center rounded-full group-active:scale-[0.97]",
  {
    variants: {
      variant: {
        soft: "bg-secondary",
        brand: "bg-brand",
        glass: "overflow-hidden border border-white/25 bg-white/20",
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
      <View className={actionButtonCircleVariants({ variant })}>
        {variant === "glass" ? <GlassBackdrop /> : null}
        {icon}
      </View>
      <Text className={actionButtonLabelVariants({ variant })}>{label}</Text>
    </Pressable>
  );
}

export type { ActionButtonProps };
export { ActionButton, actionButtonCircleVariants };

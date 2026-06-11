import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react-native";
import * as React from "react";
import { Pressable } from "react-native";
import { cn } from "../../lib/utils";
import { GlassBackdrop } from "./glass-panel";
import { Icon } from "./icon";
import { Text, TextClassContext } from "./text";

// Chip — the Drops pill. Filter chips, quick-amount chips, payment
// quick actions and suggestion chips all share this shape. Flat,
// hairline border on the outline look, glass over dark heroes.
const chipVariants = cva(
  "shrink-0 flex-row items-center justify-center active:scale-[0.97]",
  {
    variants: {
      variant: {
        outline: "border-border bg-card active:bg-muted border",
        primary: "bg-brand active:bg-brand/90",
        muted: "bg-secondary active:bg-secondary/80",
        glass:
          "overflow-hidden border border-white/15 bg-white/10 active:bg-white/15",
      },
      size: {
        sm: "h-[34px] gap-2 px-4",
        md: "h-[42px] gap-2 px-[18px]",
      },
      // The classic chip is a pill; `md` squares it off to the shared
      // radius token for grid-like uses (quiz word choices, option cells).
      rounded: {
        full: "rounded-full",
        md: "rounded-md",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "md",
      rounded: "full",
    },
  },
);

const chipTextVariants = cva("font-semibold", {
  variants: {
    variant: {
      outline: "text-foreground",
      primary: "text-brand-foreground",
      muted: "text-secondary-foreground",
      glass: "text-white",
    },
    size: {
      sm: "text-[13.5px]",
      md: "text-[14.5px]",
    },
  },
  compoundVariants: [
    // Filter chips (sm outline) read quieter than payment pills.
    { variant: "outline", size: "sm", className: "text-muted-foreground" },
  ],
  defaultVariants: {
    variant: "outline",
    size: "md",
  },
});

type ChipProps = Omit<React.ComponentProps<typeof Pressable>, "children"> &
  VariantProps<typeof chipVariants> & {
    /** Optional leading Lucide icon. */
    icon?: LucideIcon;
    children?: React.ReactNode;
  };

function Chip({
  className,
  variant,
  size,
  rounded,
  icon,
  children,
  ...props
}: ChipProps) {
  return (
    <TextClassContext.Provider value={chipTextVariants({ variant, size })}>
      <Pressable
        className={cn(
          props.disabled && "opacity-45",
          chipVariants({ variant, size, rounded }),
          className,
        )}
        role="button"
        {...props}
      >
        {variant === "glass" ? <GlassBackdrop /> : null}
        {icon ? <Icon as={icon} size={size === "sm" ? 15 : 17} /> : null}
        {typeof children === "string" ? <Text>{children}</Text> : children}
      </Pressable>
    </TextClassContext.Provider>
  );
}

export type { ChipProps };
export { Chip, chipTextVariants, chipVariants };

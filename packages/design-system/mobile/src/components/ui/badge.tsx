import * as Slot from "@rn-primitives/slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Platform, View } from "react-native";
import { cn } from "../../lib/utils";
import { TextClassContext } from "./text";

const badgeVariants = cva(
  cn(
    "border-border group shrink-0 flex-row items-center justify-center gap-1 overflow-hidden rounded-full border px-2 py-0.5",
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
        // Soft tinted tones for money movement & status:
        // received / sent-failed / pending / informational.
        brand: "bg-brand-soft border-transparent",
        positive: "bg-positive-soft border-transparent",
        negative: "bg-destructive-soft border-transparent",
        warning: "bg-warning-soft border-transparent",
        info: "bg-info-soft border-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const badgeTextVariants = cva("text-xs font-semibold", {
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
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type BadgeProps = React.ComponentProps<typeof View> & {
  asChild?: boolean;
} & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, asChild, ...props }: BadgeProps) {
  const Component = asChild ? Slot.View : View;
  return (
    <TextClassContext.Provider value={badgeTextVariants({ variant })}>
      <Component
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    </TextClassContext.Provider>
  );
}

export type { BadgeProps };
export { Badge, badgeTextVariants, badgeVariants };

import { cva, type VariantProps } from "class-variance-authority";
import { Pressable } from "react-native";
import { cn } from "../../lib/utils";
import { GlassBackdrop } from "./glass-panel";
import { TextClassContext } from "./text";

// IconButton — circular, icon-only control. Header utilities, the
// circular glass actions on the hero, and compact toolbars. Pass an
// icon node (e.g. <Icon as={X} size={18} />) as children; the icon
// inherits its colour from the variant.
const iconButtonVariants = cva(
  "shrink-0 items-center justify-center rounded-full active:scale-[0.97]",
  {
    variants: {
      variant: {
        soft: "bg-secondary active:bg-accent",
        solid: "bg-primary active:bg-black dark:active:bg-primary/90",
        outline: "border-foreground/25 active:bg-muted border bg-transparent",
        glass:
          "overflow-hidden border border-white/20 bg-white/15 active:bg-white/25",
      },
      size: {
        sm: "h-9 w-9",
        md: "h-11 w-11",
        lg: "h-14 w-14",
      },
    },
    defaultVariants: {
      variant: "soft",
      size: "md",
    },
  },
);

const iconButtonTextVariants = cva("", {
  variants: {
    variant: {
      soft: "text-foreground",
      solid: "text-primary-foreground",
      outline: "text-foreground",
      glass: "text-white",
    },
  },
  defaultVariants: {
    variant: "soft",
  },
});

type IconButtonProps = Omit<
  React.ComponentProps<typeof Pressable>,
  "children"
> &
  VariantProps<typeof iconButtonVariants> & {
    children?: React.ReactNode;
  };

function IconButton({
  className,
  variant,
  size,
  children,
  ...props
}: IconButtonProps) {
  return (
    <TextClassContext.Provider value={iconButtonTextVariants({ variant })}>
      <Pressable
        className={cn(
          props.disabled && "opacity-45",
          iconButtonVariants({ variant, size }),
          className,
        )}
        role="button"
        {...props}
      >
        {variant === "glass" ? <GlassBackdrop /> : null}
        {children}
      </Pressable>
    </TextClassContext.Provider>
  );
}

export type { IconButtonProps };
export { IconButton, iconButtonTextVariants, iconButtonVariants };

import { cva, type VariantProps } from "class-variance-authority";
import { Platform, Pressable } from "react-native";
import { cn } from "../../lib/utils";
import { TextClassContext } from "./text";

// Drops buttons are pills: dark ink by default, `brand` (indigo) is
// reserved for the money-action, `secondary` is the soft neutral pill.
// Surfaces are flat — no shadows; press feedback is a gentle scale.
const buttonVariants = cva(
  cn(
    "group shrink-0 flex-row items-center justify-center gap-2 rounded-full shadow-none active:scale-[0.97]",
    Platform.select({
      web: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    }),
  ),
  {
    variants: {
      variant: {
        default: cn(
          "bg-primary active:bg-black dark:active:bg-primary/90",
          Platform.select({ web: "hover:bg-black dark:hover:bg-primary/90" }),
        ),
        brand: cn(
          "bg-brand active:bg-brand/90",
          Platform.select({ web: "hover:bg-brand/90" }),
        ),
        destructive: cn(
          "bg-destructive active:bg-destructive/90",
          Platform.select({
            web: "hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
          }),
        ),
        outline: cn(
          "border-border bg-transparent active:bg-muted border",
          Platform.select({
            web: "hover:bg-muted",
          }),
        ),
        secondary: cn(
          "bg-secondary active:bg-secondary/80",
          Platform.select({ web: "hover:bg-secondary/80" }),
        ),
        ghost: cn(
          "active:bg-accent dark:active:bg-accent/50",
          Platform.select({ web: "hover:bg-accent dark:hover:bg-accent/50" }),
        ),
        link: "",
      },
      size: {
        default: cn("h-11 px-6", Platform.select({ web: "has-[>svg]:px-5" })),
        sm: cn("h-9 gap-1.5 px-4", Platform.select({ web: "has-[>svg]:px-3" })),
        lg: cn("h-[52px] px-7", Platform.select({ web: "has-[>svg]:px-6" })),
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const buttonTextVariants = cva(
  cn(
    "text-foreground text-[15px] font-semibold",
    Platform.select({ web: "pointer-events-none transition-colors" }),
  ),
  {
    variants: {
      variant: {
        default: "text-primary-foreground",
        brand: "text-brand-foreground",
        destructive: "text-destructive-foreground",
        outline: cn(
          "group-active:text-accent-foreground",
          Platform.select({ web: "group-hover:text-accent-foreground" }),
        ),
        secondary: "text-secondary-foreground",
        ghost: "group-active:text-accent-foreground",
        link: cn(
          "text-brand group-active:underline",
          Platform.select({
            web: "underline-offset-4 hover:underline group-hover:underline",
          }),
        ),
      },
      size: {
        default: "",
        sm: "text-sm",
        lg: "text-base",
        icon: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = React.ComponentProps<typeof Pressable> &
  VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Pressable
        className={cn(
          props.disabled && "opacity-45",
          buttonVariants({ variant, size }),
          className,
        )}
        role="button"
        {...props}
      />
    </TextClassContext.Provider>
  );
}

export type { ButtonProps };
export { Button, buttonTextVariants, buttonVariants };

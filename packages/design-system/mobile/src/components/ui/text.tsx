import * as Slot from "@rn-primitives/slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Platform, Text as RNText, type Role } from "react-native";
import { cn } from "../../lib/utils";

// Display type (h1–h4, display, balance) is the Refero Title serif at
// weight 400 ONLY — authority comes from ink texture, never from mass.
// Body stays on Inter; mono (addresses, hashes) on JetBrains Mono.
const textVariants = cva(
  cn(
    "text-foreground font-sans text-base",
    Platform.select({
      web: "select-text",
    }),
  ),
  {
    variants: {
      variant: {
        default: "",
        display: cn(
          "font-display text-[53px] font-normal leading-[56px] tracking-[-0.8px]",
          Platform.select({ web: "scroll-m-20 text-balance" }),
        ),
        "display-xl": cn(
          "font-display text-[72px] font-normal leading-[72px] tracking-[-1.2px]",
          Platform.select({ web: "scroll-m-20 text-balance" }),
        ),
        balance:
          "font-display tabular-nums text-[56px] font-normal leading-[56px] tracking-[-0.8px]",
        h1: cn(
          "font-display text-center text-[40px] font-normal leading-[43px] tracking-[-0.6px]",
          Platform.select({ web: "scroll-m-20 text-balance" }),
        ),
        h2: cn(
          "font-display text-[32px] font-normal leading-[37px] tracking-[-0.4px]",
          Platform.select({ web: "scroll-m-20 first:mt-0" }),
        ),
        h3: cn(
          "font-display text-2xl font-normal leading-[29px] tracking-[-0.2px]",
          Platform.select({ web: "scroll-m-20" }),
        ),
        h4: cn(
          "font-display text-lg font-normal leading-6 tracking-[-0.18px]",
          Platform.select({ web: "scroll-m-20" }),
        ),
        p: "mt-3 leading-7 sm:mt-6",
        blockquote: "mt-4 border-l-2 pl-3 italic sm:mt-6 sm:pl-6",
        code: cn(
          "bg-muted relative rounded-sm px-[0.3rem] py-[0.2rem] font-mono text-sm",
        ),
        lead: "text-muted-foreground text-xl",
        large: "text-lg font-semibold",
        small: "text-sm font-medium leading-none",
        muted: "text-muted-foreground text-sm",
        caption:
          "text-muted-foreground text-xs leading-[18px] tracking-[0.1px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type TextVariantProps = VariantProps<typeof textVariants>;

type TextVariant = NonNullable<TextVariantProps["variant"]>;

const ROLE: Partial<Record<TextVariant, Role>> = {
  h1: "heading",
  h2: "heading",
  h3: "heading",
  h4: "heading",
  blockquote: Platform.select({ web: "blockquote" as Role }),
  code: Platform.select({ web: "code" as Role }),
};

const ARIA_LEVEL: Partial<Record<TextVariant, string>> = {
  h1: "1",
  h2: "2",
  h3: "3",
  h4: "4",
};

const TextClassContext = React.createContext<string | undefined>(undefined);

function Text({
  className,
  asChild = false,
  variant = "default",
  ...props
}: React.ComponentProps<typeof RNText> &
  TextVariantProps & {
    asChild?: boolean;
  }) {
  const textClass = React.useContext(TextClassContext);
  const Component = asChild ? Slot.Text : RNText;
  return (
    <Component
      className={cn(textVariants({ variant }), textClass, className)}
      role={variant ? ROLE[variant] : undefined}
      aria-level={variant ? ARIA_LEVEL[variant] : undefined}
      {...props}
    />
  );
}

export { Text, TextClassContext };

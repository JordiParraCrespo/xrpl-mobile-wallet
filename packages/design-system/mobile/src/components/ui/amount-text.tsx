import { cva, type VariantProps } from "class-variance-authority";
import { View } from "react-native";
import { cn } from "../../lib/utils";
import { Text } from "./text";

// AmountText — monetary value with tabular figures, an optional +/−
// sign and semantic tone (incoming = positive, outgoing = negative).
// Set in the display serif at weight 400; the currency code is a
// smaller, muted sans suffix.
const amountTextVariants = cva("font-display font-normal tabular-nums", {
  variants: {
    tone: {
      default: "text-foreground",
      positive: "text-positive-soft-foreground",
      negative: "text-destructive",
      muted: "text-muted-foreground",
    },
    size: {
      sm: "text-sm leading-[18px]",
      md: "text-base leading-5",
      lg: "text-2xl leading-7",
      xl: "text-[48px] leading-[48px] tracking-[-0.8px]",
    },
  },
  defaultVariants: {
    tone: "default",
    size: "md",
  },
});

const currencyTextVariants = cva("font-sans font-semibold opacity-70", {
  variants: {
    tone: {
      default: "text-foreground",
      positive: "text-positive-soft-foreground",
      negative: "text-destructive",
      muted: "text-muted-foreground",
    },
    size: {
      sm: "text-[10px]",
      md: "text-[11px]",
      lg: "text-base",
      xl: "text-3xl",
    },
  },
  defaultVariants: {
    tone: "default",
    size: "md",
  },
});

type AmountTextProps = Omit<React.ComponentProps<typeof View>, "children"> &
  Omit<VariantProps<typeof amountTextVariants>, "tone"> & {
    value: number | string;
    currency?: string;
    /** Render a +/− sign and (with tone "auto") color by direction. */
    signed?: boolean;
    tone?: "auto" | "default" | "positive" | "negative" | "muted";
    decimals?: number;
  };

function formatAmount(value: number | string, decimals: number) {
  const n = typeof value === "number" ? value : Number.parseFloat(value);
  if (Number.isNaN(n)) return String(value);
  return Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

function AmountText({
  value,
  currency,
  signed = false,
  tone = "auto",
  size,
  decimals = 2,
  className,
  ...props
}: AmountTextProps) {
  const n = typeof value === "number" ? value : Number.parseFloat(value);
  const isNegative = n < 0;
  const resolvedTone =
    tone === "auto"
      ? signed
        ? isNegative
          ? "negative"
          : "positive"
        : "default"
      : tone;
  const sign = signed ? (isNegative ? "−" : "+") : "";
  return (
    <View className={cn("flex-row items-baseline gap-1", className)} {...props}>
      <Text className={amountTextVariants({ tone: resolvedTone, size })}>
        {sign}
        {formatAmount(value, decimals)}
      </Text>
      {currency ? (
        <Text className={currencyTextVariants({ tone: resolvedTone, size })}>
          {currency}
        </Text>
      ) : null}
    </View>
  );
}

export type { AmountTextProps };
export { AmountText, amountTextVariants };

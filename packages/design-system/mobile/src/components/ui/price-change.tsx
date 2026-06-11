import * as React from "react";
import { cn } from "../../lib/utils";
import { Text } from "./text";

// PriceChange — market percent change with a direction triangle:
// "▲ 2.41%" / "▼ 0.92%". Mono semibold, colored by direction.
// Size via className (default text-sm).
type PriceChangeProps = Omit<
  React.ComponentProps<typeof Text>,
  "children" | "variant"
> & {
  /** Percent change, e.g. 2.41 or -0.92. */
  value: number;
};

function PriceChange({ value, className, ...props }: PriceChangeProps) {
  const up = value >= 0;
  return (
    <Text
      className={cn(
        "font-mono text-sm font-semibold tabular-nums",
        up ? "text-positive-soft-foreground" : "text-destructive",
        className,
      )}
      {...props}
    >
      {up ? "▲" : "▼"} {Math.abs(value).toFixed(2)}%
    </Text>
  );
}

export type { PriceChangeProps };
export { PriceChange };

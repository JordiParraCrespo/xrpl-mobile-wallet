import * as React from "react";
import { View } from "react-native";
import { cn } from "../../lib/utils";
import { Text } from "./text";

// DetailList / DetailRow — key-value rows for transaction details,
// review cards and rate / fee breakdowns. Rows are divided by hairline
// borders; DetailList automatically marks its final row as `last` so
// the trailing divider disappears (NativeWind has no last-child
// selector). Values can be mono (timestamps, hashes, fees) or accented
// (brand indigo for actionable values).
type DetailRowProps = Omit<React.ComponentProps<typeof View>, "children"> & {
  label: string;
  /** String values get the standard styling; pass a node for custom content. */
  value: string | React.ReactNode;
  /** Small mono line under the value, right-aligned. */
  sub?: string;
  /** Render the value in the mono face (timestamps, indexes, fees). */
  mono?: boolean;
  /** Brand-indigo value (actionable / highlighted). */
  accent?: boolean;
  /** Suppress the bottom hairline divider (set automatically by DetailList). */
  last?: boolean;
};

function DetailRow({
  label,
  value,
  sub,
  mono,
  accent,
  last,
  className,
  ...props
}: DetailRowProps) {
  return (
    <View
      className={cn(
        "border-border flex-row items-center justify-between gap-3 border-b py-3.5",
        last && "border-b-0",
        className,
      )}
      {...props}
    >
      <Text className="text-muted-foreground shrink-0 text-sm">{label}</Text>
      <View className="min-w-0 shrink items-end gap-0.5">
        {typeof value === "string" ? (
          <Text
            numberOfLines={1}
            className={cn(
              "text-sm font-semibold",
              mono && "font-mono",
              accent ? "text-brand" : "text-foreground",
            )}
          >
            {value}
          </Text>
        ) : (
          value
        )}
        {sub ? (
          <Text
            numberOfLines={1}
            className="text-muted-foreground text-right font-mono text-xs"
          >
            {sub}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

type DetailListProps = React.ComponentProps<typeof View> & {
  /** Wrap the rows in a standalone hairline card. */
  card?: boolean;
};

function DetailList({ card, className, children, ...props }: DetailListProps) {
  const items = React.Children.toArray(children);
  const lastIndex = items.length - 1;
  return (
    <View
      className={cn(
        "w-full",
        card && "bg-card border-border rounded-xl border px-4 py-1",
        className,
      )}
      {...props}
    >
      {items.map((child, index) =>
        index === lastIndex &&
        React.isValidElement<DetailRowProps>(child) &&
        child.props.last === undefined
          ? React.cloneElement(child, { last: true })
          : child,
      )}
    </View>
  );
}

export type { DetailListProps, DetailRowProps };
export { DetailList, DetailRow };

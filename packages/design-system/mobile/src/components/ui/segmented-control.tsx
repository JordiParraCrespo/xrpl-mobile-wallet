import * as React from "react";
import { Pressable, View } from "react-native";
import { cn } from "../../lib/utils";
import { Text } from "./text";

// SegmentedControl — pill tab group used for in-page tabs
// (All / Sent / Received) and small filters. Soft neutral track,
// card-coloured active pill. Controlled or uncontrolled. Flat — no
// shadows, per the Drops design language.
type SegmentedControlOption = {
  value: string;
  label: string;
};

type SegmentedControlProps = Omit<
  React.ComponentProps<typeof View>,
  "children"
> & {
  options: SegmentedControlOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Stretch the track to fill its container. */
  fullWidth?: boolean;
};

function SegmentedControl({
  options,
  value,
  defaultValue,
  onValueChange,
  fullWidth = false,
  className,
  ...props
}: SegmentedControlProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(
    defaultValue !== undefined ? defaultValue : options[0]?.value,
  );
  const current = isControlled ? value : internal;

  function select(next: string) {
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  }

  return (
    <View
      className={cn(
        "bg-secondary flex-row items-center rounded-full p-1",
        fullWidth ? "w-full" : "self-start",
        className,
      )}
      role="tablist"
      {...props}
    >
      {options.map((option) => {
        const active = option.value === current;
        return (
          <Pressable
            key={option.value}
            role="tab"
            aria-selected={active}
            onPress={() => select(option.value)}
            className={cn(
              "flex-1 items-center justify-center rounded-full px-4 py-2 shadow-none",
              active ? "bg-card" : "active:bg-accent",
            )}
          >
            <Text
              numberOfLines={1}
              className={cn(
                "text-sm font-semibold",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export type { SegmentedControlOption, SegmentedControlProps };
export { SegmentedControl };

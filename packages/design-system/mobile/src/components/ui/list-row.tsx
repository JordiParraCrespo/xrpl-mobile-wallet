import * as React from "react";
import { Pressable, View } from "react-native";
import { cn } from "../../lib/utils";
import { Text } from "./text";

// ListRow — the workhorse row for activity, contacts, accounts and
// assets. Leading media (Avatar / AssetIcon / icon), a title +
// subtitle stack, and a right-aligned value + meta column.
type ListRowProps = Omit<React.ComponentProps<typeof Pressable>, "children"> & {
  media?: React.ReactNode;
  title: string;
  subtitle?: string;
  /** Right-aligned value; pass a string or e.g. an AmountText. */
  value?: React.ReactNode;
  meta?: string;
};

function ListRow({
  media,
  title,
  subtitle,
  value,
  meta,
  className,
  ...props
}: ListRowProps) {
  const interactive = !!props.onPress;
  return (
    <Pressable
      disabled={!interactive}
      className={cn(
        "w-full flex-row items-center gap-3.5 rounded-md px-4 py-3.5",
        interactive && "active:bg-muted",
        className,
      )}
      {...props}
    >
      {media ? <View className="shrink-0">{media}</View> : null}
      <View className="min-w-0 flex-1 gap-0.5">
        <Text numberOfLines={1} className="text-[15px] font-semibold">
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} className="text-muted-foreground text-[13px]">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value || meta ? (
        <View className="shrink-0 items-end gap-0.5">
          {typeof value === "string" ? (
            <Text className="text-[15px] font-semibold">{value}</Text>
          ) : (
            value
          )}
          {meta ? (
            <Text className="text-muted-foreground text-[13px]">{meta}</Text>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

export type { ListRowProps };
export { ListRow };

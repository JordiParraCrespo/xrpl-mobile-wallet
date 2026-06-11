import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";
import { cn } from "../../lib/utils";
import { Icon } from "./icon";
import { Text } from "./text";

// NotificationRow — the home bell panel row. Tinted 40px disc keyed to a
// semantic tone, title + body stack, right-aligned time and an indigo
// unread dot. `card` renders it as a standalone hairline card.
const notificationDiscVariants = cva(
  "h-10 w-10 shrink-0 items-center justify-center rounded-full",
  {
    variants: {
      tone: {
        positive: "bg-positive-soft",
        warning: "bg-warning-soft",
        info: "bg-info-soft",
        brand: "bg-brand-soft",
        neutral: "bg-secondary",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

const notificationIconVariants = cva("", {
  variants: {
    tone: {
      positive: "text-positive-soft-foreground",
      warning: "text-warning-soft-foreground",
      info: "text-info-soft-foreground",
      brand: "text-brand-soft-foreground",
      neutral: "text-muted-foreground",
    },
  },
  defaultVariants: {
    tone: "neutral",
  },
});

type NotificationRowProps = Omit<
  React.ComponentProps<typeof Pressable>,
  "children"
> &
  VariantProps<typeof notificationDiscVariants> & {
    icon: LucideIcon;
    title: string;
    body?: string;
    time?: string;
    unread?: boolean;
    /** Render as a standalone card with a hairline border. */
    card?: boolean;
  };

function NotificationRow({
  icon,
  tone,
  title,
  body,
  time,
  unread,
  card,
  className,
  ...props
}: NotificationRowProps) {
  const interactive = !!props.onPress;
  return (
    <Pressable
      disabled={!interactive}
      className={cn(
        "w-full flex-row items-start gap-3 p-3.5",
        card ? "bg-card border-border rounded-xl border" : "rounded-md",
        interactive && (card ? "active:scale-[0.97]" : "active:bg-muted"),
        className,
      )}
      {...props}
    >
      <View className={notificationDiscVariants({ tone })}>
        <Icon
          as={icon}
          size={19}
          className={notificationIconVariants({ tone })}
        />
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <Text numberOfLines={1} className="text-sm font-semibold">
          {title}
        </Text>
        {body ? (
          <Text className="text-muted-foreground text-[13px] leading-snug">
            {body}
          </Text>
        ) : null}
      </View>
      {time || unread ? (
        <View className="shrink-0 items-end gap-1.5">
          {time ? (
            <Text className="text-muted-foreground text-xs">{time}</Text>
          ) : null}
          {unread ? <View className="bg-brand h-2 w-2 rounded-full" /> : null}
        </View>
      ) : null}
    </Pressable>
  );
}

export type { NotificationRowProps };
export { NotificationRow, notificationDiscVariants };

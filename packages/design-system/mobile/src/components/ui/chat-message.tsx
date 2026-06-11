import { cva, type VariantProps } from "class-variance-authority";
import {
  ArrowLeftRight,
  Check,
  ChevronRight,
  Send,
  Sparkles,
  X,
} from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { cn } from "../../lib/utils";
import { AssetIcon } from "./asset-icon";
import { Icon } from "./icon";
import { Text } from "./text";

// ChatMessage — Dewy's chat surface. A user bubble on the right, and
// bot messages on the left: plain bubbles, a typing indicator and the
// tool cards (questions, action review, result, error, balance).
// Bubbles are rounded 16–18 with one small "tail" corner; cards sit on
// bg-card with hairline borders; results/errors use the soft semantic
// tints so they read calmly in both light and dark mode.

type ChatActionStatus = "pending" | "approved" | "declined";

type ChatActionRow = {
  label: string;
  value: string;
  sub?: string;
  mono?: boolean;
};

type ChatBalanceRow = {
  symbol: string;
  color?: string;
  name: string;
  usd: number;
  xrp: number;
};

type ChatMessageData =
  | { role: "user"; text: string }
  | { role?: "bot"; kind: "text"; text: string }
  | { role?: "bot"; kind: "typing" }
  | {
      role?: "bot";
      kind: "questions";
      title: string;
      options: string[];
      answered?: string;
    }
  | {
      role?: "bot";
      kind: "action";
      actionKind?: "send" | "swap";
      title: string;
      status: ChatActionStatus;
      rows: ChatActionRow[];
    }
  | { role?: "bot"; kind: "result"; text: string; meta?: string; tx?: string }
  | {
      role?: "bot";
      kind: "error";
      title: string;
      text: string;
      handled?: boolean;
    }
  | { role?: "bot"; kind: "balance"; total: number; rows: ChatBalanceRow[] };

const chatBubbleVariants = cva("rounded-2xl px-[15px] py-[11px]", {
  variants: {
    side: {
      user: "max-w-[80%] self-end rounded-br-[6px] bg-brand",
      bot: "self-start rounded-bl-[5px] bg-secondary",
    },
  },
  defaultVariants: {
    side: "bot",
  },
});

const chatBubbleTextVariants = cva("text-[15px] leading-snug", {
  variants: {
    side: {
      user: "text-brand-foreground",
      bot: "text-foreground",
    },
  },
  defaultVariants: {
    side: "bot",
  },
});

type ChatMessageProps = Omit<React.ComponentProps<typeof View>, "children"> & {
  message: ChatMessageData;
  /** Assistant avatar, rendered bottom-left of bot messages. */
  avatar?: React.ReactNode;
  /** Called when a `questions` option is picked. */
  onAnswer?: (option: string) => void;
  /** Called when an `action` card is approved (true) or declined (false). */
  onAction?: (approved: boolean) => void;
  /** Called when an `error` card asks to retry (true) or dismiss (false). */
  onErrorAction?: (retry: boolean) => void;
};

function TypingDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.35);
  React.useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 320 }),
          withTiming(0.35, { duration: 320 }),
        ),
        -1,
      ),
    );
  }, [delay, opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      style={style}
      className="bg-muted-foreground h-1.5 w-1.5 rounded-full"
    />
  );
}

function ActionFooter({
  status,
  onAction,
}: {
  status: ChatActionStatus;
  onAction?: (approved: boolean) => void;
}) {
  if (status === "pending") {
    return (
      <View className="px-4 pb-3.5 pt-3">
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => onAction?.(false)}
            className="border-input h-[46px] flex-1 items-center justify-center rounded-full border active:opacity-70"
          >
            <Text className="text-foreground text-[15px] font-semibold">
              Decline
            </Text>
          </Pressable>
          <Pressable
            onPress={() => onAction?.(true)}
            className="bg-brand active:bg-brand/90 h-[46px] flex-[1.4] flex-row items-center justify-center gap-1.5 rounded-full"
          >
            <Icon as={Check} size={17} className="text-white" />
            <Text className="text-[15px] font-semibold text-white">
              Approve
            </Text>
          </Pressable>
        </View>
        <Text className="text-muted-foreground mt-2 text-center text-xs">
          Or type a change below
        </Text>
      </View>
    );
  }
  const approved = status === "approved";
  return (
    <View className="flex-row items-center gap-2 px-4 py-3">
      <Icon
        as={approved ? Check : X}
        size={16}
        className={approved ? "text-positive" : "text-muted-foreground"}
      />
      <Text
        className={cn(
          "text-[13px] font-semibold",
          approved ? "text-positive" : "text-muted-foreground",
        )}
      >
        {approved ? "Approved" : "Declined"}
      </Text>
    </View>
  );
}

function BotMessageBody({
  message,
  onAnswer,
  onAction,
  onErrorAction,
}: {
  message: Exclude<ChatMessageData, { role: "user"; text: string }>;
  onAnswer?: (option: string) => void;
  onAction?: (approved: boolean) => void;
  onErrorAction?: (retry: boolean) => void;
}) {
  switch (message.kind) {
    case "typing":
      return (
        <View
          className={cn(
            chatBubbleVariants({ side: "bot" }),
            "flex-row items-center gap-1 px-4 py-[15px]",
          )}
        >
          <TypingDot delay={0} />
          <TypingDot delay={160} />
          <TypingDot delay={320} />
        </View>
      );

    case "text":
      return (
        <View className={chatBubbleVariants({ side: "bot" })}>
          <Text className={chatBubbleTextVariants({ side: "bot" })}>
            {message.text}
          </Text>
        </View>
      );

    case "questions": {
      const done = !!message.answered;
      return (
        <View className="bg-card border-border w-full rounded-2xl border p-3.5">
          <View className="mb-3 flex-row items-center gap-2">
            <Icon as={Sparkles} size={14} className="text-brand" />
            <Text className="text-muted-foreground text-xs font-bold uppercase tracking-wide">
              {message.title}
            </Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {message.options.map((option) => {
              const chosen = message.answered === option;
              return (
                <Pressable
                  key={option}
                  disabled={done}
                  onPress={() => onAnswer?.(option)}
                  className={cn(
                    "rounded-full border px-[15px] py-[9px]",
                    chosen
                      ? "border-brand bg-brand"
                      : "border-input bg-transparent active:bg-muted",
                    done && !chosen && "opacity-60",
                  )}
                >
                  <Text
                    className={cn(
                      "text-sm font-semibold",
                      chosen ? "text-white" : "text-foreground",
                    )}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      );
    }

    case "action":
      return (
        <View className="bg-card border-border w-full overflow-hidden rounded-2xl border">
          <View className="border-border flex-row items-center gap-2.5 border-b-hairline px-4 py-3">
            <View className="bg-brand h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px]">
              <Icon
                as={message.actionKind === "swap" ? ArrowLeftRight : Send}
                size={16}
                className="text-white"
              />
            </View>
            <Text
              numberOfLines={1}
              className="text-foreground min-w-0 flex-1 text-[15px] font-bold"
            >
              {message.title}
            </Text>
            <Text className="text-muted-foreground text-xs font-bold">
              Review
            </Text>
          </View>
          <View className="px-4 pb-1 pt-1.5">
            {message.rows.map((row, index) => (
              <View
                key={row.label}
                className={cn(
                  "flex-row items-baseline justify-between gap-3 py-[9px]",
                  index < message.rows.length - 1 &&
                    "border-border border-b-hairline",
                )}
              >
                <Text className="text-muted-foreground text-[13px]">
                  {row.label}
                </Text>
                <View className="min-w-0 shrink items-end">
                  <Text
                    numberOfLines={1}
                    className={cn(
                      "text-foreground text-sm font-semibold",
                      row.mono && "font-mono",
                    )}
                  >
                    {row.value}
                  </Text>
                  {row.sub ? (
                    <Text className="text-muted-foreground font-mono text-xs">
                      {row.sub}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
          <ActionFooter status={message.status} onAction={onAction} />
        </View>
      );

    case "result":
      return (
        <View className="bg-positive-soft border-positive/30 w-full rounded-2xl border p-4">
          <View className="flex-row items-center gap-2.5">
            <View className="bg-positive h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full">
              <Icon as={Check} size={19} className="text-white" />
            </View>
            <Text className="text-foreground min-w-0 flex-1 text-[15px] font-semibold">
              {message.text}
            </Text>
          </View>
          {message.meta ? (
            <Text className="text-muted-foreground mt-2 text-[13px] leading-snug">
              {message.meta}
            </Text>
          ) : null}
          {message.tx ? (
            <View className="border-positive/20 mt-3 flex-row items-center justify-between border-t pt-3">
              <Text className="text-muted-foreground font-mono text-[13px]">
                {message.tx}
              </Text>
              <Pressable className="flex-row items-center gap-1 active:opacity-70">
                <Text className="text-positive-soft-foreground text-[13px] font-semibold">
                  View
                </Text>
                <Icon
                  as={ChevronRight}
                  size={15}
                  className="text-positive-soft-foreground"
                />
              </Pressable>
            </View>
          ) : null}
        </View>
      );

    case "error":
      return (
        <View className="bg-destructive-soft border-destructive/30 w-full rounded-2xl border p-4">
          <View className="flex-row items-center gap-2.5">
            <View className="bg-destructive h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full">
              <Icon as={X} size={18} className="text-white" />
            </View>
            <Text className="text-foreground min-w-0 flex-1 text-[15px] font-semibold">
              {message.title}
            </Text>
          </View>
          <Text className="text-muted-foreground mt-2 text-[13px] leading-snug">
            {message.text}
          </Text>
          {!message.handled ? (
            <View className="mt-3 flex-row gap-2">
              <Pressable
                onPress={() => onErrorAction?.(false)}
                className="border-input h-11 flex-1 items-center justify-center rounded-full border active:opacity-70"
              >
                <Text className="text-foreground text-sm font-semibold">
                  Dismiss
                </Text>
              </Pressable>
              <Pressable
                onPress={() => onErrorAction?.(true)}
                className="bg-destructive active:bg-destructive/90 h-11 flex-[1.2] items-center justify-center rounded-full"
              >
                <Text className="text-sm font-semibold text-white">
                  Try again
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      );

    case "balance":
      return (
        <View className="bg-card border-border w-full rounded-2xl border p-4">
          <Text className="text-muted-foreground text-xs font-semibold">
            Total balance
          </Text>
          <Text className="text-foreground font-display mb-3 mt-0.5 text-3xl font-normal tracking-tight">
            $
            {message.total.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
          {message.rows.map((row) => (
            <View
              key={row.name}
              className="border-border flex-row items-center gap-3 border-t-hairline py-[9px]"
            >
              <AssetIcon symbol={row.symbol} color={row.color} size={32} />
              <Text
                numberOfLines={1}
                className="text-foreground min-w-0 flex-1 text-sm font-semibold"
              >
                {row.name}
              </Text>
              <View className="shrink-0 items-end">
                <Text className="text-foreground font-mono text-sm">
                  $
                  {row.usd.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
                <Text className="text-muted-foreground font-mono text-xs">
                  {row.xrp.toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })}{" "}
                  XRP
                </Text>
              </View>
            </View>
          ))}
        </View>
      );

    default:
      return null;
  }
}

function ChatMessage({
  message,
  avatar,
  onAnswer,
  onAction,
  onErrorAction,
  className,
  ...props
}: ChatMessageProps) {
  if (message.role === "user") {
    return (
      <View className={cn("w-full flex-row justify-end", className)} {...props}>
        <View className={chatBubbleVariants({ side: "user" })}>
          <Text className={chatBubbleTextVariants({ side: "user" })}>
            {message.text}
          </Text>
        </View>
      </View>
    );
  }
  return (
    <View
      className={cn("w-full flex-row items-end gap-2", className)}
      {...props}
    >
      {avatar ? <View className="mb-0.5 shrink-0">{avatar}</View> : null}
      <View className="max-w-[86%] flex-1">
        <BotMessageBody
          message={message}
          onAnswer={onAnswer}
          onAction={onAction}
          onErrorAction={onErrorAction}
        />
      </View>
    </View>
  );
}

export type {
  ChatActionRow,
  ChatActionStatus,
  ChatBalanceRow,
  ChatMessageData,
  ChatMessageProps,
};
export type ChatBubbleVariantProps = VariantProps<typeof chatBubbleVariants>;
export { ChatMessage, chatBubbleVariants, chatBubbleTextVariants };

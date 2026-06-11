import { cva, type VariantProps } from "class-variance-authority";
import { History } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";
import { cn } from "../../lib/utils";
import { Icon } from "./icon";
import { Text } from "./text";

// SessionRow — a chat session in the assistant's sessions drawer.
// A quiet history disc, title + last-message preview, and a faint
// timestamp. The active session sits on a card surface with a hairline
// border; idle rows stay transparent.
const sessionRowVariants = cva(
  "w-full flex-row items-center gap-[11px] rounded-md border px-2.5 py-[11px]",
  {
    variants: {
      active: {
        true: "bg-card border-border",
        false: "border-transparent active:bg-muted",
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

type SessionRowProps = Omit<
  React.ComponentProps<typeof Pressable>,
  "children"
> &
  VariantProps<typeof sessionRowVariants> & {
    title: string;
    preview: string;
    time: string;
  };

function SessionRow({
  title,
  preview,
  time,
  active,
  className,
  ...props
}: SessionRowProps) {
  return (
    <Pressable
      className={cn(sessionRowVariants({ active }), className)}
      {...props}
    >
      <View className="bg-secondary h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full">
        <Icon as={History} size={16} className="text-muted-foreground" />
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <Text
          numberOfLines={1}
          className="text-foreground text-[14.5px] font-semibold"
        >
          {title}
        </Text>
        <Text numberOfLines={1} className="text-muted-foreground text-[12.5px]">
          {preview}
        </Text>
      </View>
      <Text className="text-muted-foreground shrink-0 text-[11.5px]">
        {time}
      </Text>
    </Pressable>
  );
}

export type { SessionRowProps };
export { SessionRow, sessionRowVariants };

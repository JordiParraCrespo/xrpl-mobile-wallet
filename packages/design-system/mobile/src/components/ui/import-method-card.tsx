import { Check, type LucideIcon } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";
import { cn } from "../../lib/utils";
import { Badge, type BadgeProps } from "./badge";
import { Icon } from "./icon";
import { Text } from "./text";

// ImportMethodCard — selectable onboarding card for choosing how to
// import a wallet (recovery phrase, family seed, secret numbers).
// Selection turns the card brand-soft with an indigo border, fills the
// leading disc indigo and checks the trailing radio.
type ImportMethodCardProps = Omit<
  React.ComponentProps<typeof Pressable>,
  "children"
> & {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Compatibility badge text shown under the description. */
  badge?: string;
  /** Maps straight onto Badge variants (e.g. 'positive', 'secondary'). */
  badgeTone?: BadgeProps["variant"];
  selected?: boolean;
};

function ImportMethodCard({
  icon,
  title,
  description,
  badge,
  badgeTone = "secondary",
  selected,
  className,
  ...props
}: ImportMethodCardProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: !!selected }}
      className={cn(
        "w-full flex-row items-center gap-3.5 rounded-xl border p-4 active:scale-[0.97]",
        selected ? "bg-brand-soft border-brand" : "bg-card border-border",
        className,
      )}
      {...props}
    >
      <View
        className={cn(
          "h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[14px]",
          selected ? "bg-brand" : "bg-secondary",
        )}
      >
        <Icon
          as={icon}
          size={22}
          className={selected ? "text-brand-foreground" : "text-foreground"}
        />
      </View>
      <View className="min-w-0 flex-1 gap-1">
        <Text numberOfLines={1} className="text-base font-semibold">
          {title}
        </Text>
        {description ? (
          <Text className="text-muted-foreground text-[13px]">
            {description}
          </Text>
        ) : null}
        {badge ? (
          <Badge variant={badgeTone} className="mt-1 self-start">
            <Text>{badge}</Text>
          </Badge>
        ) : null}
      </View>
      <View
        className={cn(
          "h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2",
          selected ? "border-brand bg-brand" : "border-input bg-transparent",
        )}
      >
        {selected ? (
          <Icon
            as={Check}
            size={13}
            strokeWidth={3}
            className="text-brand-foreground"
          />
        ) : null}
      </View>
    </Pressable>
  );
}

export type { ImportMethodCardProps };
export { ImportMethodCard };

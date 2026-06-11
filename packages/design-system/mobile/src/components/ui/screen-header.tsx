import { ChevronLeft } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";
import { cn } from "../../lib/utils";
import { Icon } from "./icon";

// ScreenHeader — onboarding / flow input screens: soft circular back
// button, centered step-progress dots (active dot stretches to a pill),
// and an optional right slot balanced by a spacer.
type ScreenHeaderProps = Omit<React.ComponentProps<typeof View>, "children"> & {
  onBack?: () => void;
  /** Current 1-based step; omit to hide the progress dots. */
  step?: number;
  total?: number;
  right?: React.ReactNode;
};

function ScreenHeader({
  onBack,
  step,
  total = 3,
  right,
  className,
  ...props
}: ScreenHeaderProps) {
  return (
    <View
      className={cn(
        "min-h-[44px] w-full flex-row items-center justify-between py-2",
        className,
      )}
      {...props}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={onBack}
        className="bg-secondary h-11 w-11 items-center justify-center rounded-full active:scale-[0.97]"
      >
        <Icon as={ChevronLeft} size={20} className="text-foreground" />
      </Pressable>
      {step ? (
        <View className="flex-row items-center gap-1.5">
          {Array.from({ length: total }).map((_, i) => {
            const active = i + 1 === step;
            const completed = i + 1 < step;
            return (
              <View
                // biome-ignore lint/suspicious/noArrayIndexKey: positional step dots
                key={i}
                className={cn(
                  "h-[7px] rounded-full",
                  active
                    ? "bg-brand w-[22px]"
                    : completed
                      ? "bg-brand/40 w-[7px]"
                      : "bg-border w-[7px]",
                )}
              />
            );
          })}
        </View>
      ) : null}
      {right ?? <View className="w-11" />}
    </View>
  );
}

export type { ScreenHeaderProps };
export { ScreenHeader };

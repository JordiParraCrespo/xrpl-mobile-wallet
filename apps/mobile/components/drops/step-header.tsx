import { Button } from "@flama/design-system-mobile/button";
import { Icon } from "@flama/design-system-mobile/icon";
import { cn } from "@flama/design-system-mobile/utils";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { View } from "react-native";

/** Back chevron + step dots — the header for the onboarding input screens. */
export function StepHeader({
  step,
  total = 3,
}: {
  step: number;
  total?: number;
}) {
  const router = useRouter();

  return (
    <View className="h-11 flex-row items-center justify-between">
      <Button
        variant="secondary"
        size="icon"
        onPress={() => router.back()}
        accessibilityLabel="Back"
      >
        <Icon as={ChevronLeft} size={20} />
      </Button>

      <View className="flex-row items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => {
          const n = i + 1;
          const active = n === step;
          return (
            <View
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length step indicator
              key={i}
              className={cn(
                "h-[7px] rounded-full",
                active
                  ? "w-[22px] bg-brand"
                  : n < step
                    ? "w-[7px] bg-brand"
                    : "w-[7px] bg-muted",
              )}
            />
          );
        })}
      </View>

      <View className="w-11" />
    </View>
  );
}

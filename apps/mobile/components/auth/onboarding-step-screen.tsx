import { Button } from "@flama/design-system-mobile/button";
import { Icon } from "@flama/design-system-mobile/icon";
import { ScreenHeader } from "@flama/design-system-mobile/screen-header";
import { Text } from "@flama/design-system-mobile/text";
import { useRouter } from "expo-router";
import type { LucideIcon } from "lucide-react-native";
import type * as React from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type OnboardingStepScreenProps = {
  /** 1-based position in the create-wallet flow's step dots. */
  step: number;
  title: string;
  subtitle: string;
  /** Optional hero icon rendered in a brand-tinted disc above the title. */
  icon?: LucideIcon;
  /** Optional badge rendered beside the title (e.g. chain compatibility). */
  titleBadge?: React.ReactNode;
  /** The single footer call-to-action. */
  cta: { label: string; onPress: () => void; disabled?: boolean };
  children?: React.ReactNode;
};

/**
 * Scaffold shared by the create-wallet onboarding steps: safe-area padding,
 * step-progress header, scrollable title + content, and a pinned footer CTA.
 */
export function OnboardingStepScreen({
  step,
  title,
  subtitle,
  icon,
  titleBadge,
  cta,
  children,
}: OnboardingStepScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top + 8 }} className="px-6">
        <ScreenHeader step={step} onBack={() => router.back()} />
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-2 pt-3">
        {icon ? (
          <View className="mb-5 h-14 w-14 items-center justify-center rounded-[18px] bg-brand-soft">
            <Icon as={icon} size={28} className="text-brand" />
          </View>
        ) : null}

        <View className="flex-row flex-wrap items-center gap-2.5">
          <Text className="font-display text-[30px] leading-[34px] tracking-[-0.5px] text-foreground">
            {title}
          </Text>
          {titleBadge}
        </View>
        <Text className="mt-2.5 text-[15px] leading-6 text-muted-foreground">
          {subtitle}
        </Text>

        {children}
      </ScrollView>

      <View style={{ paddingBottom: insets.bottom + 16 }} className="px-6 pt-3">
        <Button
          variant="brand"
          size="lg"
          className="w-full"
          disabled={cta.disabled}
          onPress={cta.onPress}
        >
          <Text>{cta.label}</Text>
        </Button>
      </View>
    </View>
  );
}

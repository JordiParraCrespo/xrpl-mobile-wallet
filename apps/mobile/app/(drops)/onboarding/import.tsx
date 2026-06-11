import type { BadgeProps } from "@flama/design-system-mobile/badge";
import { BottomSheet } from "@flama/design-system-mobile/bottom-sheet";
import { Button } from "@flama/design-system-mobile/button";
import { Icon } from "@flama/design-system-mobile/icon";
import { ImportMethodCard } from "@flama/design-system-mobile/import-method-card";
import { Text } from "@flama/design-system-mobile/text";
import { useRouter } from "expo-router";
import {
  FileText,
  Hash,
  Info,
  KeyRound,
  type LucideIcon,
} from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";
import { OnboardingStepScreen } from "../../../components/auth/onboarding-step-screen";
import { Routes } from "../../../lib/routes";

type Method = {
  id: "phrase" | "seed" | "secret";
  icon: LucideIcon;
  title: string;
  description: string;
  badge: string;
  badgeTone: BadgeProps["variant"];
  route: Routes;
  /** Longer explainer shown in the "Which one do I have?" sheet. */
  help: string;
};

const METHODS: Method[] = [
  {
    id: "phrase",
    icon: FileText,
    title: "Recovery phrase",
    description: "12 or 24 words",
    badge: "All networks",
    badgeTone: "positive",
    route: Routes.OnboardingImportPhrase,
    help: "A list of 12 or 24 ordinary words. The standard backup for most wallets — works on every network.",
  },
  {
    id: "seed",
    icon: KeyRound,
    title: "Family seed",
    description: "Starts with s or sEd",
    badge: "XRP Ledger only",
    badgeTone: "secondary",
    route: Routes.OnboardingImportSeed,
    help: "A single string beginning with s or sEd. The classic XRPL secret — XRP Ledger only.",
  },
  {
    id: "secret",
    icon: Hash,
    title: "Secret numbers",
    description: "8 groups of 6 digits",
    badge: "XRP Ledger only",
    badgeTone: "secondary",
    route: Routes.OnboardingImportSecretNumbers,
    help: "Eight rows of six digits, as used by Xaman. XRP Ledger only.",
  },
];

export default function ImportPickerScreen() {
  const router = useRouter();
  const [selected, setSelected] = React.useState<Method | null>(null);
  const [helpOpen, setHelpOpen] = React.useState(false);

  return (
    <OnboardingStepScreen
      step={1}
      title="Import your wallet"
      subtitle="Choose how you'd like to restore access. Your keys never leave this device."
      cta={{
        label: "Continue",
        disabled: !selected,
        onPress: () => selected && router.push(selected.route),
      }}
    >
      <View className="mt-6 gap-3">
        {METHODS.map((method) => (
          <ImportMethodCard
            key={method.id}
            icon={method.icon}
            title={method.title}
            description={method.description}
            badge={method.badge}
            badgeTone={method.badgeTone}
            selected={selected?.id === method.id}
            onPress={() => setSelected(method)}
          />
        ))}
      </View>

      <Pressable
        onPress={() => setHelpOpen(true)}
        className="mt-5 flex-row items-center gap-1.5 self-center active:opacity-70"
      >
        <Icon as={Info} size={16} className="text-info" />
        <Text className="text-sm font-semibold text-info">
          Which one do I have?
        </Text>
      </Pressable>

      <BottomSheet open={helpOpen} onClose={() => setHelpOpen(false)}>
        <Text className="mb-1 font-display text-[22px] tracking-[-0.3px] text-foreground">
          Which one do I have?
        </Text>
        {METHODS.map((method) => (
          <View
            key={method.id}
            className="flex-row gap-3 border-t border-border py-3"
          >
            <View className="h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] bg-secondary">
              <Icon as={method.icon} size={19} className="text-foreground" />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="text-[15px] font-semibold text-foreground">
                {method.title}
              </Text>
              <Text className="mt-0.5 text-[13px] leading-[19px] text-muted-foreground">
                {method.help}
              </Text>
            </View>
          </View>
        ))}
        <Button
          variant="secondary"
          size="lg"
          className="mt-3 w-full"
          onPress={() => setHelpOpen(false)}
        >
          <Text>Got it</Text>
        </Button>
      </BottomSheet>
    </OnboardingStepScreen>
  );
}

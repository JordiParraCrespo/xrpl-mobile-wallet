import { Button } from "@flama/design-system-mobile/button";
import { Icon } from "@flama/design-system-mobile/icon";
import { Text } from "@flama/design-system-mobile/text";
import { cn } from "@flama/design-system-mobile/utils";
import { useRouter } from "expo-router";
import { Download, EyeOff, FileText, ShieldCheck } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StepHeader } from "../../../components/drops/step-header";
import { Routes } from "../../../lib/routes";

const POINTS = [
  {
    icon: FileText,
    title: "It's your master key",
    desc: "A 12-word recovery phrase is the only way to restore this wallet — on every XRPL chain.",
  },
  {
    icon: EyeOff,
    title: "Keep it private",
    desc: "Anyone who sees it can move your funds. Drops will never ask for it.",
  },
  {
    icon: Download,
    title: "Store it offline",
    desc: "Write it down on paper. Don't screenshot it or save it to the cloud.",
  },
];

export default function SecureIntroScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top + 8 }} className="px-6">
        <StepHeader step={1} />
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-2 pt-3">
        <View className="mb-5 h-14 w-14 items-center justify-center rounded-[18px] bg-brand-soft">
          <Icon as={ShieldCheck} size={28} className="text-brand" />
        </View>

        <Text className="font-display text-[30px] leading-[34px] tracking-[-0.5px] text-foreground">
          Back up your new wallet
        </Text>
        <Text className="mt-2.5 text-[15px] leading-6 text-muted-foreground">
          You're about to create a recovery phrase. Three things to know before
          you do.
        </Text>

        <View className="mt-5">
          {POINTS.map((p, i) => (
            <View
              key={p.title}
              className={cn(
                "flex-row gap-3.5 py-3.5",
                i > 0 && "border-t border-border",
              )}
            >
              <View className="h-[38px] w-[38px] items-center justify-center rounded-xl bg-secondary">
                <Icon as={p.icon} size={19} className="text-foreground" />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-semibold text-foreground">
                  {p.title}
                </Text>
                <Text className="mt-1 text-[13px] leading-[19px] text-muted-foreground">
                  {p.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={{ paddingBottom: insets.bottom + 16 }} className="px-6 pt-3">
        <Button
          variant="brand"
          size="lg"
          className="w-full"
          onPress={() => router.push(Routes.OnboardingRevealPhrase)}
        >
          <Text>Create recovery phrase</Text>
        </Button>
      </View>
    </View>
  );
}

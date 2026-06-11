import { Badge } from "@flama/design-system-mobile/badge";
import { Callout } from "@flama/design-system-mobile/callout";
import { Chip } from "@flama/design-system-mobile/chip";
import { Icon } from "@flama/design-system-mobile/icon";
import { Text } from "@flama/design-system-mobile/text";
import { cn } from "@flama/design-system-mobile/utils";
import { isValidFamilySeed } from "@flama/frontend";
import { useImportFamilySeed } from "@flama/frontend/react";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { CircleCheck, ClipboardPaste, Eye, EyeOff } from "lucide-react-native";
import * as React from "react";
import { Pressable, TextInput, View } from "react-native";
import { OnboardingStepScreen } from "../../../components/auth/onboarding-step-screen";
import { buildRoute } from "../../../lib/routes";

export default function ImportSeedScreen() {
  const router = useRouter();
  const [seed, setSeed] = React.useState("");
  const [show, setShow] = React.useState(false);

  const importSeed = useImportFamilySeed({
    onSuccess: () => router.replace(buildRoute.onboardingSuccess("xrpl")),
  });

  // Empty input is neutral — only a non-empty, malformed seed flags red.
  const state = seed ? isValidFamilySeed(seed.trim()) : null;
  const valid = state === true;
  const invalid = state === false;

  const pasteFromClipboard = async () => {
    const text = (await Clipboard.getStringAsync()).trim();
    if (text) setSeed(text);
  };

  const confirm = () => {
    if (!valid || importSeed.isPending) return;
    importSeed.mutate({ seed: seed.trim() });
  };

  return (
    <OnboardingStepScreen
      step={2}
      title="Enter your family seed"
      titleBadge={
        <Badge variant="secondary">
          <Text>XRP Ledger only</Text>
        </Badge>
      }
      subtitle="Your secret seed begins with s or sEd. It restores your XRP Ledger account only."
      cta={{
        label: importSeed.isPending ? "Importing…" : "Continue",
        disabled: !valid || importSeed.isPending,
        onPress: confirm,
      }}
    >
      <View
        className={cn(
          "mt-6 min-h-[56px] flex-row items-center gap-2.5 rounded-md border bg-card py-1 pr-1.5 pl-4",
          invalid
            ? "border-destructive"
            : valid
              ? "border-positive"
              : "border-border",
        )}
      >
        <TextInput
          value={seed}
          onChangeText={(value) => setSeed(value.replace(/\s/g, ""))}
          placeholder="sEd…"
          secureTextEntry={!show}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          spellCheck={false}
          className="h-full min-w-0 flex-1 p-0 font-mono text-base tracking-[0.4px] text-foreground placeholder:text-muted-foreground/50"
        />
        {valid ? (
          <Icon as={CircleCheck} size={20} className="text-positive" />
        ) : null}
        <Pressable
          onPress={() => setShow((s) => !s)}
          accessibilityRole="button"
          accessibilityLabel={show ? "Hide seed" : "Show seed"}
          className="h-9 w-9 items-center justify-center rounded-full bg-secondary active:scale-[0.97]"
        >
          <Icon
            as={show ? EyeOff : Eye}
            size={17}
            className="text-foreground"
          />
        </Pressable>
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <Text className="font-mono text-[12.5px] text-muted-foreground">
          s… · sEd…
        </Text>
        <Chip size="sm" icon={ClipboardPaste} onPress={pasteFromClipboard}>
          Paste
        </Chip>
      </View>

      <View className="mt-4">
        {invalid || importSeed.isError ? (
          <Callout variant="negative">
            {importSeed.isError
              ? "That seed couldn't be imported. Double-check it and try again."
              : "This isn't a valid family seed. It should start with s or sEd and contain only base58 characters."}
          </Callout>
        ) : (
          <Callout variant="neutral">
            Stored encrypted on this device. Your seed never leaves it.
          </Callout>
        )}
      </View>
    </OnboardingStepScreen>
  );
}

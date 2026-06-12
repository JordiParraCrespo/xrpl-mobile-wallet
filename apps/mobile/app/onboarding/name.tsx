import { Button } from "@flama/design-system-mobile/button";
import { Icon } from "@flama/design-system-mobile/icon";
import { InputField } from "@flama/design-system-mobile/input-field";
import { ScreenHeader } from "@flama/design-system-mobile/screen-header";
import { Text } from "@flama/design-system-mobile/text";
import { MAX_NAME_LENGTH } from "@flama/frontend";
import { useSetDisplayName } from "@flama/frontend/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CircleCheck, User } from "lucide-react-native";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NamePreview } from "../../components/auth/name-preview";
import { buildRoute, type OnboardingPath, Routes } from "../../lib/routes";

/** Smallest accepted name; mirrors the `profile` module's MIN_NAME_LENGTH. */
const MIN_NAME_LENGTH = 2;

/**
 * Sets the local display name — the first onboarding step on both paths. The
 * name is saved to the device (via the `profile` module) and is what shows on
 * the profile and greets you when you chat with Dewy, the wallet assistant.
 * A live preview shows exactly where it lands. The `next` param continues into
 * this path's flow. Design: onboarding-name.html.
 */
export default function NameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { next } = useLocalSearchParams<{ next?: OnboardingPath }>();

  const isImport = next === "import";
  // Both paths continue into the device-security block (passcode explainer →
  // keypad → biometrics); the paths only diverge after it.
  const destination = buildRoute.onboardingBackupInfo(
    isImport ? "import" : "create",
  );

  const [name, setName] = React.useState("");
  const valid = name.trim().length >= MIN_NAME_LENGTH;

  const setDisplayName = useSetDisplayName({
    onSuccess: () => router.push(destination),
  });
  const { mutate: saveName, isPending } = setDisplayName;

  const submit = () => {
    if (!valid || isPending) return;
    saveName(name);
  };

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top + 8 }} className="px-6">
        <ScreenHeader
          step={1}
          total={isImport ? 4 : 5}
          onBack={() => router.back()}
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-2 pt-3"
        keyboardShouldPersistTaps="handled"
      >
        <View className="h-[58px] w-[58px] items-center justify-center rounded-[18px] bg-brand-soft">
          <Icon as={User} size={28} className="text-brand-soft-foreground" />
        </View>
        <Text className="mt-5 font-display text-[30px] leading-[34px] tracking-[-0.5px] text-foreground">
          {t("onboarding.name.title")}
        </Text>
        <Text className="mt-2.5 text-[15px] leading-6 text-muted-foreground">
          {t("onboarding.name.subtitle")}
        </Text>

        <View className="mt-[26px]">
          <InputField
            label={t("onboarding.name.label")}
            value={name}
            onChangeText={(value) =>
              setName(value.replace(/^\s+/, "").slice(0, MAX_NAME_LENGTH))
            }
            placeholder={t("onboarding.name.fieldPlaceholder")}
            autoCapitalize="words"
            autoComplete="name"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={submit}
            maxLength={MAX_NAME_LENGTH}
            leading={<Icon as={User} size={20} />}
            trailing={
              valid ? (
                <Icon as={CircleCheck} size={20} className="text-positive" />
              ) : undefined
            }
          />
        </View>

        <NamePreview name={name} />
      </ScrollView>

      <View className="px-6 pt-3" style={{ paddingBottom: insets.bottom + 16 }}>
        <Button
          variant="brand"
          size="lg"
          className="w-full"
          disabled={!valid || isPending}
          onPress={submit}
        >
          <Text>
            {valid ? t("onboarding.name.cta") : t("onboarding.name.ctaEmpty")}
          </Text>
        </Button>
      </View>
    </View>
  );
}

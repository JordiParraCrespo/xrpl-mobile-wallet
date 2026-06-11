import { useWalletState } from "@flama/frontend/react";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

/**
 * Entry to the Drops shell. Onboarding is the front door for a fresh wallet;
 * once a wallet exists we land on the Home hub. Mirrors SCREENS.md:
 * `onboarding → home`.
 */
export default function DropsIndex() {
  const { status } = useWalletState();

  if (status === "idle") {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (status === "no_wallet") {
    return <Redirect href="/(drops)/onboarding" />;
  }

  return <Redirect href="/(drops)/(tabs)/home" />;
}

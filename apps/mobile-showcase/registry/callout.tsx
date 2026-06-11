import { Callout } from "@flama/design-system-mobile/callout";
import { Text } from "@flama/design-system-mobile/text";
import { EyeOff } from "lucide-react-native";
import * as React from "react";
import { ScrollView, View } from "react-native";

export default function CalloutScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Variants</Text>
        <View className="gap-3">
          <Callout variant="neutral">
            Drops never stores your phrase. It stays on this device.
          </Callout>
          <Callout variant="positive">
            Your phrase is confirmed and your wallet is ready.
          </Callout>
          <Callout variant="negative">
            That word isn't in the recovery wordlist. Check the spelling.
          </Callout>
          <Callout variant="warning">
            Never screenshot or share these words.
          </Callout>
          <Callout variant="info">
            Both addresses come from the same recovery phrase.
          </Callout>
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Custom icon
        </Text>
        <Callout variant="neutral" icon={EyeOff}>
          Keep it private — anyone who sees it can move your funds.
        </Callout>
      </View>
    </ScrollView>
  );
}

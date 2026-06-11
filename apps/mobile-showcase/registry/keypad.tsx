import { applyKeypadKey, Keypad } from "@flama/design-system-mobile/keypad";
import { Text } from "@flama/design-system-mobile/text";
import * as React from "react";
import { ScrollView, View } from "react-native";

export default function KeypadScreen() {
  const [amount, setAmount] = React.useState("0");
  const [calcAmount, setCalcAmount] = React.useState("25");
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Interactive · send amount
        </Text>
        <View className="items-center gap-2 py-4">
          <Text className="font-display text-4xl text-foreground">
            {amount} XRP
          </Text>
          <Text className="text-sm text-muted-foreground">
            ≈ ${(Number(amount) * 0.6184).toFixed(2)}
          </Text>
        </View>
        <Keypad
          onKey={(key) => setAmount((prev) => applyKeypadKey(prev, key))}
        />
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          With operator row
        </Text>
        <View className="items-center py-4">
          <Text className="font-display text-4xl text-foreground">
            ${calcAmount}
          </Text>
        </View>
        <Keypad
          operators
          onKey={(key) => setCalcAmount((prev) => applyKeypadKey(prev, key))}
        />
      </View>
    </ScrollView>
  );
}

import { AmountDisplay } from "@flama/design-system-mobile/amount-display";
import { Text } from "@flama/design-system-mobile/text";
import * as React from "react";
import { ScrollView, View } from "react-native";

export default function AmountDisplayScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Prefix symbol
        </Text>
        <AmountDisplay value="50" />
        <AmountDisplay value="1,250.75" />
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          With input cursor
        </Text>
        <AmountDisplay value="50" showCursor />
        <AmountDisplay value="0" showCursor />
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Suffix symbol
        </Text>
        <AmountDisplay value="64.20" symbol="XRP" symbolPosition="suffix" />
        <AmountDisplay
          value="64.20"
          symbol="XRP"
          symbolPosition="suffix"
          showCursor
        />
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Other symbols
        </Text>
        <AmountDisplay value="48.10" symbol="€" />
        <AmountDisplay value="120" symbol="RLUSD" symbolPosition="suffix" />
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Send flow (centered)
        </Text>
        <View className="items-center rounded-xl border border-border bg-card px-4 py-8">
          <AmountDisplay value="25" showCursor />
          <Text className="mt-2 text-sm text-muted-foreground">
            ≈ 40.43 XRP
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

import { AssetIcon } from "@flama/design-system-mobile/asset-icon";
import { Text } from "@flama/design-system-mobile/text";
import * as React from "react";
import { ScrollView, View } from "react-native";

const ASSETS = ["XRP", "RLUSD", "USD", "EUR", "BTC", "ETH"] as const;

export default function AssetIconScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Known assets
        </Text>
        <View className="flex-row flex-wrap gap-4">
          {ASSETS.map((symbol) => (
            <View key={symbol} className="items-center gap-2">
              <AssetIcon symbol={symbol} size={52} />
              <Text className="font-mono text-xs text-muted-foreground">
                {symbol}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Unknown asset · brand fallback
        </Text>
        <View className="flex-row gap-4">
          <AssetIcon symbol="SOLO" size={52} color="#5b41dd" />
          <AssetIcon symbol="SGB" size={52} color="#e8870a" />
          <AssetIcon symbol="CSC" size={52} />
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Sizes</Text>
        <View className="flex-row items-end gap-4">
          <AssetIcon symbol="XRP" size={26} />
          <AssetIcon symbol="XRP" size={40} />
          <AssetIcon symbol="XRP" size={52} />
          <AssetIcon symbol="XRP" size={64} />
        </View>
      </View>
    </ScrollView>
  );
}

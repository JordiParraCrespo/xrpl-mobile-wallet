import { AssetIcon } from "@flama/design-system-mobile/asset-icon";
import { PriceChange } from "@flama/design-system-mobile/price-change";
import { Text } from "@flama/design-system-mobile/text";
import * as React from "react";
import { ScrollView, View } from "react-native";

export default function PriceChangeScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Directions
        </Text>
        <View className="flex-row flex-wrap items-center gap-4">
          <PriceChange value={2.41} />
          <PriceChange value={-0.92} />
          <PriceChange value={0} />
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Sizes</Text>
        <View className="flex-row flex-wrap items-baseline gap-4">
          <PriceChange value={2.41} className="text-xs" />
          <PriceChange value={-0.92} className="text-sm" />
          <PriceChange value={5.03} className="text-base" />
          <PriceChange value={-12.6} className="text-lg" />
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Market row
        </Text>
        <View className="gap-3">
          {[
            { sym: "XRP", name: "XRP", price: "0.6184", chg: 2.41 },
            { sym: "BTC", name: "Bitcoin", price: "64,210.55", chg: -0.92 },
            { sym: "ETH", name: "Ethereum", price: "3,412.08", chg: 1.27 },
          ].map((row) => (
            <View
              key={row.sym}
              className="flex-row items-center gap-3 rounded-xl border border-border bg-card p-4"
            >
              <AssetIcon symbol={row.sym} size={40} />
              <View className="flex-1">
                <Text className="text-[15px] font-semibold text-foreground">
                  {row.name}
                </Text>
                <Text className="text-sm text-muted-foreground">{row.sym}</Text>
              </View>
              <View className="items-end gap-0.5">
                <Text className="font-mono text-[15px] text-foreground">
                  ${row.price}
                </Text>
                <PriceChange value={row.chg} className="text-xs" />
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

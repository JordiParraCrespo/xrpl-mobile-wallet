import { PriceChange } from "@flama/design-system-mobile/price-change";
import { Sparkline } from "@flama/design-system-mobile/sparkline";
import { Text } from "@flama/design-system-mobile/text";
import * as React from "react";
import { ScrollView, View } from "react-native";

const UP = [10, 9, 11, 10.5, 12, 11.4, 13, 12.6, 14.2, 13.8, 15.6];
const DOWN = [16, 15.2, 15.6, 14.2, 14.8, 13.4, 13.9, 12.6, 13.2, 12.1, 11.7];

export default function SparklineScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Trend (auto from data)
        </Text>
        <View className="flex-row flex-wrap gap-4">
          <Sparkline data={UP} />
          <Sparkline data={DOWN} />
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Explicit trend / color
        </Text>
        <View className="flex-row flex-wrap gap-4">
          <Sparkline data={UP} trend="down" />
          <Sparkline data={DOWN} trend="up" />
          <Sparkline data={UP} color="#5b41dd" />
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Sizes</Text>
        <View className="flex-row flex-wrap items-end gap-4">
          <Sparkline data={UP} width={80} height={28} />
          <Sparkline data={DOWN} width={150} height={46} />
          <Sparkline data={UP} width={240} height={64} />
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Market card
        </Text>
        <View className="flex-row items-center gap-3 rounded-xl border border-border bg-card p-4">
          <View className="flex-1">
            <Text className="text-[15px] font-semibold text-foreground">
              XRP
            </Text>
            <Text className="font-mono text-sm text-foreground">$0.6184</Text>
            <PriceChange value={2.41} className="text-xs" />
          </View>
          <Sparkline data={UP} width={120} height={40} />
        </View>
      </View>
    </ScrollView>
  );
}

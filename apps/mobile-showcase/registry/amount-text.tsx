import { AmountText } from "@flama/design-system-mobile/amount-text";
import { Text } from "@flama/design-system-mobile/text";
import * as React from "react";
import { ScrollView, View } from "react-native";

export default function AmountTextScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Sizes</Text>
        <View className="gap-2">
          <AmountText value={1250.75} currency="XRP" size="sm" />
          <AmountText value={1250.75} currency="XRP" size="md" />
          <AmountText value={1250.75} currency="XRP" size="lg" />
          <AmountText value={1250.75} currency="XRP" size="xl" />
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Tones</Text>
        <View className="gap-2">
          <AmountText value={64.2} currency="XRP" size="lg" tone="default" />
          <AmountText value={64.2} currency="XRP" size="lg" tone="positive" />
          <AmountText value={64.2} currency="XRP" size="lg" tone="negative" />
          <AmountText value={64.2} currency="XRP" size="lg" tone="muted" />
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Signed (auto tone)
        </Text>
        <View className="gap-2">
          <AmountText value={60} currency="XRP" size="lg" signed />
          <AmountText value={-4.2} currency="XRP" size="lg" signed />
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Mono (list rows)
        </Text>
        <View className="gap-2">
          <AmountText value={60} currency="XRP" size="md" signed mono />
          <AmountText value={-4.2} currency="XRP" size="md" signed mono />
          <AmountText value={1250.75} currency="USD" size="lg" mono />
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Activity row
        </Text>
        <View className="flex-row items-center justify-between rounded-xl border border-border bg-card p-4">
          <View>
            <Text className="text-[15px] font-semibold text-foreground">
              Maria Gutiérrez
            </Text>
            <Text className="text-sm text-muted-foreground">
              Received · 2h ago
            </Text>
          </View>
          <AmountText value={60} currency="XRP" signed mono />
        </View>
      </View>
    </ScrollView>
  );
}

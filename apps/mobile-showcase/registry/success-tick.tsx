import { Button } from "@flama/design-system-mobile/button";
import { SuccessTick } from "@flama/design-system-mobile/success-tick";
import { Text } from "@flama/design-system-mobile/text";
import * as React from "react";
import { ScrollView, View } from "react-native";

export default function SuccessTickScreen() {
  const [replayKey, setReplayKey] = React.useState(0);
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Positive</Text>
        <View className="flex-row flex-wrap items-end gap-4">
          <SuccessTick key={`p-${replayKey}`} variant="positive" />
          <SuccessTick key={`ps-${replayKey}`} variant="positive" size={56} />
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Glass (dark / gradient surfaces)
        </Text>
        <View className="items-center gap-4 rounded-xl bg-[#0b0b0f] p-5">
          <SuccessTick key={`g-${replayKey}`} variant="glass" />
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Send success
        </Text>
        <View className="items-center gap-1 rounded-xl border border-border bg-card px-4 py-8">
          <SuccessTick key={`s-${replayKey}`} variant="positive" size={72} />
          <Text className="mt-4 font-display text-4xl font-normal tracking-[-0.6px] text-foreground">
            $50.00
          </Text>
          <Text className="text-base font-semibold text-positive-soft-foreground">
            Sent
          </Text>
          <Text className="mt-2 max-w-[220px] text-center text-sm text-muted-foreground">
            To Maria · settled on the XRP Ledger in 3.7s
          </Text>
        </View>
      </View>

      <Button variant="secondary" onPress={() => setReplayKey((k) => k + 1)}>
        <Text>Replay animation</Text>
      </Button>
    </ScrollView>
  );
}

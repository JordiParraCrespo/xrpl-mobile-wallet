import { Text } from "@flama/design-system-mobile/text";
import { Toast } from "@flama/design-system-mobile/toast";
import { Copy, WifiOff } from "lucide-react-native";
import * as React from "react";
import { ScrollView, View } from "react-native";

export default function ToastScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Default · check icon
        </Text>
        <View className="gap-3">
          <Toast>Sent · 25 XRP</Toast>
          <Toast>Address copied</Toast>
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Custom icon
        </Text>
        <View className="gap-3">
          <Toast icon={Copy}>rN7n…c4eE copied</Toast>
          <Toast icon={WifiOff}>You're offline — balances may be stale</Toast>
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Over content
        </Text>
        <View className="items-center gap-4 rounded-xl bg-[#0b0b0f] p-5">
          <Toast>Swapped · 100 XRP → 61.79 RLUSD</Toast>
        </View>
      </View>
    </ScrollView>
  );
}

import { SelectorPill } from "@flama/design-system-mobile/selector-pill";
import { Text } from "@flama/design-system-mobile/text";
import { Landmark, Wallet } from "lucide-react-native";
import * as React from "react";
import { ScrollView, View } from "react-native";
import { HeroSurface } from "../lib/hero-surface";

export default function SelectorPillScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Token</Text>
        <View className="flex-row flex-wrap gap-3">
          <SelectorPill
            asset={{ symbol: "XRP" }}
            label="XRP"
            onPress={() => {}}
          />
          <SelectorPill
            asset={{ symbol: "RLUSD" }}
            label="RLUSD"
            onPress={() => {}}
          />
          <SelectorPill
            asset={{ symbol: "SOLO", color: "#2d6fdb" }}
            label="SOLO"
            onPress={() => {}}
          />
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Account</Text>
        <View className="flex-row flex-wrap gap-3">
          <SelectorPill icon={Wallet} label="Personal" onPress={() => {}} />
          <SelectorPill
            icon={Landmark}
            label="Savings · XRPL"
            onPress={() => {}}
          />
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Glass · over dark flow surface
        </Text>
        <HeroSurface>
          <View className="flex-row flex-wrap gap-3">
            <SelectorPill
              glass
              asset={{ symbol: "XRP" }}
              label="XRP"
              onPress={() => {}}
            />
            <SelectorPill
              glass
              icon={Wallet}
              label="Wallet 1"
              onPress={() => {}}
            />
          </View>
        </HeroSurface>
      </View>
    </ScrollView>
  );
}

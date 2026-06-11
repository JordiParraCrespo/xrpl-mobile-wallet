import { ChainBadge } from "@flama/design-system-mobile/chain-badge";
import { Text } from "@flama/design-system-mobile/text";
import * as React from "react";
import { ScrollView, View } from "react-native";

export default function ChainBadgeScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Kinds</Text>
        <View className="flex-row flex-wrap items-center gap-4">
          <View className="items-center gap-1.5">
            <ChainBadge kind="xrp" />
            <Text className="text-xs text-muted-foreground">XRP Ledger</Text>
          </View>
          <View className="items-center gap-1.5">
            <ChainBadge kind="evm" />
            <Text className="text-xs text-muted-foreground">XRPL EVM</Text>
          </View>
          <View className="items-center gap-1.5">
            <ChainBadge kind="letter" label="R" color="#0ca678" />
            <Text className="text-xs text-muted-foreground">Letter</Text>
          </View>
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Sizes</Text>
        <View className="flex-row flex-wrap items-end gap-3">
          <ChainBadge kind="evm" size={24} />
          <ChainBadge kind="evm" size={32} />
          <ChainBadge kind="evm" size={40} />
          <ChainBadge kind="evm" size={56} />
          <ChainBadge kind="xrp" size={24} />
          <ChainBadge kind="xrp" size={40} />
          <ChainBadge kind="xrp" size={56} />
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Letter palette
        </Text>
        <View className="flex-row flex-wrap gap-3">
          <ChainBadge kind="letter" label="R" color="#0ca678" />
          <ChainBadge kind="letter" label="B" color="#f59f00" />
          <ChainBadge kind="letter" label="S" color="#4287f5" />
          <ChainBadge kind="letter" label="P" color="#5b41dd" />
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          In an account row
        </Text>
        <View className="flex-row items-center gap-3 rounded-xl border border-border bg-card p-4">
          <ChainBadge kind="evm" size={40} />
          <View className="flex-1">
            <Text className="text-[15px] font-semibold text-foreground">
              XRPL EVM
            </Text>
            <Text className="font-mono text-xs text-muted-foreground">
              0x8F3a…b1C2e
            </Text>
          </View>
          <Text className="font-mono text-sm text-foreground">128.40 XRP</Text>
        </View>
      </View>
    </ScrollView>
  );
}

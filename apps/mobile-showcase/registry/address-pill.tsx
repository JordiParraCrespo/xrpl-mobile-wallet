import { AddressPill } from "@flama/design-system-mobile/address-pill";
import { Text } from "@flama/design-system-mobile/text";
import * as React from "react";
import { ScrollView, View } from "react-native";
import { HeroSurface } from "../lib/hero-surface";

const XRPL_ADDRESS = "rPLkM9qTb7sN3vXcF2dQ8wH4eYz1uA6x";
const EVM_ADDRESS = "0x8F3aC2e1B9d74F6c0A5e2D1b8C7f4E3a9D6b1C2e";

export default function AddressPillScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Truncated (press to copy)
        </Text>
        <View className="gap-3">
          <AddressPill address={XRPL_ADDRESS} onCopy={() => {}} />
          <AddressPill address={EVM_ADDRESS} onCopy={() => {}} />
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Full address
        </Text>
        <AddressPill
          address={XRPL_ADDRESS}
          truncate={false}
          onCopy={() => {}}
        />
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">On dark</Text>
        <HeroSurface>
          <AddressPill address={XRPL_ADDRESS} onDark onCopy={() => {}} />
          <AddressPill address={EVM_ADDRESS} onDark onCopy={() => {}} />
        </HeroSurface>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          In a receive card
        </Text>
        <View className="gap-1 rounded-xl border border-border bg-card p-4">
          <Text className="text-xs uppercase tracking-[1px] text-muted-foreground">
            XRP Ledger address
          </Text>
          <AddressPill address={XRPL_ADDRESS} onCopy={() => {}} />
        </View>
      </View>
    </ScrollView>
  );
}

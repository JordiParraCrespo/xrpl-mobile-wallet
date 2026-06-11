import { GlassPanel } from "@flama/design-system-mobile/glass-panel";
import { Text } from "@flama/design-system-mobile/text";
import * as React from "react";
import { ScrollView, View } from "react-native";
import { HeroSurface } from "../lib/hero-surface";

export default function GlassPanelScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          On dark · over the gradient hero
        </Text>
        <HeroSurface>
          <GlassPanel className="w-full">
            <Text className="text-xs font-semibold tracking-wide text-white/70">
              AVAILABLE BALANCE
            </Text>
            <Text className="mt-1 font-display text-[48px] font-normal leading-[48px] tracking-[-0.8px] text-white tabular-nums">
              $942.76
            </Text>
            <Text className="mt-1 font-mono text-xs text-white/60">
              1,204.51 XRP · TESTNET
            </Text>
          </GlassPanel>
        </HeroSurface>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Light · over light surfaces
        </Text>
        <HeroSurface>
          <GlassPanel variant="light" className="w-full">
            <Text className="text-sm font-semibold text-foreground">
              Neutral light glass
            </Text>
            <Text className="mt-1 text-[13px] text-muted-foreground">
              Search pills and utility surfaces over white.
            </Text>
          </GlassPanel>
        </HeroSurface>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Blur intensity
        </Text>
        <HeroSurface>
          <View className="w-full flex-row gap-3">
            {[8, 20, 40].map((intensity) => (
              <GlassPanel
                key={intensity}
                intensity={intensity}
                className="flex-1 items-center"
              >
                <Text className="font-mono text-xs text-white">
                  {intensity}
                </Text>
              </GlassPanel>
            ))}
          </View>
        </HeroSurface>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Unpadded · flush content
        </Text>
        <HeroSurface>
          <GlassPanel padded={false} className="w-full">
            <View className="border-b border-white/10 px-4 py-3">
              <Text className="text-sm font-semibold text-white">
                ACCOUNT 1
              </Text>
            </View>
            <View className="px-4 py-3">
              <Text className="text-sm text-white/80">XRP Ledger</Text>
              <Text className="mt-0.5 font-mono text-xs text-white/60">
                rPLkM9…uA6x
              </Text>
            </View>
          </GlassPanel>
        </HeroSurface>
      </View>
    </ScrollView>
  );
}

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
        <View className="overflow-hidden rounded-xl border border-border bg-background p-5">
          <View className="absolute -left-8 -top-10 h-32 w-32 rounded-full bg-brand/20" />
          <View className="absolute -bottom-10 -right-6 h-28 w-28 rounded-full bg-positive/15" />
          <GlassPanel variant="light" tint="light" className="w-full">
            <Text className="text-sm font-semibold text-foreground">
              Neutral light glass
            </Text>
            <Text className="mt-1 text-[13px] text-muted-foreground">
              Search pills and utility surfaces over white.
            </Text>
          </GlassPanel>
        </View>
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
              <Text className="text-[13px] font-semibold tracking-[0.3px] text-white/70">
                ACCOUNT 1
              </Text>
            </View>
            <View className="px-4 py-3">
              <Text className="text-[15px] font-semibold text-white">
                XRP Ledger
              </Text>
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

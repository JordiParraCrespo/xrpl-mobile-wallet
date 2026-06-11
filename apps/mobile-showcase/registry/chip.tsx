import { Chip } from "@flama/design-system-mobile/chip";
import { Text } from "@flama/design-system-mobile/text";
import { ArrowDownLeft, Repeat, Send, Users } from "lucide-react-native";
import * as React from "react";
import { ScrollView, View } from "react-native";
import { HeroSurface } from "../lib/hero-surface";

export default function ChipScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Variants</Text>
        <View className="flex-row flex-wrap gap-3">
          <Chip variant="outline">Outline</Chip>
          <Chip variant="primary">Primary</Chip>
          <Chip variant="muted">Muted</Chip>
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Sizes</Text>
        <View className="flex-row flex-wrap items-center gap-3">
          <Chip size="sm">Small</Chip>
          <Chip size="md">Medium</Chip>
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Search filter chips
        </Text>
        <View className="flex-row flex-wrap gap-2">
          <Chip variant="primary" size="sm">
            All
          </Chip>
          <Chip variant="outline" size="sm">
            Sent
          </Chip>
          <Chip variant="outline" size="sm">
            Received
          </Chip>
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Payment quick actions
        </Text>
        <View className="flex-row flex-wrap gap-2.5">
          <Chip variant="primary" icon={Send}>
            Send
          </Chip>
          <Chip variant="outline" icon={ArrowDownLeft}>
            Request
          </Chip>
          <Chip variant="outline" icon={Repeat}>
            Swap
          </Chip>
          <Chip variant="outline" icon={Users}>
            Split a bill
          </Chip>
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Glass · quick amounts
        </Text>
        <HeroSurface>
          <View className="flex-row gap-2.5">
            <Chip variant="glass" className="min-w-16">
              $10
            </Chip>
            <Chip variant="glass" className="min-w-16">
              $20
            </Chip>
            <Chip variant="glass" className="min-w-16">
              $50
            </Chip>
          </View>
        </HeroSurface>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Disabled</Text>
        <View className="flex-row gap-3">
          <Chip variant="primary" disabled>
            Send
          </Chip>
        </View>
      </View>
    </ScrollView>
  );
}

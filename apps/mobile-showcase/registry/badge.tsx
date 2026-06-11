import { Badge } from "@flama/design-system-mobile/badge";
import { Text } from "@flama/design-system-mobile/text";
import * as React from "react";
import { ScrollView, View } from "react-native";
import { HeroSurface } from "../lib/hero-surface";

export default function BadgeScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Status tones · soft + dot
        </Text>
        <View className="flex-row flex-wrap gap-3">
          <Badge variant="positive" dot>
            <Text>Received</Text>
          </Badge>
          <Badge variant="negative" dot>
            <Text>Sent</Text>
          </Badge>
          <Badge variant="warning" dot>
            <Text>Pending</Text>
          </Badge>
          <Badge variant="info" dot>
            <Text>Info</Text>
          </Badge>
          <Badge variant="brand">
            <Text>Testnet</Text>
          </Badge>
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Solid</Text>
        <View className="flex-row flex-wrap gap-3">
          <Badge>
            <Text>Default</Text>
          </Badge>
          <Badge variant="positive" solid>
            <Text>+2.41%</Text>
          </Badge>
          <Badge variant="negative" solid>
            <Text>−0.92%</Text>
          </Badge>
          <Badge variant="brand" solid>
            <Text>New</Text>
          </Badge>
          <Badge variant="warning" solid>
            <Text>Pending</Text>
          </Badge>
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Small</Text>
        <View className="flex-row flex-wrap gap-3">
          <Badge variant="positive" size="sm" dot>
            <Text>All chains</Text>
          </Badge>
          <Badge variant="secondary" size="sm" dot>
            <Text>XRPL only</Text>
          </Badge>
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Glass · coming soon
        </Text>
        <HeroSurface>
          <Badge variant="glass">
            <Text>COMING SOON</Text>
          </Badge>
        </HeroSurface>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Neutral set
        </Text>
        <View className="flex-row flex-wrap gap-3">
          <Badge variant="secondary">
            <Text>Secondary</Text>
          </Badge>
          <Badge variant="outline">
            <Text>Outline</Text>
          </Badge>
          <Badge variant="destructive">
            <Text>Destructive</Text>
          </Badge>
        </View>
      </View>
    </ScrollView>
  );
}

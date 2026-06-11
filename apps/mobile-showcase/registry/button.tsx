import { Button } from "@flama/design-system-mobile/button";
import { Icon } from "@flama/design-system-mobile/icon";
import { Text } from "@flama/design-system-mobile/text";
import { ArrowUpRight } from "lucide-react-native";
import * as React from "react";
import { ScrollView, View } from "react-native";
import { HeroSurface } from "../lib/hero-surface";

export default function ButtonScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Variants</Text>
        <View className="gap-3">
          <Button>
            <Text>Continue</Text>
          </Button>
          <Button variant="brand">
            <Icon
              as={ArrowUpRight}
              size={17}
              className="text-brand-foreground"
            />
            <Text>Send</Text>
          </Button>
          <Button variant="secondary">
            <Text>Maybe later</Text>
          </Button>
          <Button variant="outline">
            <Text>Learn more</Text>
          </Button>
          <Button variant="ghost">
            <Text>Ghost</Text>
          </Button>
          <Button variant="destructive">
            <Text>Remove wallet</Text>
          </Button>
          <Button variant="link">
            <Text>View on explorer</Text>
          </Button>
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Glass · on dark
        </Text>
        <HeroSurface>
          <Button variant="glass">
            <Text>Skip</Text>
          </Button>
          <Button variant="glass" size="lg" className="w-full">
            <Text>I already have a wallet</Text>
          </Button>
        </HeroSurface>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Sizes</Text>
        <View className="gap-3 items-start">
          <Button size="sm" variant="secondary">
            <Text>Small · 36</Text>
          </Button>
          <Button size="default" variant="secondary">
            <Text>Default · 44</Text>
          </Button>
          <Button size="lg" variant="secondary">
            <Text>Large · 52</Text>
          </Button>
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Full width · money action
        </Text>
        <Button variant="brand" size="lg" className="w-full">
          <Text>Add money securely</Text>
        </Button>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Disabled</Text>
        <Button disabled>
          <Text>Insufficient balance</Text>
        </Button>
      </View>
    </ScrollView>
  );
}

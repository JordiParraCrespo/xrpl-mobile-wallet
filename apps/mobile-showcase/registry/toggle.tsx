import { Text } from "@flama/design-system-mobile/text";
import { Toggle } from "@flama/design-system-mobile/toggle";
import * as React from "react";
import { ScrollView, View } from "react-native";

export default function ToggleScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Default</Text>
        <View className="flex-row gap-3">
          <Toggle>
            <Text>B</Text>
          </Toggle>
          <Toggle>
            <Text>I</Text>
          </Toggle>
          <Toggle>
            <Text>U</Text>
          </Toggle>
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Outline</Text>
        <View className="flex-row gap-3">
          <Toggle variant="outline">
            <Text>B</Text>
          </Toggle>
          <Toggle variant="outline">
            <Text>I</Text>
          </Toggle>
          <Toggle variant="outline">
            <Text>U</Text>
          </Toggle>
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Sizes</Text>
        <View className="flex-row gap-3 items-center">
          <Toggle size="sm">
            <Text>sm</Text>
          </Toggle>
          <Toggle size="default">
            <Text>md</Text>
          </Toggle>
          <Toggle size="lg">
            <Text>lg</Text>
          </Toggle>
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Disabled</Text>
        <Toggle disabled>
          <Text>Disabled</Text>
        </Toggle>
      </View>
    </ScrollView>
  );
}

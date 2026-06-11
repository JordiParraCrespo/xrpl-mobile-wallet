import { Badge } from "@flama/design-system-mobile/badge";
import { ScreenHeader } from "@flama/design-system-mobile/screen-header";
import { Text } from "@flama/design-system-mobile/text";
import * as React from "react";
import { ScrollView, View } from "react-native";

export default function ScreenHeaderScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Progress · steps 1–3
        </Text>
        <ScreenHeader onBack={() => {}} step={1} total={3} />
        <ScreenHeader onBack={() => {}} step={2} total={3} />
        <ScreenHeader onBack={() => {}} step={3} total={3} />
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">5 steps</Text>
        <ScreenHeader onBack={() => {}} step={3} total={5} />
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          No steps · back only
        </Text>
        <ScreenHeader onBack={() => {}} />
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Right slot
        </Text>
        <ScreenHeader
          onBack={() => {}}
          step={2}
          total={3}
          right={
            <Badge variant="brand">
              <Text>Testnet</Text>
            </Badge>
          }
        />
      </View>
    </ScrollView>
  );
}

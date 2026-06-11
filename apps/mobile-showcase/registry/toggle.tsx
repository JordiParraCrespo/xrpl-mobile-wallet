import { Text } from "@flama/design-system-mobile/text";
import { Toggle } from "@flama/design-system-mobile/toggle";
import * as React from "react";
import { ScrollView, View } from "react-native";

type ToggleProps = React.ComponentProps<typeof Toggle>;

function DemoToggle({
  defaultPressed = false,
  ...props
}: Omit<ToggleProps, "pressed" | "onPressedChange"> & {
  defaultPressed?: boolean;
}) {
  const [pressed, setPressed] = React.useState(defaultPressed);
  return <Toggle pressed={pressed} onPressedChange={setPressed} {...props} />;
}

export default function ToggleScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Default</Text>
        <View className="flex-row gap-3">
          <DemoToggle defaultPressed>
            <Text>B</Text>
          </DemoToggle>
          <DemoToggle>
            <Text>I</Text>
          </DemoToggle>
          <DemoToggle>
            <Text>U</Text>
          </DemoToggle>
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Outline</Text>
        <View className="flex-row gap-3">
          <DemoToggle variant="outline">
            <Text>B</Text>
          </DemoToggle>
          <DemoToggle variant="outline">
            <Text>I</Text>
          </DemoToggle>
          <DemoToggle variant="outline">
            <Text>U</Text>
          </DemoToggle>
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Sizes</Text>
        <View className="flex-row gap-3 items-center">
          <DemoToggle size="sm">
            <Text>sm</Text>
          </DemoToggle>
          <DemoToggle size="default">
            <Text>md</Text>
          </DemoToggle>
          <DemoToggle size="lg">
            <Text>lg</Text>
          </DemoToggle>
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Disabled</Text>
        <DemoToggle disabled>
          <Text>Disabled</Text>
        </DemoToggle>
      </View>
    </ScrollView>
  );
}

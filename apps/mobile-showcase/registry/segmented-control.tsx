import { SegmentedControl } from "@flama/design-system-mobile/segmented-control";
import { Text } from "@flama/design-system-mobile/text";
import * as React from "react";
import { ScrollView, View } from "react-native";

export default function SegmentedControlScreen() {
  const [filter, setFilter] = React.useState("all");
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Controlled
        </Text>
        <SegmentedControl
          options={[
            { value: "all", label: "All" },
            { value: "sent", label: "Sent" },
            { value: "received", label: "Received" },
          ]}
          value={filter}
          onValueChange={setFilter}
        />
        <Text className="text-sm text-muted-foreground">Active: {filter}</Text>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Full width
        </Text>
        <SegmentedControl
          fullWidth
          options={[
            { value: "1d", label: "1D" },
            { value: "1w", label: "1W" },
            { value: "1m", label: "1M" },
            { value: "1y", label: "1Y" },
          ]}
          defaultValue="1w"
        />
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Uncontrolled · two options
        </Text>
        <SegmentedControl
          options={[
            { value: "xrpl", label: "XRPL" },
            { value: "evm", label: "XRPL EVM" },
          ]}
          defaultValue="xrpl"
        />
      </View>
    </ScrollView>
  );
}

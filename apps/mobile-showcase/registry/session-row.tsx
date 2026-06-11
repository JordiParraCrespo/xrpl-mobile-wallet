import { Button } from "@flama/design-system-mobile/button";
import { Icon } from "@flama/design-system-mobile/icon";
import { SessionRow } from "@flama/design-system-mobile/session-row";
import { Text } from "@flama/design-system-mobile/text";
import { SquarePen } from "lucide-react-native";
import * as React from "react";
import { ScrollView, View } from "react-native";

export default function SessionRowScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Sessions</Text>
        <View className="gap-1">
          <SessionRow
            active
            title="Send 25 XRP to Maria"
            preview="Sent 25 XRP to Maria."
            time="09:41"
            onPress={() => {}}
          />
          <SessionRow
            title="Balance check"
            preview="Here’s your balance right now."
            time="Yesterday"
            onPress={() => {}}
          />
          <SessionRow
            title="Swap XRP to RLUSD"
            preview="Swapped 100 XRP for 61.79 RLUSD."
            time="Mon"
            onPress={() => {}}
          />
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">New chat</Text>
        <Button variant="brand" onPress={() => {}}>
          <Icon as={SquarePen} size={17} />
          <Text>New chat</Text>
        </Button>
      </View>
    </ScrollView>
  );
}

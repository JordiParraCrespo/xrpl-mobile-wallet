import { AmountText } from "@flama/design-system-mobile/amount-text";
import { AssetIcon } from "@flama/design-system-mobile/asset-icon";
import { Card } from "@flama/design-system-mobile/card";
import { InitialsAvatar } from "@flama/design-system-mobile/initials-avatar";
import { ListRow } from "@flama/design-system-mobile/list-row";
import { Text } from "@flama/design-system-mobile/text";
import * as React from "react";
import { ScrollView, View } from "react-native";

export default function ListRowScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Activity · grouped card
        </Text>
        <Card className="gap-0 overflow-hidden p-0">
          <ListRow
            media={<InitialsAvatar name="Maria Gutiérrez" size="md" />}
            title="Maria Gutiérrez"
            subtitle="Sent you"
            value={<AmountText value={60} currency="XRP" signed mono />}
            meta="Sun"
            onPress={() => {}}
          />
          <ListRow
            media={<InitialsAvatar name="Aerolink Travel" size="md" />}
            title="Aerolink Travel"
            subtitle="You sent"
            value={
              <AmountText
                value={-56.4}
                currency="XRP"
                signed
                mono
                tone="default"
              />
            }
            meta="12 Aug"
            onPress={() => {}}
          />
          <ListRow
            media={<AssetIcon symbol="RLUSD" size={40} />}
            title="Swap to RLUSD"
            subtitle="Swapping · Just now"
            value="100 XRP"
            meta="Pending"
            onPress={() => {}}
          />
        </Card>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Static · no press state
        </Text>
        <ListRow
          media={<AssetIcon symbol="XRP" size={40} />}
          title="XRP Ledger"
          subtitle="Main account"
          value="$744.87"
          meta="1,204.51 XRP"
        />
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Title only
        </Text>
        <ListRow
          title="Statements"
          subtitle="Export your activity"
          onPress={() => {}}
        />
      </View>
    </ScrollView>
  );
}

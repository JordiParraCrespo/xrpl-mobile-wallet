import { NotificationRow } from "@flama/design-system-mobile/notification-row";
import { Text } from "@flama/design-system-mobile/text";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  Info,
  Sparkles,
  TriangleAlert,
} from "lucide-react-native";
import * as React from "react";
import { ScrollView, View } from "react-native";

export default function NotificationRowScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Card · tones & unread
        </Text>
        <NotificationRow
          card
          tone="positive"
          icon={ArrowDownLeft}
          title="Received 60 XRP"
          body="From Maria Gutiérrez · ≈ $37.10"
          time="2h"
          unread
          onPress={() => {}}
        />
        <NotificationRow
          card
          tone="warning"
          icon={TriangleAlert}
          title="Network fee increased"
          body="XRPL fees are elevated while the ledger is busy."
          time="5h"
          unread
          onPress={() => {}}
        />
        <NotificationRow
          card
          tone="info"
          icon={Info}
          title="Ledger upgrade complete"
          body="The XRPL amendment activated successfully."
          time="1d"
          onPress={() => {}}
        />
        <NotificationRow
          card
          tone="brand"
          icon={Sparkles}
          title="DropPoints arrived"
          body="You earned 120 points this week."
          time="3d"
          onPress={() => {}}
        />
        <NotificationRow
          card
          tone="neutral"
          icon={Bell}
          title="Weekly summary ready"
          body="See what moved in your wallet this week."
          time="6d"
        />
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Grouped · inside a card
        </Text>
        <View className="rounded-xl border border-border bg-card p-1">
          <NotificationRow
            tone="positive"
            icon={ArrowDownLeft}
            title="Received 14.5 XRP"
            body="From Ernest Terré · ≈ $8.97"
            time="14 May"
            onPress={() => {}}
          />
          <NotificationRow
            tone="neutral"
            icon={ArrowUpRight}
            title="Sent 56.4 XRP"
            body="To Aerolink Travel · ≈ $34.88"
            time="12 Aug"
            onPress={() => {}}
          />
        </View>
      </View>
    </ScrollView>
  );
}

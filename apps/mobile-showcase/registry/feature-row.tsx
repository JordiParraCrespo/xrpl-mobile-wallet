import { FeatureRow } from "@flama/design-system-mobile/feature-row";
import { Text } from "@flama/design-system-mobile/text";
import { Bell, Gift, ShieldCheck, Zap } from "lucide-react-native";
import * as React from "react";
import { ScrollView, View } from "react-native";

export default function FeatureRowScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Glyph · pressable
        </Text>
        <FeatureRow
          glyph="✦"
          title="DropPoints"
          description="Earn rewards on every payment you make."
          onPress={() => {}}
        />
        <FeatureRow
          glyph="◎"
          title="Price alerts"
          description="Get notified when XRP moves more than 5%."
          onPress={() => {}}
        />
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Icon · static
        </Text>
        <FeatureRow
          icon={Bell}
          title="Stay in the loop"
          description="Payment and market notifications, in one feed."
        />
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Perk rows · circle disc
        </Text>
        <FeatureRow
          circle
          icon={Zap}
          title="Instant settlement"
          description="Payments settle on the XRP Ledger in 3–5 seconds."
        />
        <FeatureRow
          circle
          icon={ShieldCheck}
          title="Self-custody"
          description="Your keys never leave this device."
        />
        <FeatureRow
          circle
          icon={Gift}
          title="No hidden fees"
          description="Network fee is 0.00001 XRP — that’s it."
        />
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Tones</Text>
        <FeatureRow
          tone="positive"
          icon={ShieldCheck}
          title="Backed up"
          description="Your recovery phrase is confirmed."
        />
        <FeatureRow
          tone="warning"
          icon={Bell}
          title="Action needed"
          description="Verify your email to raise limits."
          onPress={() => {}}
        />
        <FeatureRow
          tone="info"
          icon={Zap}
          title="Ledger upgrade"
          description="XRPL amendment activates next week."
        />
        <FeatureRow
          tone="neutral"
          icon={Gift}
          title="Invite friends"
          description="Share Drops and earn together."
          onPress={() => {}}
        />
      </View>
    </ScrollView>
  );
}

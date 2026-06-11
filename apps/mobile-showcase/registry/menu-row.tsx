import { MenuRow } from "@flama/design-system-mobile/menu-row";
import { Text } from "@flama/design-system-mobile/text";
import {
  ArrowLeftRight,
  CreditCard,
  FileText,
  HandCoins,
  Sparkles,
} from "lucide-react-native";
import * as React from "react";
import { ScrollView, View } from "react-native";

export default function MenuRowScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">More menu</Text>
        <View>
          <MenuRow
            icon={CreditCard}
            label="Buy XRP"
            sub="Card or bank transfer"
            onPress={() => {}}
          />
          <MenuRow
            icon={HandCoins}
            label="Request money"
            sub="Ask someone to pay you"
            onPress={() => {}}
          />
          <MenuRow
            icon={ArrowLeftRight}
            label="Convert"
            sub="Between your tokens"
            onPress={() => {}}
          />
          <MenuRow
            icon={FileText}
            label="Statements"
            sub="Export your activity"
            onPress={() => {}}
          />
          <MenuRow
            icon={Sparkles}
            label="Rewards"
            sub="DropPoints · coming soon"
            onPress={() => {}}
          />
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Without sub
        </Text>
        <MenuRow icon={FileText} label="Terms of service" onPress={() => {}} />
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Inside a sheet card
        </Text>
        <View className="rounded-2xl border border-border bg-card p-2">
          <MenuRow
            icon={CreditCard}
            label="Buy XRP"
            sub="Card or bank transfer"
            onPress={() => {}}
          />
          <MenuRow
            icon={ArrowLeftRight}
            label="Convert"
            sub="Between your tokens"
            onPress={() => {}}
          />
        </View>
      </View>
    </ScrollView>
  );
}

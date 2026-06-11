import { DetailList, DetailRow } from "@flama/design-system-mobile/detail-list";
import { Text } from "@flama/design-system-mobile/text";
import * as React from "react";
import { ScrollView, View } from "react-native";

export default function DetailListScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Transaction detail · card
        </Text>
        <DetailList card>
          <DetailRow
            label="Status"
            value={
              <View className="flex-row items-center gap-1.5">
                <View className="h-[7px] w-[7px] rounded-full bg-positive" />
                <Text className="text-sm font-semibold text-foreground">
                  Settled
                </Text>
              </View>
            }
          />
          <DetailRow label="Submitted" value="17:31:02" mono />
          <DetailRow label="Validated" value="17:31:06" mono />
          <DetailRow label="Ledger index" value="86,421,907" mono />
          <DetailRow label="Network fee" value="0.00001 XRP" mono />
        </DetailList>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Review card · send flow
        </Text>
        <DetailList card>
          <DetailRow label="From" value="Personal · XRP Ledger" />
          <DetailRow label="Network" value="XRP Ledger" />
          <DetailRow label="Fee" value="0.00001 XRP" mono />
          <DetailRow label="Note" value="Dinner split" />
        </DetailList>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Plain · rate & fee
        </Text>
        <DetailList>
          <DetailRow label="Rate" value="1 XRP ≈ $0.6184" mono />
          <DetailRow label="Network fee" value="0.00001 XRP" mono />
        </DetailList>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Accent & sub
        </Text>
        <DetailList card>
          <DetailRow
            label="Amount"
            value="+14.50 XRP"
            sub="≈ $8.97"
            mono
            accent
          />
          <DetailRow label="To" value="rPLkM9…uA6x" sub="XRP Ledger" mono />
          <DetailRow label="Hash" value="0x9f3c…a1b2" mono accent />
        </DetailList>
      </View>
    </ScrollView>
  );
}

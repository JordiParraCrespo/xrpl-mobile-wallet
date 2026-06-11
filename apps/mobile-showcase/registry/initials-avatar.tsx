import { ChainBadge } from "@flama/design-system-mobile/chain-badge";
import { InitialsAvatar } from "@flama/design-system-mobile/initials-avatar";
import { Text } from "@flama/design-system-mobile/text";
import * as React from "react";
import { ScrollView, View } from "react-native";

const CONTACTS = [
  "Maria Gutiérrez",
  "Coffee Collective",
  "Liam Ortega",
  "Aiko Tanaka",
  "Pedro Alves",
  "Nina Vasquez",
];

export default function InitialsAvatarScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Sizes</Text>
        <View className="flex-row flex-wrap items-end gap-3">
          <InitialsAvatar name="Maria Gutiérrez" size="sm" />
          <InitialsAvatar name="Maria Gutiérrez" size="md" />
          <InitialsAvatar name="Maria Gutiérrez" size="lg" />
          <InitialsAvatar name="Maria Gutiérrez" size="xl" />
          <InitialsAvatar name="Maria Gutiérrez" size={96} />
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Deterministic palette
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {CONTACTS.map((name) => (
            <InitialsAvatar key={name} name={name} size="lg" />
          ))}
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Color override
        </Text>
        <View className="flex-row flex-wrap gap-3">
          <InitialsAvatar name="Maria Gutiérrez" size="lg" color="#5b41dd" />
          <InitialsAvatar name="Coffee Collective" size="lg" color="#0ca678" />
          <InitialsAvatar name="Liam Ortega" size="lg" color="#e8590c" />
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          With badge
        </Text>
        <View className="flex-row flex-wrap items-end gap-4">
          <InitialsAvatar
            name="Maria Gutiérrez"
            size="lg"
            badge={<ChainBadge kind="xrp" size={18} />}
          />
          <InitialsAvatar
            name="Pedro Alves"
            size="lg"
            badge={<ChainBadge kind="evm" size={18} />}
          />
          <InitialsAvatar
            name="Aiko Tanaka"
            size="xl"
            badge={
              <ChainBadge kind="letter" label="R" color="#0ca678" size={24} />
            }
          />
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Single word / empty
        </Text>
        <View className="flex-row flex-wrap gap-3">
          <InitialsAvatar name="Binance" size="md" />
          <InitialsAvatar name="" size="md" />
        </View>
      </View>
    </ScrollView>
  );
}

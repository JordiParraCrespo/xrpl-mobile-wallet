import { AssistantAvatar } from "@flama/design-system-mobile/assistant-avatar";
import { Text } from "@flama/design-system-mobile/text";
import * as React from "react";
import { ScrollView, View } from "react-native";
import { HeroSurface } from "../lib/hero-surface";

const DEWY = require("../assets/dewy.png");

export default function AssistantAvatarScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Sizes</Text>
        <View className="flex-row flex-wrap items-end gap-3">
          <AssistantAvatar source={DEWY} size={32} />
          <AssistantAvatar source={DEWY} size={44} />
          <AssistantAvatar source={DEWY} size={56} />
          <AssistantAvatar source={DEWY} size={72} />
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          With ring (dark surfaces)
        </Text>
        <HeroSurface>
          <View className="flex-row items-end gap-3">
            <AssistantAvatar source={DEWY} size={44} ring />
            <AssistantAvatar source={DEWY} size={56} ring />
          </View>
        </HeroSurface>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Assistant row
        </Text>
        <View className="flex-row items-center gap-3 rounded-xl border border-border bg-card p-4">
          <AssistantAvatar source={DEWY} size={46} />
          <View className="flex-1">
            <Text className="text-[15px] font-semibold text-foreground">
              Dewy
            </Text>
            <Text className="text-sm text-muted-foreground">
              Ask me anything about your wallet
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

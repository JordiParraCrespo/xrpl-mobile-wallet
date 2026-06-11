import { ActionButton } from "@flama/design-system-mobile/action-button";
import { Icon } from "@flama/design-system-mobile/icon";
import { Text } from "@flama/design-system-mobile/text";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  Ellipsis,
  Plus,
} from "lucide-react-native";
import * as React from "react";
import { ScrollView, View } from "react-native";
import { HeroSurface } from "../lib/hero-surface";

export default function ActionButtonScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Soft · light surfaces
        </Text>
        <View className="flex-row justify-between px-2.5">
          <ActionButton
            variant="brand"
            label="Add money"
            icon={<Icon as={Plus} className="size-5 text-brand-foreground" />}
          />
          <ActionButton
            variant="soft"
            label="Receive"
            icon={
              <Icon as={ArrowDownLeft} className="size-5 text-foreground" />
            }
          />
          <ActionButton
            variant="soft"
            label="Swap"
            icon={
              <Icon as={ArrowLeftRight} className="size-5 text-foreground" />
            }
          />
          <ActionButton
            variant="soft"
            label="More"
            icon={<Icon as={Ellipsis} className="size-5 text-foreground" />}
          />
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Glass · over the hero
        </Text>
        <HeroSurface>
          <View className="w-full flex-row justify-between px-2.5">
            <ActionButton
              variant="brand"
              label="Add money"
              icon={<Icon as={Plus} className="size-5 text-brand-foreground" />}
            />
            <ActionButton
              variant="glass"
              label="Receive"
              icon={<Icon as={ArrowDownLeft} className="size-5 text-white" />}
            />
            <ActionButton
              variant="glass"
              label="Swap"
              icon={<Icon as={ArrowLeftRight} className="size-5 text-white" />}
            />
            <ActionButton
              variant="glass"
              label="More"
              icon={<Icon as={Ellipsis} className="size-5 text-white" />}
            />
          </View>
        </HeroSurface>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Disabled</Text>
        <View className="flex-row gap-6">
          <ActionButton
            variant="soft"
            label="Swap"
            disabled
            icon={
              <Icon as={ArrowLeftRight} className="size-5 text-foreground" />
            }
          />
        </View>
      </View>
    </ScrollView>
  );
}

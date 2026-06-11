import { Icon } from "@flama/design-system-mobile/icon";
import { IconButton } from "@flama/design-system-mobile/icon-button";
import { Text } from "@flama/design-system-mobile/text";
import {
  ArrowDownLeft,
  Bell,
  Plus,
  QrCode,
  Search,
  Send,
  Settings,
  X,
} from "lucide-react-native";
import * as React from "react";
import { ScrollView, View } from "react-native";

export default function IconButtonScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Variants</Text>
        <View className="flex-row flex-wrap items-center gap-3">
          <IconButton variant="soft">
            <Icon as={Search} size={19} />
          </IconButton>
          <IconButton variant="solid">
            <Icon as={Plus} size={19} />
          </IconButton>
          <IconButton variant="outline">
            <Icon as={Settings} size={19} />
          </IconButton>
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Sizes</Text>
        <View className="flex-row flex-wrap items-center gap-3">
          <IconButton variant="soft" size="sm">
            <Icon as={X} size={16} />
          </IconButton>
          <IconButton variant="soft" size="md">
            <Icon as={Bell} size={19} />
          </IconButton>
          <IconButton variant="soft" size="lg">
            <Icon as={QrCode} size={24} />
          </IconButton>
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Glass · hero actions
        </Text>
        <View className="items-center gap-4 rounded-xl bg-[#0b0b0f] p-5">
          <View className="flex-row gap-4">
            <IconButton variant="glass" size="lg">
              <Icon as={Send} size={22} />
            </IconButton>
            <IconButton variant="glass" size="lg">
              <Icon as={ArrowDownLeft} size={22} />
            </IconButton>
            <IconButton variant="glass" size="lg">
              <Icon as={QrCode} size={22} />
            </IconButton>
          </View>
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Disabled</Text>
        <View className="flex-row gap-3">
          <IconButton variant="solid" disabled>
            <Icon as={Plus} size={19} />
          </IconButton>
        </View>
      </View>
    </ScrollView>
  );
}

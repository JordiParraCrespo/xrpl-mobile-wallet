import { Icon } from "@flama/design-system-mobile/icon";
import { TabBar, type TabBarItem } from "@flama/design-system-mobile/tab-bar";
import { Text } from "@flama/design-system-mobile/text";
import {
  ArrowLeftRight,
  ChartNoAxesColumn,
  House,
  Sparkles,
} from "lucide-react-native";
import * as React from "react";
import { ScrollView, View } from "react-native";

const ITEMS: TabBarItem[] = [
  { key: "home", label: "Home", icon: House },
  { key: "market", label: "Market", icon: ChartNoAxesColumn },
  { key: "payments", label: "Payments", icon: ArrowLeftRight },
  { key: "points", label: "DropPoints", icon: Sparkles },
];

function AssistantAccessory() {
  return (
    <View className="h-[42px] w-[42px] items-center justify-center rounded-full bg-brand">
      <Icon as={Sparkles} size={20} className="text-brand-foreground" />
    </View>
  );
}

export default function TabBarScreen() {
  const [active, setActive] = React.useState("home");
  const [glassActive, setGlassActive] = React.useState("points");
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Light · interactive
        </Text>
        <TabBar items={ITEMS} activeKey={active} onChange={setActive} />
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          With assistant accessory
        </Text>
        <TabBar
          items={ITEMS}
          activeKey={active}
          onChange={setActive}
          accessory={<AssistantAccessory />}
        />
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Glass · over dark surface
        </Text>
        <View className="rounded-xl bg-[#0b0b0f] p-5">
          <TabBar
            glass
            items={ITEMS}
            activeKey={glassActive}
            onChange={setGlassActive}
            accessory={<AssistantAccessory />}
          />
        </View>
      </View>
    </ScrollView>
  );
}

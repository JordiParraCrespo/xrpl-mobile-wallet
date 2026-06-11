import { GlassPanel } from "@flama/design-system-mobile/glass-panel";
import { Icon } from "@flama/design-system-mobile/icon";
import { IconButton } from "@flama/design-system-mobile/icon-button";
import { InitialsAvatar } from "@flama/design-system-mobile/initials-avatar";
import { Text } from "@flama/design-system-mobile/text";
import { Bell, Search } from "lucide-react-native";
import { Pressable, View } from "react-native";

/**
 * Home header: avatar (→ profile), a frosted search pill (→ search) and the
 * notifications bell with its unread dot. Glass controls sit over the gradient
 * hero, per the Drops "Dark" home.
 */
export function HomeHeader({
  onProfile,
  onSearch,
  onNotifications,
}: {
  onProfile: () => void;
  onSearch: () => void;
  onNotifications: () => void;
}) {
  return (
    <View className="flex-row items-center gap-3 px-5">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Profile"
        onPress={onProfile}
        className="active:opacity-80"
      >
        <InitialsAvatar name="Jordan Pierce" size="md" color="#5b41dd" />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Search"
        onPress={onSearch}
        className="h-11 flex-1 active:opacity-80"
      >
        <GlassPanel
          variant="on-dark"
          padded={false}
          className="h-11 flex-row items-center gap-2.5 rounded-full px-4"
        >
          <Icon as={Search} size={18} className="text-white/60" />
          <Text className="text-[15px] text-white/60">Search</Text>
        </GlassPanel>
      </Pressable>

      <IconButton
        variant="glass"
        accessibilityLabel="Notifications"
        onPress={onNotifications}
      >
        <Icon as={Bell} size={20} />
        <View className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-[1.5px] border-[#3a2a86] bg-destructive" />
      </IconButton>
    </View>
  );
}

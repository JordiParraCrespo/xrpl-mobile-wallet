import { Icon } from "@flama/design-system-mobile/icon";
import { Switch } from "@flama/design-system-mobile/switch";
import { Text } from "@flama/design-system-mobile/text";
import { ChevronRight, type LucideIcon } from "lucide-react-native";
import { Pressable, View } from "react-native";
import type { ProfileTheme } from "./profile-theme";

type SettingsRowProps = {
  theme: ProfileTheme;
  /** Leading disc icon. */
  icon: LucideIcon;
  label: string;
  /** Trailing value text (shown with a chevron). Ignored for toggle rows. */
  value?: string;
  /** Render the row destructive (red), e.g. Sign out. */
  danger?: boolean;
  /** Drop the bottom divider (last row in a section). */
  last?: boolean;
  onPress?: () => void;
  /** Render a trailing Switch instead of value + chevron. */
  toggle?: boolean;
  toggleOn?: boolean;
  onToggle?: (next: boolean) => void;
  toggleDisabled?: boolean;
};

/**
 * A single settings row inside a glass section — a 34px disc icon, a label,
 * and either a value + chevron or a trailing Switch. Mirrors `PrRow` from the
 * Drops profile design (profile/profile-app.jsx); divider-separated rather
 * than individually rounded.
 *
 * Layout primitives (`flex-row`, `flex-1`, centring) are expressed as NativeWind
 * classes rather than inline `style` flexbox: under NativeWind v4 an inline
 * `style={{ flexDirection: 'row' }}` is clobbered back to the RN `column`
 * default, which would stack the icon, label and value vertically. Theme-driven
 * colours and sizes stay in `style` since they're dynamic.
 */
export function SettingsRow({
  theme,
  icon,
  label,
  value,
  danger,
  last,
  onPress,
  toggle,
  toggleOn,
  onToggle,
  toggleDisabled,
}: SettingsRowProps) {
  const fg = danger ? theme.danger : theme.fg;

  const content = (
    <>
      <View
        className="items-center justify-center rounded-full"
        style={{ width: 34, height: 34, backgroundColor: theme.iconBg }}
      >
        <Icon as={icon} size={18} color={fg} />
      </View>
      <Text
        numberOfLines={1}
        className="font-sans flex-1"
        style={{ fontSize: 15.5, fontWeight: "500", color: fg }}
      >
        {label}
      </Text>
      {toggle ? (
        <Switch
          checked={!!toggleOn}
          onCheckedChange={(next) => onToggle?.(next)}
          disabled={toggleDisabled}
        />
      ) : (
        <>
          {value ? (
            <Text
              className="font-sans"
              style={{ fontSize: 14.5, color: theme.dim }}
            >
              {value}
            </Text>
          ) : null}
          <Icon as={ChevronRight} size={18} color={theme.faint} />
        </>
      )}
    </>
  );

  const rowStyle = {
    gap: 13,
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderBottomWidth: last ? 0 : 1,
    borderBottomColor: theme.divider,
  };

  // Toggle rows are not pressable as a whole — only the Switch is interactive.
  if (toggle || !onPress) {
    return (
      <View className="flex-row items-center" style={rowStyle}>
        {content}
      </View>
    );
  }

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View
          className="flex-row items-center"
          style={[rowStyle, pressed && { opacity: 0.6 }]}
        >
          {content}
        </View>
      )}
    </Pressable>
  );
}

import { GlassPanel } from "@flama/design-system-mobile/glass-panel";
import { Icon } from "@flama/design-system-mobile/icon";
import { Text } from "@flama/design-system-mobile/text";
import { User } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import type { ProfileTheme } from "./profile-theme";

// The profile avatar's emerald wash (150deg, #19c39a → #0c8f6c), lifted from
// the design. SVG can't read CSS vars, so the stops are inlined.
const AVATAR_FROM = "#19c39a";
const AVATAR_TO = "#0c8f6c";

/** Up-to-two-letter initials from a display name (e.g. "Jordan Pierce" → "JP"). */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return (
    parts
      .map((p) => p[0] ?? "")
      .join("")
      .toUpperCase() || "?"
  );
}

function ProfileAvatar({ name }: { name: string }) {
  return (
    <View
      className="items-center justify-center overflow-hidden rounded-full"
      style={{
        width: 88,
        height: 88,
        borderWidth: 3,
        borderColor: "rgba(255,255,255,0.35)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.22,
        shadowRadius: 15,
        elevation: 8,
      }}
    >
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient
            id="profile-avatar"
            x1="0%"
            y1="0%"
            x2="50%"
            y2="100%"
          >
            <Stop offset="0" stopColor={AVATAR_FROM} />
            <Stop offset="1" stopColor={AVATAR_TO} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#profile-avatar)" />
      </Svg>
      <Text
        className="font-sans text-white"
        style={{ fontSize: 32, fontWeight: "600" }}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
}

type ProfileIdentityProps = {
  theme: ProfileTheme;
  name: string;
  handle: string;
  onEditPress?: () => void;
};

/**
 * The centred identity block at the top of the profile: emerald avatar disc
 * with initials, the serif display name, the derived `@handle`, and a glass
 * "Edit profile" pill. Mirrors the identity column in the Drops profile design.
 */
export function ProfileIdentity({
  theme,
  name,
  handle,
  onEditPress,
}: ProfileIdentityProps) {
  const { t } = useTranslation();

  return (
    <View className="items-center" style={{ paddingBottom: 6 }}>
      <ProfileAvatar name={name} />
      <Text
        numberOfLines={1}
        className="font-display"
        style={{
          fontSize: 26,
          // Refero's ascent (~1.105em) overshoots a tight line box; without
          // explicit leading iOS shears the glyph tops. ~1.23em clears them.
          lineHeight: 32,
          color: theme.fg,
          letterSpacing: -0.3,
          marginTop: 14,
        }}
      >
        {name}
      </Text>
      <Text
        className="font-mono"
        style={{ fontSize: 13.5, color: theme.dim, marginTop: 3 }}
      >
        {handle}
      </Text>

      <Pressable onPress={onEditPress} style={{ marginTop: 14 }}>
        {({ pressed }) => (
          <GlassPanel
            padded={false}
            intensity={theme.blur}
            tint={theme.blurTint}
            className="flex-row items-center rounded-full"
            style={{
              gap: 7,
              paddingVertical: 9,
              paddingHorizontal: 18,
              backgroundColor: theme.glassBg,
              borderColor: theme.glassBorder,
              opacity: pressed ? 0.7 : 1,
            }}
          >
            <Icon as={User} size={16} color={theme.fg} />
            <Text
              className="font-sans"
              style={{ fontSize: 14, fontWeight: "600", color: theme.fg }}
            >
              {t("profile.editProfile")}
            </Text>
          </GlassPanel>
        )}
      </Pressable>
    </View>
  );
}

import * as React from "react";
import { Text as RNText, View } from "react-native";
import { cn } from "../../lib/utils";

// InitialsAvatar — contact / account avatar. Renders initials on a
// deterministic tinted disc (the colourful contact circles in the
// activity list). Optional small overlay badge bottom-right for a
// payment-rail / provider mark. Initials are crisp sans semibold —
// never the display serif.
const PALETTE = [
  "#5b41dd",
  "#12b886",
  "#f59f00",
  "#f0444b",
  "#4287f5",
  "#7d6ff2",
  "#0ca678",
  "#e8590c",
];

const SIZES = { sm: 32, md: 44, lg: 56, xl: 72 } as const;

function pickColor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return PALETTE[h % PALETTE.length];
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return (
    parts
      .map((p) => p[0] ?? "")
      .join("")
      .toUpperCase() || "?"
  );
}

type InitialsAvatarProps = React.ComponentProps<typeof View> & {
  name: string;
  size?: keyof typeof SIZES | number;
  /** Override the deterministic palette color. */
  color?: string;
  /** Small overlay disc bottom-right (e.g. a chain / provider mark). */
  badge?: React.ReactNode;
};

function InitialsAvatar({
  name,
  size = "md",
  color,
  badge,
  className,
  ...props
}: InitialsAvatarProps) {
  const px = typeof size === "number" ? size : (SIZES[size] ?? 44);
  const background = color ?? pickColor(name);
  const fontSize = Math.round(px * 0.38);
  const badgePx = Math.round(px * 0.42);
  return (
    <View
      className={cn("relative shrink-0", className)}
      style={{ width: px, height: px }}
      {...props}
    >
      <View
        className="h-full w-full items-center justify-center overflow-hidden rounded-full"
        style={{ backgroundColor: background }}
      >
        <RNText
          className="font-sans font-semibold text-white"
          style={{ fontSize, letterSpacing: 0.2 }}
        >
          {getInitials(name)}
        </RNText>
      </View>
      {badge ? (
        <View
          className="bg-card border-background absolute -bottom-0.5 -right-0.5 items-center justify-center overflow-hidden rounded-full border-2"
          style={{ width: badgePx, height: badgePx }}
        >
          {badge}
        </View>
      ) : null}
    </View>
  );
}

export type { InitialsAvatarProps };
export { InitialsAvatar };

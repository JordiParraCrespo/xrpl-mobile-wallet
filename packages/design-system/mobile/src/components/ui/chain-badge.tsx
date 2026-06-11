import * as React from "react";
import { Text as RNText, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";
import { cn } from "../../lib/utils";
import { AssetIcon } from "./asset-icon";

// ChainBadge — circular network disc used in account lists and flow
// success screens. `xrp` is the dark XRP asset disc, `evm` is the
// indigo-gradient disc with the Ethereum-style diamond glyph, and
// `letter` is a solid tinted disc with a single bold initial.
// Gradient + glyph are SVG, so colors are design constants (SVG can't
// read CSS variables).
const EVM_GRADIENT_FROM = "#6f59ea";
const EVM_GRADIENT_TO = "#3c2c93";

type ChainBadgeProps = React.ComponentProps<typeof View> & {
  kind: "xrp" | "evm" | "letter";
  /** Letter shown on `letter` badges (first character is used). */
  label?: string;
  /** Disc color for `letter` badges. */
  color?: string;
  size?: number;
};

function EvmDisc({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Defs>
        <LinearGradient id="evm-disc" x1="0%" y1="0%" x2="50%" y2="100%">
          <Stop offset="0" stopColor={EVM_GRADIENT_FROM} />
          <Stop offset="1" stopColor={EVM_GRADIENT_TO} />
        </LinearGradient>
      </Defs>
      <Circle cx={24} cy={24} r={24} fill="url(#evm-disc)" />
      {/* Ethereum-style diamond glyph, white on the disc. */}
      <G transform="translate(12 12)">
        <Path d="M12 2 5 12.2l7 4.1 7-4.1z" fill="#fff" fillOpacity={0.92} />
        <Path d="M12 2 5 12.2l7-3.1z" fill="#fff" fillOpacity={0.6} />
        <Path d="M12 17.8 5 13.6 12 22l7-8.4z" fill="#fff" fillOpacity={0.92} />
        <Path d="M12 17.8 5 13.6l7 1.9z" fill="#fff" fillOpacity={0.6} />
      </G>
    </Svg>
  );
}

function ChainBadge({
  kind,
  label,
  color = "#5b41dd",
  size = 40,
  className,
  ...props
}: ChainBadgeProps) {
  if (kind === "xrp") {
    return (
      <AssetIcon symbol="XRP" size={size} className={className} {...props} />
    );
  }
  if (kind === "evm") {
    return (
      <View
        className={cn("shrink-0 overflow-hidden rounded-full", className)}
        style={{ width: size, height: size }}
        {...props}
      >
        <EvmDisc size={size} />
      </View>
    );
  }
  return (
    <View
      className={cn(
        "shrink-0 items-center justify-center overflow-hidden rounded-full",
        className,
      )}
      style={{ width: size, height: size, backgroundColor: color }}
      {...props}
    >
      <RNText
        className="font-sans font-bold text-white"
        style={{ fontSize: Math.round(size * 0.42) }}
      >
        {(label ?? "?").slice(0, 1).toUpperCase()}
      </RNText>
    </View>
  );
}

export type { ChainBadgeProps };
export { ChainBadge };

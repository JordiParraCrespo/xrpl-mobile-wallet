import * as React from "react";
import {
  Image,
  type ImageSourcePropType,
  Text as RNText,
  View,
} from "react-native";
import { cn } from "../../lib/utils";

// AssetIcon — circular token / asset badge. Shows an image when given,
// else a symbol glyph on a tinted disc. Known assets get a sensible
// default color; everything else falls back to the brand indigo.
// Glyphs render in crisp sans bold (never the display serif).
const KNOWN_ASSETS: Record<string, { background: string; label: string }> = {
  XRP: { background: "#14161a", label: "XRP" },
  USD: { background: "#0ca678", label: "$" },
  EUR: { background: "#4287f5", label: "€" },
  RLUSD: { background: "#0ca678", label: "R$" },
  BTC: { background: "#f7931a", label: "₿" },
  ETH: { background: "#627eea", label: "Ξ" },
};

const BRAND_BACKGROUND = "#5b41dd";

type AssetIconProps = React.ComponentProps<typeof View> & {
  symbol?: string;
  source?: ImageSourcePropType;
  size?: number;
  color?: string;
};

function AssetIcon({
  symbol = "XRP",
  source,
  size = 44,
  color,
  className,
  ...props
}: AssetIconProps) {
  const known = KNOWN_ASSETS[symbol.toUpperCase()];
  const label = known?.label ?? symbol.slice(0, 3).toUpperCase();
  const background = color ?? known?.background ?? BRAND_BACKGROUND;
  const fontSize = Math.round(
    size * (label.length > 2 ? 0.3 : label.length > 1 ? 0.4 : 0.46),
  );
  return (
    <View
      className={cn(
        "shrink-0 items-center justify-center overflow-hidden rounded-full",
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: source ? undefined : background,
      }}
      {...props}
    >
      {source ? (
        <Image
          source={source}
          style={{ width: size, height: size }}
          resizeMode="cover"
        />
      ) : (
        <RNText
          className="font-sans font-bold text-white"
          style={{ fontSize, letterSpacing: -0.3 }}
        >
          {label}
        </RNText>
      )}
    </View>
  );
}

export type { AssetIconProps };
export { AssetIcon };

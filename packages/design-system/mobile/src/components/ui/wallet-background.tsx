import * as React from "react";
import { StyleSheet, View } from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { cn } from "../../lib/utils";

// WalletBackground — the signature Drops "glass-on-gradient" backdrop shared
// by the premium wallet shell (Home, Profile, Market, …). It reproduces the
// CSS multi-layer gradient from the design (home-parts2 · WALLET_BG_*): a
// vertical base wash with a handful of soft radial colour blooms on top.
//
// Modelled in a 100×100 user space with `preserveAspectRatio="none"`, so the
// percentage-based stops stretch to fill any screen exactly like the CSS
// background does. Children render above the gradient.

type RadialLayer = {
  /** Center + ellipse radii, as percentages of the box (0–100). */
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  /** Bloom colour as an `r,g,b` triplet. */
  rgb: string;
  /** Alpha at the center. */
  alpha: number;
  /** Offset (0–1) at which the bloom has fully faded out. */
  fade: number;
};

type GradientTheme = {
  /** Vertical base wash: `[offset, color]` stops, top → bottom. */
  base: ReadonlyArray<readonly [string, string]>;
  /** Colour blooms, painted top-most first (matching CSS layer order). */
  radials: readonly RadialLayer[];
};

// Indigo-accent default, lifted verbatim from the design's dark wallet shell.
const DARK: GradientTheme = {
  base: [
    ["0", "#6f59ea"],
    ["0.16", "#4a33ba"],
    ["0.3", "#160f2b"],
    ["0.46", "#08080b"],
    ["1", "#08080b"],
  ],
  radials: [
    {
      cx: 15,
      cy: 2,
      rx: 70,
      ry: 42,
      rgb: "123,111,242",
      alpha: 0.95,
      fade: 0.6,
    },
    {
      cx: 99,
      cy: -8,
      rx: 66,
      ry: 40,
      rgb: "176,107,255",
      alpha: 0.95,
      fade: 0.58,
    },
    {
      cx: 58,
      cy: 14,
      rx: 54,
      ry: 30,
      rgb: "255,148,92",
      alpha: 0.55,
      fade: 0.58,
    },
    {
      cx: 106,
      cy: 26,
      rx: 70,
      ry: 38,
      rgb: "232,150,255",
      alpha: 0.45,
      fade: 0.6,
    },
    {
      cx: 80,
      cy: -8,
      rx: 120,
      ry: 36,
      rgb: "255,255,255",
      alpha: 0.22,
      fade: 0.52,
    },
  ],
};

const LIGHT: GradientTheme = {
  base: [
    ["0", "#efeafe"],
    ["0.18", "#f3eefb"],
    ["0.42", "#ffffff"],
    ["1", "#ffffff"],
  ],
  radials: [
    {
      cx: 14,
      cy: 0,
      rx: 70,
      ry: 42,
      rgb: "123,111,242",
      alpha: 0.34,
      fade: 0.6,
    },
    {
      cx: 100,
      cy: -8,
      rx: 64,
      ry: 40,
      rgb: "176,107,255",
      alpha: 0.34,
      fade: 0.58,
    },
    {
      cx: 58,
      cy: 12,
      rx: 56,
      ry: 30,
      rgb: "255,148,92",
      alpha: 0.3,
      fade: 0.6,
    },
    {
      cx: 106,
      cy: 24,
      rx: 70,
      ry: 38,
      rgb: "232,150,255",
      alpha: 0.32,
      fade: 0.62,
    },
  ],
};

const THEMES = { dark: DARK, light: LIGHT } as const;

type WalletBackgroundProps = React.ComponentProps<typeof View> & {
  /** Which gradient to render. Defaults to the dark indigo shell. */
  variant?: keyof typeof THEMES;
};

function WalletBackground({
  variant = "dark",
  className,
  children,
  ...props
}: WalletBackgroundProps) {
  const theme = THEMES[variant];
  return (
    <View className={cn("flex-1", className)} {...props}>
      <Svg
        style={StyleSheet.absoluteFill}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        pointerEvents="none"
      >
        <Defs>
          <LinearGradient id="wallet-base" x1="0" y1="0" x2="0" y2="1">
            {theme.base.map(([offset, color]) => (
              <Stop key={offset} offset={offset} stopColor={color} />
            ))}
          </LinearGradient>
          {theme.radials.map((r, i) => (
            <RadialGradient
              // biome-ignore lint/suspicious/noArrayIndexKey: layers are static
              key={i}
              id={`wallet-bloom-${variant}-${i}`}
              cx={r.cx}
              cy={r.cy}
              rx={r.rx}
              ry={r.ry}
              fx={r.cx}
              fy={r.cy}
              gradientUnits="userSpaceOnUse"
            >
              <Stop
                offset="0"
                stopColor={`rgb(${r.rgb})`}
                stopOpacity={r.alpha}
              />
              <Stop
                offset={r.fade}
                stopColor={`rgb(${r.rgb})`}
                stopOpacity={0}
              />
            </RadialGradient>
          ))}
        </Defs>

        <Rect x="0" y="0" width="100" height="100" fill="url(#wallet-base)" />
        {/* Paint blooms back-to-front so the first design layer lands on top. */}
        {theme.radials
          .map((_, i) => i)
          .reverse()
          .map((i) => (
            <Rect
              // biome-ignore lint/suspicious/noArrayIndexKey: layers are static
              key={i}
              x="0"
              y="0"
              width="100"
              height="100"
              fill={`url(#wallet-bloom-${variant}-${i})`}
            />
          ))}
      </Svg>
      {children}
    </View>
  );
}

export type { WalletBackgroundProps };
export { WalletBackground };

import { useColorScheme } from "nativewind";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import Svg, {
  Defs,
  Ellipse,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { cn } from "../../lib/utils";

// GradientBackdrop — the signature Drops "aurora": a soft base wash with a
// handful of brand-tinted radial blobs bleeding in from the top edges. It's
// the shared chrome behind the wallet's hero screens (Market, and Home /
// secondary pages as they're built), so it lives in the design system rather
// than any one feature. Painted with react-native-svg since RN has no CSS
// radial-gradient; the viewBox is stretched edge-to-edge so the blob
// coordinates read as percentages of the screen, matching the design source.
type Blob = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  color: string;
  opacity: number;
  /** Fraction of the radius where the colour has fully faded out. */
  fade: number;
};

type Stops = { offset: number; color: string }[];

// Light theme — translucent blobs over a near-white violet wash.
const LIGHT_BLOBS: Blob[] = [
  { cx: 14, cy: 0, rx: 70, ry: 42, color: "#7b6ff2", opacity: 0.34, fade: 0.6 },
  {
    cx: 100,
    cy: -8,
    rx: 64,
    ry: 40,
    color: "#b06bff",
    opacity: 0.34,
    fade: 0.58,
  },
  { cx: 58, cy: 12, rx: 56, ry: 30, color: "#ff945c", opacity: 0.3, fade: 0.6 },
  {
    cx: 106,
    cy: 24,
    rx: 70,
    ry: 38,
    color: "#e896ff",
    opacity: 0.32,
    fade: 0.62,
  },
];
const LIGHT_BASE: Stops = [
  { offset: 0, color: "#efeafe" },
  { offset: 0.18, color: "#f3eefb" },
  { offset: 0.42, color: "#ffffff" },
  { offset: 1, color: "#ffffff" },
];

// Dark theme — saturated blobs over a brand-to-ink vertical wash.
const DARK_BLOBS: Blob[] = [
  { cx: 15, cy: 2, rx: 70, ry: 42, color: "#7b6ff2", opacity: 0.95, fade: 0.6 },
  {
    cx: 99,
    cy: -8,
    rx: 66,
    ry: 40,
    color: "#b06bff",
    opacity: 0.95,
    fade: 0.58,
  },
  {
    cx: 58,
    cy: 14,
    rx: 54,
    ry: 30,
    color: "#ff945c",
    opacity: 0.55,
    fade: 0.58,
  },
  {
    cx: 106,
    cy: 26,
    rx: 70,
    ry: 38,
    color: "#e896ff",
    opacity: 0.45,
    fade: 0.6,
  },
  {
    cx: 80,
    cy: -8,
    rx: 120,
    ry: 36,
    color: "#ffffff",
    opacity: 0.22,
    fade: 0.52,
  },
];
const DARK_BASE: Stops = [
  { offset: 0, color: "#6f59ea" },
  { offset: 0.16, color: "#4a33ba" },
  { offset: 0.3, color: "#160f2b" },
  { offset: 0.46, color: "#08080b" },
  { offset: 1, color: "#08080b" },
];

type GradientBackdropProps = React.ComponentProps<typeof View> & {
  /** Force a palette; defaults to the active color scheme. */
  scheme?: "light" | "dark";
};

function GradientBackdrop({
  scheme,
  className,
  ...props
}: GradientBackdropProps) {
  const { colorScheme } = useColorScheme();
  const dark = (scheme ?? colorScheme) === "dark";
  const blobs = dark ? DARK_BLOBS : LIGHT_BLOBS;
  const base = dark ? DARK_BASE : LIGHT_BASE;

  return (
    <View
      pointerEvents="none"
      className={cn("absolute inset-0", className)}
      {...props}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <LinearGradient id="gb-base" x1="0" y1="0" x2="0" y2="1">
            {base.map((s) => (
              <Stop
                key={s.offset}
                offset={s.offset}
                stopColor={s.color}
                stopOpacity={1}
              />
            ))}
          </LinearGradient>
          {blobs.map((b, i) => (
            <RadialGradient
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed blob list
              key={i}
              id={`gb-blob-${i}`}
              cx="50%"
              cy="50%"
              r="50%"
            >
              <Stop offset="0" stopColor={b.color} stopOpacity={b.opacity} />
              <Stop offset={b.fade} stopColor={b.color} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill="url(#gb-base)" />
        {blobs.map((b, i) => (
          <Ellipse
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed blob list
            key={i}
            cx={b.cx}
            cy={b.cy}
            rx={b.rx}
            ry={b.ry}
            fill={`url(#gb-blob-${i})`}
          />
        ))}
      </Svg>
    </View>
  );
}

export type { GradientBackdropProps };
export { GradientBackdrop };

import { StyleSheet } from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

/**
 * The signature Drops "Dark" home backdrop (home-app.jsx `H_THEMES.gradient`):
 * a vertical indigo→ink wash with violet and magenta glows bleeding in from the
 * top corners, so the balance hero floats on brand color and the cards below
 * settle onto near-black. Rendered with SVG (no native gradient dep needed).
 */
export function HomeBackground() {
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
      <Defs>
        {/* brand-500 → brand-700 → ink, matching the design's linear stops */}
        <LinearGradient id="h-base" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#6f59ea" />
          <Stop offset="0.16" stopColor="#4a33ba" />
          <Stop offset="0.3" stopColor="#160f2b" />
          <Stop offset="0.46" stopColor="#08080b" />
          <Stop offset="1" stopColor="#08080b" />
        </LinearGradient>
        <RadialGradient id="h-violet" cx="0.15" cy="0.02" r="0.7">
          <Stop offset="0" stopColor="#7b6ff2" stopOpacity={0.95} />
          <Stop offset="0.6" stopColor="#7b6ff2" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="h-magenta" cx="0.99" cy="-0.08" r="0.66">
          <Stop offset="0" stopColor="#b06bff" stopOpacity={0.9} />
          <Stop offset="0.58" stopColor="#b06bff" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="h-warm" cx="0.58" cy="0.12" r="0.55">
          <Stop offset="0" stopColor="#ff945c" stopOpacity={0.5} />
          <Stop offset="0.58" stopColor="#ff945c" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#h-base)" />
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#h-warm)" />
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#h-violet)" />
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#h-magenta)" />
    </Svg>
  );
}

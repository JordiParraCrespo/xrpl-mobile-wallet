import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

// The DropPoints immersive backdrop — the light indigo→violet→white wash from
// drops.html (DP_BG): a soft white base under four faint colour blooms across
// the top. The viewBox is stretched to fill the screen (preserveAspectRatio
// none), so each bloom's rx/ry map to %-of-width / %-of-height just like the
// design's `radial-gradient(rx ry at cx cy)` stack.
type Bloom = {
  id: string;
  color: string;
  opacity: number;
  /** Centre, in viewBox units (0–100 = 0–100% of the screen). */
  cx: number;
  cy: number;
  /** Ending-shape radii, in viewBox units. */
  rx: number;
  ry: number;
  /** Fraction of the radius at which the colour has faded to transparent. */
  stop: number;
};

const BLOOMS: Bloom[] = [
  {
    id: 'dp-bloom-1',
    color: '#7b6ff2',
    opacity: 0.34,
    cx: 14,
    cy: 0,
    rx: 70,
    ry: 42,
    stop: 0.6,
  },
  {
    id: 'dp-bloom-2',
    color: '#b06bff',
    opacity: 0.34,
    cx: 100,
    cy: -8,
    rx: 64,
    ry: 40,
    stop: 0.58,
  },
  {
    id: 'dp-bloom-3',
    color: '#ff945c',
    opacity: 0.3,
    cx: 58,
    cy: 12,
    rx: 56,
    ry: 30,
    stop: 0.6,
  },
  {
    id: 'dp-bloom-4',
    color: '#e896ff',
    opacity: 0.32,
    cx: 106,
    cy: 24,
    rx: 70,
    ry: 38,
    stop: 0.62,
  },
];

/** Full-bleed gradient backdrop for the DropPoints "coming soon" screen. */
export function DroppointsBackground() {
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      pointerEvents="none"
    >
      <Defs>
        <LinearGradient id="dp-base" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#efeafe" />
          <Stop offset="0.18" stopColor="#f3eefb" />
          <Stop offset="0.42" stopColor="#ffffff" />
          <Stop offset="1" stopColor="#ffffff" />
        </LinearGradient>
        {BLOOMS.map((bloom) => (
          <RadialGradient
            key={bloom.id}
            id={bloom.id}
            gradientUnits="userSpaceOnUse"
            cx={0}
            cy={0}
            r={1}
            gradientTransform={`translate(${bloom.cx} ${bloom.cy}) scale(${bloom.rx} ${bloom.ry})`}
          >
            <Stop offset="0" stopColor={bloom.color} stopOpacity={bloom.opacity} />
            <Stop offset={bloom.stop} stopColor={bloom.color} stopOpacity={0} />
          </RadialGradient>
        ))}
      </Defs>
      <Rect x="0" y="0" width="100" height="100" fill="url(#dp-base)" />
      {BLOOMS.map((bloom) => (
        <Rect key={bloom.id} x="0" y="0" width="100" height="100" fill={`url(#${bloom.id})`} />
      ))}
    </Svg>
  );
}

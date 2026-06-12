import { View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

// PaymentsBackdrop — the soft brand "glow" the Drops payments design wears:
// a few tinted radial blooms across the top, fading into the page surface.
// Purely decorative and pointer-transparent, it sits behind the scroll
// content. Glows are kept low-opacity so they read on both light and dark.
type Glow = {
  cx: string;
  cy: string;
  r: string;
  color: string;
  opacity: number;
};

const GLOWS: Glow[] = [
  { cx: '14%', cy: '2%', r: '55%', color: '#7b6ff2', opacity: 0.32 },
  { cx: '100%', cy: '0%', r: '55%', color: '#b06bff', opacity: 0.3 },
  { cx: '58%', cy: '12%', r: '45%', color: '#ff945c', opacity: 0.22 },
];

export function PaymentsBackdrop() {
  return (
    <View pointerEvents="none" className="absolute inset-x-0 top-0 h-[420px]">
      <Svg width="100%" height="100%">
        <Defs>
          {GLOWS.map((g, i) => (
            <RadialGradient
              // biome-ignore lint/suspicious/noArrayIndexKey: static decorative gradient list
              key={i}
              id={`pay-glow-${i}`}
              cx={g.cx}
              cy={g.cy}
              r={g.r}
            >
              <Stop offset="0" stopColor={g.color} stopOpacity={g.opacity} />
              <Stop offset="1" stopColor={g.color} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        {GLOWS.map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static decorative gradient list
          <Rect key={i} width="100%" height="100%" fill={`url(#pay-glow-${i})`} />
        ))}
      </Svg>
    </View>
  );
}

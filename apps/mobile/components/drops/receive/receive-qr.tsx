import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';

// Brand indigo for the QR center mark. Hard-coded (not a theme token) because
// the code always sits on a white card, independent of light/dark.
const BRAND = '#5b41dd';
const MODULE_DARK = '#0b0a14';

/**
 * A deterministic faux QR with a branded center mark, ported from the design's
 * `flow-kit` `FakeQR`. A real scannable code comes from a QR encoder in
 * app-land; this stands in for the mocked address. `seed` keeps each account's
 * module pattern stable across renders.
 */
export function ReceiveQr({ size = 196, seed = 7 }: { size?: number; seed?: number }) {
  const modules = 25;
  const cell = size / modules;

  // Same LCG as the design, so the pattern is stable per seed.
  let s = seed * 99991;
  const rnd = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };

  const inFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x > modules - 9 && y < 8) || (x < 8 && y > modules - 9);

  const cells: ReactNode[] = [];
  for (let y = 0; y < modules; y++) {
    for (let x = 0; x < modules; x++) {
      if (inFinder(x, y)) continue;
      if (rnd() > 0.52) {
        cells.push(
          <Rect
            key={`m-${x}-${y}`}
            x={x * cell + cell * 0.12}
            y={y * cell + cell * 0.12}
            width={cell * 0.76}
            height={cell * 0.76}
            rx={cell * 0.22}
            fill={MODULE_DARK}
          />,
        );
      }
    }
  }

  const finder = (gx: number, gy: number) => [
    <Rect
      key={`f1-${gx}-${gy}`}
      x={gx * cell}
      y={gy * cell}
      width={cell * 7}
      height={cell * 7}
      rx={cell * 1.6}
      fill={MODULE_DARK}
    />,
    <Rect
      key={`f2-${gx}-${gy}`}
      x={(gx + 1) * cell}
      y={(gy + 1) * cell}
      width={cell * 5}
      height={cell * 5}
      rx={cell}
      fill="#ffffff"
    />,
    <Rect
      key={`f3-${gx}-${gy}`}
      x={(gx + 2) * cell}
      y={(gy + 2) * cell}
      width={cell * 3}
      height={cell * 3}
      rx={cell * 0.7}
      fill={MODULE_DARK}
    />,
  ];

  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 22,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.4,
        shadowRadius: 40,
        shadowOffset: { width: 0, height: 10 },
      }}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {cells}
        {finder(0, 0)}
        {finder(modules - 7, 0)}
        {finder(0, modules - 7)}
        {/* Branded center mark — a Dewy drop on a brand disc. */}
        <Circle cx={size / 2} cy={size / 2} r={size * 0.11} fill="#fff" />
        <Circle cx={size / 2} cy={size / 2} r={size * 0.092} fill={BRAND} />
      </Svg>
    </View>
  );
}

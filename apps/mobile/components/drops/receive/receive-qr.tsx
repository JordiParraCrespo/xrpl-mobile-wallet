import QRCode from 'qrcode';
import type { ReactNode } from 'react';
import * as React from 'react';
import { View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, Rect, Image as SvgImage } from 'react-native-svg';

// Brand indigo for the QR center mark. Hard-coded (not a theme token) because
// the code always sits on a white card, independent of light/dark.
const BRAND = '#5b41dd';
const MODULE_DARK = '#0b0a14';

/**
 * A real, scannable QR for `value`, styled like the design's `FakeQR`
 * (flow-kit.jsx): rounded modules, smooth finder rings and the Dewy mark on
 * a brand disc in the center. Error correction is H so the center mark's
 * ~4% coverage stays well within budget.
 */
export function ReceiveQr({ value, size = 196 }: { value: string; size?: number }) {
  const matrix = React.useMemo(() => {
    const qr = QRCode.create(value, { errorCorrectionLevel: 'H' });
    return { count: qr.modules.size, data: qr.modules.data };
  }, [value]);

  const n = matrix.count;
  const cell = size / n;

  // The three 7×7 finder squares are drawn as the design's smooth rounded
  // rings instead of per-module dots; everything else follows the matrix.
  const inFinder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);

  const cells: ReactNode[] = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (inFinder(x, y)) continue;
      if (matrix.data[y * n + x]) {
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

  const dewySize = size * 0.144;

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
        <Defs>
          <ClipPath id="dewy-clip">
            <Circle cx={size / 2} cy={size / 2} r={dewySize / 2} />
          </ClipPath>
        </Defs>
        {cells}
        {finder(0, 0)}
        {finder(n - 7, 0)}
        {finder(0, n - 7)}
        {/* Branded center mark — Dewy on a brand disc (flow-kit FakeQR). */}
        <Circle cx={size / 2} cy={size / 2} r={size * 0.11} fill="#fff" />
        <Circle cx={size / 2} cy={size / 2} r={size * 0.092} fill={BRAND} />
        <SvgImage
          href={require('../../../assets/dewy.png')}
          x={size / 2 - dewySize / 2}
          y={size / 2 - dewySize / 2}
          width={dewySize}
          height={dewySize}
          clipPath="url(#dewy-clip)"
        />
      </Svg>
    </View>
  );
}

import * as React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { cn } from "../../lib/utils";

// Sparkline — small inline market chart: a 2px round-capped line with
// a soft area fill underneath. Trend colors are design constants
// (SVG can't read CSS variables); pass `color` to override.
const TREND_COLORS = {
  up: "#0ca678",
  down: "#e03131",
} as const;

type SparklineProps = React.ComponentProps<typeof View> & {
  data: number[];
  width?: number;
  height?: number;
  /** Defaults to the direction from first → last data point. */
  trend?: "up" | "down";
  /** Explicit stroke color (overrides trend). */
  color?: string;
};

// Catmull-Rom → cubic Bézier: the curve passes through every data
// point; each segment's control points lean on the neighbors so the
// line bends smoothly instead of kinking at the samples.
function buildLinePath(data: number[], width: number, height: number) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1 || 1)) * width,
    y: height - 4 - ((v - min) / range) * (height - 10),
  }));
  const d = [`M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d.push(
      `C${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${cp2x.toFixed(1)} ${cp2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`,
    );
  }
  return d.join(" ");
}

function Sparkline({
  data,
  width = 150,
  height = 46,
  trend,
  color,
  className,
  ...props
}: SparklineProps) {
  const resolvedTrend =
    trend ?? (data[data.length - 1] >= data[0] ? "up" : "down");
  const stroke = color ?? TREND_COLORS[resolvedTrend];
  const line = data.length > 1 ? buildLinePath(data, width, height) : "";
  return (
    <View
      className={cn("shrink-0", className)}
      style={{ width, height }}
      {...props}
    >
      {line ? (
        <Svg width={width} height={height}>
          <Path
            d={`${line} L${width} ${height} L0 ${height} Z`}
            fill={stroke}
            opacity={0.12}
          />
          <Path
            d={line}
            fill="none"
            stroke={stroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ) : null}
    </View>
  );
}

export type { SparklineProps };
export { Sparkline };

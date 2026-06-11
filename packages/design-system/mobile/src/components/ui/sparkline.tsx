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

function buildLinePath(data: number[], width: number, height: number) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  return data
    .map((v, i) => {
      const x = ((i / (data.length - 1 || 1)) * width).toFixed(1);
      const y = (height - 4 - ((v - min) / range) * (height - 10)).toFixed(1);
      return `${i ? "L" : "M"}${x} ${y}`;
    })
    .join(" ");
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

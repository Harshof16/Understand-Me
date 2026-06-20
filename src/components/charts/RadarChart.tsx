import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Line, Polygon, Text as SvgText } from "react-native-svg";
import { useTheme } from "../../theme";

type Props = {
  data: { label: string; value: number }[];
  max?: number;
  size?: number;
};

export function RadarChart({ data, max = 5, size = 220 }: Props) {
  const { colors } = useTheme();

  const center = size / 2;
  const radius = size / 2 - 28;
  const ringCount = 4;
  const angleStep = (Math.PI * 2) / data.length;

  function pointFor(index: number, fraction: number) {
    const angle = angleStep * index - Math.PI / 2;
    return {
      x: center + radius * fraction * Math.cos(angle),
      y: center + radius * fraction * Math.sin(angle),
    };
  }

  const dataPoints = data.map((d, i) => pointFor(i, Math.max(0, Math.min(1, d.value / max))));
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <View style={styles.wrap}>
      <Svg width={size} height={size}>
        {Array.from({ length: ringCount }, (_, ring) => {
          const fraction = (ring + 1) / ringCount;
          const ringPoints = data.map((_, i) => pointFor(i, fraction));
          const ringPolygon = ringPoints.map((p) => `${p.x},${p.y}`).join(" ");
          return (
            <Polygon
              key={ring}
              points={ringPolygon}
              fill="none"
              stroke={colors.border}
              strokeWidth={1}
            />
          );
        })}

        {data.map((_, i) => {
          const edge = pointFor(i, 1);
          return (
            <Line
              key={i}
              x1={center}
              y1={center}
              x2={edge.x}
              y2={edge.y}
              stroke={colors.border}
              strokeWidth={1}
            />
          );
        })}

        <Polygon
          points={dataPolygon}
          fill={colors.primary}
          fillOpacity={0.25}
          stroke={colors.primary}
          strokeWidth={2}
        />

        {dataPoints.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={3.5} fill={colors.primary} />
        ))}

        {data.map((d, i) => {
          const labelPoint = pointFor(i, 1.22);
          return (
            <SvgText
              key={d.label}
              x={labelPoint.x}
              y={labelPoint.y}
              fontSize={11}
              fontWeight="600"
              fill={colors.textSecondary}
              textAnchor="middle"
            >
              {d.label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
});

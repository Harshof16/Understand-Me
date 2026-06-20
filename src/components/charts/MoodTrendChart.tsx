import React, { useMemo } from "react";
import { LineChart } from "react-native-gifted-charts";
import { useTheme } from "../../theme";
import type { TrendPoint } from "../../utils/moodStats";

type Props = {
  points: TrendPoint[];
  height?: number;
};

export function MoodTrendChart({ points, height = 140 }: Props) {
  const { colors } = useTheme();

  const lineData = useMemo(
    () =>
      points.map((p) => ({
        value: p.value,
        label: p.label,
        dataPointText: p.value > 0 ? String(p.value) : "",
      })),
    [points]
  );

  return (
    <LineChart
      data={lineData}
      height={height}
      maxValue={5}
      noOfSections={5}
      stepValue={1}
      color={colors.primary}
      thickness={3}
      dataPointsColor={colors.primary}
      yAxisThickness={0}
      xAxisThickness={1}
      xAxisColor={colors.border}
      xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 11, fontWeight: "600" }}
      yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
      curved
      hideRules
      startFillColor={colors.primaryLight}
      endFillColor={colors.background}
      startOpacity={0.7}
      endOpacity={0.1}
      areaChart
      isAnimated
    />
  );
}

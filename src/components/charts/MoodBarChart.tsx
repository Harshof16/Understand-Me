import React, { useMemo } from "react";
import { BarChart } from "react-native-gifted-charts";
import { useTheme } from "../../theme";
import type { Sentiment } from "../../utils/moodStats";

type Props = {
  counts: Record<Sentiment, number>;
  height?: number;
};

const ORDER: Sentiment[] = ["negative", "neutral", "positive"];
const LABELS: Record<Sentiment, string> = {
  negative: "Negative",
  neutral: "Neutral",
  positive: "Positive",
};

export function MoodBarChart({ counts, height = 140 }: Props) {
  const { colors } = useTheme();

  const sentimentColor: Record<Sentiment, string> = {
    negative: colors.danger,
    neutral: colors.warning,
    positive: colors.success,
  };

  const barData = useMemo(
    () =>
      ORDER.map((sentiment) => ({
        value: counts[sentiment],
        label: LABELS[sentiment],
        frontColor: sentimentColor[sentiment],
        topLabelComponent: () => null,
      })),
    [counts, sentimentColor]
  );

  const maxValue = Math.max(1, ...ORDER.map((s) => counts[s]));

  return (
    <BarChart
      data={barData}
      height={height}
      barWidth={36}
      spacing={28}
      barBorderRadius={6}
      maxValue={maxValue}
      noOfSections={3}
      yAxisThickness={0}
      xAxisThickness={1}
      xAxisColor={colors.border}
      yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
      xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 12, fontWeight: "600" }}
      hideRules
      isAnimated
    />
  );
}

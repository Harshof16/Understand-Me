import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AnimatedPressable } from "./AnimatedPressable";
import { radius, spacing, useTheme, ThemeColors, Typography } from "../theme";
import type { Sentiment } from "../utils/moodStats";

type DayInfo = { date: string; sentiment: Sentiment | null };

type Props = {
  days: DayInfo[];
  selectedDate: string | null;
  onSelect: (date: string) => void;
};

const SENTIMENT_LABEL: Record<Sentiment, string> = {
  positive: "Happy",
  neutral: "Calm",
  negative: "Sad",
};

export function CalendarStrip({ days, selectedDate, onSelect }: Props) {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  function sentimentColor(sentiment: Sentiment | null) {
    if (!sentiment) return colors.border;
    return colors.moods[SENTIMENT_LABEL[sentiment]] ?? colors.primary;
  }

  return (
    <View style={styles.row}>
      {days.map((day) => {
        const dateObj = new Date(day.date);
        const isToday = day.date === new Date().toISOString().slice(0, 10);
        const isSelected = day.date === selectedDate;
        return (
          <AnimatedPressable
            key={day.date}
            onPress={() => onSelect(day.date)}
            style={[styles.day, isSelected && styles.daySelected]}
          >
            <Text style={[styles.weekday, isSelected && styles.weekdaySelected]}>
              {dateObj.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1)}
            </Text>
            <View
              style={[
                styles.dot,
                { backgroundColor: sentimentColor(day.sentiment) },
                isToday && styles.dotToday,
              ]}
            />
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

function createStyles(colors: ThemeColors, typography: Typography) {
  return StyleSheet.create({
    row: { flexDirection: "row", justifyContent: "space-between" },
    day: {
      alignItems: "center",
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.md,
    },
    daySelected: { backgroundColor: colors.primaryLight },
    weekday: { ...typography.caption, fontWeight: "700" },
    weekdaySelected: { color: colors.primary },
    dot: { width: 10, height: 10, borderRadius: 5 },
    dotToday: { borderWidth: 2, borderColor: colors.primary },
  });
}

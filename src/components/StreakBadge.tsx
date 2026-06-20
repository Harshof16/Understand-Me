import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { radius, spacing, useTheme, ThemeColors, Typography } from "../theme";

type Props = {
  days: number;
};

export function StreakBadge({ days }: Props) {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  return (
    <View style={styles.badge}>
      <Ionicons name="flame" size={16} color={colors.warning} />
      <Text style={styles.text}>
        {days} day{days === 1 ? "" : "s"} streak
      </Text>
    </View>
  );
}

function createStyles(colors: ThemeColors, typography: Typography) {
  return StyleSheet.create({
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      backgroundColor: colors.surfaceMuted,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      alignSelf: "flex-start",
    },
    text: { ...typography.subheading, fontSize: 13 },
  });
}

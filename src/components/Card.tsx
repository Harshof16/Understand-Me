import React, { useMemo } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { radius, shadow, spacing, useTheme, ThemeColors } from "../theme";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  muted?: boolean;
};

export function Card({ children, style, muted }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return <View style={[styles.base, muted && styles.muted, style]}>{children}</View>;
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    base: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
      ...shadow.card,
    },
    muted: {
      backgroundColor: colors.surfaceMuted,
      shadowOpacity: 0,
      elevation: 0,
    },
  });
}

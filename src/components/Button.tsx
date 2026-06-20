import React, { useMemo } from "react";
import { StyleSheet, Text } from "react-native";
import { AnimatedPressable } from "./AnimatedPressable";
import { radius, spacing, useTheme, ThemeColors, Typography } from "../theme";

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ label, onPress, disabled, variant = "primary" }: Props) {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.base,
        variant === "secondary" && styles.secondary,
        variant === "ghost" && styles.ghost,
        disabled && styles.disabled,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === "secondary" && styles.secondaryLabel,
          variant === "ghost" && styles.ghostLabel,
        ]}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

function createStyles(colors: ThemeColors, typography: Typography) {
  return StyleSheet.create({
    base: {
      paddingVertical: 14,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      alignItems: "center",
      marginTop: spacing.sm,
      backgroundColor: colors.primary,
    },
    secondary: { backgroundColor: colors.primaryLight },
    ghost: { backgroundColor: "transparent" },
    disabled: { opacity: 0.4 },
    label: { ...typography.subheading, color: colors.textOnPrimary },
    secondaryLabel: { color: colors.primary },
    ghostLabel: { color: colors.primary },
  });
}

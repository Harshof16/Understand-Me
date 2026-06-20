import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useTheme, Typography } from "../../theme";

type Props = {
  label: string;
};

export function EmptyState({ label }: Props) {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(typography), [typography]);

  return (
    <View style={styles.container}>
      <Svg width={120} height={90} viewBox="0 0 120 90">
        <Path
          d="M20 70 C 20 40, 45 20, 65 30 C 85 38, 95 60, 78 72 C 60 84, 30 85, 20 70 Z"
          fill={colors.primaryLight}
        />
        <Circle cx="50" cy="50" r="14" fill={colors.secondary} opacity={0.5} />
        <Circle cx="78" cy="35" r="5" fill={colors.secondary} opacity={0.7} />
        <Circle cx="90" cy="50" r="3" fill={colors.primary} opacity={0.6} />
      </Svg>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

function createStyles(typography: Typography) {
  return StyleSheet.create({
    container: { alignItems: "center", paddingVertical: 24 },
    label: { ...typography.bodyMuted, marginTop: 12, textAlign: "center" },
  });
}

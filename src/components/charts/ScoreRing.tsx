import React, { useEffect, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedProps, useSharedValue, withTiming } from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { useTheme, ThemeColors, Typography } from "../../theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  value: number;
  max: number;
  label?: string;
  size?: number;
  strokeWidth?: number;
};

export function ScoreRing({ value, max, label, size = 140, strokeWidth = 12 }: Props) {
  const { colors, typography } = useTheme();
  const compact = size < 100;
  const styles = useMemo(() => createStyles(colors, typography, compact), [colors, typography, compact]);

  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const fraction = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(fraction, { duration: 600 });
  }, [fraction, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={styles.wrap}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeLinecap="round"
          rotation={-90}
          originX={size / 2}
          originY={size / 2}
          animatedProps={animatedProps}
        />
      </Svg>
      <View style={styles.centerLabel} pointerEvents="none">
        <Text style={styles.value}>{Math.round(value)}</Text>
        {!compact && <Text style={styles.max}>out of {max}</Text>}
        {!compact && label ? <Text style={styles.label}>{label}</Text> : null}
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors, typography: Typography, compact: boolean) {
  return StyleSheet.create({
    wrap: { alignItems: "center", justifyContent: "center" },
    centerLabel: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
    },
    value: { ...typography.title, fontSize: compact ? 16 : 28 },
    max: { ...typography.caption },
    label: { ...typography.caption, color: colors.primary, marginTop: 2 },
  });
}

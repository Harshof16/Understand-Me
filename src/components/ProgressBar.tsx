import React, { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { radius, useTheme, ThemeColors } from "../theme";

type Props = {
  progress: number; // 0 to 1
};

export function ProgressBar({ progress }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(progress, { duration: 280 });
  }, [progress, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, animatedStyle]} />
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    track: {
      height: 6,
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceMuted,
      overflow: "hidden",
    },
    fill: {
      height: "100%",
      borderRadius: radius.pill,
      backgroundColor: colors.primary,
    },
  });
}

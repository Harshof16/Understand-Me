import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import { AnimatedPressable } from "./AnimatedPressable";
import { radius, useTheme, ThemeColors } from "../theme";

type Props = {
  value: number | undefined;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

function Option({
  opt,
  selected,
  onPress,
  styles,
}: {
  opt: number;
  selected: boolean;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(selected ? 1.08 : 1, { damping: 12, stiffness: 180 }) }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <AnimatedPressable onPress={onPress} style={[styles.option, selected && styles.optionSelected]}>
        <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{opt}</Text>
      </AnimatedPressable>
    </Animated.View>
  );
}

export function LikertScale({ value, onChange, min = 1, max = 5 }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <View style={styles.row}>
      {options.map((opt) => (
        <Option key={opt} opt={opt} selected={value === opt} onPress={() => onChange(opt)} styles={styles} />
      ))}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    row: { flexDirection: "row", justifyContent: "space-between" },
    option: {
      width: 42,
      height: 42,
      borderRadius: radius.pill,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
    },
    optionSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
    optionText: { color: colors.primary, fontWeight: "600" },
    optionTextSelected: { color: colors.textOnPrimary },
  });
}

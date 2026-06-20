import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import { AnimatedPressable } from "./AnimatedPressable";
import { radius, useTheme, ThemeColors } from "../theme";

type Props = {
  value: number | undefined;
  onChange: (value: number) => void;
};

const FACES: { level: number; icon: keyof typeof Ionicons.glyphMap }[] = [
  { level: 1, icon: "sad" },
  { level: 2, icon: "sad-outline" },
  { level: 3, icon: "remove-circle-outline" },
  { level: 4, icon: "happy-outline" },
  { level: 5, icon: "happy" },
];

function Face({
  level,
  icon,
  selected,
  onPress,
  styles,
  colors,
}: {
  level: number;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  colors: ThemeColors;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(selected ? 1.12 : 1, { damping: 12, stiffness: 180 }) }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <AnimatedPressable onPress={onPress} style={[styles.face, selected && styles.faceSelected]}>
        <Ionicons name={icon} size={24} color={selected ? colors.textOnPrimary : colors.primary} />
      </AnimatedPressable>
    </Animated.View>
  );
}

export function MoodFaceScale({ value, onChange }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      {FACES.map((face) => (
        <Face
          key={face.level}
          level={face.level}
          icon={face.icon}
          selected={value === face.level}
          onPress={() => onChange(face.level)}
          styles={styles}
          colors={colors}
        />
      ))}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    row: { flexDirection: "row", justifyContent: "space-between" },
    face: {
      width: 46,
      height: 46,
      borderRadius: radius.pill,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
    },
    faceSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  });
}

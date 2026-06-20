import React from "react";
import { Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Props = Omit<PressableProps, "style"> & {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
};

export function AnimatedPressable({ style, scaleTo = 0.96, onPressIn, onPressOut, ...rest }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        style={style}
        onPressIn={(e) => {
          scale.value = withTiming(scaleTo, { duration: 90 });
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          scale.value = withTiming(1, { duration: 120 });
          onPressOut?.(e);
        }}
        {...rest}
      />
    </Animated.View>
  );
}

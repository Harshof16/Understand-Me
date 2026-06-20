import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
};

export function Button({ label, onPress, disabled, variant = "primary" }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.base,
        variant === "secondary" ? styles.secondary : styles.primary,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.label, variant === "secondary" && styles.secondaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  primary: { backgroundColor: "#5B4FE5" },
  secondary: { backgroundColor: "#EFEDFC" },
  disabled: { opacity: 0.4 },
  label: { color: "#fff", fontSize: 16, fontWeight: "600" },
  secondaryLabel: { color: "#5B4FE5" },
});

import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  value: number | undefined;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

export function LikertScale({ value, onChange, min = 1, max = 5 }: Props) {
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <View style={styles.row}>
      {options.map((opt) => (
        <Pressable
          key={opt}
          onPress={() => onChange(opt)}
          style={[styles.option, value === opt && styles.optionSelected]}
        >
          <Text style={[styles.optionText, value === opt && styles.optionTextSelected]}>{opt}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between" },
  option: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D9D6F5",
    alignItems: "center",
    justifyContent: "center",
  },
  optionSelected: { backgroundColor: "#5B4FE5", borderColor: "#5B4FE5" },
  optionText: { color: "#5B4FE5", fontWeight: "600" },
  optionTextSelected: { color: "#fff" },
});

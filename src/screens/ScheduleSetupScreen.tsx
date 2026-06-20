import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { saveDailySchedule } from "../storage/repository";
import type { DailySchedule, ScheduleBlock } from "../types";
import type { RootStackParamList } from "../navigation/types";
import { Button } from "../components/Button";

type Props = NativeStackScreenProps<RootStackParamList, "ScheduleSetup">;

const DEFAULT_BLOCKS: ScheduleBlock[] = [
  { label: "Work / study", startTime: "09:00", endTime: "17:00" },
  { label: "Wind down", startTime: "20:00", endTime: "22:00" },
];

export default function ScheduleSetupScreen({ navigation }: Props) {
  const [wakeTime, setWakeTime] = useState("07:00");
  const [sleepTime, setSleepTime] = useState("23:00");
  const [blocks, setBlocks] = useState<ScheduleBlock[]>(DEFAULT_BLOCKS);

  function updateBlock(index: number, field: keyof ScheduleBlock, value: string) {
    setBlocks((prev) => prev.map((b, i) => (i === index ? { ...b, [field]: value } : b)));
  }

  function handleSave() {
    const schedule: DailySchedule = {
      id: `schedule-${Date.now()}`,
      wakeTime,
      sleepTime,
      blocks,
      updatedAt: new Date().toISOString(),
    };
    saveDailySchedule(schedule).then(() => navigation.replace("Tabs"));
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Your Typical Day</Text>
      <Text style={styles.subtitle}>
        This rough shape of your day helps the AI later connect your mood and energy to what's
        actually happening in your schedule.
      </Text>

      <Text style={styles.label}>Wake-up time</Text>
      <TextInput style={styles.input} value={wakeTime} onChangeText={setWakeTime} placeholder="07:00" />

      <Text style={styles.label}>Sleep time</Text>
      <TextInput style={styles.input} value={sleepTime} onChangeText={setSleepTime} placeholder="23:00" />

      <Text style={styles.sectionTitle}>Recurring blocks</Text>
      {blocks.map((block, i) => (
        <View key={i} style={styles.blockRow}>
          <TextInput
            style={[styles.input, styles.blockLabelInput]}
            value={block.label}
            onChangeText={(v) => updateBlock(i, "label", v)}
            placeholder="Label"
          />
          <TextInput
            style={[styles.input, styles.blockTimeInput]}
            value={block.startTime}
            onChangeText={(v) => updateBlock(i, "startTime", v)}
            placeholder="Start"
          />
          <TextInput
            style={[styles.input, styles.blockTimeInput]}
            value={block.endTime}
            onChangeText={(v) => updateBlock(i, "endTime", v)}
            placeholder="End"
          />
        </View>
      ))}

      <Button label="Save my day structure" onPress={handleSave} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#555", marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginTop: 20, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#D9D6F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  blockRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  blockLabelInput: { flex: 2 },
  blockTimeInput: { flex: 1 },
});

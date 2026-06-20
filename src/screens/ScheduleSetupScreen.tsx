import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { saveDailySchedule } from "../storage/repository";
import type { DailySchedule, ScheduleBlock } from "../types";
import type { RootStackParamList } from "../navigation/types";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { FadeIn } from "../components/FadeIn";
import { spacing, useTheme, ThemeColors, Typography } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "ScheduleSetup">;

const DEFAULT_BLOCKS: ScheduleBlock[] = [
  { label: "Work / study", startTime: "09:00", endTime: "17:00" },
  { label: "Wind down", startTime: "20:00", endTime: "22:00" },
];

export default function ScheduleSetupScreen({ navigation }: Props) {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

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
      <FadeIn>
        <Text style={styles.title}>Your typical day</Text>
        <Text style={styles.subtitle}>
          This rough shape of your day helps the AI later connect your mood and energy to what's
          actually happening in your schedule.
        </Text>
      </FadeIn>

      <FadeIn delay={80}>
        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={styles.timeField}>
              <View style={styles.fieldLabelRow}>
                <Ionicons name="sunny" size={14} color={colors.warning} />
                <Text style={styles.label}>Wake-up</Text>
              </View>
              <TextInput
                style={styles.input}
                value={wakeTime}
                onChangeText={setWakeTime}
                placeholder="07:00"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={styles.timeField}>
              <View style={styles.fieldLabelRow}>
                <Ionicons name="moon" size={14} color={colors.primary} />
                <Text style={styles.label}>Sleep</Text>
              </View>
              <TextInput
                style={styles.input}
                value={sleepTime}
                onChangeText={setSleepTime}
                placeholder="23:00"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>
        </Card>
      </FadeIn>

      <Text style={styles.sectionTitle}>Recurring blocks</Text>
      {blocks.map((block, i) => (
        <FadeIn key={i} delay={120 + i * 60}>
          <Card style={styles.card} muted>
            <TextInput
              style={[styles.input, styles.blockLabelInput]}
              value={block.label}
              onChangeText={(v) => updateBlock(i, "label", v)}
              placeholder="Label"
              placeholderTextColor={colors.textMuted}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.blockTimeInput]}
                value={block.startTime}
                onChangeText={(v) => updateBlock(i, "startTime", v)}
                placeholder="Start"
                placeholderTextColor={colors.textMuted}
              />
              <TextInput
                style={[styles.input, styles.blockTimeInput]}
                value={block.endTime}
                onChangeText={(v) => updateBlock(i, "endTime", v)}
                placeholder="End"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </Card>
        </FadeIn>
      ))}

      <Button label="Save my day structure" onPress={handleSave} />
    </ScrollView>
  );
}

function createStyles(colors: ThemeColors, typography: Typography) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
    title: { ...typography.title, marginBottom: spacing.sm },
    subtitle: { ...typography.bodyMuted, marginBottom: spacing.xl },
    sectionTitle: { ...typography.heading, marginTop: spacing.lg, marginBottom: spacing.md },
    card: { marginBottom: spacing.md },
    row: { flexDirection: "row", gap: spacing.md },
    timeField: { flex: 1 },
    fieldLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    label: { ...typography.caption },
    input: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: spacing.md,
      paddingVertical: 10,
      fontSize: 15,
      backgroundColor: colors.surface,
      color: colors.textPrimary,
    },
    blockLabelInput: { marginBottom: spacing.sm },
    blockTimeInput: { flex: 1 },
  });
}

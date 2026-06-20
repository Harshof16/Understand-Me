import React, { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { addMoodEntry, getMoodEntries } from "../storage/repository";
import type { MoodEntry, MoodLevel } from "../types";
import { AnimatedPressable } from "../components/AnimatedPressable";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { FadeIn } from "../components/FadeIn";
import { LikertScale } from "../components/LikertScale";
import { EmptyState } from "../components/illustrations/EmptyState";
import { radius, spacing, useTheme, ThemeColors, Typography } from "../theme";

const MOODS: { label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: "Happy", icon: "happy" },
  { label: "Calm", icon: "leaf" },
  { label: "Anxious", icon: "pulse" },
  { label: "Sad", icon: "rainy" },
  { label: "Frustrated", icon: "flame" },
  { label: "Energized", icon: "flash" },
  { label: "Tired", icon: "bed" },
];

export default function MoodDiaryScreen() {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<MoodLevel | undefined>();
  const [energy, setEnergy] = useState<MoodLevel | undefined>();
  const [tagsInput, setTagsInput] = useState("");

  const loadEntries = useCallback(() => {
    getMoodEntries().then((data) => setEntries([...data].reverse()));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  function handleLog() {
    if (!selectedMood || !intensity) return;
    const entry: MoodEntry = {
      id: `mood-${Date.now()}`,
      timestamp: new Date().toISOString(),
      moodPrimary: selectedMood,
      moodIntensity: intensity,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      energyRating: energy,
    };
    addMoodEntry(entry).then(() => {
      setSelectedMood(null);
      setIntensity(undefined);
      setEnergy(undefined);
      setTagsInput("");
      loadEntries();
    });
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={entries}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View style={styles.form}>
          <FadeIn>
            <Text style={styles.title}>How are you feeling right now?</Text>
          </FadeIn>

          <FadeIn delay={60}>
            <View style={styles.moodGrid}>
              {MOODS.map((mood) => {
                const selected = selectedMood === mood.label;
                const tint = colors.moods[mood.label] ?? colors.primary;
                return (
                  <AnimatedPressable
                    key={mood.label}
                    onPress={() => setSelectedMood(mood.label)}
                    style={[
                      styles.moodChip,
                      selected && { backgroundColor: tint, borderColor: tint },
                    ]}
                  >
                    <Ionicons name={mood.icon} size={18} color={selected ? "#fff" : tint} />
                    <Text style={[styles.moodChipText, selected && styles.moodChipTextSelected]}>
                      {mood.label}
                    </Text>
                  </AnimatedPressable>
                );
              })}
            </View>
          </FadeIn>

          <FadeIn delay={120}>
            <Text style={styles.label}>Intensity</Text>
            <LikertScale value={intensity} onChange={(v) => setIntensity(v as MoodLevel)} />

            <Text style={styles.label}>Energy level</Text>
            <LikertScale value={energy} onChange={(v) => setEnergy(v as MoodLevel)} />

            <Text style={styles.label}>Tags (comma separated, optional)</Text>
            <TextInput
              style={styles.input}
              value={tagsInput}
              onChangeText={setTagsInput}
              placeholder="work, sleep, social"
              placeholderTextColor={colors.textMuted}
            />

            <Button label="Log mood" onPress={handleLog} disabled={!selectedMood || !intensity} />
          </FadeIn>

          <Text style={styles.sectionTitle}>Recent entries</Text>
        </View>
      }
      renderItem={({ item, index }) => (
        <FadeIn delay={Math.min(index, 4) * 40}>
          <Card style={styles.entryCard} muted>
            <View style={styles.entryHeader}>
              <Ionicons
                name={MOODS.find((m) => m.label === item.moodPrimary)?.icon ?? "ellipse"}
                size={16}
                color={colors.moods[item.moodPrimary] ?? colors.primary}
              />
              <Text style={styles.entryMood}>
                {item.moodPrimary} · intensity {item.moodIntensity}
                {item.energyRating ? ` · energy ${item.energyRating}` : ""}
              </Text>
            </View>
            <Text style={styles.entryMeta}>{new Date(item.timestamp).toLocaleString()}</Text>
            {item.tags.length > 0 && <Text style={styles.entryTags}>{item.tags.join(", ")}</Text>}
          </Card>
        </FadeIn>
      )}
      ListEmptyComponent={<EmptyState label="No mood entries yet. Log your first one above." />}
    />
  );
}

function createStyles(colors: ThemeColors, typography: Typography) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
    form: { marginBottom: spacing.sm },
    title: { ...typography.title, marginBottom: spacing.lg },
    label: { ...typography.subheading, marginTop: spacing.lg, marginBottom: spacing.sm },
    moodGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    moodChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.surface,
    },
    moodChipText: { fontSize: 13, fontWeight: "600", color: colors.textPrimary },
    moodChipTextSelected: { color: "#fff" },
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
    sectionTitle: { ...typography.heading, marginTop: spacing.xxl, marginBottom: spacing.sm },
    entryCard: { marginBottom: spacing.sm },
    entryHeader: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
    entryMood: { ...typography.subheading },
    entryMeta: { ...typography.caption, marginTop: spacing.xs },
    entryTags: { fontSize: 12, color: colors.primary, marginTop: spacing.xs, fontWeight: "600" },
  });
}

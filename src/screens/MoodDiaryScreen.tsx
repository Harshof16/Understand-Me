import React, { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { addMoodEntry, getJournalEntries, getMoodEntries } from "../storage/repository";
import type { MoodEntry, MoodLevel } from "../types";
import { AnimatedPressable } from "../components/AnimatedPressable";
import { Button } from "../components/Button";
import { CalendarStrip } from "../components/CalendarStrip";
import { Card } from "../components/Card";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { FadeIn } from "../components/FadeIn";
import { LikertScale } from "../components/LikertScale";
import { MoodFaceScale } from "../components/MoodFaceScale";
import { StreakBadge } from "../components/StreakBadge";
import { MoodBarChart } from "../components/charts/MoodBarChart";
import { EmptyState } from "../components/illustrations/EmptyState";
import {
  computeStreak,
  dayBuckets,
  last7Days,
  sentimentCounts,
  type DayBucket,
} from "../utils/moodStats";
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
  const [streak, setStreak] = useState(0);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<MoodLevel | undefined>();
  const [energy, setEnergy] = useState<MoodLevel | undefined>();
  const [tagsInput, setTagsInput] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const loadEntries = useCallback(() => {
    Promise.all([getMoodEntries(), getJournalEntries()]).then(([moods, journals]) => {
      setEntries(moods);
      setStreak(computeStreak(moods, journals));
    });
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

  const weekStrip = useMemo(() => last7Days(entries), [entries]);
  const counts = useMemo(() => sentimentCounts(entries), [entries]);
  const filteredEntries = useMemo(
    () => (selectedDate ? entries.filter((e) => e.timestamp.slice(0, 10) === selectedDate) : entries),
    [entries, selectedDate]
  );
  const buckets = useMemo(() => dayBuckets(filteredEntries).sort((a, b) => (a.date < b.date ? 1 : -1)), [
    filteredEntries,
  ]);

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={buckets}
      keyExtractor={(bucket) => bucket.date}
      ListHeaderComponent={
        <View style={styles.form}>
          <FadeIn>
            <Text style={styles.title}>How are you feeling right now?</Text>
          </FadeIn>

          <FadeIn delay={30}>
            <ErrorBoundary fallbackLabel="Couldn't load your week view.">
              <CalendarStrip
                days={weekStrip}
                selectedDate={selectedDate}
                onSelect={(date) => setSelectedDate((d) => (d === date ? null : date))}
              />
            </ErrorBoundary>
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
            <MoodFaceScale value={intensity} onChange={(v) => setIntensity(v as MoodLevel)} />

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

          <FadeIn delay={170}>
            <ErrorBoundary fallbackLabel="Couldn't load your mood stats.">
              <Card style={styles.statsCard}>
                <View style={styles.statsHeader}>
                  <Text style={styles.cardTitle}>Your stats</Text>
                  <StreakBadge days={streak} />
                </View>
                {entries.length > 0 ? (
                  <MoodBarChart counts={counts} />
                ) : (
                  <Text style={styles.cardBody}>Log a mood to start seeing your stats.</Text>
                )}
              </Card>
            </ErrorBoundary>
          </FadeIn>

          <Text style={styles.sectionTitle}>
            {selectedDate ? "Entries for selected day" : "Recent entries"}
          </Text>
        </View>
      }
      renderItem={({ item, index }: { item: DayBucket<MoodEntry>; index: number }) => (
        <FadeIn delay={Math.min(index, 4) * 40}>
          <View style={styles.bucket}>
            <Text style={styles.bucketLabel}>{item.label}</Text>
            {item.entries.map((entry) => (
              <Card key={entry.id} style={styles.entryCard} muted>
                <View style={styles.entryHeader}>
                  <Ionicons
                    name={MOODS.find((m) => m.label === entry.moodPrimary)?.icon ?? "ellipse"}
                    size={16}
                    color={colors.moods[entry.moodPrimary] ?? colors.primary}
                  />
                  <Text style={styles.entryMood}>
                    {entry.moodPrimary} · intensity {entry.moodIntensity}
                    {entry.energyRating ? ` · energy ${entry.energyRating}` : ""}
                  </Text>
                </View>
                <Text style={styles.entryMeta}>{new Date(entry.timestamp).toLocaleTimeString()}</Text>
                {entry.tags.length > 0 && <Text style={styles.entryTags}>{entry.tags.join(", ")}</Text>}
              </Card>
            ))}
          </View>
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
    moodGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.lg },
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
    statsCard: { marginTop: spacing.xxl },
    statsHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.md,
    },
    cardTitle: { ...typography.subheading },
    cardBody: { ...typography.bodyMuted },
    sectionTitle: { ...typography.heading, marginTop: spacing.xxl, marginBottom: spacing.sm },
    bucket: { marginBottom: spacing.md },
    bucketLabel: { ...typography.caption, marginBottom: spacing.xs, textTransform: "uppercase" },
    entryCard: { marginBottom: spacing.sm },
    entryHeader: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
    entryMood: { ...typography.subheading },
    entryMeta: { ...typography.caption, marginTop: spacing.xs },
    entryTags: { fontSize: 12, color: colors.primary, marginTop: spacing.xs, fontWeight: "600" },
  });
}

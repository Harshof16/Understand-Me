import React, { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { addJournalEntry, getJournalEntries } from "../storage/repository";
import type { JournalEntry } from "../types";
import { AnimatedPressable } from "../components/AnimatedPressable";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { FadeIn } from "../components/FadeIn";
import { EmptyState } from "../components/illustrations/EmptyState";
import { dayBuckets, type DayBucket } from "../utils/moodStats";
import { radius, spacing, useTheme, ThemeColors, Typography } from "../theme";

const GUIDED_PROMPTS = [
  "What brought you joy today?",
  "What's something small that made a big difference in your day?",
  "What was hard today, and how did you cope?",
];

const JOURNAL_MOODS: { label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: "Happy", icon: "happy" },
  { label: "Calm", icon: "leaf" },
  { label: "Anxious", icon: "pulse" },
  { label: "Sad", icon: "rainy" },
  { label: "Frustrated", icon: "flame" },
];

type Mode = "freeform" | "guided";

export default function JournalScreen() {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [mode, setMode] = useState<Mode>("freeform");
  const [text, setText] = useState("");
  const [guidedAnswers, setGuidedAnswers] = useState<string[]>(GUIDED_PROMPTS.map(() => ""));
  const [mood, setMood] = useState<string | null>(null);

  const loadEntries = useCallback(() => {
    getJournalEntries().then((data) => setEntries(data));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  const hasContent =
    mode === "freeform" ? text.trim().length > 0 : guidedAnswers.some((a) => a.trim().length > 0);

  function handleSave() {
    if (!hasContent) return;

    const body =
      mode === "freeform"
        ? text.trim()
        : GUIDED_PROMPTS.map((prompt, i) => (guidedAnswers[i].trim() ? `${prompt}\n${guidedAnswers[i].trim()}` : ""))
            .filter(Boolean)
            .join("\n\n");

    const entry: JournalEntry = {
      id: `journal-${Date.now()}`,
      timestamp: new Date().toISOString(),
      text: body,
      moodPrimary: mood ?? undefined,
      prompt: mode === "guided" ? GUIDED_PROMPTS[0] : undefined,
    };
    addJournalEntry(entry).then(() => {
      setText("");
      setGuidedAnswers(GUIDED_PROMPTS.map(() => ""));
      setMood(null);
      loadEntries();
    });
  }

  const buckets = useMemo(() => dayBuckets(entries), [entries]);

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={buckets}
      keyExtractor={(bucket) => bucket.date}
      ListHeaderComponent={
        <View style={styles.form}>
          <FadeIn>
            <Text style={styles.title}>Log your day</Text>

            <View style={styles.modeRow}>
              <AnimatedPressable
                onPress={() => setMode("freeform")}
                style={[styles.modeChip, mode === "freeform" && styles.modeChipSelected]}
              >
                <Text style={[styles.modeChipText, mode === "freeform" && styles.modeChipTextSelected]}>
                  Freeform
                </Text>
              </AnimatedPressable>
              <AnimatedPressable
                onPress={() => setMode("guided")}
                style={[styles.modeChip, mode === "guided" && styles.modeChipSelected]}
              >
                <Text style={[styles.modeChipText, mode === "guided" && styles.modeChipTextSelected]}>
                  Guided
                </Text>
              </AnimatedPressable>
            </View>

            <Card style={styles.composeCard}>
              {mode === "freeform" ? (
                <TextInput
                  style={styles.textArea}
                  value={text}
                  onChangeText={setText}
                  placeholder="What happened today? How did it affect you?"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={6}
                />
              ) : (
                <View>
                  {GUIDED_PROMPTS.map((prompt, i) => (
                    <View key={prompt} style={styles.guidedBlock}>
                      <Text style={styles.guidedPrompt}>{prompt}</Text>
                      <TextInput
                        style={styles.guidedInput}
                        value={guidedAnswers[i]}
                        onChangeText={(value) =>
                          setGuidedAnswers((prev) => prev.map((a, idx) => (idx === i ? value : a)))
                        }
                        placeholder="Write a few words..."
                        placeholderTextColor={colors.textMuted}
                        multiline
                      />
                    </View>
                  ))}
                </View>
              )}

              <Text style={styles.label}>How are you feeling? (optional)</Text>
              <View style={styles.moodRow}>
                {JOURNAL_MOODS.map((m) => {
                  const selected = mood === m.label;
                  const tint = colors.moods[m.label] ?? colors.primary;
                  return (
                    <AnimatedPressable
                      key={m.label}
                      onPress={() => setMood((current) => (current === m.label ? null : m.label))}
                      style={[styles.moodChip, selected && { backgroundColor: tint, borderColor: tint }]}
                    >
                      <Ionicons name={m.icon} size={16} color={selected ? "#fff" : tint} />
                    </AnimatedPressable>
                  );
                })}
              </View>

              <Button label="Save entry" onPress={handleSave} disabled={!hasContent} />
            </Card>
          </FadeIn>
          <Text style={styles.sectionTitle}>Past entries</Text>
        </View>
      }
      renderItem={({ item, index }: { item: DayBucket<JournalEntry>; index: number }) => (
        <FadeIn delay={Math.min(index, 4) * 40}>
          <View style={styles.bucket}>
            <Text style={styles.bucketLabel}>{item.label}</Text>
            {item.entries.map((entry) => (
              <Card key={entry.id} style={styles.entryCard} muted>
                <View style={styles.entryHeader}>
                  {entry.moodPrimary && (
                    <Ionicons
                      name={JOURNAL_MOODS.find((m) => m.label === entry.moodPrimary)?.icon ?? "ellipse"}
                      size={14}
                      color={colors.moods[entry.moodPrimary] ?? colors.primary}
                    />
                  )}
                  <Text style={styles.entryMeta}>{new Date(entry.timestamp).toLocaleTimeString()}</Text>
                </View>
                <Text style={styles.entryText}>{entry.text}</Text>
              </Card>
            ))}
          </View>
        </FadeIn>
      )}
      ListEmptyComponent={<EmptyState label="No journal entries yet. Write your first one above." />}
    />
  );
}

function createStyles(colors: ThemeColors, typography: Typography) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
    form: { marginBottom: spacing.sm },
    title: { ...typography.title, marginBottom: spacing.lg },
    modeRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
    modeChip: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      backgroundColor: colors.surface,
    },
    modeChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
    modeChipText: { fontSize: 13, fontWeight: "600", color: colors.textPrimary },
    modeChipTextSelected: { color: "#fff" },
    composeCard: { marginBottom: spacing.sm },
    textArea: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: spacing.md,
      paddingVertical: 10,
      fontSize: 15,
      minHeight: 120,
      textAlignVertical: "top",
      marginBottom: spacing.md,
      backgroundColor: colors.surface,
      color: colors.textPrimary,
    },
    guidedBlock: { marginBottom: spacing.md },
    guidedPrompt: { ...typography.subheading, marginBottom: spacing.xs },
    guidedInput: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: spacing.md,
      paddingVertical: 10,
      fontSize: 15,
      minHeight: 50,
      textAlignVertical: "top",
      backgroundColor: colors.surface,
      color: colors.textPrimary,
    },
    label: { ...typography.subheading, marginBottom: spacing.sm },
    moodRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
    moodChip: {
      width: 36,
      height: 36,
      borderRadius: radius.pill,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
    },
    sectionTitle: { ...typography.heading, marginTop: spacing.xxl, marginBottom: spacing.sm },
    bucket: { marginBottom: spacing.md },
    bucketLabel: { ...typography.caption, marginBottom: spacing.xs, textTransform: "uppercase" },
    entryCard: { marginBottom: spacing.sm },
    entryHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    entryMeta: { ...typography.caption },
    entryText: { ...typography.body },
  });
}

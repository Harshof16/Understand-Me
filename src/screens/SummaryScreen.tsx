import React, { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import {
  addInsightSnapshot,
  getInsightSnapshots,
  getJournalEntries,
  getMoodEntries,
} from "../storage/repository";
import type { InsightSnapshot } from "../types";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { FadeIn } from "../components/FadeIn";
import { ProgressBar } from "../components/ProgressBar";
import { Spinner } from "../components/Spinner";
import { EmptyState } from "../components/illustrations/EmptyState";
import { spacing, useTheme, ThemeColors, Typography } from "../theme";

const MIN_ENTRIES_FOR_SUMMARY = 5;

// Stub: replace with a real Claude API call once there's a backend proxy to hold the key.
// This placeholder keeps the data flow (entries in -> snapshot out) wired up end to end.
async function generateStubSummary(moodCount: number, journalCount: number): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 900));
  return (
    `[AI summary placeholder] Based on ${moodCount} mood logs and ${journalCount} journal entries, ` +
    `this is where Claude will identify your recurring pain points and emotional patterns once the ` +
    `API integration is wired up.`
  );
}

export default function SummaryScreen() {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  const [snapshots, setSnapshots] = useState<InsightSnapshot[]>([]);
  const [entryCount, setEntryCount] = useState(0);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(() => {
    Promise.all([getInsightSnapshots(), getMoodEntries(), getJournalEntries()]).then(
      ([snaps, moods, journals]) => {
        setSnapshots([...snaps].reverse());
        setEntryCount(moods.length + journals.length);
      }
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const hasEnoughData = entryCount >= MIN_ENTRIES_FOR_SUMMARY;
  const progress = Math.min(entryCount / MIN_ENTRIES_FOR_SUMMARY, 1);

  async function handleGenerate() {
    setGenerating(true);
    const [moods, journals] = await Promise.all([getMoodEntries(), getJournalEntries()]);
    const summaryText = await generateStubSummary(moods.length, journals.length);
    const now = new Date();
    const snapshot: InsightSnapshot = {
      id: `insight-${Date.now()}`,
      periodStart: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      periodEnd: now.toISOString(),
      summaryText,
      generatedAt: now.toISOString(),
    };
    await addInsightSnapshot(snapshot);
    setGenerating(false);
    load();
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={snapshots}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View style={styles.form}>
          <FadeIn>
            <Text style={styles.title}>Your pain points & patterns</Text>
          </FadeIn>

          <FadeIn delay={80}>
            <Card style={styles.statusCard}>
              {hasEnoughData ? (
                <Text style={styles.subtitle}>
                  You have {entryCount} logged entries. Generate a summary to see recurring patterns.
                </Text>
              ) : (
                <>
                  <Text style={styles.subtitle}>
                    Log at least {MIN_ENTRIES_FOR_SUMMARY} mood/journal entries before generating a
                    summary — too little data gives unreliable insights.
                  </Text>
                  <ProgressBar progress={progress} />
                  <Text style={styles.progressLabel}>
                    {entryCount} / {MIN_ENTRIES_FOR_SUMMARY} entries
                  </Text>
                </>
              )}
              <Button
                label={generating ? "Generating..." : "Generate summary"}
                onPress={handleGenerate}
                disabled={!hasEnoughData || generating}
              />
              {generating && (
                <View style={styles.generatingRow}>
                  <Spinner />
                  <Text style={styles.generatingText}>Analyzing your entries...</Text>
                </View>
              )}
            </Card>
          </FadeIn>

          <Text style={styles.sectionTitle}>Past summaries</Text>
        </View>
      }
      renderItem={({ item, index }) => (
        <FadeIn delay={Math.min(index, 4) * 40}>
          <Card style={styles.entryCard} muted>
            <View style={styles.entryHeader}>
              <Ionicons name="sparkles" size={14} color={colors.primary} />
              <Text style={styles.entryMeta}>{new Date(item.generatedAt).toLocaleString()}</Text>
            </View>
            <Text style={styles.entryText}>{item.summaryText}</Text>
          </Card>
        </FadeIn>
      )}
      ListEmptyComponent={<EmptyState label="No summaries generated yet." />}
    />
  );
}

function createStyles(colors: ThemeColors, typography: Typography) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
    form: { marginBottom: spacing.sm },
    title: { ...typography.title, marginBottom: spacing.lg },
    statusCard: { marginBottom: spacing.sm },
    subtitle: { ...typography.bodyMuted, marginBottom: spacing.md },
    progressLabel: { ...typography.caption, marginTop: spacing.sm, marginBottom: spacing.md },
    generatingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    generatingText: { ...typography.bodyMuted },
    sectionTitle: { ...typography.heading, marginTop: spacing.xxl, marginBottom: spacing.sm },
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

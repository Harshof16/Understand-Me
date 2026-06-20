import React, { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import {
  addInsightSnapshot,
  getDailySchedule,
  getInsightSnapshots,
  getJournalEntries,
  getMoodEntries,
  getPersonalityBaseline,
  getScenarioSession,
} from "../storage/repository";
import { requestProfileSummary } from "../services/profileSummary";
import type { BigFiveScores, InsightSnapshot, MoodEntry, PersonalityBaseline } from "../types";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { FadeIn } from "../components/FadeIn";
import { ProgressBar } from "../components/ProgressBar";
import { Spinner } from "../components/Spinner";
import { StreakBadge } from "../components/StreakBadge";
import { RadarChart } from "../components/charts/RadarChart";
import { ScoreRing } from "../components/charts/ScoreRing";
import { MoodBarChart } from "../components/charts/MoodBarChart";
import { MoodTrendChart } from "../components/charts/MoodTrendChart";
import { EmptyState } from "../components/illustrations/EmptyState";
import { computeStreak, sentimentCounts, weeklyTrend } from "../utils/moodStats";
import { spacing, useTheme, ThemeColors, Typography } from "../theme";

const MIN_ENTRIES_FOR_SUMMARY = 5;

const TRAIT_LABELS: Record<keyof BigFiveScores, string> = {
  openness: "Open",
  conscientiousness: "Consc.",
  extraversion: "Extra.",
  agreeableness: "Agree.",
  neuroticism: "Stable",
};

export default function SummaryScreen() {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  const [snapshots, setSnapshots] = useState<InsightSnapshot[]>([]);
  const [entryCount, setEntryCount] = useState(0);
  const [baseline, setBaseline] = useState<PersonalityBaseline | null>(null);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [streak, setStreak] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    Promise.all([getInsightSnapshots(), getMoodEntries(), getJournalEntries(), getPersonalityBaseline()]).then(
      ([snaps, moods, journals, base]) => {
        setSnapshots([...snaps].reverse());
        setEntryCount(moods.length + journals.length);
        setMoodEntries(moods);
        setBaseline(base);
        setStreak(computeStreak(moods, journals));
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
    setError(null);
    try {
      const [baseline, schedule, scenarioSession, moods, journals] = await Promise.all([
        getPersonalityBaseline(),
        getDailySchedule(),
        getScenarioSession(),
        getMoodEntries(),
        getJournalEntries(),
      ]);

      const result = await requestProfileSummary({
        personalityBaseline: baseline,
        dailySchedule: schedule,
        scenarioSession,
        moodEntries: [...moods].reverse(),
        journalEntries: [...journals].reverse(),
      });

      const now = new Date();
      const snapshot: InsightSnapshot = {
        id: `insight-${Date.now()}`,
        periodStart: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        periodEnd: now.toISOString(),
        summaryText: result.summaryText ?? "",
        attributes: result.attributes ?? [],
        painPoints: result.painPoints ?? [],
        productiveWindows: result.productiveWindows ?? [],
        generatedAt: now.toISOString(),
      };
      await addInsightSnapshot(snapshot);
      load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't generate a summary. Check that the profile server is running."
      );
    } finally {
      setGenerating(false);
    }
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
            <Text style={styles.title}>Your concluded profile</Text>
          </FadeIn>

          {(baseline || moodEntries.length > 0) && (
            <FadeIn delay={40}>
              <ErrorBoundary fallbackLabel="Couldn't load your personality score.">
                <Card style={styles.statsCard}>
                  <View style={styles.statsTopRow}>
                    {baseline ? (
                      <ScoreRing
                        value={
                          (Object.keys(TRAIT_LABELS) as (keyof BigFiveScores)[]).reduce(
                            (sum, trait) =>
                              sum +
                              (trait === "neuroticism"
                                ? 6 - baseline.bigFiveScores[trait]
                                : baseline.bigFiveScores[trait]),
                            0
                          )
                        }
                        max={25}
                        label="Score"
                        size={120}
                        strokeWidth={10}
                      />
                    ) : (
                      <Text style={styles.cardBody}>Take the personality quiz to see your score.</Text>
                    )}
                    <StreakBadge days={streak} />
                  </View>

                  {baseline && (
                    <View style={styles.radarWrap}>
                      <RadarChart
                        data={(Object.keys(TRAIT_LABELS) as (keyof BigFiveScores)[]).map((trait) => ({
                          label: TRAIT_LABELS[trait],
                          value:
                            trait === "neuroticism"
                              ? 6 - baseline.bigFiveScores[trait]
                              : baseline.bigFiveScores[trait],
                        }))}
                        max={5}
                        size={200}
                      />
                    </View>
                  )}
                </Card>
              </ErrorBoundary>
            </FadeIn>
          )}

          {moodEntries.length > 0 && (
            <FadeIn delay={60}>
              <ErrorBoundary fallbackLabel="Couldn't load your mood trend.">
                <Card style={styles.statsCard}>
                  <Text style={styles.cardTitle}>Mood trend (7 days)</Text>
                  <MoodTrendChart points={weeklyTrend(moodEntries)} />
                </Card>
              </ErrorBoundary>
              <ErrorBoundary fallbackLabel="Couldn't load your mood breakdown.">
                <Card style={styles.statsCard}>
                  <Text style={styles.cardTitle}>Mood breakdown</Text>
                  <MoodBarChart counts={sentimentCounts(moodEntries)} />
                </Card>
              </ErrorBoundary>
            </FadeIn>
          )}

          <FadeIn delay={80}>
            <Card style={styles.statusCard}>
              {hasEnoughData ? (
                <Text style={styles.subtitle}>
                  You have {entryCount} logged entries. Generate a profile to see what we've
                  concluded so far.
                </Text>
              ) : (
                <>
                  <Text style={styles.subtitle}>
                    Log at least {MIN_ENTRIES_FOR_SUMMARY} mood/journal entries before generating a
                    profile — too little data gives unreliable conclusions.
                  </Text>
                  <ProgressBar progress={progress} />
                  <Text style={styles.progressLabel}>
                    {entryCount} / {MIN_ENTRIES_FOR_SUMMARY} entries
                  </Text>
                </>
              )}
              <Button
                label={generating ? "Generating..." : "Generate profile"}
                onPress={handleGenerate}
                disabled={!hasEnoughData || generating}
              />
              {generating && (
                <View style={styles.generatingRow}>
                  <Spinner />
                  <Text style={styles.generatingText}>Asking Gemini about your data...</Text>
                </View>
              )}
              {error && (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle" size={16} color={colors.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </Card>
          </FadeIn>

          <Text style={styles.sectionTitle}>Past profiles</Text>
        </View>
      }
      renderItem={({ item, index }) => {
        const attributes = item.attributes ?? [];
        const painPoints = item.painPoints ?? [];
        const productiveWindows = item.productiveWindows ?? [];
        return (
        <FadeIn delay={Math.min(index, 4) * 40}>
          <Card style={styles.entryCard} muted>
            <View style={styles.entryHeader}>
              <Ionicons name="sparkles" size={14} color={colors.primary} />
              <Text style={styles.entryMeta}>{new Date(item.generatedAt).toLocaleString()}</Text>
            </View>

            <Text style={styles.entryText}>{item.summaryText}</Text>

            {attributes.length > 0 && (
              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>Concluded attributes</Text>
                {attributes.map((attr, i) => (
                  <View key={i} style={styles.attributeRow}>
                    <View style={styles.attributeDot} />
                    <View style={styles.attributeTextWrap}>
                      <Text style={styles.attributeLabel}>{attr.label}</Text>
                      <Text style={styles.attributeDetail}>{attr.detail}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {painPoints.length > 0 && (
              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>Recurring pain points</Text>
                {painPoints.map((point, i) => (
                  <Text key={i} style={styles.bulletText}>
                    • {point}
                  </Text>
                ))}
              </View>
            )}

            {productiveWindows.length > 0 && (
              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>Best windows</Text>
                {productiveWindows.map((window, i) => (
                  <Text key={i} style={styles.bulletText}>
                    • {window}
                  </Text>
                ))}
              </View>
            )}
          </Card>
        </FadeIn>
        );
      }}
      ListEmptyComponent={<EmptyState label="No profiles generated yet." />}
    />
  );
}

function createStyles(colors: ThemeColors, typography: Typography) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
    form: { marginBottom: spacing.sm },
    title: { ...typography.title, marginBottom: spacing.lg },
    statsCard: { marginBottom: spacing.lg },
    statsTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    radarWrap: { alignItems: "center", marginTop: spacing.lg },
    cardTitle: { ...typography.subheading, marginBottom: spacing.md },
    cardBody: { ...typography.bodyMuted },
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
    errorRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    errorText: { ...typography.bodyMuted, color: colors.danger, flex: 1 },
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
    subsection: { marginTop: spacing.md },
    subsectionTitle: { ...typography.subheading, marginBottom: spacing.sm },
    attributeRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, marginBottom: spacing.sm },
    attributeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
      marginTop: 7,
    },
    attributeTextWrap: { flex: 1 },
    attributeLabel: { ...typography.subheading, marginBottom: 2 },
    attributeDetail: { ...typography.bodyMuted },
    bulletText: { ...typography.bodyMuted, marginBottom: spacing.xs },
  });
}

import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import type { BigFiveScores } from "../types";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { FadeIn } from "../components/FadeIn";
import { ProgressBar } from "../components/ProgressBar";
import { RadarChart } from "../components/charts/RadarChart";
import { ScoreRing } from "../components/charts/ScoreRing";
import { spacing, useTheme, ThemeColors, Typography } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "PersonalityResult">;

const TRAIT_LABELS: Record<keyof BigFiveScores, string> = {
  openness: "Openness",
  conscientiousness: "Conscientiousness",
  extraversion: "Extraversion",
  agreeableness: "Agreeableness",
  neuroticism: "Emotional stability",
};

const ATTACHMENT_COPY: Record<string, string> = {
  secure: "You tend to form trusting, stable connections with others.",
  anxious: "You crave closeness and may worry about how others feel about you.",
  avoidant: "You value independence and may keep some emotional distance.",
  fearful: "You want closeness but can feel uneasy once you have it.",
};

export default function PersonalityResultScreen({ route, navigation }: Props) {
  const { baseline } = route.params;
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  const radarData = useMemo(
    () =>
      (Object.keys(TRAIT_LABELS) as (keyof BigFiveScores)[]).map((trait) => ({
        label: TRAIT_LABELS[trait].split(" ")[0],
        // Emotional stability is the inverse of raw neuroticism so the chart reads "higher = better" consistently.
        value: trait === "neuroticism" ? 6 - baseline.bigFiveScores[trait] : baseline.bigFiveScores[trait],
      })),
    [baseline]
  );

  const overallScore = radarData.reduce((sum, d) => sum + d.value, 0);
  const maxScore = radarData.length * 5;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <FadeIn>
        <Text style={styles.title}>Your Personality Score</Text>
        <Text style={styles.subtitle}>Based on your quiz answers, here's what we found.</Text>
      </FadeIn>

      <FadeIn delay={60}>
        <ErrorBoundary fallbackLabel="Couldn't load your overall score.">
          <View style={styles.ringWrap}>
            <ScoreRing value={overallScore} max={maxScore} label="Overall" size={170} strokeWidth={14} />
          </View>
        </ErrorBoundary>
      </FadeIn>

      <FadeIn delay={120}>
        <ErrorBoundary fallbackLabel="Couldn't load your trait breakdown.">
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Trait breakdown</Text>
            <View style={styles.radarWrap}>
              <RadarChart data={radarData} max={5} size={230} />
            </View>
          </Card>
        </ErrorBoundary>
      </FadeIn>

      <FadeIn delay={180}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>General breakdown</Text>
          {radarData.map((d) => (
            <View key={d.label} style={styles.traitRow}>
              <View style={styles.traitHeader}>
                <Text style={styles.traitLabel}>{d.label}</Text>
                <Text style={styles.traitValue}>{d.value.toFixed(1)} / 5</Text>
              </View>
              <ProgressBar progress={d.value / 5} />
            </View>
          ))}
        </Card>
      </FadeIn>

      <FadeIn delay={240}>
        <Card style={styles.card} muted>
          <Text style={styles.cardTitle}>Attachment style</Text>
          <Text style={styles.attachmentLabel}>
            {baseline.attachmentStyle.charAt(0).toUpperCase() + baseline.attachmentStyle.slice(1)}
          </Text>
          <Text style={styles.cardBody}>{ATTACHMENT_COPY[baseline.attachmentStyle]}</Text>
        </Card>
      </FadeIn>

      <Button label="Continue" onPress={() => navigation.replace("Tabs")} />
    </ScrollView>
  );
}

function createStyles(colors: ThemeColors, typography: Typography) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
    title: { ...typography.title, textAlign: "center" },
    subtitle: { ...typography.bodyMuted, textAlign: "center", marginTop: spacing.xs, marginBottom: spacing.lg },
    ringWrap: { alignItems: "center", marginBottom: spacing.xl },
    card: { marginBottom: spacing.lg },
    cardTitle: { ...typography.heading, marginBottom: spacing.md },
    radarWrap: { alignItems: "center" },
    traitRow: { marginBottom: spacing.md },
    traitHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xs },
    traitLabel: { ...typography.subheading },
    traitValue: { ...typography.caption },
    attachmentLabel: { ...typography.heading, color: colors.primary, marginBottom: spacing.xs },
    cardBody: { ...typography.bodyMuted },
  });
}

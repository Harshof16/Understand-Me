import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps, NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  getDailySchedule,
  getJournalEntries,
  getMoodEntries,
  getPersonalityBaseline,
  getScenarioSession,
} from "../storage/repository";
import type { BigFiveScores, DailySchedule, PersonalityBaseline, ScenarioSession } from "../types";
import type { MainTabsParamList, RootStackParamList } from "../navigation/types";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { FadeIn } from "../components/FadeIn";
import { StreakBadge } from "../components/StreakBadge";
import { ScoreRing } from "../components/charts/ScoreRing";
import { AnimatedPressable } from "../components/AnimatedPressable";
import { CalmWaves } from "../components/illustrations/CalmWaves";
import { computeStreak } from "../utils/moodStats";
import { spacing, useTheme, ThemeColors, Typography } from "../theme";

const TRAIT_KEYS: (keyof BigFiveScores)[] = [
  "openness",
  "conscientiousness",
  "extraversion",
  "agreeableness",
  "neuroticism",
];

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, "Home">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function HomeScreen({ navigation }: Props) {
  const { colors, typography, mode, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  const [baseline, setBaseline] = useState<PersonalityBaseline | null>(null);
  const [schedule, setSchedule] = useState<DailySchedule | null>(null);
  const [scenarioSession, setScenarioSession] = useState<ScenarioSession | null>(null);
  const [streak, setStreak] = useState(0);

  const load = useCallback(() => {
    Promise.all([
      getPersonalityBaseline(),
      getDailySchedule(),
      getScenarioSession(),
      getMoodEntries(),
      getJournalEntries(),
    ]).then(([b, s, session, moods, journals]) => {
      setBaseline(b);
      setSchedule(s);
      setScenarioSession(session);
      setStreak(computeStreak(moods, journals));
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const rootNav = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>() ?? navigation;

  return (
    <View style={styles.root}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <CalmWaves width={400} height={140} />
          <FadeIn>
            <Text style={styles.title}>Understanding Me</Text>
            <Text style={styles.subtitle}>Know thyself — one log at a time.</Text>
          </FadeIn>
        </View>

        {(streak > 0 || baseline) && (
          <FadeIn delay={20}>
            <ErrorBoundary fallbackLabel="Couldn't load today's stats.">
              <AnimatedPressable
                onPress={() => navigation.navigate("Summary")}
                style={styles.todayRow}
              >
                {baseline ? (
                  <ScoreRing
                    value={TRAIT_KEYS.reduce(
                      (sum, trait) =>
                        sum +
                        (trait === "neuroticism" ? 6 - baseline.bigFiveScores[trait] : baseline.bigFiveScores[trait]),
                      0
                    )}
                    max={25}
                    size={64}
                    strokeWidth={6}
                  />
                ) : (
                  <View style={styles.todayRowSpacer} />
                )}
                <StreakBadge days={streak} />
              </AnimatedPressable>
            </ErrorBoundary>
          </FadeIn>
        )}

        <FadeIn delay={40}>
          <Card style={styles.card}>
            <View style={styles.appearanceRow}>
              <View style={styles.appearanceLabel}>
                <Ionicons
                  name={mode === "dark" ? "moon" : "sunny"}
                  size={18}
                  color={mode === "dark" ? colors.primary : colors.warning}
                />
                <Text style={styles.cardTitle}>Dark theme</Text>
              </View>
              <Switch
                value={mode === "dark"}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.surface}
              />
            </View>
          </Card>
        </FadeIn>

        <FadeIn delay={80}>
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBadge, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="person" size={18} color={colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Personality baseline</Text>
            </View>
            {baseline ? (
              <Text style={styles.cardBody}>{baseline.narrativeSummary}</Text>
            ) : (
              <>
                <Text style={styles.cardBody}>Not taken yet.</Text>
                <Button label="Take the quiz" onPress={() => rootNav.navigate("PersonalityQuiz")} />
              </>
            )}
          </Card>
        </FadeIn>

        <FadeIn delay={140}>
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBadge, { backgroundColor: colors.secondaryLight }]}>
                <Ionicons name="time" size={18} color={colors.secondary} />
              </View>
              <Text style={styles.cardTitle}>Day structure</Text>
            </View>
            <Text style={styles.cardBody}>
              {schedule
                ? `Wake ${schedule.wakeTime} · Sleep ${schedule.sleepTime} · ${schedule.blocks.length} recurring block(s)`
                : "Not set up yet."}
            </Text>
            <Button
              label={schedule ? "Edit my day" : "Set up my day"}
              variant={schedule ? "secondary" : "primary"}
              onPress={() => rootNav.navigate("ScheduleSetup")}
            />
          </Card>
        </FadeIn>

        <FadeIn delay={200}>
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBadge, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="shuffle" size={18} color={colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Situational questions</Text>
            </View>
            <Text style={styles.cardBody}>
              {scenarioSession
                ? `Completed on ${new Date(scenarioSession.takenAt).toLocaleDateString()}.`
                : "Not completed yet."}
            </Text>
            <Button
              label={scenarioSession ? "Retake situations" : "Answer situations"}
              variant="secondary"
              onPress={() => rootNav.navigate("Scenario")}
            />
          </Card>
        </FadeIn>
      </ScrollView>
    </View>
  );
}

function createStyles(colors: ThemeColors, typography: Typography) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1 },
    content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
    header: { paddingTop: spacing.lg, paddingBottom: spacing.xxl, overflow: "hidden" },
    title: { ...typography.title },
    subtitle: { ...typography.bodyMuted, marginTop: spacing.xs },
    todayRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surfaceMuted,
      borderRadius: 16,
      padding: spacing.md,
      marginBottom: spacing.lg,
    },
    todayRowSpacer: { width: 64, height: 64 },
    card: { marginBottom: spacing.lg },
    appearanceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    appearanceLabel: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.sm,
      gap: spacing.sm,
    },
    iconBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    cardTitle: { ...typography.subheading },
    cardBody: { ...typography.bodyMuted, marginBottom: spacing.sm },
  });
}

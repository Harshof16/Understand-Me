import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SCENARIOS } from "../data/scenarios";
import { saveScenarioSession } from "../storage/repository";
import type { BigFiveScores, ScenarioSession } from "../types";
import type { RootStackParamList } from "../navigation/types";
import { AnimatedPressable } from "../components/AnimatedPressable";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { FadeIn } from "../components/FadeIn";
import { ProgressBar } from "../components/ProgressBar";
import { spacing, useTheme, ThemeColors, Typography } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Scenario">;

export default function ScenarioScreen({ navigation }: Props) {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  const [stepIndex, setStepIndex] = useState(0);
  // scenarioId -> chosen choiceId. A map (not an accumulating sum) so revisiting a
  // question via Back, or retaking the whole set, always reflects only the latest choice.
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const scenario = SCENARIOS[stepIndex];
  const isLast = stepIndex === SCENARIOS.length - 1;

  function computeTraitDeltas(finalAnswers: Record<string, string>): Partial<BigFiveScores> {
    const totals: Partial<BigFiveScores> = {};
    for (const s of SCENARIOS) {
      const chosenId = finalAnswers[s.id];
      const choice = s.choices.find((c) => c.id === chosenId);
      if (!choice) continue;
      for (const key of Object.keys(choice.traitDeltas) as (keyof BigFiveScores)[]) {
        totals[key] = (totals[key] ?? 0) + (choice.traitDeltas[key] ?? 0);
      }
    }
    return totals;
  }

  function handleChoice(choiceId: string) {
    const updatedAnswers = { ...answers, [scenario.id]: choiceId };
    setAnswers(updatedAnswers);

    setTimeout(() => {
      if (isLast) {
        const session: ScenarioSession = {
          id: `scenario-session-${Date.now()}`,
          scenarioId: "onboarding-set",
          choicesMade: SCENARIOS.map((s) => updatedAnswers[s.id]),
          traitDeltas: computeTraitDeltas(updatedAnswers),
          takenAt: new Date().toISOString(),
        };
        saveScenarioSession(session).then(() => navigation.replace("Tabs"));
      } else {
        setStepIndex((i) => i + 1);
      }
    }, 180);
  }

  function handleBack() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  return (
    <View style={styles.container}>
      <View style={styles.progressWrap}>
        <ProgressBar progress={(stepIndex + 1) / SCENARIOS.length} />
        <View style={styles.progressFooter}>
          <AnimatedPressable
            onPress={handleBack}
            disabled={stepIndex === 0}
            style={[styles.backButton, stepIndex === 0 && styles.backButtonDisabled]}
          >
            <Ionicons name="chevron-back" size={16} color={colors.primary} />
            <Text style={styles.backLabel}>Back</Text>
          </AnimatedPressable>
          <Text style={styles.progressLabel}>
            Situation {stepIndex + 1} of {SCENARIOS.length}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <FadeIn key={scenario.id}>
          <Card style={styles.promptCard}>
            <Text style={styles.prompt}>{scenario.prompt}</Text>
          </Card>

          <View style={styles.choices}>
            {scenario.choices.map((choice, i) => (
              <FadeIn key={choice.id} delay={80 + i * 60} style={styles.choiceWrap}>
                <Button
                  label={choice.text}
                  variant={answers[scenario.id] === choice.id ? "primary" : "secondary"}
                  onPress={() => handleChoice(choice.id)}
                />
              </FadeIn>
            ))}
          </View>
        </FadeIn>
      </ScrollView>
    </View>
  );
}

function createStyles(colors: ThemeColors, typography: Typography) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl },
    progressWrap: { marginBottom: spacing.xl },
    progressFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: spacing.sm,
    },
    backButton: { flexDirection: "row", alignItems: "center", gap: 2 },
    backButtonDisabled: { opacity: 0.3 },
    backLabel: { fontSize: 13, fontWeight: "600", color: colors.primary },
    progressLabel: { ...typography.caption },
    scrollContent: { paddingBottom: spacing.xxxl },
    promptCard: { marginBottom: spacing.xl },
    prompt: { ...typography.heading, lineHeight: 28 },
    choices: {},
    choiceWrap: { marginBottom: spacing.md },
  });
}

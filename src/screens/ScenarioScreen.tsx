import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SCENARIOS } from "../data/scenarios";
import { addScenarioSession } from "../storage/repository";
import type { BigFiveScores, ScenarioSession } from "../types";
import type { RootStackParamList } from "../navigation/types";
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
  const [choicesMade, setChoicesMade] = useState<string[]>([]);
  const [traitDeltas, setTraitDeltas] = useState<Partial<BigFiveScores>>({});

  const scenario = SCENARIOS[stepIndex];
  const isLast = stepIndex === SCENARIOS.length - 1;

  function handleChoice(choiceId: string, deltas: Partial<BigFiveScores>) {
    const mergedDeltas: Partial<BigFiveScores> = { ...traitDeltas };
    for (const key of Object.keys(deltas) as (keyof BigFiveScores)[]) {
      mergedDeltas[key] = (mergedDeltas[key] ?? 0) + (deltas[key] ?? 0);
    }
    const updatedChoices = [...choicesMade, choiceId];

    if (isLast) {
      const session: ScenarioSession = {
        id: `scenario-session-${Date.now()}`,
        scenarioId: "onboarding-set",
        choicesMade: updatedChoices,
        traitDeltas: mergedDeltas,
        takenAt: new Date().toISOString(),
      };
      addScenarioSession(session).then(() => navigation.replace("Tabs"));
      return;
    }

    setChoicesMade(updatedChoices);
    setTraitDeltas(mergedDeltas);
    setStepIndex((i) => i + 1);
  }

  return (
    <View style={styles.container}>
      <View style={styles.progressWrap}>
        <ProgressBar progress={(stepIndex + 1) / SCENARIOS.length} />
        <Text style={styles.progressLabel}>
          Situation {stepIndex + 1} of {SCENARIOS.length}
        </Text>
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
                  variant="secondary"
                  onPress={() => handleChoice(choice.id, choice.traitDeltas)}
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
    progressLabel: { ...typography.caption, marginTop: spacing.sm, textAlign: "right" },
    scrollContent: { paddingBottom: spacing.xxxl },
    promptCard: { marginBottom: spacing.xl },
    prompt: { ...typography.heading, lineHeight: 28 },
    choices: {},
    choiceWrap: { marginBottom: spacing.xs },
  });
}

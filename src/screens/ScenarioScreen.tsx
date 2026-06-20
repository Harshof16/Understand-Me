import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SCENARIOS } from "../data/scenarios";
import { addScenarioSession } from "../storage/repository";
import type { BigFiveScores, ScenarioSession } from "../types";
import type { RootStackParamList } from "../navigation/types";
import { Button } from "../components/Button";

type Props = NativeStackScreenProps<RootStackParamList, "Scenario">;

export default function ScenarioScreen({ navigation }: Props) {
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.progress}>
        Situation {stepIndex + 1} of {SCENARIOS.length}
      </Text>
      <Text style={styles.prompt}>{scenario.prompt}</Text>

      <View style={styles.choices}>
        {scenario.choices.map((choice) => (
          <View key={choice.id} style={styles.choiceWrapper}>
            <Button
              label={choice.text}
              variant="secondary"
              onPress={() => handleChoice(choice.id, choice.traitDeltas)}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20, paddingBottom: 48 },
  progress: { fontSize: 13, color: "#888", marginBottom: 12 },
  prompt: { fontSize: 19, fontWeight: "600", marginBottom: 24, lineHeight: 26 },
  choices: { gap: 4 },
  choiceWrapper: { marginBottom: 4 },
});

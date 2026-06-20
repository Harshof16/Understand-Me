import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ATTACHMENT_QUESTIONS, QUIZ_QUESTIONS } from "../data/quizQuestions";
import { savePersonalityBaseline } from "../storage/repository";
import type { AttachmentStyle, BigFiveScores, PersonalityBaseline } from "../types";
import type { RootStackParamList } from "../navigation/types";
import { Button } from "../components/Button";
import { LikertScale } from "../components/LikertScale";

type Props = NativeStackScreenProps<RootStackParamList, "PersonalityQuiz">;

const TRAIT_KEYS: (keyof BigFiveScores)[] = [
  "openness",
  "conscientiousness",
  "extraversion",
  "agreeableness",
  "neuroticism",
];

function buildNarrativeSummary(scores: BigFiveScores, attachmentStyle: AttachmentStyle): string {
  const dominant = TRAIT_KEYS.reduce((a, b) => (scores[a] >= scores[b] ? a : b));
  return `You lean strongly toward ${dominant}, with a ${attachmentStyle} attachment style. This baseline will give your daily logs more context.`;
}

export default function PersonalityQuizScreen({ navigation }: Props) {
  const [traitAnswers, setTraitAnswers] = useState<Record<string, number>>({});
  const [attachmentAnswers, setAttachmentAnswers] = useState<Record<string, number>>({});

  const allAnswered =
    QUIZ_QUESTIONS.every((q) => traitAnswers[q.id] !== undefined) &&
    ATTACHMENT_QUESTIONS.every((q) => attachmentAnswers[q.id] !== undefined);

  function handleSubmit() {
    const scores: BigFiveScores = {
      openness: 0,
      conscientiousness: 0,
      extraversion: 0,
      agreeableness: 0,
      neuroticism: 0,
    };
    const counts: Record<keyof BigFiveScores, number> = {
      openness: 0,
      conscientiousness: 0,
      extraversion: 0,
      agreeableness: 0,
      neuroticism: 0,
    };

    for (const q of QUIZ_QUESTIONS) {
      const raw = traitAnswers[q.id];
      const value = q.reverseScored ? 6 - raw : raw;
      scores[q.trait] += value;
      counts[q.trait] += 1;
    }
    for (const trait of TRAIT_KEYS) {
      scores[trait] = counts[trait] > 0 ? scores[trait] / counts[trait] : 0;
    }

    const attachmentTotals: Record<AttachmentStyle, number> = {
      secure: 0,
      anxious: 0,
      avoidant: 0,
      fearful: 0,
    };
    for (const q of ATTACHMENT_QUESTIONS) {
      attachmentTotals[q.style] += attachmentAnswers[q.id] ?? 0;
    }
    const attachmentStyle = (Object.keys(attachmentTotals) as AttachmentStyle[]).reduce((a, b) =>
      attachmentTotals[a] >= attachmentTotals[b] ? a : b
    );

    const baseline: PersonalityBaseline = {
      id: `baseline-${Date.now()}`,
      bigFiveScores: scores,
      attachmentStyle,
      narrativeSummary: buildNarrativeSummary(scores, attachmentStyle),
      takenAt: new Date().toISOString(),
    };

    savePersonalityBaseline(baseline).then(() => navigation.replace("Tabs"));
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Know Thyself: Personality Baseline</Text>
      <Text style={styles.subtitle}>
        Rate how much each statement sounds like you, from 1 (not at all) to 5 (very much).
      </Text>

      {QUIZ_QUESTIONS.map((q) => (
        <View key={q.id} style={styles.questionBlock}>
          <Text style={styles.question}>{q.prompt}</Text>
          <LikertScale
            value={traitAnswers[q.id]}
            onChange={(v) => setTraitAnswers((prev) => ({ ...prev, [q.id]: v }))}
          />
        </View>
      ))}

      <Text style={styles.sectionTitle}>Closeness & Connection</Text>
      {ATTACHMENT_QUESTIONS.map((q) => (
        <View key={q.id} style={styles.questionBlock}>
          <Text style={styles.question}>{q.prompt}</Text>
          <LikertScale
            value={attachmentAnswers[q.id]}
            onChange={(v) => setAttachmentAnswers((prev) => ({ ...prev, [q.id]: v }))}
          />
        </View>
      ))}

      <Button label="See my baseline" onPress={handleSubmit} disabled={!allAnswered} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#555", marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginTop: 12, marginBottom: 8 },
  questionBlock: { marginBottom: 20 },
  question: { fontSize: 15, marginBottom: 8 },
});

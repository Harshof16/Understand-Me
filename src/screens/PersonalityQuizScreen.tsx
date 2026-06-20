import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ATTACHMENT_QUESTIONS, QUIZ_QUESTIONS } from "../data/quizQuestions";
import { savePersonalityBaseline } from "../storage/repository";
import type { AttachmentStyle, BigFiveScores, PersonalityBaseline } from "../types";
import type { RootStackParamList } from "../navigation/types";
import { AnimatedPressable } from "../components/AnimatedPressable";
import { Card } from "../components/Card";
import { FadeIn } from "../components/FadeIn";
import { LikertScale } from "../components/LikertScale";
import { ProgressBar } from "../components/ProgressBar";
import { spacing, useTheme, ThemeColors, Typography } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "PersonalityQuiz">;

const TRAIT_KEYS: (keyof BigFiveScores)[] = [
  "openness",
  "conscientiousness",
  "extraversion",
  "agreeableness",
  "neuroticism",
];

type Step =
  | { kind: "trait"; id: string; prompt: string }
  | { kind: "attachment"; id: string; prompt: string };

function buildNarrativeSummary(scores: BigFiveScores, attachmentStyle: AttachmentStyle): string {
  const dominant = TRAIT_KEYS.reduce((a, b) => (scores[a] >= scores[b] ? a : b));
  return `You lean strongly toward ${dominant}, with a ${attachmentStyle} attachment style. This baseline will give your daily logs more context.`;
}

export default function PersonalityQuizScreen({ navigation }: Props) {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  const steps: Step[] = useMemo(
    () => [
      ...QUIZ_QUESTIONS.map((q) => ({ kind: "trait" as const, id: q.id, prompt: q.prompt })),
      ...ATTACHMENT_QUESTIONS.map((q) => ({ kind: "attachment" as const, id: q.id, prompt: q.prompt })),
    ],
    []
  );

  const [stepIndex, setStepIndex] = useState(0);
  const [traitAnswers, setTraitAnswers] = useState<Record<string, number>>({});
  const [attachmentAnswers, setAttachmentAnswers] = useState<Record<string, number>>({});

  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;
  const currentValue =
    step.kind === "trait" ? traitAnswers[step.id] : attachmentAnswers[step.id];

  function finish(finalTraitAnswers: Record<string, number>, finalAttachmentAnswers: Record<string, number>) {
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
      const raw = finalTraitAnswers[q.id];
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
      attachmentTotals[q.style] += finalAttachmentAnswers[q.id] ?? 0;
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

    savePersonalityBaseline(baseline).then(() =>
      navigation.replace("PersonalityResult", { baseline })
    );
  }

  function handleAnswer(value: number) {
    let nextTraitAnswers = traitAnswers;
    let nextAttachmentAnswers = attachmentAnswers;

    if (step.kind === "trait") {
      nextTraitAnswers = { ...traitAnswers, [step.id]: value };
      setTraitAnswers(nextTraitAnswers);
    } else {
      nextAttachmentAnswers = { ...attachmentAnswers, [step.id]: value };
      setAttachmentAnswers(nextAttachmentAnswers);
    }

    setTimeout(() => {
      if (isLast) {
        finish(nextTraitAnswers, nextAttachmentAnswers);
      } else {
        setStepIndex((i) => i + 1);
      }
    }, 220);
  }

  function handleBack() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  return (
    <View style={styles.container}>
      <View style={styles.progressWrap}>
        <ProgressBar progress={(stepIndex + 1) / steps.length} />
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
            {stepIndex + 1} of {steps.length}
          </Text>
        </View>
      </View>

      <FadeIn key={step.id} style={styles.cardWrap}>
        <Card>
          <Text style={styles.sectionLabel}>
            {step.kind === "attachment" ? "Closeness & connection" : "About you"}
          </Text>
          <Text style={styles.prompt}>{step.prompt}</Text>
          <Text style={styles.scaleHint}>1 = not at all · 5 = very much</Text>
          <LikertScale value={currentValue} onChange={handleAnswer} />
        </Card>
      </FadeIn>
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
    cardWrap: { flex: 1, justifyContent: "center" },
    sectionLabel: { ...typography.caption, color: colors.primary, marginBottom: spacing.sm },
    prompt: { ...typography.heading, marginBottom: spacing.lg, lineHeight: 28 },
    scaleHint: { ...typography.bodyMuted, marginBottom: spacing.lg },
  });
}

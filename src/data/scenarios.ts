import type { ScenarioQuestion } from "../types";

export const SCENARIOS: ScenarioQuestion[] = [
  {
    id: "s1",
    prompt:
      "A close friend cancels plans with you last minute for the third time this month. What do you do?",
    choices: [
      {
        id: "s1c1",
        text: "Tell them directly how it made you feel and ask what's going on.",
        traitDeltas: { agreeableness: 0.2, extraversion: 0.1 },
      },
      {
        id: "s1c2",
        text: "Say it's fine, but quietly make fewer plans with them going forward.",
        traitDeltas: { agreeableness: -0.1, neuroticism: 0.1 },
      },
      {
        id: "s1c3",
        text: "Let it go completely — everyone gets busy.",
        traitDeltas: { agreeableness: 0.1, neuroticism: -0.1 },
      },
    ],
  },
  {
    id: "s2",
    prompt: "You're given a big task at work/school with a tight, ambiguous deadline. What's your first move?",
    choices: [
      {
        id: "s2c1",
        text: "Break it into a checklist and start immediately.",
        traitDeltas: { conscientiousness: 0.2 },
      },
      {
        id: "s2c2",
        text: "Ask clarifying questions before doing anything.",
        traitDeltas: { conscientiousness: 0.1, openness: 0.1 },
      },
      {
        id: "s2c3",
        text: "Feel overwhelmed and put it off for a bit.",
        traitDeltas: { neuroticism: 0.2, conscientiousness: -0.1 },
      },
    ],
  },
  {
    id: "s3",
    prompt: "You're at a social event full of people you don't know. How do you spend the evening?",
    choices: [
      {
        id: "s3c1",
        text: "Work the room and meet as many people as possible.",
        traitDeltas: { extraversion: 0.2 },
      },
      {
        id: "s3c2",
        text: "Find one or two people and have a real conversation.",
        traitDeltas: { extraversion: 0.05, agreeableness: 0.1 },
      },
      {
        id: "s3c3",
        text: "Stay near the edges and leave early if you can.",
        traitDeltas: { extraversion: -0.2 },
      },
    ],
  },
  {
    id: "s4",
    prompt: "Someone close to you is going through a hard time but hasn't asked for help. What do you do?",
    choices: [
      {
        id: "s4c1",
        text: "Check in directly and offer specific support.",
        traitDeltas: { agreeableness: 0.2, openness: 0.05 },
      },
      {
        id: "s4c2",
        text: "Give them space and wait for them to reach out.",
        traitDeltas: { agreeableness: -0.05 },
      },
      {
        id: "s4c3",
        text: "Feel anxious about saying the wrong thing, so you say nothing.",
        traitDeltas: { neuroticism: 0.2, agreeableness: -0.1 },
      },
    ],
  },
];

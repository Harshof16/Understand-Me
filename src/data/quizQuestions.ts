import type { BigFiveScores } from "../types";

export type QuizQuestion = {
  id: string;
  prompt: string;
  trait: keyof BigFiveScores;
  reverseScored?: boolean;
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  { id: "q1", prompt: "I enjoy trying new experiences and ideas.", trait: "openness" },
  { id: "q2", prompt: "I prefer familiar routines over surprises.", trait: "openness", reverseScored: true },
  { id: "q3", prompt: "I keep my commitments and plan ahead.", trait: "conscientiousness" },
  { id: "q4", prompt: "I often leave tasks unfinished.", trait: "conscientiousness", reverseScored: true },
  { id: "q5", prompt: "I feel energized when I'm around other people.", trait: "extraversion" },
  { id: "q6", prompt: "I need a lot of alone time to recharge.", trait: "extraversion", reverseScored: true },
  { id: "q7", prompt: "I find it easy to empathize with others.", trait: "agreeableness" },
  { id: "q8", prompt: "I prioritize my own needs over keeping the peace.", trait: "agreeableness", reverseScored: true },
  { id: "q9", prompt: "I worry about things more than most people.", trait: "neuroticism" },
  { id: "q10", prompt: "I stay calm under pressure.", trait: "neuroticism", reverseScored: true },
];

export type AttachmentQuestion = {
  id: string;
  prompt: string;
  style: "secure" | "anxious" | "avoidant" | "fearful";
};

export const ATTACHMENT_QUESTIONS: AttachmentQuestion[] = [
  { id: "a1", prompt: "I find it easy to trust people close to me.", style: "secure" },
  { id: "a2", prompt: "I worry that people I'm close to don't really care about me.", style: "anxious" },
  { id: "a3", prompt: "I prefer to keep some emotional distance, even from people I'm close to.", style: "avoidant" },
  { id: "a4", prompt: "I want closeness but get anxious when I actually have it.", style: "fearful" },
];

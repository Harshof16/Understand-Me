export type BigFiveScores = {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
};

export type AttachmentStyle = "secure" | "anxious" | "avoidant" | "fearful";

export type PersonalityBaseline = {
  id: string;
  bigFiveScores: BigFiveScores;
  attachmentStyle: AttachmentStyle;
  narrativeSummary: string;
  takenAt: string;
};

export type ScheduleBlock = {
  label: string;
  startTime: string;
  endTime: string;
};

export type DailySchedule = {
  id: string;
  wakeTime: string;
  sleepTime: string;
  blocks: ScheduleBlock[];
  updatedAt: string;
};

export type ScenarioChoice = {
  id: string;
  text: string;
  traitDeltas: Partial<BigFiveScores>;
};

export type ScenarioQuestion = {
  id: string;
  prompt: string;
  choices: ScenarioChoice[];
};

export type ScenarioSession = {
  id: string;
  scenarioId: string;
  choicesMade: string[];
  traitDeltas: Partial<BigFiveScores>;
  takenAt: string;
};

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export type MoodEntry = {
  id: string;
  timestamp: string;
  moodPrimary: string;
  moodIntensity: MoodLevel;
  tags: string[];
  energyRating?: MoodLevel;
};

export type JournalEntry = {
  id: string;
  timestamp: string;
  text: string;
  moodPrimary?: string;
  prompt?: string;
};

export type ProfileAttribute = {
  label: string;
  detail: string;
};

export type InsightSnapshot = {
  id: string;
  periodStart: string;
  periodEnd: string;
  summaryText: string;
  attributes: ProfileAttribute[];
  painPoints: string[];
  productiveWindows: string[];
  generatedAt: string;
};

import type {
  DailySchedule,
  JournalEntry,
  MoodEntry,
  PersonalityBaseline,
  ProfileAttribute,
  ScenarioSession,
} from "../types";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export type ProfileSummaryInput = {
  personalityBaseline: PersonalityBaseline | null;
  dailySchedule: DailySchedule | null;
  scenarioSession: ScenarioSession | null;
  moodEntries: MoodEntry[];
  journalEntries: JournalEntry[];
};

export type ProfileSummaryResult = {
  summaryText: string;
  attributes: ProfileAttribute[];
  painPoints: string[];
  productiveWindows: string[];
};

export async function requestProfileSummary(
  input: ProfileSummaryInput
): Promise<ProfileSummaryResult> {
  const response = await fetch(`${API_BASE_URL}/api/profile-summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? `Profile summary request failed (${response.status}).`);
  }

  return (await response.json()) as ProfileSummaryResult;
}

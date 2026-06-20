import { KEYS, readJson, writeJson } from "./storage";
import type {
  DailySchedule,
  InsightSnapshot,
  JournalEntry,
  MoodEntry,
  PersonalityBaseline,
  ScenarioSession,
} from "../types";

export async function getPersonalityBaseline(): Promise<PersonalityBaseline | null> {
  return readJson<PersonalityBaseline | null>(KEYS.personalityBaseline, null);
}

export async function savePersonalityBaseline(baseline: PersonalityBaseline): Promise<void> {
  await writeJson(KEYS.personalityBaseline, baseline);
}

export async function getDailySchedule(): Promise<DailySchedule | null> {
  return readJson<DailySchedule | null>(KEYS.dailySchedule, null);
}

export async function saveDailySchedule(schedule: DailySchedule): Promise<void> {
  await writeJson(KEYS.dailySchedule, schedule);
}

export async function getScenarioSessions(): Promise<ScenarioSession[]> {
  return readJson<ScenarioSession[]>(KEYS.scenarioSessions, []);
}

export async function addScenarioSession(session: ScenarioSession): Promise<void> {
  const sessions = await getScenarioSessions();
  await writeJson(KEYS.scenarioSessions, [...sessions, session]);
}

export async function getMoodEntries(): Promise<MoodEntry[]> {
  return readJson<MoodEntry[]>(KEYS.moodEntries, []);
}

export async function addMoodEntry(entry: MoodEntry): Promise<void> {
  const entries = await getMoodEntries();
  await writeJson(KEYS.moodEntries, [...entries, entry]);
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
  return readJson<JournalEntry[]>(KEYS.journalEntries, []);
}

export async function addJournalEntry(entry: JournalEntry): Promise<void> {
  const entries = await getJournalEntries();
  await writeJson(KEYS.journalEntries, [...entries, entry]);
}

export async function getInsightSnapshots(): Promise<InsightSnapshot[]> {
  return readJson<InsightSnapshot[]>(KEYS.insightSnapshots, []);
}

export async function addInsightSnapshot(snapshot: InsightSnapshot): Promise<void> {
  const snapshots = await getInsightSnapshots();
  await writeJson(KEYS.insightSnapshots, [...snapshots, snapshot]);
}

import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  personalityBaseline: "@um/personalityBaseline",
  dailySchedule: "@um/dailySchedule",
  scenarioSessions: "@um/scenarioSessions",
  moodEntries: "@um/moodEntries",
  journalEntries: "@um/journalEntries",
  insightSnapshots: "@um/insightSnapshots",
} as const;

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;
  return JSON.parse(raw) as T;
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export { KEYS, readJson, writeJson };

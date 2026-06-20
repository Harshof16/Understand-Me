import type { JournalEntry, MoodEntry } from "../types";

export type Sentiment = "positive" | "neutral" | "negative";

export const MOOD_SENTIMENT: Record<string, Sentiment> = {
  Happy: "positive",
  Calm: "positive",
  Energized: "positive",
  Tired: "neutral",
  Anxious: "negative",
  Sad: "negative",
  Frustrated: "negative",
};

export function sentimentOf(moodLabel: string): Sentiment {
  return MOOD_SENTIMENT[moodLabel] ?? "neutral";
}

function dateKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

export function computeStreak(moodEntries: MoodEntry[], journalEntries: JournalEntry[]): number {
  const days = new Set<string>([
    ...moodEntries.map((e) => dateKey(e.timestamp)),
    ...journalEntries.map((e) => dateKey(e.timestamp)),
  ]);

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  if (!days.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function sentimentCounts(moodEntries: MoodEntry[]): Record<Sentiment, number> {
  const counts: Record<Sentiment, number> = { positive: 0, neutral: 0, negative: 0 };
  for (const entry of moodEntries) {
    counts[sentimentOf(entry.moodPrimary)] += 1;
  }
  return counts;
}

export type TrendPoint = { label: string; value: number; date: string };

export function weeklyTrend(moodEntries: MoodEntry[], days = 7): TrendPoint[] {
  const points: TrendPoint[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const key = day.toISOString().slice(0, 10);
    const dayEntries = moodEntries.filter((e) => dateKey(e.timestamp) === key);
    const avg =
      dayEntries.length > 0
        ? dayEntries.reduce((sum, e) => sum + e.moodIntensity, 0) / dayEntries.length
        : 0;
    points.push({
      label: day.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2),
      value: Math.round(avg * 10) / 10,
      date: key,
    });
  }

  return points;
}

export type DayBucket<T> = { date: string; label: string; entries: T[] };

export function dayBuckets<T extends { timestamp: string }>(entries: T[]): DayBucket<T>[] {
  const map = new Map<string, T[]>();
  for (const entry of entries) {
    const key = dateKey(entry.timestamp);
    const list = map.get(key) ?? [];
    list.push(entry);
    map.set(key, list);
  }

  return Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, items]) => ({
      date,
      label: new Date(date).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      entries: items,
    }));
}

export function last7Days(moodEntries: MoodEntry[]): { date: string; sentiment: Sentiment | null }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const result: { date: string; sentiment: Sentiment | null }[] = [];

  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const key = day.toISOString().slice(0, 10);
    const dayEntries = moodEntries.filter((e) => dateKey(e.timestamp) === key);
    if (dayEntries.length === 0) {
      result.push({ date: key, sentiment: null });
      continue;
    }
    const counts = sentimentCounts(dayEntries);
    const dominant = (Object.keys(counts) as Sentiment[]).reduce((a, b) =>
      counts[a] >= counts[b] ? a : b
    );
    result.push({ date: key, sentiment: dominant });
  }

  return result;
}

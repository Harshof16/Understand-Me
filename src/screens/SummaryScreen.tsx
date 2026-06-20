import React, { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  addInsightSnapshot,
  getInsightSnapshots,
  getJournalEntries,
  getMoodEntries,
} from "../storage/repository";
import type { InsightSnapshot } from "../types";
import { Button } from "../components/Button";

const MIN_ENTRIES_FOR_SUMMARY = 5;

// Stub: replace with a real Claude API call once there's a backend proxy to hold the key.
// This placeholder keeps the data flow (entries in -> snapshot out) wired up end to end.
async function generateStubSummary(moodCount: number, journalCount: number): Promise<string> {
  return (
    `[AI summary placeholder] Based on ${moodCount} mood logs and ${journalCount} journal entries, ` +
    `this is where Claude will identify your recurring pain points and emotional patterns once the ` +
    `API integration is wired up.`
  );
}

export default function SummaryScreen() {
  const [snapshots, setSnapshots] = useState<InsightSnapshot[]>([]);
  const [entryCount, setEntryCount] = useState(0);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(() => {
    Promise.all([getInsightSnapshots(), getMoodEntries(), getJournalEntries()]).then(
      ([snaps, moods, journals]) => {
        setSnapshots([...snaps].reverse());
        setEntryCount(moods.length + journals.length);
      }
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const hasEnoughData = entryCount >= MIN_ENTRIES_FOR_SUMMARY;

  async function handleGenerate() {
    setGenerating(true);
    const [moods, journals] = await Promise.all([getMoodEntries(), getJournalEntries()]);
    const summaryText = await generateStubSummary(moods.length, journals.length);
    const now = new Date();
    const snapshot: InsightSnapshot = {
      id: `insight-${Date.now()}`,
      periodStart: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      periodEnd: now.toISOString(),
      summaryText,
      generatedAt: now.toISOString(),
    };
    await addInsightSnapshot(snapshot);
    setGenerating(false);
    load();
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={snapshots}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View style={styles.form}>
          <Text style={styles.title}>Your Pain Points & Patterns</Text>
          {hasEnoughData ? (
            <Text style={styles.subtitle}>
              You have {entryCount} logged entries. Generate a summary to see recurring patterns.
            </Text>
          ) : (
            <Text style={styles.subtitle}>
              Log at least {MIN_ENTRIES_FOR_SUMMARY} mood/journal entries ({entryCount}/
              {MIN_ENTRIES_FOR_SUMMARY} so far) before generating a summary — too little data gives
              unreliable insights.
            </Text>
          )}
          <Button
            label={generating ? "Generating..." : "Generate summary"}
            onPress={handleGenerate}
            disabled={!hasEnoughData || generating}
          />
          <Text style={styles.sectionTitle}>Past summaries</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.entryCard}>
          <Text style={styles.entryMeta}>{new Date(item.generatedAt).toLocaleString()}</Text>
          <Text style={styles.entryText}>{item.summaryText}</Text>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.empty}>No summaries generated yet.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20, paddingBottom: 48 },
  form: { marginBottom: 8 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#555", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginTop: 28, marginBottom: 8 },
  entryCard: {
    backgroundColor: "#F7F6FE",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  entryMeta: { fontSize: 12, color: "#888", marginBottom: 6 },
  entryText: { fontSize: 14, lineHeight: 20 },
  empty: { textAlign: "center", color: "#888", marginTop: 20 },
});

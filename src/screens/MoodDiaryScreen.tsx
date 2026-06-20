import React, { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { addMoodEntry, getMoodEntries } from "../storage/repository";
import type { MoodEntry, MoodLevel } from "../types";
import { Button } from "../components/Button";
import { LikertScale } from "../components/LikertScale";

const MOODS = ["Happy", "Calm", "Anxious", "Sad", "Frustrated", "Energized", "Tired"];

export default function MoodDiaryScreen() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<MoodLevel | undefined>();
  const [energy, setEnergy] = useState<MoodLevel | undefined>();
  const [tagsInput, setTagsInput] = useState("");

  const loadEntries = useCallback(() => {
    getMoodEntries().then((data) => setEntries([...data].reverse()));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  function handleLog() {
    if (!selectedMood || !intensity) return;
    const entry: MoodEntry = {
      id: `mood-${Date.now()}`,
      timestamp: new Date().toISOString(),
      moodPrimary: selectedMood,
      moodIntensity: intensity,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      energyRating: energy,
    };
    addMoodEntry(entry).then(() => {
      setSelectedMood(null);
      setIntensity(undefined);
      setEnergy(undefined);
      setTagsInput("");
      loadEntries();
    });
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={entries}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View style={styles.form}>
          <Text style={styles.title}>How are you feeling right now?</Text>

          <View style={styles.moodRow}>
            {MOODS.map((mood) => (
              <Text
                key={mood}
                onPress={() => setSelectedMood(mood)}
                style={[styles.moodChip, selectedMood === mood && styles.moodChipSelected]}
              >
                {mood}
              </Text>
            ))}
          </View>

          <Text style={styles.label}>Intensity</Text>
          <LikertScale value={intensity} onChange={(v) => setIntensity(v as MoodLevel)} />

          <Text style={styles.label}>Energy level</Text>
          <LikertScale value={energy} onChange={(v) => setEnergy(v as MoodLevel)} />

          <Text style={styles.label}>Tags (comma separated, optional)</Text>
          <TextInput
            style={styles.input}
            value={tagsInput}
            onChangeText={setTagsInput}
            placeholder="work, sleep, social"
          />

          <Button label="Log mood" onPress={handleLog} disabled={!selectedMood || !intensity} />

          <Text style={styles.sectionTitle}>Recent entries</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.entryCard}>
          <Text style={styles.entryMood}>
            {item.moodPrimary} · intensity {item.moodIntensity}
            {item.energyRating ? ` · energy ${item.energyRating}` : ""}
          </Text>
          <Text style={styles.entryMeta}>{new Date(item.timestamp).toLocaleString()}</Text>
          {item.tags.length > 0 && <Text style={styles.entryTags}>{item.tags.join(", ")}</Text>}
        </View>
      )}
      ListEmptyComponent={<Text style={styles.empty}>No entries yet.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20, paddingBottom: 48 },
  form: { marginBottom: 8 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", marginTop: 16, marginBottom: 8 },
  moodRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  moodChip: {
    borderWidth: 1,
    borderColor: "#D9D6F5",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    color: "#5B4FE5",
  },
  moodChipSelected: { backgroundColor: "#5B4FE5", color: "#fff" },
  input: {
    borderWidth: 1,
    borderColor: "#D9D6F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginTop: 28, marginBottom: 8 },
  entryCard: {
    backgroundColor: "#F7F6FE",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  entryMood: { fontSize: 15, fontWeight: "600" },
  entryMeta: { fontSize: 12, color: "#888", marginTop: 4 },
  entryTags: { fontSize: 12, color: "#5B4FE5", marginTop: 4 },
  empty: { textAlign: "center", color: "#888", marginTop: 20 },
});

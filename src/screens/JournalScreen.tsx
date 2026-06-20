import React, { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { addJournalEntry, getJournalEntries } from "../storage/repository";
import type { JournalEntry } from "../types";
import { Button } from "../components/Button";

export default function JournalScreen() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [text, setText] = useState("");

  const loadEntries = useCallback(() => {
    getJournalEntries().then((data) => setEntries([...data].reverse()));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  function handleSave() {
    if (!text.trim()) return;
    const entry: JournalEntry = {
      id: `journal-${Date.now()}`,
      timestamp: new Date().toISOString(),
      text: text.trim(),
    };
    addJournalEntry(entry).then(() => {
      setText("");
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
          <Text style={styles.title}>Log your day</Text>
          <TextInput
            style={styles.textArea}
            value={text}
            onChangeText={setText}
            placeholder="What happened today? How did it affect you?"
            multiline
            numberOfLines={6}
          />
          <Button label="Save entry" onPress={handleSave} disabled={!text.trim()} />
          <Text style={styles.sectionTitle}>Past entries</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.entryCard}>
          <Text style={styles.entryMeta}>{new Date(item.timestamp).toLocaleString()}</Text>
          <Text style={styles.entryText}>{item.text}</Text>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.empty}>No journal entries yet.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20, paddingBottom: 48 },
  form: { marginBottom: 8 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  textArea: {
    borderWidth: 1,
    borderColor: "#D9D6F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: "top",
    marginBottom: 12,
  },
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

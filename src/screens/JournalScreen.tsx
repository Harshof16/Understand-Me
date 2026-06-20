import React, { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { addJournalEntry, getJournalEntries } from "../storage/repository";
import type { JournalEntry } from "../types";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { FadeIn } from "../components/FadeIn";
import { EmptyState } from "../components/illustrations/EmptyState";
import { spacing, useTheme, ThemeColors, Typography } from "../theme";

export default function JournalScreen() {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

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
          <FadeIn>
            <Text style={styles.title}>Log your day</Text>
            <Card style={styles.composeCard}>
              <TextInput
                style={styles.textArea}
                value={text}
                onChangeText={setText}
                placeholder="What happened today? How did it affect you?"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={6}
              />
              <Button label="Save entry" onPress={handleSave} disabled={!text.trim()} />
            </Card>
          </FadeIn>
          <Text style={styles.sectionTitle}>Past entries</Text>
        </View>
      }
      renderItem={({ item, index }) => (
        <FadeIn delay={Math.min(index, 4) * 40}>
          <Card style={styles.entryCard} muted>
            <View style={styles.entryHeader}>
              <Ionicons name="document-text" size={14} color={colors.primary} />
              <Text style={styles.entryMeta}>{new Date(item.timestamp).toLocaleString()}</Text>
            </View>
            <Text style={styles.entryText}>{item.text}</Text>
          </Card>
        </FadeIn>
      )}
      ListEmptyComponent={<EmptyState label="No journal entries yet. Write your first one above." />}
    />
  );
}

function createStyles(colors: ThemeColors, typography: Typography) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
    form: { marginBottom: spacing.sm },
    title: { ...typography.title, marginBottom: spacing.lg },
    composeCard: { marginBottom: spacing.sm },
    textArea: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: spacing.md,
      paddingVertical: 10,
      fontSize: 15,
      minHeight: 120,
      textAlignVertical: "top",
      marginBottom: spacing.md,
      backgroundColor: colors.surface,
      color: colors.textPrimary,
    },
    sectionTitle: { ...typography.heading, marginTop: spacing.xxl, marginBottom: spacing.sm },
    entryCard: { marginBottom: spacing.sm },
    entryHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    entryMeta: { ...typography.caption },
    entryText: { ...typography.body },
  });
}

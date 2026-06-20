import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps, NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getDailySchedule, getPersonalityBaseline, getScenarioSessions } from "../storage/repository";
import type { DailySchedule, PersonalityBaseline } from "../types";
import type { MainTabsParamList, RootStackParamList } from "../navigation/types";
import { Button } from "../components/Button";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, "Home">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function HomeScreen({ navigation }: Props) {
  const [baseline, setBaseline] = useState<PersonalityBaseline | null>(null);
  const [schedule, setSchedule] = useState<DailySchedule | null>(null);
  const [scenarioCount, setScenarioCount] = useState(0);

  const load = useCallback(() => {
    Promise.all([getPersonalityBaseline(), getDailySchedule(), getScenarioSessions()]).then(
      ([b, s, sessions]) => {
        setBaseline(b);
        setSchedule(s);
        setScenarioCount(sessions.length);
      }
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const rootNav = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>() ?? navigation;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Understanding Me</Text>
      <Text style={styles.subtitle}>Know thyself — one log at a time.</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Personality baseline</Text>
        {baseline ? (
          <Text style={styles.cardBody}>{baseline.narrativeSummary}</Text>
        ) : (
          <>
            <Text style={styles.cardBody}>Not taken yet.</Text>
            <Button label="Take the quiz" onPress={() => rootNav.navigate("PersonalityQuiz")} />
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Day structure</Text>
        {schedule ? (
          <Text style={styles.cardBody}>
            Wake {schedule.wakeTime} · Sleep {schedule.sleepTime} · {schedule.blocks.length} recurring
            blocks
          </Text>
        ) : (
          <>
            <Text style={styles.cardBody}>Not set up yet.</Text>
            <Button label="Set up my day" onPress={() => rootNav.navigate("ScheduleSetup")} />
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Situational questions</Text>
        <Text style={styles.cardBody}>
          {scenarioCount > 0 ? `Completed ${scenarioCount} round(s).` : "Not completed yet."}
        </Text>
        <Button
          label={scenarioCount > 0 ? "Retake situations" : "Answer situations"}
          variant="secondary"
          onPress={() => rootNav.navigate("Scenario")}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 26, fontWeight: "700" },
  subtitle: { fontSize: 14, color: "#555", marginBottom: 24 },
  card: {
    backgroundColor: "#F7F6FE",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  cardBody: { fontSize: 14, color: "#444", marginBottom: 10, lineHeight: 20 },
});

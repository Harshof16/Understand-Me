import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps, NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getDailySchedule, getPersonalityBaseline, getScenarioSessions } from "../storage/repository";
import type { DailySchedule, PersonalityBaseline } from "../types";
import type { MainTabsParamList, RootStackParamList } from "../navigation/types";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { FadeIn } from "../components/FadeIn";
import { CalmWaves } from "../components/illustrations/CalmWaves";
import { spacing, useTheme, ThemeColors, Typography } from "../theme";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, "Home">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function HomeScreen({ navigation }: Props) {
  const { colors, typography, mode, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

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
    <View style={styles.root}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <CalmWaves width={400} height={140} />
          <FadeIn>
            <Text style={styles.title}>Understanding Me</Text>
            <Text style={styles.subtitle}>Know thyself — one log at a time.</Text>
          </FadeIn>
        </View>

        <FadeIn delay={40}>
          <Card style={styles.card}>
            <View style={styles.appearanceRow}>
              <View style={styles.appearanceLabel}>
                <Ionicons
                  name={mode === "dark" ? "moon" : "sunny"}
                  size={18}
                  color={mode === "dark" ? colors.primary : colors.warning}
                />
                <Text style={styles.cardTitle}>Dark theme</Text>
              </View>
              <Switch
                value={mode === "dark"}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.surface}
              />
            </View>
          </Card>
        </FadeIn>

        <FadeIn delay={80}>
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBadge, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="person" size={18} color={colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Personality baseline</Text>
            </View>
            {baseline ? (
              <Text style={styles.cardBody}>{baseline.narrativeSummary}</Text>
            ) : (
              <>
                <Text style={styles.cardBody}>Not taken yet.</Text>
                <Button label="Take the quiz" onPress={() => rootNav.navigate("PersonalityQuiz")} />
              </>
            )}
          </Card>
        </FadeIn>

        <FadeIn delay={140}>
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBadge, { backgroundColor: colors.secondaryLight }]}>
                <Ionicons name="time" size={18} color={colors.secondary} />
              </View>
              <Text style={styles.cardTitle}>Day structure</Text>
            </View>
            {schedule ? (
              <Text style={styles.cardBody}>
                Wake {schedule.wakeTime} · Sleep {schedule.sleepTime} · {schedule.blocks.length}{" "}
                recurring blocks
              </Text>
            ) : (
              <>
                <Text style={styles.cardBody}>Not set up yet.</Text>
                <Button label="Set up my day" onPress={() => rootNav.navigate("ScheduleSetup")} />
              </>
            )}
          </Card>
        </FadeIn>

        <FadeIn delay={200}>
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBadge, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="shuffle" size={18} color={colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Situational questions</Text>
            </View>
            <Text style={styles.cardBody}>
              {scenarioCount > 0 ? `Completed ${scenarioCount} round(s).` : "Not completed yet."}
            </Text>
            <Button
              label={scenarioCount > 0 ? "Retake situations" : "Answer situations"}
              variant="secondary"
              onPress={() => rootNav.navigate("Scenario")}
            />
          </Card>
        </FadeIn>
      </ScrollView>
    </View>
  );
}

function createStyles(colors: ThemeColors, typography: Typography) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1 },
    content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
    header: { paddingTop: spacing.lg, paddingBottom: spacing.xxl, overflow: "hidden" },
    title: { ...typography.title },
    subtitle: { ...typography.bodyMuted, marginTop: spacing.xs },
    card: { marginBottom: spacing.lg },
    appearanceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    appearanceLabel: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.sm,
      gap: spacing.sm,
    },
    iconBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    cardTitle: { ...typography.subheading },
    cardBody: { ...typography.bodyMuted, marginBottom: spacing.sm },
  });
}

import React from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { RootStackParamList } from "./types";
import MainTabs from "./MainTabs";
import PersonalityQuizScreen from "../screens/PersonalityQuizScreen";
import ScheduleSetupScreen from "../screens/ScheduleSetupScreen";
import ScenarioScreen from "../screens/ScenarioScreen";
import { useTheme } from "../theme";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { colors, mode } = useTheme();

  const navTheme = {
    ...(mode === "dark" ? DarkTheme : DefaultTheme),
    colors: {
      ...(mode === "dark" ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.background,
      primary: colors.primary,
      border: colors.border,
      text: colors.textPrimary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { color: colors.textPrimary },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="Tabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="PersonalityQuiz"
          component={PersonalityQuizScreen}
          options={{ title: "Personality Quiz" }}
        />
        <Stack.Screen
          name="ScheduleSetup"
          component={ScheduleSetupScreen}
          options={{ title: "Your Day" }}
        />
        <Stack.Screen name="Scenario" component={ScenarioScreen} options={{ title: "Situations" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

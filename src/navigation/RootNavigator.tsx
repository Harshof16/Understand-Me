import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { RootStackParamList } from "./types";
import MainTabs from "./MainTabs";
import PersonalityQuizScreen from "../screens/PersonalityQuizScreen";
import ScheduleSetupScreen from "../screens/ScheduleSetupScreen";
import ScenarioScreen from "../screens/ScenarioScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
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

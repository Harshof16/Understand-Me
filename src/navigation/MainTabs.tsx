import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { MainTabsParamList } from "./types";
import HomeScreen from "../screens/HomeScreen";
import MoodDiaryScreen from "../screens/MoodDiaryScreen";
import JournalScreen from "../screens/JournalScreen";
import SummaryScreen from "../screens/SummaryScreen";

const Tab = createBottomTabNavigator<MainTabsParamList>();

export default function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerTitleAlign: "center" }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Home" }} />
      <Tab.Screen name="MoodDiary" component={MoodDiaryScreen} options={{ title: "Mood" }} />
      <Tab.Screen name="Journal" component={JournalScreen} options={{ title: "Journal" }} />
      <Tab.Screen name="Summary" component={SummaryScreen} options={{ title: "Insights" }} />
    </Tab.Navigator>
  );
}

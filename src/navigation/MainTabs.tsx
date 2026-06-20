import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { MainTabsParamList } from "./types";
import HomeScreen from "../screens/HomeScreen";
import MoodDiaryScreen from "../screens/MoodDiaryScreen";
import JournalScreen from "../screens/JournalScreen";
import SummaryScreen from "../screens/SummaryScreen";
import { useTheme } from "../theme";

const Tab = createBottomTabNavigator<MainTabsParamList>();

const TAB_ICONS: Record<keyof MainTabsParamList, keyof typeof Ionicons.glyphMap> = {
  Home: "home",
  MoodDiary: "happy",
  Journal: "book",
  Summary: "sparkles",
};

export default function MainTabs() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const baseTabBarHeight = 54;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: baseTabBarHeight + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 10),
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={
              focused
                ? TAB_ICONS[route.name as keyof MainTabsParamList]
                : (`${TAB_ICONS[route.name as keyof MainTabsParamList]}-outline` as keyof typeof Ionicons.glyphMap)
            }
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Home" }} />
      <Tab.Screen name="MoodDiary" component={MoodDiaryScreen} options={{ title: "Mood" }} />
      <Tab.Screen name="Journal" component={JournalScreen} options={{ title: "Journal" }} />
      <Tab.Screen name="Summary" component={SummaryScreen} options={{ title: "Insights" }} />
    </Tab.Navigator>
  );
}

import type { PersonalityBaseline } from "../types";

export type RootStackParamList = {
  Tabs: undefined;
  PersonalityQuiz: undefined;
  PersonalityResult: { baseline: PersonalityBaseline };
  ScheduleSetup: undefined;
  Scenario: undefined;
};

export type MainTabsParamList = {
  Home: undefined;
  MoodDiary: undefined;
  Journal: undefined;
  Summary: undefined;
};

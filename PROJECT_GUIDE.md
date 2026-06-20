# Understanding Me — Project Guide

A self-awareness mobile app built around "know thyself": a personality baseline (quiz + situational
choices), a daily mood/journal log, and an AI-generated summary of recurring patterns and pain points.

This file is the single reference for what the app does, how it's built, where things live, and what
to check first when something breaks.

---

## 1. Purpose

The product idea: most mood-journaling apps (Daylio, Bearable, etc.) only show raw correlations. This
app adds a **personality baseline** up front (Big Five traits + attachment style, gathered via a quiz
and a branching "situational choices" mini-game) so that later AI-generated insights can be
contextualized against who the user is, not just what they logged.

Core loop for the end user:

1. **Onboarding** (once): personality quiz → day-structure setup → situational scenarios.
2. **Daily use**: log mood (Mood tab) and/or journal entries (Journal tab).
3. **Insights**: once enough entries exist, generate an AI summary of recurring pain points
   (Summary/"Insights" tab).

MVP scope deliberately excludes: social features, compatibility matching, wearable integration,
push reminders/streaks, and paid tiers. See the original plan at
`C:\Users\harsh\.claude\plans\do-we-need-a-whimsical-truffle.md` for the full product reasoning.

---

## 2. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Expo SDK 56** (React Native 0.85.3, React 19.2.3) | Fastest path to a runnable app on-device via Expo Go; managed native modules. |
| Language | TypeScript (`strict: true`) | Catch data-model/prop mismatches at compile time. |
| Navigation | `@react-navigation` (native-stack + bottom-tabs) | Standard RN navigation; stack wraps onboarding screens, tabs hold the daily-use screens. |
| Local storage | `@react-native-async-storage/async-storage` | MVP decision: **all data is local-only**, no backend. Simple JSON blobs per entity. |
| Animations | `react-native-reanimated` v4 (+ `react-native-worklets` peer dep) | Smooth, native-thread animations (fades, progress bars, press scaling). |
| Icons | `@expo/vector-icons` (Ionicons set) | Tab bar, mood icons, card badges. |
| Illustrations | `react-native-svg` | Two hand-built decorative SVGs (`CalmWaves`, `EmptyState`) — no external asset/image dependency. |
| AI summary | **Stubbed** — see §9 | Claude API call is intentionally not wired up yet; needs a backend proxy first (see §10). |

Why these choices were made this way (from conversation history):
- Local-only storage was an explicit MVP decision to avoid backend setup before validating the concept.
- The AI call is deferred/stubbed on purpose — calling Claude directly from the RN app would expose the
  API key, so it needs a small backend proxy first.
- Expo (not bare RN CLI) was chosen for speed of iteration and easy phone testing via Expo Go.

---

## 3. Project structure

```
App.tsx                        Root: SafeAreaProvider > ThemeProvider > RootNavigator
app.json                       Expo app config (icons, Android adaptive icon, userInterfaceStyle)
babel.config.js                babel-preset-expo + react-native-reanimated/plugin
metro.config.js                Standard Expo Metro config (getDefaultConfig) — required, see §9
tsconfig.json                  extends expo/tsconfig.base, strict: true

src/
  types/index.ts                All data model types (see §5)
  storage/
    storage.ts                  Low-level AsyncStorage read/write JSON helpers + key constants
    repository.ts                Typed CRUD functions per entity (one get + one add/save per type)
  data/
    quizQuestions.ts             Big Five + attachment style quiz question banks
    scenarios.ts                 Situational "choose your path" scenarios with trait deltas
  theme/
    colors.ts                    lightColors / darkColors palettes + ThemeColors type
    spacing.ts                   spacing / radius / shadow scales (theme-independent)
    typography.ts                createTypography(colors) — text styles depend on theme
    ThemeContext.tsx             ThemeProvider + useTheme() hook (persists mode to AsyncStorage)
    index.ts                     Barrel export for all of the above
  components/
    Button.tsx                   Themed button (primary/secondary/ghost variants)
    Card.tsx                     Themed card surface (default + muted variant)
    LikertScale.tsx               1–5 rating picker used by quiz + mood diary
    ProgressBar.tsx               Animated progress bar (quiz/scenario steps, summary gating)
    Spinner.tsx                   Rotating icon, used during "generating summary"
    AnimatedPressable.tsx         Press-scale wrapper around Pressable (used by Button, LikertScale)
    FadeIn.tsx                    Fade + slide-in wrapper for staggered entrance animations
    illustrations/
      CalmWaves.tsx                Decorative header SVG (Home screen)
      EmptyState.tsx               Empty-list SVG illustration (Mood/Journal/Summary empty states)
  navigation/
    types.ts                      RootStackParamList + MainTabsParamList (typed navigation)
    RootNavigator.tsx             Native stack: Tabs (main) + PersonalityQuiz/ScheduleSetup/Scenario
    MainTabs.tsx                  Bottom tabs: Home, MoodDiary, Journal, Summary
  screens/
    HomeScreen.tsx                Onboarding status cards + dark mode toggle
    PersonalityQuizScreen.tsx     Paginated Big Five + attachment quiz (one question at a time)
    ScheduleSetupScreen.tsx       Wake/sleep time + recurring day blocks
    ScenarioScreen.tsx            Paginated situational choice scenarios
    MoodDiaryScreen.tsx           Mood + intensity + energy + tags logging, recent entries list
    JournalScreen.tsx             Free-text daily journal, past entries list
    SummaryScreen.tsx             Entry-count gate + "Generate summary" (stubbed AI call) + history
```

---

## 4. How the screens connect (navigation)

```
App.tsx
 └─ RootNavigator (native-stack)
     ├─ "Tabs"            → MainTabs (bottom-tabs, headerShown: false on the stack)
     │    ├─ Home
     │    ├─ MoodDiary
     │    ├─ Journal
     │    └─ Summary
     ├─ "PersonalityQuiz"  (pushed from Home when baseline not yet taken)
     ├─ "ScheduleSetup"    (pushed from Home when schedule not yet set)
     └─ "Scenario"         (pushed from Home when scenarios not yet completed)
```

Onboarding screens use `navigation.replace("Tabs")` after saving data (not `navigate`), so the user
can't go "back" into a completed onboarding step. Param types live in `src/navigation/types.ts` —
update both `RootStackParamList` and `MainTabsParamList` there if you add a screen.

---

## 5. Data models (`src/types/index.ts`)

| Type | Fields | Written by |
|---|---|---|
| `PersonalityBaseline` | `bigFiveScores` (5 traits, 0–5 avg), `attachmentStyle`, `narrativeSummary`, `takenAt` | PersonalityQuizScreen |
| `DailySchedule` | `wakeTime`, `sleepTime`, `blocks: ScheduleBlock[]`, `updatedAt` | ScheduleSetupScreen |
| `ScenarioSession` | `choicesMade: string[]`, `traitDeltas`, `takenAt` | ScenarioScreen |
| `MoodEntry` | `moodPrimary`, `moodIntensity` (1–5), `tags[]`, `energyRating?`, `timestamp` | MoodDiaryScreen |
| `JournalEntry` | `text`, `timestamp` | JournalScreen |
| `InsightSnapshot` | `summaryText`, `periodStart/End`, `generatedAt` | SummaryScreen (currently stub-generated) |

Each type has exactly one corresponding pair of functions in `src/storage/repository.ts`
(`get<Entity>()` / `save<Entity>()` or `add<Entity>()` for list-based entities). If you add a new data
type, follow that same pattern: add the type → add a storage key in `storage.ts` → add get/add functions
in `repository.ts`.

---

## 6. Storage layer

- `src/storage/storage.ts` — generic `readJson<T>(key, fallback)` / `writeJson<T>(key, value)` wrapping
  `AsyncStorage`, plus the `KEYS` map (one string key per entity, prefixed `@um/`).
- `src/storage/repository.ts` — the only place screens should import storage functions from. Screens
  never call `AsyncStorage` directly.
- **Everything is local-only.** There is no sync, no backend, no auth. Uninstalling the app or clearing
  app storage deletes all data. This was an explicit MVP tradeoff (see §2).

---

## 7. Theming (dark mode)

- `src/theme/colors.ts` defines `lightColors` and `darkColors` — same keys, different values. `moods`
  (per-mood accent colors) is shared between both themes.
- `src/theme/typography.ts` exports `createTypography(colors)` because text color depends on theme —
  it's a function, not a static object.
- `src/theme/ThemeContext.tsx` exports `ThemeProvider` and `useTheme()`. `useTheme()` returns
  `{ mode, colors, typography, toggleTheme, setMode }`. Theme mode persists to AsyncStorage
  (`@um/themeMode`) and defaults to the OS color scheme on first launch (`Appearance.getColorScheme()`).
- **Every screen/component computes its `StyleSheet` inside the component body**, not at module scope:
  ```ts
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  ```
  This is necessary because `StyleSheet.create({...})` at module scope would freeze colors at import
  time and never update when the user toggles dark mode. **If you add a new screen/component that uses
  colors, follow this exact pattern** — a plain top-level `StyleSheet.create` using `colors.x` will not
  react to theme changes.
- The dark-mode toggle lives on `HomeScreen.tsx` (a `Switch` in the first card). To add a toggle
  elsewhere, just call `toggleTheme()` from `useTheme()`.

---

## 8. Helpful utilities

| Utility | Location | Use it for |
|---|---|---|
| `useTheme()` | `src/theme` | Colors + typography + dark mode toggle — needed in almost every component. |
| `Button` | `src/components/Button.tsx` | Standard call-to-action; `variant="primary" \| "secondary" \| "ghost"`. |
| `Card` | `src/components/Card.tsx` | Standard surface container; `muted` prop for a flatter, no-shadow look (used for list items vs. interactive cards). |
| `LikertScale` | `src/components/LikertScale.tsx` | 1–5 picker, used by quiz and mood/energy rating. |
| `ProgressBar` | `src/components/ProgressBar.tsx` | Animated 0–1 progress fill — quiz/scenario step progress, summary entry-count gate. |
| `FadeIn` | `src/components/FadeIn.tsx` | Wrap any block to get a staggered fade+slide-in; pass `delay` (ms) to stagger siblings. |
| `AnimatedPressable` | `src/components/AnimatedPressable.tsx` | Drop-in replacement for `Pressable` with a press-scale animation; `Button` and `LikertScale` are built on it. |
| `EmptyState` | `src/components/illustrations/EmptyState.tsx` | Standard "no entries yet" illustration + label for empty `FlatList`s. |

---

## 9. Troubleshooting — where to look first

| Symptom | Likely cause | Where to look |
|---|---|---|
| `Cannot read properties of undefined (reading 'transformFile')` on bundling | A Babel/Metro dependency (commonly `babel-preset-expo`) is referenced in config but not installed as a direct dependency. **The real error is hidden** — search the Metro log for `Failed to construct transformer:` to see the actual missing module. | `babel.config.js`, `metro.config.js`, `package.json` dependencies |
| Metro bundling fails immediately / weird Bundler errors | Missing `metro.config.js` at project root, or duplicate native module versions | Root `metro.config.js` must exist and `require('expo/metro-config')`; run `npx expo-doctor` to check for duplicates |
| App won't open in Expo Go ("incompatible" / SDK mismatch) | Expo Go app on the phone is pinned to one SDK version; project's `expo` version in `package.json` must match. **Do not let `npx expo install` silently downgrade/upgrade `expo` itself** — always check `package.json` after running it. | `package.json` → `"expo"` version; compare to phone's Expo Go SDK support |
| Missing peer dependency warnings (e.g. `expo-font`, `react-native-worklets`) | `npx expo install` sometimes resolves the wrong (stale) version for very recently released SDKs. The authoritative source of correct versions is `node_modules/expo/bundledNativeModules.json` — if `expo install` disagrees with it, install the exact version from that file manually. | `node_modules/expo/bundledNativeModules.json`, then `npm install <pkg>@<exact-version>` |
| New dark-mode toggle doesn't restyle a screen/component | A `StyleSheet.create` was placed at module scope referencing `colors` directly, instead of inside the component via `createStyles(colors, typography)` + `useMemo`. | The offending file's top of file — check whether `colors` import is static (`theme/colors`) vs. from `useTheme()` |
| Tab bar / bottom controls hidden behind Android's gesture or 3-button nav bar | Missing `SafeAreaProvider` at the app root, or `MainTabs` not reading `useSafeAreaInsets()` | `App.tsx` (must wrap in `SafeAreaProvider`), `src/navigation/MainTabs.tsx` (`tabBarStyle` height/padding) |
| TypeScript error about `StyleProp`/style arrays with `false`/`undefined` | A conditional style like `condition && styles.x` was passed to a component whose `style` prop is typed as plain `ViewStyle` instead of `StyleProp<ViewStyle>` | The component's prop types (see `AnimatedPressable.tsx` for the correct pattern) |
| Data seems to disappear after reinstalling the app or clearing storage | Expected — storage is local-only (AsyncStorage), not backed up anywhere | Not a bug; see §6 |

General rule: **run `npx tsc --noEmit` first** for any change — most regressions in this codebase show
up as type errors before they show up at runtime, since every screen is fully typed against
`src/types/index.ts` and the navigation param lists.

To sanity-check the Metro bundle without a device:
```
npx expo start --web --clear
curl "http://localhost:8081/index.ts.bundle?platform=android&dev=true"
```
A `200` with no `Failed to construct transformer` or `Unable to resolve module` in the response body
means the bundle is healthy.

---

## 10. Known stubs / intentionally incomplete

- **AI summary** (`SummaryScreen.tsx` → `generateStubSummary()`): returns a placeholder string instead
  of calling Claude. The data pipeline (mood + journal entries → summary → stored `InsightSnapshot`) is
  fully wired, only the actual model call is missing. To wire it up for real: build a small backend
  proxy to hold the Claude API key (never call the API directly from the RN app), then replace
  `generateStubSummary` with a fetch to that proxy.
- **No habit-formation features**: streaks, smart reminders — explicitly deferred from MVP scope.
- **No premium/paid tier gating**: monetization tiers were sketched in the original plan but not built.

---

## 11. History of major changes (chronological)

1. **Initial scaffold** — `create-expo-app` (blank-typescript template), navigation + AsyncStorage
   installed, data models + repository layer written, 7 screens + navigation stack/tabs built, stub AI
   summary wired end-to-end. Verified via `tsc --noEmit` + web bundle.
2. **UI overhaul** — design system (`theme/colors.ts`, `spacing.ts`, `typography.ts`), Reanimated-based
   animation primitives (`AnimatedPressable`, `FadeIn`, `ProgressBar`, `Spinner`), `@expo/vector-icons`
   for tab bar/mood icons, two custom `react-native-svg` illustrations, quiz/scenario screens converted
   to one-question-at-a-time paginated flow with progress bars.
3. **SDK/build fixes** — added missing `babel-preset-expo` and `metro.config.js` (root cause of a
   Metro `Bundler.transformFile` crash); resolved missing peer dependencies (`expo-font`,
   `react-native-worklets`) using the exact versions from `expo`'s own `bundledNativeModules.json`
   rather than trusting `npx expo install`'s (stale) recommendation for this very recent SDK.
4. **Dark mode + safe-area fix** — converted the static `colors` export into `lightColors`/`darkColors`
   plus a `ThemeProvider`/`useTheme()` context with AsyncStorage persistence; refactored every
   screen/component to compute styles reactively via `useMemo(() => createStyles(colors, typography))`;
   added `SafeAreaProvider` at the app root and `useSafeAreaInsets()` in `MainTabs` to stop the bottom
   tab bar from being hidden behind Android's gesture/button navigation overlay.

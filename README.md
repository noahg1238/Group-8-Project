# PlanB

Cross-platform calendar app (iOS, Android, web) built with Expo. With dark liquid-glass panels, month/year views, event CRUD, settings, and a numeric passkey.

## Requirements

- Node.js 20+
- npm 10+

## Run

```bash
npm install
npm run web # then open http://localhost:8081 or press w in the terminal
```

**Metro often shows 99% forever in the terminal** — that is normal. The bundle completes when the browser requests it. If nothing loads, open http://localhost:8081 manually or press `w` in the terminal.

Fresh install requires `babel-preset-expo` (included in devDependencies). Native SQLite is excluded from the web bundle via `db.web.ts` + Metro stub.

| Command           | Description                                   |
| ----------------- | --------------------------------------------- |
| `npm start`       | Expo dev server (choose platform in terminal) |
| `npm run web`     | Web only                                      |
| `npm run ios`     | iOS simulator                                 |
| `npm run android` | Android emulator                              |
| `npm install`     | Install deps                                  |

## Project layout

```
src/
├── app/
├── components/
│   ├── calendar/
│   ├── events/
│   ├── search/
│   └── ui/
├── database/
└── design/
assets/
└── images/
```

### Database folder

| File             | Role                                     |
| ---------------- | ---------------------------------------- |
| `db.ts`          | SQLite access (native)                   |
| `webDb.ts`       | localStorage stub (web)                  |
| `migrations.ts`  | Schema setup                             |
| `events.ts`      | Event CRUD + React Query hooks           |
| `stores.ts`      | Zustand (calendar, settings, auth flags) |
| `auth.ts`        | Passkey hash + secure storage            |
| `queryClient.ts` | TanStack Query client                    |
| `types.ts`       | Event + DB row types                     |

## Routes

| Path                 | Screen                                             |
| -------------------- | -------------------------------------------------- |
| `/`                  | Index - passkey verification/redirect to home page |
| `/home`              | Month calendar + day events                        |
| `/year_overview`     | 12 mini-month grid                                 |
| `/event_details?id=` | Event detail                                       |
| `/add_event_page`    | Create event (`?id=` for edit)                     |
| `/settings`          | App settings                                       |
| `/passkey_page`      | 4-digit passkey setup / entry                      |

## Data & state

- **Native:** `expo-sqlite` with migrations in `src/database/migrations.ts`
- **Web:** `localStorage` via `src/database/webDb.ts` (same event shape)
- **Events:** TanStack Query hooks and CRUD in `src/database/events.ts`
- **UI prefs / calendar month / auth flags:** Zustand in `src/database/stores.ts`
- **Passkey:** `src/database/auth.ts` (`expo-crypto` + `expo-secure-store`; web falls back to localStorage)

## Design system

- **Tokens:** `src/design/tokens.ts` — colors, spacing, `GlassColors`, shadows
- **Glass UI:** `LiquidGlassCard`, `GlassDepthLayer`, `GlassScreen` in `src/components/ui/`
- **Motion:** shared Reanimated presets in `src/design/motion.ts`
- **Web glass CSS:** `global.css` (`.liquid-glass`, `.liquid-glass-event`, etc.)

Components use **named exports**; only `app/` screens use `default` (Expo Router).



Search
The search query will display three hardcoded placeholder events instead of actual events. When tapping on a search result, the user will access a non-existing event that uses the demo data. The user’s search query is not sent to the database – it only filters in memory list.
Steps to reproduce:
Creating actual events -> opening the event -> tapping search button -> suggestions are placeholder demo entries -> tapping on one of them will display the demo data.

## Problems

| Cause                                                                                                | Where                                                 |
|------------------------------------------------------------------------------------------------------|------------------------------------------------------ |
| `No search overlay suggestions have been rendered; therefore, it defaults to DEFAULT_SUGGESTIONS`    | src/app/event_details.tsx                             |
| `Undefined list means defaulting to DEFAULT_SUGGESTIONS fallback`                                    | src/app/home.tsx                                      |
| `The native search source is useEventsByMonth; searches will happen for the current month only;`     | src/app/home.tsx                                      |
| `other months cannot be searched`                                                                    |                                                       |
| `searchEvents() / useSearchEvents() is defined, but not used in any file`                            | src/database/events.ts                                |
| `Hardcoded placeholder data lives here`                                                              | src/components/search/Search Overlay.tsx              |

Direction of fixing: delete DEFAULT_SUGGESTIONS default value (show the actual empty view), show actual suggestions for showing details and searching by useSearchEvents(query) in order to search all events.
Event removal doesn't work
Removal of an event (Event Details -> actions -> Remove) causes the event to be saved in storage but stays in the event list. The event appears only after switching months or refreshing the page. Specific to the web application.
Reproduction (web): npm run web -> create an event -> navigate to the event -> remove the event -> go back to the Home page and the event is still there.

|Cause                                                                                               |Where|
--------------------------------------------------------------------------------------------------------------------------------------------
|DELETE operation executes at the storage |                                                |events.ts / webDb.ts|

level (DELETE FROM events, row is deleted from localStorage)|                                |src/app/home.tsx|
                       
| HOME component depends on webEvents / allWebEvents state,                                |src/database/events.ts|
which is updated due to the effect triggered by 
[year, month, isWebClient]. 
Delete operation |doesn’t trigger it|                                                        |src/database/events.ts|                              
|WEB list gets its data from the state, not from React Query,|
therefore invalidateQueries in useDeleteEvent is useless|
|no useFocusEffect to update the list when screen gets focus|                               | src/app/home.tsx|
|
|                                                                                                 
|                                                                                            
 
|                                                                                                 
Fix direction: refresh the web lists on focus (useFocusEffect re-reading readEventsForMonth / readAllEvents)
Native invalidates the query Home actually consumesor unify the web path onto React Query so delete invalidation drives the Home list.
so deletion generally updates correctly there — the visible bug is the web render path.


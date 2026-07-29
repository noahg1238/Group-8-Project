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

| Path                 | Screen                             |
| -------------------- | ---------------------------------- |
| `/`                  | Home — month calendar + day events |
| `/year_overview`     | 12 mini-month grid                 |
| `/event_details?id=` | Event detail                       |
| `/add_event_page`    | Create event (`?id=` for edit)     |
| `/settings`          | App settings                       |
| `/passkey_page`      | 4-digit passkey setup / entry      |

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

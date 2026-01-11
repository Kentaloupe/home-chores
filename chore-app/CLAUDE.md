# Home Chores

A household chore management app with calendar scheduling, team assignments, and recurring task support.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 with TypeScript |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 |
| Calendar | FullCalendar 6 |
| Recurrence | rrule library |
| State | React Context + useReducer |
| Persistence | localStorage |

## Project Structure

```
src/
  components/
    Calendar/       # FullCalendar integration and event rendering
    Chores/         # Chore forms and recurrence configuration
    Layout/         # Header, Sidebar components
    Notifications/  # Notification badge display
    Team/           # Team member CRUD
  context/
    AppContext.tsx  # Global state provider with reducer
  hooks/
    useLocalStorage.ts
  types/
    index.ts        # All TypeScript interfaces and types
  utils/
    colors.ts       # Color palette utilities
    recurrence.ts   # RRule helpers and parsing
  App.tsx           # Root component, modal state management
  main.tsx          # Entry point
```

## Commands

```bash
npm run dev      # Start dev server (Vite)
npm run build    # Type-check + production build
npm run lint     # ESLint
npm run preview  # Preview production build
```

## Key Files

| Purpose | File |
|---------|------|
| App entry | `src/App.tsx` |
| State management | `src/context/AppContext.tsx` |
| Type definitions | `src/types/index.ts` |
| Recurrence logic | `src/utils/recurrence.ts` |
| Vite config | `vite.config.ts` |

## Data Model

**TeamMember**: `src/types/index.ts:1-5`
- `id`, `name`, `color`

**Chore**: `src/types/index.ts:7-14`
- `id`, `title`, `description?`, `assigneeId`, `startDate`, `recurrenceRule?`, `completed[]`

**AppState**: `src/types/index.ts:17-20`
- `teamMembers[]`, `chores[]`

## State Actions

Available via `useApp()` hook from `src/context/AppContext.tsx`:

- `addMember(member)` / `updateMember(member)` / `deleteMember(id)`
- `addChore(chore)` / `updateChore(chore)` / `deleteChore(id)`
- `toggleChoreCompletion(choreId, date)`

## Recurrence

Chores support recurring schedules using RRule format:

- Configuration: `src/utils/recurrence.ts:3-9` (`RecurrenceConfig` interface)
- Convert config to RRule: `configToRRule()` at `src/utils/recurrence.ts:17-61`
- Get occurrences in date range: `getOccurrences()` at `src/utils/recurrence.ts:63-78`
- Parse RRule back to config: `parseRRuleToConfig()` at `src/utils/recurrence.ts:101-139`

## Additional Documentation

When working on specific areas, consult these files:

| Topic | File |
|-------|------|
| Architectural patterns | `.claude/docs/architectural_patterns.md` |

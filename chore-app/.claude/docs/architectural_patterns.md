# Architectural Patterns

## State Management: Context + Reducer

The app uses React Context with useReducer for centralized state management.

- **Provider**: `src/context/AppContext.tsx:87-159` wraps the app with state and dispatch
- **Reducer**: `src/context/AppContext.tsx:11-71` handles all state mutations via action types
- **Consumer hook**: `src/context/AppContext.tsx:161-167` - use `useApp()` to access state/actions
- **Action types**: `src/types/index.ts:22-30` - discriminated union pattern

Pattern usage:
```
const { state, addChore, updateChore } = useApp();
```

## Persistence: localStorage Sync

State automatically syncs to localStorage via effects in AppContext.

- **Load on mount**: `src/context/AppContext.tsx:91-101`
- **Save on change**: `src/context/AppContext.tsx:104-110`
- **Storage key**: `chore-app-data`

## Modal Pattern

All modals follow a consistent implementation:

1. Fixed overlay with backdrop (`fixed inset-0 z-50`)
2. Backdrop click handler for dismissal
3. Centered content with max-width constraint
4. Close button in header

Examples:
- `src/components/Chores/ChoreForm.tsx:78-92`
- `src/components/Team/TeamList.tsx:19-34`
- `src/components/Team/MemberForm.tsx:33-40`

## Form Component Pattern

All forms use controlled components with consistent structure:

1. Local state for form fields via `useState`
2. Props interface defining `onClose` and optional entity for edit mode
3. `handleSubmit` validates and calls context action
4. Conditional rendering for create vs edit mode

Examples:
- `src/components/Chores/ChoreForm.tsx:18-68`
- `src/components/Team/MemberForm.tsx:11-30`

## Props Interface Convention

Every component defines a TypeScript interface for its props:

```typescript
interface ComponentNameProps {
  // required props
  onClose: () => void;
  // optional props for edit mode
  entity?: EntityType | null;
}
```

Examples:
- `src/components/Chores/ChoreForm.tsx:12-16`
- `src/components/Team/TeamList.tsx:6-9`
- `src/components/Calendar/CalendarView.tsx:13-16`

## Feature-based Directory Structure

Components are organized by domain/feature:

```
src/components/
  Calendar/     # Calendar display
  Chores/       # Chore CRUD forms
  Layout/       # Header, Sidebar
  Notifications/
  Team/         # Team member management
```

## Utility Function Separation

Pure utility functions are extracted to `src/utils/`:

- `recurrence.ts` - RRule configuration, parsing, occurrence generation
- `colors.ts` - Color palette and helper functions

These have no React dependencies and can be unit tested independently.

## Type Centralization

All shared types are defined in `src/types/index.ts`:

- Entity interfaces: `TeamMember`, `Chore`
- State interface: `AppState`
- Action union: `AppAction`
- Helper types: `RecurrenceOption`

## Callback Props Pattern

Parent components pass callback handlers to children for actions:

- `App.tsx:16-38` defines handlers for chore/team modals
- Callbacks passed to Header, CalendarView for user interactions
- Children call callbacks; parents manage state transitions

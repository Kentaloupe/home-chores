export interface TeamMember {
  id: string;
  name: string;
  color: string;
}

export interface Chore {
  id: string;
  title: string;
  description?: string;
  assigneeId: string | null;
  startDate: string; // ISO date string
  recurrenceRule?: string; // RRule string (e.g., "FREQ=WEEKLY;BYDAY=MO")
  completed: string[]; // Array of completed occurrence dates (ISO strings)
  owner: string; // User ID who created this chore
}

export interface AppState {
  teamMembers: TeamMember[];
  chores: Chore[];
}

export type AppAction =
  | { type: 'ADD_MEMBER'; payload: TeamMember }
  | { type: 'UPDATE_MEMBER'; payload: TeamMember }
  | { type: 'DELETE_MEMBER'; payload: string }
  | { type: 'ADD_CHORE'; payload: Chore }
  | { type: 'UPDATE_CHORE'; payload: Chore }
  | { type: 'DELETE_CHORE'; payload: string }
  | { type: 'TOGGLE_CHORE_COMPLETION'; payload: { choreId: string; date: string } }
  | { type: 'LOAD_STATE'; payload: AppState };

export interface RecurrenceOption {
  label: string;
  value: string;
  rrule?: string;
}

export interface AuthUser {
  id: string;
  email: string;
}

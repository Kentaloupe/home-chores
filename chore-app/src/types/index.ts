export const REGIONS = [
  'BC', 'AB', 'SK', 'MB',
  'GTA-N', 'GTA-S', 'ON-E', 'ON-W', 'Central',
  'QC',
  'NS', 'NL', 'PE',
  'YK', 'NT', 'NWT'
] as const;

export type Region = typeof REGIONS[number];

export interface TeamMember {
  id: string;
  name: string;
  color: string;
  region: Region;
  owner: string;
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  assigneeId: string | null;
  startDate: string; // ISO date string
  recurrenceRule?: string; // RRule string (e.g., "FREQ=WEEKLY;BYDAY=MO")
  completed: string[]; // Array of completed occurrence dates (ISO strings)
  owner: string; // User ID who created this activity
}

export interface AppState {
  teamMembers: TeamMember[];
  activities: Activity[];
}

export type AppAction =
  | { type: 'ADD_MEMBER'; payload: TeamMember }
  | { type: 'UPDATE_MEMBER'; payload: TeamMember }
  | { type: 'DELETE_MEMBER'; payload: string }
  | { type: 'ADD_ACTIVITY'; payload: Activity }
  | { type: 'UPDATE_ACTIVITY'; payload: Activity }
  | { type: 'DELETE_ACTIVITY'; payload: string }
  | { type: 'TOGGLE_ACTIVITY_COMPLETION'; payload: { activityId: string; date: string } }
  | { type: 'LOAD_STATE'; payload: AppState };

export interface RecurrenceOption {
  label: string;
  value: string;
  rrule?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  isAdmin: boolean;
}

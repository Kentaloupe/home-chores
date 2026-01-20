import { createContext, useContext, useReducer, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { AppState, AppAction, TeamMember, Activity } from '../types';
import { fetchTeamMembers, createTeamMember, updateTeamMember as updateTeamMemberApi, deleteTeamMember as deleteTeamMemberApi } from '../services/teamMemberService';
import { fetchActivities, createActivity, updateActivity as updateActivityApi, deleteActivity as deleteActivityApi } from '../services/activityService';
import { toggleCompletion } from '../services/completionService';
import pb from '../services/pocketbase';

const initialState: AppState = {
  teamMembers: [],
  activities: [],
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_MEMBER':
      return { ...state, teamMembers: [...state.teamMembers, action.payload] };

    case 'UPDATE_MEMBER':
      return {
        ...state,
        teamMembers: state.teamMembers.map(m =>
          m.id === action.payload.id ? action.payload : m
        ),
      };

    case 'DELETE_MEMBER':
      return {
        ...state,
        teamMembers: state.teamMembers.filter(m => m.id !== action.payload),
        activities: state.activities.map(a =>
          a.assigneeId === action.payload ? { ...a, assigneeId: null } : a
        ),
      };

    case 'ADD_ACTIVITY':
      return { ...state, activities: [...state.activities, action.payload] };

    case 'UPDATE_ACTIVITY':
      return {
        ...state,
        activities: state.activities.map(a =>
          a.id === action.payload.id ? action.payload : a
        ),
      };

    case 'DELETE_ACTIVITY':
      return {
        ...state,
        activities: state.activities.filter(a => a.id !== action.payload),
      };

    case 'TOGGLE_ACTIVITY_COMPLETION': {
      const { activityId, date } = action.payload;
      return {
        ...state,
        activities: state.activities.map(a => {
          if (a.id !== activityId) return a;
          const completed = a.completed.includes(date)
            ? a.completed.filter(d => d !== date)
            : [...a.completed, date];
          return { ...a, completed };
        }),
      };
    }

    case 'LOAD_STATE':
      return action.payload;

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  isLoading: boolean;
  error: string | null;
  addMember: (member: Omit<TeamMember, 'id' | 'owner'>) => Promise<void>;
  updateMember: (member: TeamMember) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  addActivity: (activity: Omit<Activity, 'id' | 'completed' | 'owner'>) => Promise<void>;
  updateActivity: (activity: Activity) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  toggleActivityCompletion: (activityId: string, date: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [teamMembers, activities] = await Promise.all([
        fetchTeamMembers(),
        fetchActivities(),
      ]);
      dispatch({ type: 'LOAD_STATE', payload: { teamMembers, activities } });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load data';
      setError(message);
      console.error('Error loading data:', err);
    }
  }, []);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      await loadData();
      setIsLoading(false);
    }
    init();

    // Subscribe to real-time updates
    const unsubscribes: (() => void)[] = [];

    pb.collection('chores').subscribe('*', () => {
      loadData();
    }).then(unsub => unsubscribes.push(unsub));

    pb.collection('team_members').subscribe('*', () => {
      loadData();
    }).then(unsub => unsubscribes.push(unsub));

    pb.collection('chore_completions').subscribe('*', () => {
      loadData();
    }).then(unsub => unsubscribes.push(unsub));

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [loadData]);

  const addMember = async (member: Omit<TeamMember, 'id' | 'owner'>) => {
    try {
      const created = await createTeamMember(member);
      dispatch({ type: 'ADD_MEMBER', payload: created });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add member';
      setError(message);
      throw err;
    }
  };

  const updateMember = async (member: TeamMember) => {
    try {
      const updated = await updateTeamMemberApi(member);
      dispatch({ type: 'UPDATE_MEMBER', payload: updated });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update member';
      setError(message);
      throw err;
    }
  };

  const deleteMember = async (id: string) => {
    try {
      await deleteTeamMemberApi(id);
      dispatch({ type: 'DELETE_MEMBER', payload: id });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete member';
      setError(message);
      throw err;
    }
  };

  const addActivity = async (activity: Omit<Activity, 'id' | 'completed' | 'owner'>) => {
    try {
      const created = await createActivity(activity);
      dispatch({ type: 'ADD_ACTIVITY', payload: created });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add activity';
      setError(message);
      throw err;
    }
  };

  const updateActivity = async (activity: Activity) => {
    try {
      const updated = await updateActivityApi(activity);
      dispatch({ type: 'UPDATE_ACTIVITY', payload: updated });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update activity';
      setError(message);
      throw err;
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      await deleteActivityApi(id);
      dispatch({ type: 'DELETE_ACTIVITY', payload: id });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete activity';
      setError(message);
      throw err;
    }
  };

  const toggleActivityCompletionFn = async (activityId: string, date: string) => {
    try {
      await toggleCompletion(activityId, date);
      dispatch({ type: 'TOGGLE_ACTIVITY_COMPLETION', payload: { activityId, date } });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to toggle completion';
      setError(message);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        isLoading,
        error,
        addMember,
        updateMember,
        deleteMember,
        addActivity,
        updateActivity,
        deleteActivity,
        toggleActivityCompletion: toggleActivityCompletionFn,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

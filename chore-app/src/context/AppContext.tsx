import { createContext, useContext, useReducer, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { AppState, AppAction, TeamMember, Chore } from '../types';
import { fetchTeamMembers, createTeamMember, updateTeamMember as updateTeamMemberApi, deleteTeamMember as deleteTeamMemberApi } from '../services/teamMemberService';
import { fetchChores, createChore, updateChore as updateChoreApi, deleteChore as deleteChoreApi } from '../services/choreService';
import { toggleCompletion } from '../services/completionService';
import pb from '../services/pocketbase';

const initialState: AppState = {
  teamMembers: [],
  chores: [],
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
        chores: state.chores.map(c =>
          c.assigneeId === action.payload ? { ...c, assigneeId: null } : c
        ),
      };

    case 'ADD_CHORE':
      return { ...state, chores: [...state.chores, action.payload] };

    case 'UPDATE_CHORE':
      return {
        ...state,
        chores: state.chores.map(c =>
          c.id === action.payload.id ? action.payload : c
        ),
      };

    case 'DELETE_CHORE':
      return {
        ...state,
        chores: state.chores.filter(c => c.id !== action.payload),
      };

    case 'TOGGLE_CHORE_COMPLETION': {
      const { choreId, date } = action.payload;
      return {
        ...state,
        chores: state.chores.map(c => {
          if (c.id !== choreId) return c;
          const completed = c.completed.includes(date)
            ? c.completed.filter(d => d !== date)
            : [...c.completed, date];
          return { ...c, completed };
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
  addChore: (chore: Omit<Chore, 'id' | 'completed' | 'owner'>) => Promise<void>;
  updateChore: (chore: Chore) => Promise<void>;
  deleteChore: (id: string) => Promise<void>;
  toggleChoreCompletion: (choreId: string, date: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [teamMembers, chores] = await Promise.all([
        fetchTeamMembers(),
        fetchChores(),
      ]);
      dispatch({ type: 'LOAD_STATE', payload: { teamMembers, chores } });
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

  const addChore = async (chore: Omit<Chore, 'id' | 'completed' | 'owner'>) => {
    try {
      const created = await createChore(chore);
      dispatch({ type: 'ADD_CHORE', payload: created });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add chore';
      setError(message);
      throw err;
    }
  };

  const updateChore = async (chore: Chore) => {
    try {
      const updated = await updateChoreApi(chore);
      dispatch({ type: 'UPDATE_CHORE', payload: updated });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update chore';
      setError(message);
      throw err;
    }
  };

  const deleteChore = async (id: string) => {
    try {
      await deleteChoreApi(id);
      dispatch({ type: 'DELETE_CHORE', payload: id });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete chore';
      setError(message);
      throw err;
    }
  };

  const toggleChoreCompletionFn = async (choreId: string, date: string) => {
    try {
      await toggleCompletion(choreId, date);
      dispatch({ type: 'TOGGLE_CHORE_COMPLETION', payload: { choreId, date } });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to toggle completion';
      setError(message);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
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
        addChore,
        updateChore,
        deleteChore,
        toggleChoreCompletion: toggleChoreCompletionFn,
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

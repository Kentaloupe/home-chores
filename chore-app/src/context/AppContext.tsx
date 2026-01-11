import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { AppState, AppAction, TeamMember, Chore } from '../types';

const STORAGE_KEY = 'chore-app-data';

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
        // Unassign chores from deleted member
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
  addMember: (member: Omit<TeamMember, 'id'>) => void;
  updateMember: (member: TeamMember) => void;
  deleteMember: (id: string) => void;
  addChore: (chore: Omit<Chore, 'id' | 'completed'>) => void;
  updateChore: (chore: Chore) => void;
  deleteChore: (id: string) => void;
  toggleChoreCompletion: (choreId: string, date: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_STATE', payload: parsed });
      }
    } catch (error) {
      console.error('Error loading state from localStorage:', error);
    }
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving state to localStorage:', error);
    }
  }, [state]);

  const addMember = (member: Omit<TeamMember, 'id'>) => {
    const id = crypto.randomUUID();
    dispatch({ type: 'ADD_MEMBER', payload: { ...member, id } });
  };

  const updateMember = (member: TeamMember) => {
    dispatch({ type: 'UPDATE_MEMBER', payload: member });
  };

  const deleteMember = (id: string) => {
    dispatch({ type: 'DELETE_MEMBER', payload: id });
  };

  const addChore = (chore: Omit<Chore, 'id' | 'completed'>) => {
    const id = crypto.randomUUID();
    dispatch({ type: 'ADD_CHORE', payload: { ...chore, id, completed: [] } });
  };

  const updateChore = (chore: Chore) => {
    dispatch({ type: 'UPDATE_CHORE', payload: chore });
  };

  const deleteChore = (id: string) => {
    dispatch({ type: 'DELETE_CHORE', payload: id });
  };

  const toggleChoreCompletion = (choreId: string, date: string) => {
    dispatch({ type: 'TOGGLE_CHORE_COMPLETION', payload: { choreId, date } });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        addMember,
        updateMember,
        deleteMember,
        addChore,
        updateChore,
        deleteChore,
        toggleChoreCompletion,
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

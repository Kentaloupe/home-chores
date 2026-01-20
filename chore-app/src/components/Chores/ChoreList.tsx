import { useApp } from '../../context/AppContext';
import type { Chore } from '../../types';
import { describeRecurrence } from '../../utils/recurrence';

interface ChoreListProps {
  onEditChore: (chore: Chore) => void;
}

export function ChoreList({ onEditChore }: ChoreListProps) {
  const { state, toggleChoreCompletion } = useApp();

  const getMemberColor = (assigneeId: string | null) => {
    if (!assigneeId) return '#9ca3af';
    const member = state.teamMembers.find(m => m.id === assigneeId);
    return member?.color || '#9ca3af';
  };

  const getMemberName = (assigneeId: string | null) => {
    if (!assigneeId) return 'Unassigned';
    const member = state.teamMembers.find(m => m.id === assigneeId);
    return member?.name || 'Unknown';
  };

  if (state.chores.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No chores yet. Click "Add Chore" to create one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {state.chores.map(chore => {
        const dateStr = chore.startDate.split('T')[0];
        const isCompleted = chore.completed.includes(dateStr);

        return (
          <div
            key={chore.id}
            className={`p-4 bg-white rounded-lg border-l-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
              isCompleted ? 'opacity-60' : ''
            }`}
            style={{ borderLeftColor: getMemberColor(chore.assigneeId) }}
            onClick={() => onEditChore(chore)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      toggleChoreCompletion(chore.id, dateStr);
                    }}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-emerald-500'
                    }`}
                  >
                    {isCompleted && (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <h3 className={`font-medium text-gray-900 ${isCompleted ? 'line-through' : ''}`}>
                    {chore.title}
                  </h3>
                </div>
                {chore.description && (
                  <p className="mt-1 text-sm text-gray-600 ml-7">{chore.description}</p>
                )}
                <div className="mt-2 flex items-center gap-4 ml-7 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getMemberColor(chore.assigneeId) }}
                    />
                    {getMemberName(chore.assigneeId)}
                  </span>
                  <span>{new Date(chore.startDate).toLocaleDateString()}</span>
                  {chore.recurrenceRule && (
                    <span className="text-emerald-600">
                      {describeRecurrence(chore.recurrenceRule)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

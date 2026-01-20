import { useApp } from '../../context/AppContext';

export function Sidebar() {
  const { state } = useApp();

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 p-4">
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Team Members
        </h2>
        {state.teamMembers.length === 0 ? (
          <p className="text-sm text-gray-400">No team members yet</p>
        ) : (
          <ul className="space-y-2">
            {state.teamMembers.map(member => (
              <li key={member.id} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: member.color }}
                />
                <span className="text-sm text-gray-700">{member.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Quick Stats
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Activities</span>
            <span className="font-medium text-gray-900">{state.activities.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Team Size</span>
            <span className="font-medium text-gray-900">{state.teamMembers.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Unassigned</span>
            <span className="font-medium text-gray-900">
              {state.activities.filter(a => !a.assigneeId).length}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

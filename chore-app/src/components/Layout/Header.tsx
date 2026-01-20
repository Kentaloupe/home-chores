import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onAddActivity: () => void;
  onManageTeam: () => void;
}

export function Header({ onAddActivity, onManageTeam }: HeaderProps) {
  const { state } = useApp();
  const { user, logout } = useAuth();

  const upcomingCount = getUpcomingActivitiesCount(state.activities);
  const overdueCount = getOverdueActivitiesCount(state.activities);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Pharmacy Field Team</h1>
          <div className="flex gap-2">
            {upcomingCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {upcomingCount} upcoming
              </span>
            )}
            {overdueCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {overdueCount} overdue
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onManageTeam}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Manage Team
          </button>
          <button
            onClick={onAddActivity}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            + Add Activity
          </button>
          <div className="ml-4 pl-4 border-l border-gray-200 flex items-center gap-3">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              onClick={logout}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function getUpcomingActivitiesCount(activities: { startDate: string; completed: string[]; recurrenceRule?: string }[]): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);

  let count = 0;
  for (const activity of activities) {
    const activityDate = new Date(activity.startDate);
    const dateStr = activityDate.toISOString().split('T')[0];
    if (activityDate >= now && activityDate <= tomorrow && !activity.completed.includes(dateStr)) {
      count++;
    }
  }
  return count;
}

function getOverdueActivitiesCount(activities: { startDate: string; completed: string[]; recurrenceRule?: string }[]): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let count = 0;
  for (const activity of activities) {
    const activityDate = new Date(activity.startDate);
    activityDate.setHours(0, 0, 0, 0);
    const dateStr = activityDate.toISOString().split('T')[0];
    if (activityDate < now && !activity.completed.includes(dateStr)) {
      count++;
    }
  }
  return count;
}

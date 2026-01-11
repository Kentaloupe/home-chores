import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getOccurrences } from '../../utils/recurrence';

export function NotificationBadge() {
  const { state } = useApp();

  const { upcoming, overdue } = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 2);

    let upcomingCount = 0;
    let overdueCount = 0;

    for (const chore of state.chores) {
      const startDate = new Date(chore.startDate);

      if (chore.recurrenceRule) {
        // Check occurrences
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 7);

        const occurrences = getOccurrences(
          chore.recurrenceRule,
          startDate,
          yesterday,
          tomorrow
        );

        for (const occ of occurrences) {
          const dateStr = occ.toISOString().split('T')[0];
          const isCompleted = chore.completed.includes(dateStr);
          if (isCompleted) continue;

          const occDate = new Date(occ.getFullYear(), occ.getMonth(), occ.getDate());
          if (occDate < today) {
            overdueCount++;
          } else if (occDate >= today && occDate < tomorrow) {
            upcomingCount++;
          }
        }
      } else {
        const dateStr = chore.startDate.split('T')[0];
        const isCompleted = chore.completed.includes(dateStr);
        if (isCompleted) continue;

        const choreDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        if (choreDate < today) {
          overdueCount++;
        } else if (choreDate >= today && choreDate < tomorrow) {
          upcomingCount++;
        }
      }
    }

    return { upcoming: upcomingCount, overdue: overdueCount };
  }, [state.chores]);

  if (upcoming === 0 && overdue === 0) {
    return null;
  }

  return (
    <div className="flex gap-2">
      {upcoming > 0 && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {upcoming} upcoming
        </span>
      )}
      {overdue > 0 && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          {overdue} overdue
        </span>
      )}
    </div>
  );
}

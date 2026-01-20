import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import type { Activity } from '../../types';
import { RecurrenceSelector } from './RecurrenceSelector';
import type { RecurrenceConfig } from '../../utils/recurrence';
import {
  configToRRule,
  describeRecurrence,
  parseRRuleToConfig,
} from '../../utils/recurrence';

interface ActivityFormProps {
  activity?: Activity | null;
  initialDate?: string;
  onClose: () => void;
}

export function ActivityForm({ activity, initialDate, onClose }: ActivityFormProps) {
  const { state, addActivity, updateActivity, deleteActivity } = useApp();
  const { user } = useAuth();
  const isOwner = !activity || activity.owner === user?.id;
  const canEdit = isOwner || user?.isAdmin;
  const isReadOnly = !!(activity && !canEdit);

  const [title, setTitle] = useState(activity?.title || '');
  const [description, setDescription] = useState(activity?.description || '');
  const [assigneeId, setAssigneeId] = useState<string | null>(activity?.assigneeId || null);
  const [startDate, setStartDate] = useState(
    activity?.startDate?.split('T')[0] ||
    initialDate ||
    new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    activity?.endDate?.split('T')[0] || ''
  );
  const [recurrenceConfig, setRecurrenceConfig] = useState<RecurrenceConfig>(
    parseRRuleToConfig(activity?.recurrenceRule)
  );

  const [showRecurrence, setShowRecurrence] = useState(!!activity?.recurrenceRule);

  useEffect(() => {
    if (activity?.recurrenceRule) {
      setShowRecurrence(true);
    }
  }, [activity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const recurrenceRule = showRecurrence
      ? configToRRule(recurrenceConfig, new Date(startDate))
      : undefined;

    if (activity) {
      updateActivity({
        ...activity,
        title: title.trim(),
        description: description.trim() || undefined,
        assigneeId,
        startDate,
        endDate: endDate || undefined,
        recurrenceRule,
      });
    } else {
      addActivity({
        title: title.trim(),
        description: description.trim() || undefined,
        assigneeId,
        startDate,
        endDate: endDate || undefined,
        recurrenceRule,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (activity && confirm('Delete this activity?')) {
      deleteActivity(activity.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {activity ? (isReadOnly ? 'View Activity' : 'Edit Activity') : 'Add Activity'}
              </h2>
              {isReadOnly && (
                <p className="text-sm text-gray-500 mt-1">You can only view this activity (created by another user)</p>
              )}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                placeholder="e.g., Site visit"
                autoFocus
                disabled={isReadOnly}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                placeholder="Add details..."
                disabled={isReadOnly}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign to
              </label>
              <select
                value={assigneeId || ''}
                onChange={e => setAssigneeId(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                disabled={isReadOnly}
              >
                <option value="">Unassigned</option>
                {state.teamMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                  disabled={isReadOnly}
                />
              </div>
            </div>

            {!isReadOnly && (
              <div className="border-t pt-4">
                <button
                  type="button"
                  onClick={() => setShowRecurrence(!showRecurrence)}
                  className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-800"
                >
                  <svg className={`w-4 h-4 transition-transform ${showRecurrence ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {showRecurrence ? 'Hide recurrence options' : 'Add recurrence'}
                  {activity?.recurrenceRule && !showRecurrence && (
                    <span className="text-gray-500 font-normal">
                      ({describeRecurrence(activity.recurrenceRule)})
                    </span>
                  )}
                </button>

                {showRecurrence && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <RecurrenceSelector
                      config={recurrenceConfig}
                      onChange={setRecurrenceConfig}
                    />
                  </div>
                )}
              </div>
            )}
            {isReadOnly && activity?.recurrenceRule && (
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Recurrence:</span> {describeRecurrence(activity.recurrenceRule)}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              {activity && canEdit && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                >
                  Delete
                </button>
              )}
              <div className="flex-1" />
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {isReadOnly ? 'Close' : 'Cancel'}
              </button>
              {!isReadOnly && (
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  {activity ? 'Save' : 'Add Activity'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

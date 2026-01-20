import type { RecurrenceConfig } from '../../utils/recurrence';
import { WEEKDAY_NAMES } from '../../utils/recurrence';

interface RecurrenceSelectorProps {
  config: RecurrenceConfig;
  onChange: (config: RecurrenceConfig) => void;
}

export function RecurrenceSelector({ config, onChange }: RecurrenceSelectorProps) {
  const updateConfig = (updates: Partial<RecurrenceConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Repeat
        </label>
        <select
          value={config.frequency}
          onChange={e => updateConfig({ frequency: e.target.value as RecurrenceConfig['frequency'] })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
        >
          <option value="none">Does not repeat</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {config.frequency !== 'none' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Every
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={99}
              value={config.interval}
              onChange={e => updateConfig({ interval: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-gray-600">
              {config.frequency === 'daily' && (config.interval === 1 ? 'day' : 'days')}
              {config.frequency === 'weekly' && (config.interval === 1 ? 'week' : 'weeks')}
              {config.frequency === 'monthly' && (config.interval === 1 ? 'month' : 'months')}
              {config.frequency === 'custom' && (config.interval === 1 ? 'week' : 'weeks')}
            </span>
          </div>
        </div>
      )}

      {(config.frequency === 'weekly' || config.frequency === 'custom') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            On days
          </label>
          <div className="flex gap-1">
            {WEEKDAY_NAMES.map((day, index) => (
              <button
                key={day}
                type="button"
                onClick={() => {
                  const weekdays = config.weekdays.includes(index)
                    ? config.weekdays.filter(d => d !== index)
                    : [...config.weekdays, index].sort();
                  updateConfig({ weekdays });
                }}
                className={`w-10 h-10 text-xs font-medium rounded-lg transition-colors ${
                  config.weekdays.includes(index)
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}

      {config.frequency === 'monthly' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Repeat on
          </label>
          <select
            value={config.monthlyType}
            onChange={e => updateConfig({ monthlyType: e.target.value as 'dayOfMonth' | 'dayOfWeek' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            <option value="dayOfMonth">Same day of month (e.g., 15th)</option>
            <option value="dayOfWeek">Same weekday (e.g., 2nd Tuesday)</option>
          </select>
        </div>
      )}

      {config.frequency !== 'none' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End date (optional)
          </label>
          <input
            type="date"
            value={config.endDate || ''}
            onChange={e => updateConfig({ endDate: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      )}
    </div>
  );
}

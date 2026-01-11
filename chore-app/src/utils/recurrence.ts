import { RRule, Frequency, Weekday } from 'rrule';

export interface RecurrenceConfig {
  frequency: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  interval: number;
  weekdays: number[]; // 0=Monday, 1=Tuesday, etc.
  monthlyType: 'dayOfMonth' | 'dayOfWeek'; // e.g., "15th" vs "2nd Tuesday"
  endDate?: string;
}

export const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const WEEKDAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// RRule weekday constants in order (Mon=0 to Sun=6)
const RRULE_WEEKDAYS = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA, RRule.SU];

export function configToRRule(config: RecurrenceConfig, startDate: Date): string | undefined {
  if (config.frequency === 'none') return undefined;

  const options: Partial<ConstructorParameters<typeof RRule>[0]> = {
    dtstart: startDate,
    interval: config.interval,
  };

  switch (config.frequency) {
    case 'daily':
      options.freq = Frequency.DAILY;
      break;
    case 'weekly':
      options.freq = Frequency.WEEKLY;
      if (config.weekdays.length > 0) {
        options.byweekday = config.weekdays.map(d => RRULE_WEEKDAYS[d]);
      }
      break;
    case 'monthly':
      options.freq = Frequency.MONTHLY;
      if (config.monthlyType === 'dayOfWeek') {
        // Calculate nth weekday of month based on start date
        const weekday = startDate.getDay();
        const dayOfMonth = startDate.getDate();
        const nthWeek = Math.ceil(dayOfMonth / 7);
        // Convert JS weekday (0=Sun) to RRule weekday (0=Mon)
        const rruleWeekdayIndex = weekday === 0 ? 6 : weekday - 1;
        options.byweekday = [RRULE_WEEKDAYS[rruleWeekdayIndex].nth(nthWeek)];
      }
      break;
    case 'custom':
      options.freq = Frequency.WEEKLY;
      if (config.weekdays.length > 0) {
        options.byweekday = config.weekdays.map(d => RRULE_WEEKDAYS[d]);
      }
      break;
  }

  if (config.endDate) {
    options.until = new Date(config.endDate);
  }

  const rule = new RRule(options as ConstructorParameters<typeof RRule>[0]);
  return rule.toString();
}

export function getOccurrences(
  rruleString: string,
  startDate: Date,
  rangeStart: Date,
  rangeEnd: Date
): Date[] {
  try {
    const rule = RRule.fromString(rruleString);
    // Ensure dtstart is set
    const options = { ...rule.options, dtstart: startDate };
    const ruleWithStart = new RRule(options);
    return ruleWithStart.between(rangeStart, rangeEnd, true);
  } catch {
    return [];
  }
}

export function describeRecurrence(rruleString?: string): string {
  if (!rruleString) return 'One-time';

  try {
    const rule = RRule.fromString(rruleString);
    return rule.toText();
  } catch {
    return 'Custom schedule';
  }
}

export function getDefaultRecurrenceConfig(): RecurrenceConfig {
  return {
    frequency: 'none',
    interval: 1,
    weekdays: [],
    monthlyType: 'dayOfMonth',
  };
}

// Helper to parse an RRule string back to config (for editing)
export function parseRRuleToConfig(rruleString?: string): RecurrenceConfig {
  if (!rruleString) return getDefaultRecurrenceConfig();

  try {
    const rule = RRule.fromString(rruleString);
    const { freq, interval, byweekday } = rule.options;

    const config: RecurrenceConfig = {
      frequency: 'none',
      interval: interval || 1,
      weekdays: [],
      monthlyType: 'dayOfMonth',
    };

    switch (freq) {
      case Frequency.DAILY:
        config.frequency = 'daily';
        break;
      case Frequency.WEEKLY:
        config.frequency = 'weekly';
        if (byweekday && Array.isArray(byweekday)) {
          config.weekdays = byweekday.map(w =>
            typeof w === 'number' ? w : (w as Weekday).weekday
          );
        }
        break;
      case Frequency.MONTHLY:
        config.frequency = 'monthly';
        if (byweekday && byweekday.length > 0) {
          config.monthlyType = 'dayOfWeek';
        }
        break;
    }

    return config;
  } catch {
    return getDefaultRecurrenceConfig();
  }
}

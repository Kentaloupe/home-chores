import pb from './pocketbase';
import type { Activity } from '../types';

interface PBActivity {
  id: string;
  title: string;
  description: string;
  assignee: string;
  start_date: string;
  end_date: string;
  hours_per_day: number;
  recurrence_rule: string;
  owner: string;
}

function pbActivityToActivity(record: PBActivity, completedDates: string[]): Activity {
  return {
    id: record.id,
    title: record.title,
    description: record.description || undefined,
    assigneeId: record.assignee || null,
    startDate: record.start_date,
    endDate: record.end_date || undefined,
    hoursPerDay: record.hours_per_day || undefined,
    recurrenceRule: record.recurrence_rule || undefined,
    completed: completedDates,
    owner: record.owner,
  };
}

export async function fetchActivities(): Promise<Activity[]> {
  const records = await pb.collection('chores').getFullList<PBActivity>();
  const completions = await pb.collection('chore_completions').getFullList();

  const completionsByActivity = new Map<string, string[]>();
  for (const completion of completions) {
    const activityId = completion.chore;
    if (!completionsByActivity.has(activityId)) {
      completionsByActivity.set(activityId, []);
    }
    completionsByActivity.get(activityId)!.push(completion.completed_date);
  }

  return records.map((record) =>
    pbActivityToActivity(record, completionsByActivity.get(record.id) || [])
  );
}

export async function createActivity(
  activity: Omit<Activity, 'id' | 'completed' | 'owner'>
): Promise<Activity> {
  const ownerId = pb.authStore.model?.id || '';
  const record = await pb.collection('chores').create({
    title: activity.title,
    description: activity.description || '',
    assignee: activity.assigneeId || '',
    start_date: activity.startDate,
    end_date: activity.endDate || '',
    hours_per_day: activity.hoursPerDay || 0,
    recurrence_rule: activity.recurrenceRule || '',
    owner: ownerId,
  });
  return {
    id: record.id,
    title: record.title,
    description: record.description || undefined,
    assigneeId: record.assignee || null,
    startDate: record.start_date,
    endDate: record.end_date || undefined,
    hoursPerDay: record.hours_per_day || undefined,
    recurrenceRule: record.recurrence_rule || undefined,
    completed: [],
    owner: ownerId,
  };
}

export async function updateActivity(activity: Activity): Promise<Activity> {
  const record = await pb.collection('chores').update(activity.id, {
    title: activity.title,
    description: activity.description || '',
    assignee: activity.assigneeId || '',
    start_date: activity.startDate,
    end_date: activity.endDate || '',
    hours_per_day: activity.hoursPerDay || 0,
    recurrence_rule: activity.recurrenceRule || '',
  });
  return {
    id: record.id,
    title: record.title,
    description: record.description || undefined,
    assigneeId: record.assignee || null,
    startDate: record.start_date,
    endDate: record.end_date || undefined,
    hoursPerDay: record.hours_per_day || undefined,
    recurrenceRule: record.recurrence_rule || undefined,
    completed: activity.completed,
    owner: activity.owner,
  };
}

export async function deleteActivity(id: string): Promise<void> {
  await pb.collection('chores').delete(id);
}

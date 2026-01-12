import pb from './pocketbase';
import type { Chore } from '../types';

interface PBChore {
  id: string;
  title: string;
  description: string;
  assignee: string;
  start_date: string;
  recurrence_rule: string;
  owner: string;
}

function pbChoreToChore(record: PBChore, completedDates: string[]): Chore {
  return {
    id: record.id,
    title: record.title,
    description: record.description || undefined,
    assigneeId: record.assignee || null,
    startDate: record.start_date,
    recurrenceRule: record.recurrence_rule || undefined,
    completed: completedDates,
    owner: record.owner,
  };
}

export async function fetchChores(): Promise<Chore[]> {
  const records = await pb.collection('chores').getFullList<PBChore>();
  const completions = await pb.collection('chore_completions').getFullList();

  const completionsByChore = new Map<string, string[]>();
  for (const completion of completions) {
    const choreId = completion.chore;
    if (!completionsByChore.has(choreId)) {
      completionsByChore.set(choreId, []);
    }
    completionsByChore.get(choreId)!.push(completion.completed_date);
  }

  return records.map((record) =>
    pbChoreToChore(record, completionsByChore.get(record.id) || [])
  );
}

export async function createChore(
  chore: Omit<Chore, 'id' | 'completed' | 'owner'>
): Promise<Chore> {
  const ownerId = pb.authStore.model?.id || '';
  const record = await pb.collection('chores').create({
    title: chore.title,
    description: chore.description || '',
    assignee: chore.assigneeId || '',
    start_date: chore.startDate,
    recurrence_rule: chore.recurrenceRule || '',
    owner: ownerId,
  });
  return {
    id: record.id,
    title: record.title,
    description: record.description || undefined,
    assigneeId: record.assignee || null,
    startDate: record.start_date,
    recurrenceRule: record.recurrence_rule || undefined,
    completed: [],
    owner: ownerId,
  };
}

export async function updateChore(chore: Chore): Promise<Chore> {
  const record = await pb.collection('chores').update(chore.id, {
    title: chore.title,
    description: chore.description || '',
    assignee: chore.assigneeId || '',
    start_date: chore.startDate,
    recurrence_rule: chore.recurrenceRule || '',
  });
  return {
    id: record.id,
    title: record.title,
    description: record.description || undefined,
    assigneeId: record.assignee || null,
    startDate: record.start_date,
    recurrenceRule: record.recurrence_rule || undefined,
    completed: chore.completed,
    owner: chore.owner,
  };
}

export async function deleteChore(id: string): Promise<void> {
  await pb.collection('chores').delete(id);
}

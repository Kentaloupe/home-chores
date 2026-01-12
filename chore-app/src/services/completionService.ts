import pb from './pocketbase';

export async function addCompletion(choreId: string, date: string): Promise<void> {
  await pb.collection('chore_completions').create({
    chore: choreId,
    completed_date: date,
    owner: pb.authStore.model?.id,
  });
}

export async function removeCompletion(choreId: string, date: string): Promise<void> {
  const records = await pb.collection('chore_completions').getFullList({
    filter: `chore = "${choreId}" && completed_date = "${date}"`,
  });
  if (records.length > 0) {
    await pb.collection('chore_completions').delete(records[0].id);
  }
}

export async function toggleCompletion(
  choreId: string,
  date: string
): Promise<boolean> {
  const records = await pb.collection('chore_completions').getFullList({
    filter: `chore = "${choreId}" && completed_date = "${date}"`,
  });

  if (records.length > 0) {
    await pb.collection('chore_completions').delete(records[0].id);
    return false;
  } else {
    await pb.collection('chore_completions').create({
      chore: choreId,
      completed_date: date,
      owner: pb.authStore.model?.id,
    });
    return true;
  }
}

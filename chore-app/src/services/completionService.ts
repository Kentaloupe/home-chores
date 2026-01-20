import pb from './pocketbase';

export async function addCompletion(activityId: string, date: string): Promise<void> {
  await pb.collection('chore_completions').create({
    chore: activityId,
    completed_date: date,
    owner: pb.authStore.model?.id,
  });
}

export async function removeCompletion(activityId: string, date: string): Promise<void> {
  const records = await pb.collection('chore_completions').getFullList({
    filter: `chore = "${activityId}" && completed_date = "${date}"`,
  });
  if (records.length > 0) {
    await pb.collection('chore_completions').delete(records[0].id);
  }
}

export async function toggleCompletion(
  activityId: string,
  date: string
): Promise<boolean> {
  const records = await pb.collection('chore_completions').getFullList({
    filter: `chore = "${activityId}" && completed_date = "${date}"`,
  });

  if (records.length > 0) {
    await pb.collection('chore_completions').delete(records[0].id);
    return false;
  } else {
    await pb.collection('chore_completions').create({
      chore: activityId,
      completed_date: date,
      owner: pb.authStore.model?.id,
    });
    return true;
  }
}

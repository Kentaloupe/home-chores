import pb from './pocketbase';
import type { TeamMember, Region } from '../types';

export async function fetchTeamMembers(): Promise<TeamMember[]> {
  const records = await pb.collection('team_members').getFullList();
  return records.map((record) => ({
    id: record.id,
    name: record.name,
    color: record.color,
    region: (record.region || 'BC') as Region,
    managerId: record.manager || null,
    owner: record.owner,
  }));
}

export async function createTeamMember(
  member: Omit<TeamMember, 'id' | 'owner'>
): Promise<TeamMember> {
  const record = await pb.collection('team_members').create({
    name: member.name,
    color: member.color,
    region: member.region,
    manager: member.managerId || '',
    owner: pb.authStore.model?.id,
  });
  return {
    id: record.id,
    name: record.name,
    color: record.color,
    region: record.region as Region,
    managerId: record.manager || null,
    owner: record.owner,
  };
}

export async function updateTeamMember(member: TeamMember): Promise<TeamMember> {
  const record = await pb.collection('team_members').update(member.id, {
    name: member.name,
    color: member.color,
    region: member.region,
    manager: member.managerId || '',
  });
  return {
    id: record.id,
    name: record.name,
    color: record.color,
    region: record.region as Region,
    managerId: record.manager || null,
    owner: record.owner,
  };
}

export async function deleteTeamMember(id: string): Promise<void> {
  await pb.collection('team_members').delete(id);
}

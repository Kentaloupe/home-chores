import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { TeamMember } from '../../types';
import { MemberForm } from './MemberForm';

interface TeamListProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TeamList({ isOpen, onClose }: TeamListProps) {
  const { state, deleteMember } = useApp();
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {state.teamMembers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No team members yet. Add your first team member!
            </p>
          ) : (
            <ul className="space-y-3 mb-6">
              {state.teamMembers.map(member => (
                <li
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: member.color }}
                    />
                    <span className="font-medium text-gray-900">{member.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingMember(member)}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${member.name} from the team?`)) {
                          deleteMember(member.id);
                        }
                      }}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <button
            onClick={() => setIsAddingMember(true)}
            className="w-full py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            + Add Team Member
          </button>
        </div>
      </div>

      {(isAddingMember || editingMember) && (
        <MemberForm
          member={editingMember}
          onClose={() => {
            setIsAddingMember(false);
            setEditingMember(null);
          }}
        />
      )}
    </div>
  );
}

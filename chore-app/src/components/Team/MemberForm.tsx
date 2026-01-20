import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { TeamMember, Region } from '../../types';
import { REGIONS } from '../../types';
import { MEMBER_COLORS, getNextColor } from '../../utils/colors';

interface MemberFormProps {
  member?: TeamMember | null;
  onClose: () => void;
}

export function MemberForm({ member, onClose }: MemberFormProps) {
  const { state, addMember, updateMember } = useApp();
  const usedColors = state.teamMembers
    .filter(m => m.id !== member?.id)
    .map(m => m.color);

  const [name, setName] = useState(member?.name || '');
  const [color, setColor] = useState(member?.color || getNextColor(usedColors));
  const [region, setRegion] = useState<Region>(member?.region || 'BC');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (member) {
      updateMember({ ...member, name: name.trim(), color, region });
    } else {
      addMember({ name: name.trim(), color, region });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        <div className="relative bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {member ? 'Edit Member' : 'Add Team Member'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter name"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Region
              </label>
              <select
                value={region}
                onChange={e => setRegion(e.target.value as Region)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {REGIONS.map(r => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {MEMBER_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="flex-1 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {member ? 'Save' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

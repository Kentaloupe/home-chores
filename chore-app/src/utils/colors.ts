export const MEMBER_COLORS = [
  '#6366f1', // indigo
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#10b981', // emerald
  '#f43f5e', // rose
  '#3b82f6', // blue
  '#84cc16', // lime
  '#06b6d4', // cyan
];

export function getNextColor(usedColors: string[]): string {
  const available = MEMBER_COLORS.filter(c => !usedColors.includes(c));
  if (available.length > 0) {
    return available[0];
  }
  // If all colors are used, cycle back
  return MEMBER_COLORS[usedColors.length % MEMBER_COLORS.length];
}

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

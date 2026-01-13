export const ADMIN_EMAILS = [
  'admin@gmail.com',
  // Add admin emails here
];

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

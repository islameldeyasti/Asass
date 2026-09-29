export function assertPasswordPolicy(password) {
  const value = String(password || '');
  const rules = [
    [value.length >= 10, 'Password must be at least 10 characters'],
    [/[A-Z]/.test(value), 'Password must include an uppercase letter'],
    [/[a-z]/.test(value), 'Password must include a lowercase letter'],
    [/\d/.test(value), 'Password must include a number'],
  ];
  const failed = rules.find(([ok]) => !ok);
  if (failed) {
    const error = new Error(failed[1]);
    error.status = 400;
    throw error;
  }
  return value;
}

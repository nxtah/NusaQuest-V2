// Hardcoded client-side gate for the admin dashboard — not real authentication.
// These values ship in the JS bundle and are trivially readable by anyone;
// this is intentional per the current requirement (no backend, no Firebase
// yet), not a placeholder for something more secure.
export const ADMIN_USERNAME = 'admin';
export const ADMIN_PASSWORD = '225';

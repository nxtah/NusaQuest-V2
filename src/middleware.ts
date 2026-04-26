/**
 * @file middleware.ts
 * @description Next.js Middleware — entry point untuk route protection.
 * Mendelegasikan logika ke proxy.ts yang menggunakan Edge-compatible session reader.
 */

export { proxy as middleware, config } from './proxy';

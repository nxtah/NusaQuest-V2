import fs from 'node:fs';
import path from 'node:path';

import { getAdminDb } from './firebase-admin-bootstrap.mjs';

function parseArgs() {
  const args = process.argv.slice(2);
  const getArg = (name) => {
    const index = args.indexOf(name);
    if (index < 0 || index + 1 >= args.length) {
      return null;
    }
    return args[index + 1];
  };

  return {
    input: getArg('--input') ?? 'scripts/legacy-export.sample.json',
    dryRun: args.includes('--dry-run'),
  };
}

function loadJson(inputPath) {
  const absolutePath = path.resolve(inputPath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Input file not found: ${absolutePath}`);
  }

  return JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
}

function normalizeLegacyPayload(legacyData) {
  return {
    users: legacyData.users ?? {},
    achievements: legacyData.achievements ?? {},
    items: legacyData.items ?? {},
    rooms: legacyData.rooms ?? {},
    questions: legacyData.questions ?? {},
    games: legacyData.games ?? {},
    destination: legacyData.destination ?? {},
  };
}

async function main() {
  const { input, dryRun } = parseArgs();
  const legacyData = loadJson(input);
  const normalized = normalizeLegacyPayload(legacyData);

  const counts = Object.fromEntries(
    Object.entries(normalized).map(([key, value]) => [
      key,
      value && typeof value === 'object' ? Object.keys(value).length : 0,
    ]),
  );

  console.log('[rtdb-backfill] Summary:', counts);

  if (dryRun) {
    console.log('[rtdb-backfill] Dry run enabled. No write executed.');
    return;
  }

  const db = getAdminDb();
  await db.ref().update(normalized);

  console.log('[rtdb-backfill] Backfill completed successfully.');
}

main().catch((error) => {
  console.error('[rtdb-backfill] Failed:', error.message);
  process.exit(1);
});

import { getAdminDb } from './firebase-admin-bootstrap.mjs';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const db = getAdminDb();
  const testPath = `migration-test/parity-${Date.now()}`;
  const testRef = db.ref(testPath);

  const createdPayload = {
    status: 'created',
    count: 1,
    updatedAt: Date.now(),
  };

  await testRef.set(createdPayload);
  const createdSnap = await testRef.get();
  assert(createdSnap.exists(), 'Create check failed: missing record');

  await testRef.update({ status: 'updated', count: 2 });
  const updatedSnap = await testRef.get();
  assert(updatedSnap.val()?.status === 'updated', 'Update check failed: status mismatch');
  assert(updatedSnap.val()?.count === 2, 'Update check failed: count mismatch');

  await testRef.remove();
  const deletedSnap = await testRef.get();
  assert(!deletedSnap.exists(), 'Delete check failed: record still exists');

  console.log('[rtdb-parity-check] Read/Write/Update/Delete checks passed.');
}

main().catch((error) => {
  console.error('[rtdb-parity-check] Failed:', error.message);
  process.exit(1);
});

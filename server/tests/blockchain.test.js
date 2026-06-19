import assert from 'assert';
import blockchain, { BlockchainSimulator } from '../services/blockchainSimulator.js';

console.log('🧪 Starting Blockchain Integrity & Validation Layer Test Suite...\n');

async function testBlockchainIntegrity() {
  console.log('--------------------------------------------------');
  console.log('Test 1: Blockchain Initialization & Genesis Block');
  console.log('--------------------------------------------------');
  
  const testChain = new BlockchainSimulator();
  await testChain.init(); // runs in memory fallback if no mongo
  
  const stats = testChain.getStats();
  console.log(`- Total Blocks: ${stats.totalBlocks}`);
  console.log(`- Difficulty: ${stats.difficulty}`);
  console.log(`- Is valid? ${stats.isValid}`);
  
  assert.strictEqual(stats.totalBlocks >= 1, true, 'Blockchain should have at least 1 block');
  assert.strictEqual(stats.isValid, true, 'Genesis chain should be valid');
  assert.strictEqual(testChain.chain[0].data.type, 'genesis', 'First block must be genesis');

  console.log('✅ Test 1 Passed: Genesis block created and mined successfully.\n');

  console.log('--------------------------------------------------');
  console.log('Test 2: Adding and Mining Blocks');
  console.log('--------------------------------------------------');

  const b1 = await testChain.addAcademicRecord('Alice Smith', 'CSE2026101', { course: 'CS301', grade: 'A', semester: 3, gpa: 9.5 });
  console.log(`- Added block #1. Hash: ${b1.hash.slice(0, 12)}...`);
  console.log(`- Block Signature: ${b1.signature.slice(0, 12)}...`);
  
  const b2 = await testChain.addFeePayment('Alice Smith', 'CSE2026101', 125000, 3);
  console.log(`- Added block #2. Hash: ${b2.hash.slice(0, 12)}...`);

  const updatedStats = testChain.getStats();
  console.log(`- Total Blocks now: ${updatedStats.totalBlocks}`);
  console.log(`- Is valid? ${updatedStats.isValid}`);

  assert.strictEqual(updatedStats.totalBlocks, 3, 'Chain should contain 3 blocks');
  assert.strictEqual(updatedStats.isValid, true, 'Chain should remain valid after appending blocks');

  console.log('✅ Test 2 Passed: Blocks successfully added, mined, and validated.\n');

  console.log('--------------------------------------------------');
  console.log('Test 3: Simulating Database Tampering & Detection');
  console.log('--------------------------------------------------');

  // Let's tamper with block 1's data directly
  console.log('- Modifying Alice\'s grade from A to A+ directly in the block data...');
  await testChain.tamperBlock(1, { details: { course: 'CS301', grade: 'A+', semester: 3, gpa: 10.0 } });

  const tamperedStats = testChain.getStats();
  console.log(`- Is valid? ${tamperedStats.isValid}`);
  console.log(`- Total validation errors: ${tamperedStats.errors.length}`);
  tamperedStats.errors.forEach(err => console.log(`  * Block #${err.blockIndex} Error [${err.type}]: ${err.message}`));

  assert.strictEqual(tamperedStats.isValid, false, 'Chain should be flagged as invalid after database tampering');
  assert.strictEqual(
    tamperedStats.errors.some(err => err.blockIndex === 1 && err.type === 'HASH_MISMATCH'),
    true,
    'Should report hash mismatch for the tampered block'
  );
  assert.strictEqual(
    tamperedStats.errors.some(err => err.blockIndex === 1 && err.type === 'SIGNATURE_MISMATCH'),
    true,
    'Should report signature mismatch due to hash change without proper key re-signing'
  );

  console.log('✅ Test 3 Passed: Tamper detection is robust and reports both Hash and Signature anomalies.\n');

  console.log('--------------------------------------------------');
  console.log('Test 4: Restoring and Repairing from Backup');
  console.log('--------------------------------------------------');

  console.log('- Triggering chain repair...');
  const repairReport = await testChain.repairChain();
  console.log(`- Is chain valid now? ${repairReport.isValid}`);
  console.log(`- Discrepancy errors remaining: ${repairReport.errors.length}`);

  assert.strictEqual(repairReport.isValid, true, 'Chain should be restored to valid');
  assert.strictEqual(repairReport.errors.length, 0, 'No validation errors should remain after repair');

  console.log('✅ Test 4 Passed: Chain successfully recovered from pristine memory backup.\n');
}

testBlockchainIntegrity().then(() => {
  console.log('🎉 All blockchain validation tests passed successfully!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});

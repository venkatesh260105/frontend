import { runGatewayTestSuites, verifyJWT, generateJWT, checkAndConsumeRateLimit, resetRateLimit } from './src/utils/gatewayEngine.js';
import { getGatewayDatabase } from './src/utils/storage.js';

async function test() {
  console.log('--- Testing Gateway Test Suites ---');
  const results = await runGatewayTestSuites();
  results.forEach(r => {
    console.log(`[${r.passed ? 'PASS' : 'FAIL'}] ${r.testId} (${r.category} - ${r.module}): ${r.description} -> ${r.actual}`);
  });

  const totalPassed = results.filter(r => r.passed).length;
  console.log(`\nResult: ${totalPassed}/${results.length} tests passed.`);

  const db = getGatewayDatabase();
  console.log('\n--- 6 Database Tables Check in JSON ---');
  console.log('1. Users count:', db.users?.length);
  console.log('2. APIs count:', db.apis?.length);
  console.log('3. Requests count:', db.requests?.length);
  console.log('4. Tokens count:', db.tokens?.length);
  console.log('5. Rate Limits count:', db.rate_limits?.length);
  console.log('6. Logs count:', db.logs?.length);
  console.log('7. Orders count:', db.orders?.length);
}

test().catch(console.error);

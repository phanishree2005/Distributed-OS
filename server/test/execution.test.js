// ==============================================================================
// DistributedOS - Universal Execution Server Registry & Discovery Test Suite
// ==============================================================================

import assert from 'assert';
import { LANGUAGE_REGISTRY } from '../registry.js';
import { discoverRuntimes } from '../discovery.js';

console.log('🧪 Starting Universal Execution Server Test Suite...\n');

let passedTests = 0;
let totalTests = 0;

function it(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
  }
}

async function runAsync(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
  }
}

it('Language Registry defines required metadata schema for all entries', () => {
  assert.ok(Array.isArray(LANGUAGE_REGISTRY));
  assert.ok(LANGUAGE_REGISTRY.length >= 25, 'Expected at least 25 registered languages');

  for (const lang of LANGUAGE_REGISTRY) {
    assert.ok(lang.id, 'Language must have an ID');
    assert.ok(lang.name, `Language ${lang.id} must have a name`);
    assert.ok(lang.category, `Language ${lang.id} must have a category`);
    assert.ok(Array.isArray(lang.extensions), `Language ${lang.id} must have file extensions`);
    assert.ok(lang.editorMode, `Language ${lang.id} must have an editor syntax mode`);
    assert.ok(lang.capabilities, `Language ${lang.id} must have capabilities`);
    assert.strictEqual(typeof lang.capabilities.run, 'boolean');
  }
});

await runAsync('Discovery engine scans system and returns active runtimes', async () => {
  const runtimes = await discoverRuntimes();
  assert.ok(Array.isArray(runtimes));
  assert.strictEqual(runtimes.length, LANGUAGE_REGISTRY.length);

  const activeRuntimes = runtimes.filter(r => r.installed);
  console.log(`    Detected ${activeRuntimes.length} installed runtime(s) on host environment.`);
  assert.ok(activeRuntimes.length >= 5, 'Expected at least core runtimes to be detected');
});

console.log(`\n📊 Server Test Summary: ${passedTests}/${totalTests} tests passed.\n`);
if (passedTests === totalTests) {
  console.log('✅ Universal Execution Server tests passed successfully!');
} else {
  console.error('❌ Some server tests failed!');
  process.exit(1);
}

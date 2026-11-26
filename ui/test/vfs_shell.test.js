// ==============================================================================
// DistributedOS - Virtual Filesystem & Linux Shell Automated Test Suite
// ==============================================================================

import assert from 'assert';
import { VirtualFS } from '../src/shell/virtualFs.js';
import { ShellEngine } from '../src/shell/shellEngine.js';

console.log('🧪 Starting DistributedOS VFS & Shell Test Suite...\n');

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

// 1. VFS Integrity Tests
it('VFS initializes default POSIX directory tree', () => {
  const vfs = new VirtualFS();
  assert.ok(vfs.getNode('/root'));
  assert.ok(vfs.getNode('/etc'));
  assert.ok(vfs.getNode('/bin'));
  assert.ok(vfs.getNode('/boot'));
  assert.ok(vfs.getNode('/var/log'));
  assert.ok(vfs.getNode('/tmp'));
  assert.ok(vfs.getNode('/proc'));
});

it('VFS supports nested directory creation (mkdir -p)', () => {
  const vfs = new VirtualFS();
  vfs.mkdir('/root/nested/deep/directory', true);
  const node = vfs.getNode('/root/nested/deep/directory');
  assert.ok(node);
  assert.strictEqual(node.type, 'dir');
});

it('VFS supports file creation, writing, and reading', () => {
  const vfs = new VirtualFS();
  vfs.writeFile('/root/test.txt', 'DistributedOS Test Content');
  const content = vfs.readFile('/root/test.txt');
  assert.strictEqual(content, 'DistributedOS Test Content');
});

it('VFS supports file append (>>)', () => {
  const vfs = new VirtualFS();
  vfs.writeFile('/root/append.txt', 'Line 1\n', false);
  vfs.writeFile('/root/append.txt', 'Line 2\n', true);
  const content = vfs.readFile('/root/append.txt');
  assert.strictEqual(content, 'Line 1\nLine 2\n');
});

it('VFS throws on illegal directory operations', () => {
  const vfs = new VirtualFS();
  assert.throws(() => vfs.readFile('/root'), /Is a directory/);
  assert.throws(() => vfs.rmdir('/'), /Device or resource busy/);
});

// 2. Shell Command & Pipeline Tests
it('Shell executes navigation commands (pwd, cd, ls)', () => {
  const vfs = new VirtualFS();
  const shell = new ShellEngine(vfs);

  assert.strictEqual(shell.cwd, '/root');
  
  let res = shell.execute('pwd');
  assert.strictEqual(res.output[0].text, '/root');

  shell.execute('cd /etc');
  assert.strictEqual(shell.cwd, '/etc');

  res = shell.execute('ls');
  assert.ok(res.output.some(o => o.text.includes('hosts.conf')));
});

it('Shell executes the user verification sequence', () => {
  const vfs = new VirtualFS();
  const shell = new ShellEngine(vfs);

  shell.execute('mkdir distributed_test');
  shell.execute('cd distributed_test');
  assert.strictEqual(shell.cwd, '/root/distributed_test');

  const pwdRes = shell.execute('pwd');
  assert.strictEqual(pwdRes.output[0].text, '/root/distributed_test');

  shell.execute('echo "Hello DistributedOS" > test.txt');
  const catRes = shell.execute('cat test.txt');
  assert.strictEqual(catRes.output[0].text, 'Hello DistributedOS');

  const lsRes = shell.execute('ls -la');
  assert.ok(lsRes.output.some(o => o.text.includes('test.txt')));

  shell.execute('cd ..');
  assert.strictEqual(shell.cwd, '/root');

  const finalLs = shell.execute('ls');
  assert.ok(finalLs.output.some(o => o.text.includes('distributed_test/')));
});

it('Shell supports pipelines (|)', () => {
  const vfs = new VirtualFS();
  const shell = new ShellEngine(vfs);

  vfs.writeFile('/root/pipeline.txt', 'alpha\nbeta\ngamma\ndelta\n');
  const res = shell.execute('cat pipeline.txt | grep beta');
  assert.strictEqual(res.output[0].text, 'beta');
});

it('Shell expands environment variables ($USER, $HOME, $PWD)', () => {
  const vfs = new VirtualFS();
  const shell = new ShellEngine(vfs);

  const res = shell.execute('echo Current user is $USER at $PWD');
  assert.strictEqual(res.output[0].text, 'Current user is root at /root');
});

it('Shell tracks command history', () => {
  const vfs = new VirtualFS();
  const shell = new ShellEngine(vfs);

  shell.execute('uname -a');
  shell.execute('whoami');
  assert.strictEqual(shell.history.length, 2);
  assert.strictEqual(shell.history[0], 'uname -a');
  assert.strictEqual(shell.history[1], 'whoami');
});

console.log(`\n📊 Test Summary: ${passedTests}/${totalTests} tests passed.\n`);
if (passedTests === totalTests) {
  console.log('✅ All VFS & Shell tests passed successfully!');
} else {
  console.error('❌ Some tests failed!');
  process.exit(1);
}

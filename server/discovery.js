// server/discovery.js - Dynamic Compiler and Runtime Discovery Engine
import { execFile, execSync } from 'child_process';
import { promisify } from 'util';
import { LANGUAGE_REGISTRY } from './registry.js';

const execFileAsync = promisify(execFile);

// In-memory cache of discovered languages
let discoveredLanguages = [];

/**
 * Probes the operating system for installed toolchains, compilers, and interpreters.
 */
export async function discoverRuntimes() {
  console.log('[Discovery] Scanning host environment for compilers, runtimes, and interpreters...');
  
  const results = [];

  for (const lang of LANGUAGE_REGISTRY) {
    // Special handling for client-side web sandbox
    if (lang.binary === 'web') {
      results.push({
        ...lang,
        installed: true,
        availability: 'Client Web Sandbox',
        runtimeVersion: 'HTML5 / W3C Engine',
        executablePath: 'Browser DOM / Iframe'
      });
      continue;
    }

    try {
      // Find executable path
      let execPath = '';
      try {
        const findCmd = process.platform === 'win32' ? `where.exe ${lang.binary}` : `which ${lang.binary}`;
        execPath = execSync(findCmd, { stdio: ['pipe', 'pipe', 'ignore'], timeout: 2000 })
          .toString()
          .split('\r\n')[0]
          .split('\n')[0]
          .trim();
      } catch {
        // Not in PATH
      }

      // Check version
      if (lang.versionArgs && lang.versionArgs.length > 0) {
        const { stdout, stderr } = await execFileAsync(lang.binary, lang.versionArgs, {
          timeout: 4000,
          windowsHide: true
        });

        const rawVer = (stdout || stderr || '').trim().split('\n')[0].trim();
        results.push({
          ...lang,
          installed: true,
          availability: 'Installed & Ready',
          runtimeVersion: rawVer || 'Installed',
          executablePath: execPath || lang.binary
        });
        console.log(`  [+] ${lang.name}: ${rawVer} (at ${execPath || lang.binary})`);
      } else if (execPath) {
        results.push({
          ...lang,
          installed: true,
          availability: 'Installed & Ready',
          runtimeVersion: 'Installed',
          executablePath: execPath
        });
        console.log(`  [+] ${lang.name}: Ready at ${execPath}`);
      } else {
        throw new Error('Not found');
      }
    } catch {
      results.push({
        ...lang,
        installed: false,
        availability: 'Runtime not installed',
        runtimeVersion: null,
        executablePath: null
      });
    }
  }

  discoveredLanguages = results;
  const installedCount = results.filter((r) => r.installed).length;
  console.log(`[Discovery] Scan complete: ${installedCount} of ${results.length} programming language runtimes are active.\n`);
  return discoveredLanguages;
}

export function getDiscoveredLanguages() {
  return discoveredLanguages;
}

export function getLanguageById(id) {
  return discoveredLanguages.find((l) => l.id === id);
}

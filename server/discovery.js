// server/discovery.js - Dynamic Compiler and Runtime Discovery Engine
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFile, execSync } from 'child_process';
import { promisify } from 'util';
import { LANGUAGE_REGISTRY } from './registry.js';

const execFileAsync = promisify(execFile);

// In-memory cache of discovered languages
let discoveredLanguages = [];

/**
 * Searches system PATH as well as local user installations (WinGet, AppData, Git)
 */
export function resolveBinaryPath(binaryName) {
  // 1. Windows specific known standalone locations first
  if (process.platform === 'win32') {
    const homeDir = os.homedir();

    const knownPaths = {
      bash: [
        'C:\\Program Files\\Git\\bin\\bash.exe',
        'C:\\Program Files\\Git\\usr\\bin\\bash.exe'
      ],
      zig: [
        path.join(homeDir, 'AppData\\Local\\Microsoft\\WinGet\\Packages\\zig.zig_Microsoft.Winget.Source_8wekyb3d8bbwe\\zig-x86_64-windows-0.17.1\\zig.exe'),
        path.join(homeDir, 'AppData\\Local\\Microsoft\\WindowsApps\\zig.exe')
      ],
      bb: [
        path.join(homeDir, 'AppData\\Local\\Microsoft\\WinGet\\Packages\\Babashka.Babashka_Microsoft.Winget.Source_8wekyb3d8bbwe\\bb.exe'),
        path.join(homeDir, 'AppData\\Local\\Microsoft\\WindowsApps\\bb.exe')
      ],
      lua: [
        path.join(homeDir, 'AppData\\Local\\Programs\\Lua\\bin\\lua.exe'),
        'C:\\Program Files\\Lua\\bin\\lua.exe',
        'C:\\Program Files (x86)\\Lua\\bin\\lua.exe'
      ],
      stack: [
        path.join(homeDir, 'AppData\\Roaming\\local\\bin\\stack.exe'),
        path.join(homeDir, 'AppData\\Local\\Programs\\stack\\stack.exe')
      ]
    };

    if (knownPaths[binaryName]) {
      for (const p of knownPaths[binaryName]) {
        if (fs.existsSync(p)) return p;
      }
    }

    // WinGet package search fallback
    const wingetDir = path.join(homeDir, 'AppData\\Local\\Microsoft\\WinGet\\Packages');
    if (fs.existsSync(wingetDir)) {
      try {
        const pkgs = fs.readdirSync(wingetDir);
        for (const pkg of pkgs) {
          if (pkg.toLowerCase().includes(binaryName.toLowerCase())) {
            const pkgPath = path.join(wingetDir, pkg);
            const sub = fs.readdirSync(pkgPath);
            for (const s of sub) {
              const fullP = path.join(pkgPath, s);
              if (s.toLowerCase() === `${binaryName}.exe`) return fullP;
              if (fs.statSync(fullP).isDirectory()) {
                const exeP = path.join(fullP, `${binaryName}.exe`);
                if (fs.existsSync(exeP)) return exeP;
              }
            }
          }
        }
      } catch {}
    }
  }

  // 2. Try standard PATH via where / which
  try {
    const findCmd = process.platform === 'win32' ? `where.exe ${binaryName}` : `which ${binaryName}`;
    const found = execSync(findCmd, { stdio: ['pipe', 'pipe', 'ignore'], timeout: 1500 })
      .toString()
      .split('\r\n')[0]
      .split('\n')[0]
      .trim();
    if (found && fs.existsSync(found)) return found;
  } catch {}

  return null;
}

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

    // Special check for Python-based toolchains (e.g. SQLite, Pyverilog)
    if (lang.id === 'sqlite' || lang.id === 'verilog' || lang.id === 'yaml') {
      try {
        const { stdout } = await execFileAsync('python', lang.versionArgs, { timeout: 4000 });
        const rawVer = stdout.trim().split('\n')[0].trim();
        results.push({
          ...lang,
          installed: true,
          availability: 'Installed & Ready',
          runtimeVersion: rawVer,
          executablePath: 'python'
        });
        console.log(`  [+] ${lang.name}: ${rawVer}`);
        continue;
      } catch {
        results.push({
          ...lang,
          installed: false,
          availability: 'Runtime not installed',
          runtimeVersion: null,
          executablePath: null
        });
        continue;
      }
    }

    // Standard binary path resolution
    const execPath = resolveBinaryPath(lang.binary);

    if (execPath) {
      try {
        const { stdout, stderr } = await execFileAsync(execPath, lang.versionArgs, {
          timeout: 4000,
          windowsHide: true
        });

        const rawVer = (stdout || stderr || '').trim().split('\n')[0].trim();
        results.push({
          ...lang,
          installed: true,
          availability: 'Installed & Ready',
          runtimeVersion: rawVer || 'Installed',
          executablePath: execPath
        });
        console.log(`  [+] ${lang.name}: ${rawVer} (at ${execPath})`);
      } catch (err) {
        // If binary exists but versionArgs threw
        results.push({
          ...lang,
          installed: true,
          availability: 'Installed & Ready',
          runtimeVersion: 'Installed',
          executablePath: execPath
        });
        console.log(`  [+] ${lang.name}: Ready at ${execPath}`);
      }
    } else {
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

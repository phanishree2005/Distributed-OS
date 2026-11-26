// server/index.js - Universal Multi-Language Execution Server
import http from 'http';
import { discoverRuntimes, getDiscoveredLanguages, getLanguageById } from './discovery.js';
import { executeCode } from './adapters.js';

const PORT = process.env.PORT || 5050;

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function sendJson(res, statusCode, data) {
  setCorsHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  // Handle pre-flight CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // 1. GET /api/health
  if (req.method === 'GET' && pathname === '/api/health') {
    const langs = getDiscoveredLanguages();
    const installed = langs.filter((l) => l.installed);
    sendJson(res, 200, {
      status: 'healthy',
      uptimeSeconds: process.uptime(),
      totalLanguagesInRegistry: langs.length,
      installedRuntimesCount: installed.length,
      installedRuntimes: installed.map((i) => ({ id: i.id, name: i.name, version: i.runtimeVersion }))
    });
    return;
  }

  // 2. GET /api/languages
  if (req.method === 'GET' && pathname === '/api/languages') {
    const langs = getDiscoveredLanguages();
    sendJson(res, 200, {
      success: true,
      count: langs.length,
      languages: langs
    });
    return;
  }

  // 3. GET /api/languages/:id
  if (req.method === 'GET' && pathname.startsWith('/api/languages/')) {
    const langId = pathname.replace('/api/languages/', '').trim();
    const lang = getLanguageById(langId);
    if (!lang) {
      sendJson(res, 404, { success: false, error: `Language '${langId}' not found in registry.` });
    } else {
      sendJson(res, 200, { success: true, language: lang });
    }
    return;
  }

  // 4. POST /api/execute
  if (req.method === 'POST' && pathname === '/api/execute') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
      // Guard against massive payloads (>5MB)
      if (body.length > 5 * 1024 * 1024) {
        req.destroy();
      }
    });

    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { language, code, stdin = '', files = [] } = payload;

        if (!language) {
          sendJson(res, 400, { success: false, error: "Field 'language' is required." });
          return;
        }

        const langMeta = getLanguageById(language);
        if (!langMeta) {
          sendJson(res, 404, { success: false, error: `Language '${language}' is not recognized in registry.` });
          return;
        }

        // If language runtime is not installed on host
        if (!langMeta.installed) {
          sendJson(res, 400, {
            success: false,
            stdout: '',
            stderr: `Runtime not installed: The compiler or interpreter for '${langMeta.name}' (${langMeta.compiler}) is not installed on the host system.\nExecution capability is disabled until ${langMeta.binary} is installed and available on PATH.`,
            exitCode: 127,
            executionTimeMs: 0
          });
          return;
        }

        console.log(`[Execute] Dispatching ${langMeta.name} code (${code ? code.length : 0} bytes)...`);
        const result = await executeCode({
          language,
          code,
          stdin,
          files
        });

        console.log(`[Execute] ${langMeta.name} completed in ${result.executionTimeMs.toFixed(2)} ms (exit: ${result.exitCode})`);
        sendJson(res, 200, result);
      } catch (err) {
        console.error('[Execute Exception]', err);
        sendJson(res, 500, { success: false, error: `Execution server exception: ${err.message}` });
      }
    });
    return;
  }

  // 404 Fallback
  sendJson(res, 404, { error: 'Not Found', path: pathname });
});

// Run discovery and start listening
(async () => {
  try {
    await discoverRuntimes();
    server.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`  DistributedOS Universal Execution Server ACTIVE     `);
      console.log(`  Listening on: http://localhost:${PORT}             `);
      console.log(`======================================================\n`);
    });
  } catch (err) {
    console.error('Failed to start execution server:', err);
    process.exit(1);
  }
})();

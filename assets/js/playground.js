/**
 * VNPVP Interactive Corporation - Developer Playground Utilities
 * Real-time client-side developer tools running 100% offline in browser
 */

// Tab Switching
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.playground-tab-btn');
  const panels = document.querySelectorAll('.playground-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.tab;

      tabs.forEach(t => {
        t.classList.remove('active', 'text-cyan-400', 'border-cyan-400', 'bg-white/10');
        t.classList.add('text-slate-400', 'border-transparent');
      });

      tab.classList.add('active', 'text-cyan-400', 'border-cyan-400', 'bg-white/10');
      tab.classList.remove('text-slate-400', 'border-transparent');

      panels.forEach(p => {
        if (p.id === targetId) {
          p.classList.remove('hidden');
        } else {
          p.classList.add('hidden');
        }
      });
    });
  });

  // Init Default Playground Tools
  initJsonToTs();
  initJwtDecoder();
  initHashUuid();
  initRegexTester();
});

// Toast notification helper
function showToast(message, type = 'success') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const bgClass = type === 'success' ? 'bg-cyan-950/90 border-cyan-500/50 text-cyan-200' : 'bg-rose-950/90 border-rose-500/50 text-rose-200';
  toast.className = `flex items-center gap-2 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 transform translate-y-4 opacity-0 pointer-events-auto ${bgClass}`;
  
  toast.innerHTML = `
    <svg class="w-4 h-4 shrink-0 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
    </svg>
    <span class="text-xs font-mono font-medium">${message}</span>
  `;

  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  });

  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-4', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 2400);
}

// 1. JSON to TypeScript Converter
function initJsonToTs() {
  const jsonInput = document.getElementById('json-input');
  const tsOutput = document.getElementById('ts-output');
  const convertBtn = document.getElementById('json-convert-btn');
  const copyBtn = document.getElementById('copy-ts-btn');

  function convert() {
    const raw = jsonInput.value.trim();
    if (!raw) {
      tsOutput.textContent = '// Enter valid JSON on the left to generate TypeScript interfaces';
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      const tsCode = generateTsInterface('VnpvpConfig', parsed);
      tsOutput.textContent = tsCode;
    } catch (e) {
      tsOutput.textContent = `// JSON Parse Error:\n// ${e.message}`;
    }
  }

  function generateTsInterface(rootName, obj) {
    let result = '';
    const nested = [];

    function parseType(val, keyName) {
      if (val === null) return 'null | any';
      if (Array.isArray(val)) {
        if (val.length === 0) return 'any[]';
        const innerType = parseType(val[0], keyName + 'Item');
        return `${innerType}[]`;
      }
      if (typeof val === 'object') {
        const typeName = keyName.charAt(0).toUpperCase() + keyName.slice(1);
        nested.push(generateSingleInterface(typeName, val));
        return typeName;
      }
      return typeof val;
    }

    function generateSingleInterface(name, targetObj) {
      let code = `export interface ${name} {\n`;
      for (const [key, value] of Object.entries(targetObj)) {
        const propType = parseType(value, key);
        code += `  ${key}: ${propType};\n`;
      }
      code += `}\n\n`;
      return code;
    }

    result += generateSingleInterface(rootName, obj);
    nested.forEach(n => {
      result += n;
    });

    return result.trim();
  }

  if (convertBtn) convertBtn.addEventListener('click', convert);
  if (jsonInput) jsonInput.addEventListener('input', convert);
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(tsOutput.textContent).then(() => {
        showToast('TypeScript interfaces copied to clipboard!');
      });
    });
  }

  // Initial trigger
  if (jsonInput && jsonInput.value) convert();
}

// 2. JWT Decoder
function initJwtDecoder() {
  const jwtInput = document.getElementById('jwt-input');
  const jwtHeaderOut = document.getElementById('jwt-header-out');
  const jwtPayloadOut = document.getElementById('jwt-payload-out');
  const jwtStatus = document.getElementById('jwt-status');
  const sampleBtn = document.getElementById('jwt-sample-btn');

  function decodeBase64Url(str) {
    let output = str.replace(/-/g, '+').replace(/_/g, '/');
    switch (output.length % 4) {
      case 0: break;
      case 2: output += '=='; break;
      case 3: output += '='; break;
      default: throw new Error('Illegal base64url string');
    }
    return decodeURIComponent(escape(window.atob(output)));
  }

  function decode() {
    const token = jwtInput.value.trim();
    if (!token) {
      jwtHeaderOut.textContent = '{}';
      jwtPayloadOut.textContent = '{}';
      jwtStatus.innerHTML = '<span class="text-slate-500">Waiting for token input...</span>';
      return;
    }

    const parts = token.split('.');
    if (parts.length < 2) {
      jwtStatus.innerHTML = '<span class="text-rose-400 font-semibold">❌ Invalid JWT format (expected header.payload.signature)</span>';
      return;
    }

    try {
      const headerObj = JSON.parse(decodeBase64Url(parts[0]));
      const payloadObj = JSON.parse(decodeBase64Url(parts[1]));

      jwtHeaderOut.textContent = JSON.stringify(headerObj, null, 2);
      jwtPayloadOut.textContent = JSON.stringify(payloadObj, null, 2);

      let statusMsg = '<span class="text-emerald-400">✓ Token syntax valid</span>';
      if (payloadObj.exp) {
        const expDate = new Date(payloadObj.exp * 1000);
        const isExpired = Date.now() > expDate.getTime();
        statusMsg += ` • ${isExpired ? '<span class="text-rose-400 font-bold">Expired</span>' : '<span class="text-emerald-400 font-bold">Active</span>'} (Expires: ${expDate.toLocaleTimeString()})`;
      }
      jwtStatus.innerHTML = statusMsg;
    } catch (e) {
      jwtStatus.innerHTML = `<span class="text-rose-400">❌ Error decoding token: ${e.message}</span>`;
    }
  }

  if (jwtInput) jwtInput.addEventListener('input', decode);
  if (sampleBtn) {
    sampleBtn.addEventListener('click', () => {
      // Sample token with VNPVP claims
      const sample = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfOTA4MjMiLCJuYW1lIjoiRGV2ZWxvcGVyIEFsaWNlIiwicm9sZSI6ImNvcmUtbWFpbnRhaW5lciIsIm9yZyI6IlZOUFZQIEludGVyYWN0aXZlIENvcnBvcmF0aW9uIiwiaWF0IjoxNzA0MDY3MjAwLCJleHAiOjE5ODcyMTkyMDB9.s1Gn4tuR3_vNpVP_E0xA1F0rG3_Samp1e";
      jwtInput.value = sample;
      decode();
    });
  }

  if (jwtInput && jwtInput.value) decode();
}

// 3. Hash & UUID Generator
function initHashUuid() {
  const hashInput = document.getElementById('hash-input');
  const genUuidBtn = document.getElementById('gen-uuid-btn');
  const uuidResult = document.getElementById('uuid-result');
  const sha256Result = document.getElementById('sha256-result');
  const copyUuidBtn = document.getElementById('copy-uuid-btn');
  const copyShaBtn = document.getElementById('copy-sha-btn');

  function generateUuidV4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  async function calculateSha256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  if (genUuidBtn) {
    genUuidBtn.addEventListener('click', () => {
      const u = generateUuidV4();
      if (uuidResult) uuidResult.value = u;
    });
  }

  if (hashInput) {
    hashInput.addEventListener('input', async () => {
      const text = hashInput.value;
      if (!text) {
        if (sha256Result) sha256Result.value = '';
        return;
      }
      try {
        const hash = await calculateSha256(text);
        if (sha256Result) sha256Result.value = hash;
      } catch (err) {
        console.error(err);
      }
    });
  }

  if (copyUuidBtn) {
    copyUuidBtn.addEventListener('click', () => {
      if (uuidResult && uuidResult.value) {
        navigator.clipboard.writeText(uuidResult.value).then(() => {
          showToast('UUID v4 copied!');
        });
      }
    });
  }

  if (copyShaBtn) {
    copyShaBtn.addEventListener('click', () => {
      if (sha256Result && sha256Result.value) {
        navigator.clipboard.writeText(sha256Result.value).then(() => {
          showToast('SHA-256 Hash copied!');
        });
      }
    });
  }

  // Initial trigger
  if (genUuidBtn) genUuidBtn.click();
  if (hashInput && hashInput.value) hashInput.dispatchEvent(new Event('input'));
}

// 4. RegEx Tester
function initRegexTester() {
  const patternInput = document.getElementById('regex-pattern');
  const flagsInput = document.getElementById('regex-flags');
  const testInput = document.getElementById('regex-test-text');
  const matchResult = document.getElementById('regex-match-result');
  const matchCount = document.getElementById('regex-count');

  function testRegex() {
    const pattern = patternInput ? patternInput.value : '';
    const flags = flagsInput ? flagsInput.value : 'g';
    const text = testInput ? testInput.value : '';

    if (!pattern) {
      if (matchResult) matchResult.textContent = text;
      if (matchCount) matchCount.textContent = '0 matches';
      return;
    }

    try {
      const regex = new RegExp(pattern, flags);
      const matches = [...text.matchAll(regex)];
      if (matchCount) {
        matchCount.textContent = `${matches.length} match${matches.length === 1 ? '' : 'es'} found`;
        matchCount.className = matches.length > 0 ? 'text-xs text-emerald-400 font-mono' : 'text-xs text-slate-400 font-mono';
      }

      if (matches.length === 0) {
        if (matchResult) matchResult.innerHTML = escapeHtml(text);
        return;
      }

      let highlighted = '';
      let lastIdx = 0;

      // Ensure global matching for highlighter
      const execRegex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
      let m;
      while ((m = execRegex.exec(text)) !== null) {
        if (m.index === execRegex.lastIndex) execRegex.lastIndex++;
        highlighted += escapeHtml(text.slice(lastIdx, m.index));
        highlighted += `<mark class="bg-cyan-500/30 text-cyan-200 border-b-2 border-cyan-400 px-0.5 rounded font-bold">${escapeHtml(m[0])}</mark>`;
        lastIdx = m.index + m[0].length;
      }
      highlighted += escapeHtml(text.slice(lastIdx));

      if (matchResult) matchResult.innerHTML = highlighted;
    } catch (e) {
      if (matchCount) {
        matchCount.textContent = 'Syntax Error';
        matchCount.className = 'text-xs text-rose-400 font-mono';
      }
      if (matchResult) matchResult.innerHTML = `<span class="text-rose-400">${escapeHtml(e.message)}</span>`;
    }
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;');
  }

  if (patternInput) patternInput.addEventListener('input', testRegex);
  if (flagsInput) flagsInput.addEventListener('input', testRegex);
  if (testInput) testInput.addEventListener('input', testRegex);

  // Initial trigger
  testRegex();
}

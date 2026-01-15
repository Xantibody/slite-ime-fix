// Build script: Generate inject.js from src/ime-fix.js
import { readFileSync, writeFileSync } from "fs";

const imeFix = readFileSync("src/ime-fix.js", "utf-8");

// Remove export statements for browser usage
const browserCode = imeFix.replace(/^export /gm, "").trim();

const output = `// Slite Japanese IME Fix
// Auto-generated from src/ime-fix.js

(function() {
  'use strict';

${browserCode}

  // Initialize
  const getEditor = () => getEditorFromRefs(window.__EDITOR_REFS__);
  const imeFix = createIMEFix(getEditor);

  document.addEventListener('compositionstart', imeFix.handleCompositionStart, true);
  document.addEventListener('compositionend', imeFix.handleCompositionEnd, true);

  console.log('[Slite IME Fix] Loaded');
})();
`;

writeFileSync("inject.js", output);
console.log("Built inject.js");

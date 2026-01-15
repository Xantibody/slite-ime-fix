// Build script: Generate Chrome and Firefox extensions
import { readFileSync, writeFileSync, mkdirSync, cpSync } from "fs";
import { generateChromeManifest, generateFirefoxManifest } from "../src/build/manifest.js";

const target = process.argv[2]; // 'chrome', 'firefox', or undefined (both)

function buildInjectJs() {
  const imeFix = readFileSync("src/ime-fix.js", "utf-8");
  const browserCode = imeFix.replace(/^export /gm, "").trim();

  return `// Slite Japanese IME Fix
// Auto-generated from src/ime-fix.js

(function () {
  "use strict";

${browserCode}

  // Initialize
  const getEditor = () => getEditorFromRefs(window.__EDITOR_REFS__);
  const imeFix = createIMEFix(getEditor);

  document.addEventListener("compositionstart", imeFix.handleCompositionStart, true);
  document.addEventListener("compositionend", imeFix.handleCompositionEnd, true);

  console.log("[Slite IME Fix] Loaded");
})();
`;
}

function copyCommonFiles(distDir) {
  cpSync("content-script.js", `${distDir}/content-script.js`);
  cpSync("icons/icon-16.png", `${distDir}/icons/icon-16.png`);
  cpSync("icons/icon-48.png", `${distDir}/icons/icon-48.png`);
  cpSync("icons/icon-128.png", `${distDir}/icons/icon-128.png`);
}

function buildChrome() {
  const distDir = "dist/chrome";
  mkdirSync(distDir, { recursive: true });
  mkdirSync(`${distDir}/icons`, { recursive: true });

  writeFileSync(`${distDir}/manifest.json`, JSON.stringify(generateChromeManifest(), null, 2));
  writeFileSync(`${distDir}/inject.js`, buildInjectJs());
  cpSync("src/background.chrome.js", `${distDir}/background.js`);
  copyCommonFiles(distDir);

  console.log("Built Chrome extension -> dist/chrome/");
}

function buildFirefox() {
  const distDir = "dist/firefox";
  mkdirSync(distDir, { recursive: true });
  mkdirSync(`${distDir}/icons`, { recursive: true });

  writeFileSync(`${distDir}/manifest.json`, JSON.stringify(generateFirefoxManifest(), null, 2));
  writeFileSync(`${distDir}/inject.js`, buildInjectJs());
  cpSync("src/background.firefox.js", `${distDir}/background.js`);
  copyCommonFiles(distDir);

  console.log("Built Firefox extension -> dist/firefox/");
}

if (!target || target === "chrome") {
  buildChrome();
}
if (!target || target === "firefox") {
  buildFirefox();
}

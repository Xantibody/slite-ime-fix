// Build script: Generate Chrome and Firefox extensions
import { readFileSync, writeFileSync, mkdirSync, cpSync } from "fs";
import { execSync } from "child_process";
import { generateChromeManifest, generateFirefoxManifest } from "../src/build/manifest.js";

const target = process.argv[2]; // 'chrome', 'firefox', or undefined (both)

function buildInjectJs() {
  const imeFix = readFileSync("src/ime-fix.js", "utf-8");
  const imeFixCode = imeFix.replace(/^export /gm, "").trim();

  const emacsKeybind = readFileSync("src/emacs-keybind.js", "utf-8");
  const emacsKeybindCode = emacsKeybind.replace(/^export /gm, "").trim();

  return `// Slite Japanese IME Fix
// Auto-generated from src/*.js

(function () {
  "use strict";

  // === IME Fix ===
${imeFixCode}

  // === Emacs Keybind ===
${emacsKeybindCode}

  // === Initialize IME Fix ===
  const getEditor = () => getEditorFromRefs(window.__EDITOR_REFS__);
  const imeFix = createIMEFix(getEditor);

  document.addEventListener("compositionstart", () => imeFix.handleCompositionStart(), true);
  document.addEventListener("compositionend", () => {
    imeFix.handleCompositionEnd();
    requestAnimationFrame(() => cleanupMarkPlaceholders());
  }, true);

  // === Initialize Emacs Keybind ===
  let emacsKeybindEnabled = false;

  window.addEventListener("slite-ime-fix:emacs-keybind", () => {
    const attr = document.documentElement.getAttribute("data-slite-ime-fix-emacs");
    emacsKeybindEnabled = attr === "on";
    console.log("[Slite IME Fix] Emacs keybind:", emacsKeybindEnabled ? "ON" : "OFF");
  });

  function moveCursor(direction) {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;

    switch (direction) {
      case "ArrowRight":
        sel.modify("move", "forward", "character");
        break;
      case "ArrowLeft":
        sel.modify("move", "backward", "character");
        break;
      case "ArrowDown":
        sel.modify("move", "forward", "line");
        break;
      case "ArrowUp":
        sel.modify("move", "backward", "line");
        break;
      case "Home":
        sel.modify("move", "backward", "lineboundary");
        break;
      case "End":
        sel.modify("move", "forward", "lineboundary");
        break;
    }
  }

  document.addEventListener("keydown", (e) => {
    if (!shouldIntercept(e, emacsKeybindEnabled)) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const newKey = mapToKey(e.key);
    if (newKey) {
      moveCursor(newKey);
    }
  }, true);

  console.log("[Slite IME Fix] Loaded");
})();
`;
}

function copyCommonFiles(distDir) {
  cpSync("content-script.js", `${distDir}/content-script.js`);
  cpSync("src/popup.html", `${distDir}/popup.html`);
  cpSync("src/popup.js", `${distDir}/popup.js`);
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

function createPackage(distDir, outputPath) {
  execSync(`cd ${distDir} && zip -r ../../${outputPath} .`, { stdio: "inherit" });
  console.log(`Created ${outputPath}`);
}

if (!target || target === "chrome") {
  buildChrome();
  createPackage("dist/chrome", "dist/slite-ime-fix-chrome.zip");
}
if (!target || target === "firefox") {
  buildFirefox();
  createPackage("dist/firefox", "dist/slite-ime-fix-firefox.xpi");
}

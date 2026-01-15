# Slite Japanese IME Fix

Browser extension that fixes the Japanese IME double-display bug in Slite editor.

Supports **Chrome**, **Edge**, and **Firefox**.

## Problem

When using Japanese IME (Input Method Editor) in Slite, composed text appears duplicated during input. This extension fixes that issue by properly handling composition events.

## Installation

### Build from source

```bash
git clone https://github.com/Xantibody/slite-ime-fix.git
cd slite-ime-fix
pnpm install
pnpm build
```

This generates:

- `dist/chrome/` - Chrome/Edge extension
- `dist/firefox/` - Firefox extension

### Chrome / Edge

1. Open `chrome://extensions/` (or `edge://extensions/`)
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `dist/chrome/` directory

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on..."
3. Select any file in the `dist/firefox/` directory (e.g., `manifest.json`)

> Note: Temporary add-ons are removed when Firefox restarts. For permanent installation, the extension needs to be signed by Mozilla.

## How it works

The extension intercepts `compositionstart` and `compositionend` events to temporarily clear and restore editor marks, preventing the double-display issue caused by Slate.js editor's mark handling during IME composition.

## Files

- `src/ime-fix.js` - Core IME fix logic
- `src/build/manifest.js` - Manifest generation for Chrome/Firefox
- `src/background.chrome.js` - Chrome background script (declarativeContent API)
- `src/background.firefox.js` - Firefox background script (tabs API)
- `content-script.js` - Injects the fix script into page context
- `scripts/build.js` - Build script to generate dist/

## Technical Details

### Root Cause

Slite uses Slate.js as its rich text editor. When `editor.marks` contains formatting information (bold, italic, etc.) during IME composition, Slate applies these marks to both the composing text and the committed text, causing double-display.

This happens because Slate's `insertText` operation reads `editor.marks` synchronously, but IME composition events and text insertion occur asynchronously, leading to marks being applied twice.

### Solution

This extension temporarily clears `editor.marks` during IME composition:

1. `compositionstart`: Save `editor.marks` and set it to `null`
2. `compositionend`: Restore the saved marks

This prevents Slate from applying marks during composition while preserving the user's intended formatting.

## License

MIT

# Slite Japanese IME Fix

Browser extension that fixes the Japanese IME double-display bug in Slite editor.

Supports **Chrome**, **Edge**, and **Firefox**.

## Problem

When using Japanese IME (Input Method Editor) in Slite, composed text appears duplicated during input. This extension fixes that issue by properly handling composition events.

## Installation

### Chrome / Edge

1. Download `slite-ime-fix-chrome-vX.X.X.zip` from [Releases](https://github.com/Xantibody/slite-ime-fix/releases)
2. Extract the zip file
3. Open `chrome://extensions/` (or `edge://extensions/`)
4. Enable "Developer mode" (toggle in top-right corner)
5. Click "Load unpacked"
6. Select the extracted folder

### Firefox

1. Download `slite-ime-fix-firefox-vX.X.X.xpi` from [Releases](https://github.com/Xantibody/slite-ime-fix/releases)
2. Open Firefox and drag the `.xpi` file into the browser window
3. Click "Add" when prompted

> Note: Firefox may warn about unsigned extensions. For permanent installation without warnings, the extension needs to be signed by Mozilla or installed in Firefox Developer Edition with `xpinstall.signatures.required` set to `false`.

### Build from source

```bash
git clone https://github.com/Xantibody/slite-ime-fix.git
cd slite-ime-fix
pnpm install
pnpm build
```

This generates:

- `dist/slite-ime-fix-chrome.zip` - Chrome/Edge extension
- `dist/slite-ime-fix-firefox.xpi` - Firefox extension
- `dist/chrome/` - Unpacked Chrome extension (for development)
- `dist/firefox/` - Unpacked Firefox extension (for development)

## Features

### IME Fix

The extension intercepts `compositionstart` and `compositionend` events to temporarily clear and restore editor marks, preventing the double-display issue caused by Slate.js editor's mark handling during IME composition.

### Emacs Keybindings (Optional)

Click the extension icon to toggle Emacs-style cursor movement:

| Shortcut | Action                    |
| -------- | ------------------------- |
| Ctrl+F   | Move forward (right)      |
| Ctrl+B   | Move backward (left)      |
| Ctrl+N   | Move to next line         |
| Ctrl+P   | Move to previous line     |
| Ctrl+A   | Move to beginning of line |
| Ctrl+E   | Move to end of line       |

## Files

- `src/ime-fix.js` - Core IME fix logic
- `src/emacs-keybind.js` - Emacs keybinding logic
- `src/build/manifest.js` - Manifest generation for Chrome/Firefox
- `src/background.chrome.js` - Chrome background script (declarativeContent API)
- `src/background.firefox.js` - Firefox background script (tabs API)
- `src/popup.html` / `src/popup.js` - Toggle UI for Emacs keybindings
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

# Slite Japanese IME Fix

Chrome/Edge extension that fixes the Japanese IME double-display bug in Slite editor.

## Problem

When using Japanese IME (Input Method Editor) in Slite, composed text appears duplicated during input. This extension fixes that issue by properly handling composition events.

## Installation

### From source (Developer mode)

1. Clone this repository

   ```bash
   git clone https://github.com/Xantibody/slite-ime-fix.git
   ```

2. Open Chrome/Edge and navigate to `chrome://extensions/`

3. Enable "Developer mode" (toggle in top-right corner)

4. Click "Load unpacked" and select the cloned directory

5. The extension will be active on `*.slite.com`

## How it works

The extension intercepts `compositionstart` and `compositionend` events to temporarily clear and restore editor marks, preventing the double-display issue caused by Slate.js editor's mark handling during IME composition.

## Files

- `manifest.json` - Extension manifest (Manifest V3)
- `content-script.js` - Injects the fix script into page context
- `inject.js` - Core IME fix logic

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

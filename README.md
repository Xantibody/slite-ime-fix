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

## License

MIT

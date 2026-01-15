// Manifest generation - pure functions (no I/O)

export const BASE_MANIFEST = {
  manifest_version: 3,
  name: "Slite Japanese IME Fix",
  version: "1.0.0",
  description: "Fixes Japanese IME double-display issue in Slite editor",
  host_permissions: ["https://*.slite.com/*"],
  icons: {
    16: "icons/icon-16.png",
    48: "icons/icon-48.png",
    128: "icons/icon-128.png",
  },
  action: {
    default_title: "Slite IME Fix",
    default_popup: "popup.html",
    default_icon: {
      16: "icons/icon-16.png",
      48: "icons/icon-48.png",
      128: "icons/icon-128.png",
    },
  },
  content_scripts: [
    {
      matches: ["https://*.slite.com/*"],
      js: ["content-script.js"],
      run_at: "document_start",
    },
  ],
  web_accessible_resources: [
    {
      resources: ["inject.js"],
      matches: ["https://*.slite.com/*"],
    },
  ],
};

export function generateChromeManifest() {
  return {
    ...BASE_MANIFEST,
    permissions: ["declarativeContent", "storage"],
    background: {
      service_worker: "background.js",
    },
  };
}

export function generateFirefoxManifest() {
  return {
    ...BASE_MANIFEST,
    permissions: ["tabs", "storage"],
    background: {
      scripts: ["background.js"],
    },
    browser_specific_settings: {
      gecko: {
        id: "slite-ime-fix@example.com",
        strict_min_version: "109.0",
      },
    },
  };
}

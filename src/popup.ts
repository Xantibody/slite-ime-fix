import {
  EMACS_KEYBIND_STORAGE_KEY,
  EMACS_KEYBIND_TOGGLE,
  getExtensionApi,
} from "./extension-api.ts";
import type { EmacsKeybindToggleMessage } from "./extension-api.ts";

const api = getExtensionApi();

const toggle = document.querySelector("#emacsToggle");
if (!(toggle instanceof HTMLInputElement)) {
  throw new TypeError("#emacsToggle checkbox is missing from popup.html");
}
const emacsToggle = toggle;

async function loadState(): Promise<void> {
  const stored = await api.storage.local.get(EMACS_KEYBIND_STORAGE_KEY);
  emacsToggle.checked = stored[EMACS_KEYBIND_STORAGE_KEY] === true;
}

async function notifyActiveTab(message: EmacsKeybindToggleMessage): Promise<void> {
  const [tab] = await api.tabs.query({ active: true, currentWindow: true });
  if (tab?.id === undefined) {
    return;
  }

  try {
    await api.tabs.sendMessage(tab.id, message);
  } catch {
    // Tab might not have the content script loaded
  }
}

async function handleToggle(): Promise<void> {
  const enabled = emacsToggle.checked;
  await api.storage.local.set({ [EMACS_KEYBIND_STORAGE_KEY]: enabled });
  await notifyActiveTab({ type: EMACS_KEYBIND_TOGGLE, enabled });
}

void loadState();

emacsToggle.addEventListener("change", () => {
  void handleToggle();
});

const api = typeof browser !== "undefined" ? browser : chrome;

const emacsToggle = document.getElementById("emacsToggle");

// Load current state
api.storage.local.get("emacsKeybindEnabled").then((result) => {
  emacsToggle.checked = result.emacsKeybindEnabled || false;
});

// Handle toggle change
emacsToggle.addEventListener("change", async () => {
  const enabled = emacsToggle.checked;
  await api.storage.local.set({ emacsKeybindEnabled: enabled });

  // Notify active tab
  const [tab] = await api.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    api.tabs
      .sendMessage(tab.id, {
        type: "EMACS_KEYBIND_TOGGLE",
        enabled: enabled,
      })
      .catch(() => {
        // Tab might not have content script loaded
      });
  }
});

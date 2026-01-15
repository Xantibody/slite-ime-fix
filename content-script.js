// Content Script: ページコンテキストにスクリプトを注入
const api = typeof browser !== "undefined" ? browser : chrome;
const script = document.createElement("script");
script.src = api.runtime.getURL("inject.js");
script.onload = function () {
  this.remove();
};
(document.head || document.documentElement).appendChild(script);

// Listen for messages from background script
api.runtime.onMessage.addListener((message) => {
  if (message.type === "EMACS_KEYBIND_TOGGLE") {
    // Use attribute to pass data (Firefox blocks cross-context detail access)
    document.documentElement.setAttribute(
      "data-slite-ime-fix-emacs",
      message.enabled ? "on" : "off",
    );
    window.dispatchEvent(new CustomEvent("slite-ime-fix:emacs-keybind"));
  }
});

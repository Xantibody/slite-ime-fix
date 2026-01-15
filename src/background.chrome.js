// Enable action icon only on Slite pages (Chrome version)
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.disable();
  chrome.storage.local.set({ emacsKeybindEnabled: false });

  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostSuffix: ".slite.com" },
          }),
        ],
        actions: [new chrome.declarativeContent.ShowAction()],
      },
    ]);
  });
});

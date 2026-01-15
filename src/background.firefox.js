// Enable action icon only on Slite pages (Firefox version)
const SLITE_PATTERN = /^https:\/\/.*\.slite\.com\//;

function updateIcon(tabId, url) {
  if (url && SLITE_PATTERN.test(url)) {
    browser.action.enable(tabId);
  } else {
    browser.action.disable(tabId);
  }
}

// Check when tab is updated
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url || changeInfo.status === "complete") {
    updateIcon(tabId, tab.url);
  }
});

// Check when tab is activated
browser.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await browser.tabs.get(activeInfo.tabId);
  updateIcon(tab.id, tab.url);
});

// Initialize: disable on all existing tabs, enable on Slite tabs
browser.tabs.query({}).then((tabs) => {
  for (const tab of tabs) {
    updateIcon(tab.id, tab.url);
  }
});

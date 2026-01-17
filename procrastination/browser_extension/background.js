// Track when tabs are activated or updated
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url) {
    logWebsite(tab.url);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    logWebsite(changeInfo.url);
  }
});

const PROCRASTINATION_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

function logWebsite(url) {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const timestamp = new Date().toISOString();

    // Skip chrome:// and other internal pages
    if (
      urlObj.protocol === "chrome:" ||
      urlObj.protocol === "edge:" ||
      urlObj.protocol === "about:"
    ) {
      return;
    }

    const visitData = {
      url: url,
      domain: domain,
      timestamp: timestamp,
    };

    console.log("Website visited:", visitData);

    // Store in chrome.storage for the popup to display
    chrome.storage.local.get(["visitHistory"], (result) => {
      const history = result.visitHistory || [];
      history.unshift(visitData); // Add to beginning

      // Keep only last 50 visits
      if (history.length > 50) {
        history.pop();
      }

      chrome.storage.local.set({ visitHistory: history });
    });

    sendToProcrastinationSite(visitData);
  } catch (e) {
    console.error("Error logging website:", e);
  }
}

function sendToProcrastinationSite(data) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (!tab.id || !tab.url) {
        return;
      }

      const shouldSend = PROCRASTINATION_ORIGINS.some((origin) =>
        tab.url.startsWith(origin)
      );

      if (!shouldSend) {
        return;
      }

      chrome.tabs.sendMessage(tab.id, { type: "TRACK_VISIT", payload: data });
    });
  });
}

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
      history.unshift(visitData);

      if (history.length > 50) {
        history.pop();
      }

      chrome.storage.local.set({ visitHistory: history });
    });

    // Send to external Vue app
    sendToExternalApp(visitData);
  } catch (e) {
    console.error("Error logging website:", e);
  }
}

// Send data to your Vue app via postMessage
function sendToExternalApp(data) {
  // Query all tabs to find your Vue app
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      // Check if the tab URL matches your Vue app
      // Update this URL to match where your Vue app is hosted
      if (
        tab.url &&
        (tab.url.includes("localhost:5173") || // Vite default
          tab.url.includes("localhost:3000") || // Common dev port
          tab.url.includes("localhost:8080") || // Vue CLI default
          tab.url.includes("your-production-domain.com")) // Add your production domain
      ) {
        // Send message to the tab's content script
        chrome.tabs
          .sendMessage(tab.id, {
            type: "TRACK_VISIT",
            payload: data,
          })
          .catch((err) => {
            // Tab might not have content script loaded yet
            console.log("Could not send to tab:", err.message);
          });
      }
    });
  });
}

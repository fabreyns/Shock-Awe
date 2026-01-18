// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TRACK_VISIT") {
    // Forward the message to the Vue app via window.postMessage
    window.postMessage(
      {
        source: "procrastination-extension",
        type: "TRACK_VISIT",
        payload: message.payload,
      },
      "*",
    );

    // Also store in localStorage as a backup
    const STORAGE_KEY = "procrastinationVisitHistory";
    const MAX_ENTRIES = 50;

    try {
      const rawHistory = localStorage.getItem(STORAGE_KEY);
      let history = rawHistory ? JSON.parse(rawHistory) : [];

      history.unshift(message.payload);

      if (history.length > MAX_ENTRIES) {
        history = history.slice(0, MAX_ENTRIES);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Error storing visit history:", error);
    }
  }

  return true;
});

<<<<<<< HEAD
const STORAGE_KEY = "procrastinationVisitHistory";
const MAX_ENTRIES = 50;

function addVisit(entry) {
  const rawHistory = localStorage.getItem(STORAGE_KEY);
  let history = [];

  if (rawHistory) {
    try {
      history = JSON.parse(rawHistory);
    } catch (error) {
      console.warn("Invalid history in localStorage, resetting.");
    }
  }

  history.unshift(entry);

  if (history.length > MAX_ENTRIES) {
    history = history.slice(0, MAX_ENTRIES);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

  window.postMessage(
    {
      source: "procrastination-extension",
      type: "TRACK_VISIT",
      payload: entry,
    },
    "*"
  );
}

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type !== "TRACK_VISIT" || !message.payload) {
    return;
  }

  addVisit(message.payload);
=======
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
>>>>>>> 1ca4a0c (Integrate browser extension)
});

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
});

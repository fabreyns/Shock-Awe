// Load and display visit history
function loadHistory() {
  chrome.storage.local.get(["visitHistory"], (result) => {
    const history = result.visitHistory || [];
    const historyDiv = document.getElementById("history");

    if (history.length === 0) {
      historyDiv.innerHTML =
        '<div class="empty-state">No websites tracked yet.<br>Start browsing to see your history!</div>';
      return;
    }

    historyDiv.innerHTML = history
      .map((visit) => {
        const date = new Date(visit.timestamp);
        const timeStr = date.toLocaleTimeString();
        const dateStr = date.toLocaleDateString();

        return `
        <div class="visit-item">
          <div class="domain">${visit.domain}</div>
          <div class="timestamp">${dateStr} ${timeStr}</div>
          <div class="url">${visit.url}</div>
        </div>
      `;
      })
      .join("");
  });
}

// Clear history button
document.getElementById("clearBtn").addEventListener("click", () => {
  chrome.storage.local.set({ visitHistory: [] }, () => {
    loadHistory();
  });
});

// Load history when popup opens
loadHistory();

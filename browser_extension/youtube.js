// Auto-play YouTube videos
function autoPlayVideo() {
  const video = document.querySelector("video");
  if (video) {
    video.play().catch((err) => {
      console.log("YouTube autoplay prevented by browser:", err);
      // Browsers often block autoplay with sound
      // If autoplay fails, we could try muting first
      video.muted = true;
      video.play().catch((e) => {
        console.log("Autoplay failed even when muted:", e);
      });
    });
  }
}

// Try to autoplay after page loads
setTimeout(autoPlayVideo, 1000);

// YouTube is a single-page application, so we need to watch for URL changes
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    // New video loaded, try to autoplay
    setTimeout(autoPlayVideo, 1500);
  }
}).observe(document, { subtree: true, childList: true });

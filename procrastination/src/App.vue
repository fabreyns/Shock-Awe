<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

// 1. Create a reference to hold the video element
const videoPlayer = ref(null);
const visitHistory = ref([]);
const STORAGE_KEY = "procrastinationVisitHistory";
const MAX_ENTRIES = 50;

// 2. Define the function to start the camera
const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: true 
    });
    
    // Attach the stream to the video element we referenced
    if (videoPlayer.value) {
      videoPlayer.value.srcObject = stream;
    }
  } catch (error) {
    console.error("Camera Error:", error);
    alert("Error: " + error.name);
  }
};

const loadVisitHistory = () => {
  const rawHistory = localStorage.getItem(STORAGE_KEY);

  if (!rawHistory) {
    visitHistory.value = [];
    return;
  }

  try {
    visitHistory.value = JSON.parse(rawHistory);
  } catch (error) {
    console.warn("Invalid history in localStorage, resetting.");
    visitHistory.value = [];
  }
};

const clearHistory = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  visitHistory.value = [];
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) {
    return "";
  }

  return new Date(timestamp).toLocaleString();
};

const handleMessage = (event) => {
  const message = event?.data;

  if (message?.source !== "procrastination-extension") {
    return;
  }

  if (message.type !== "TRACK_VISIT" || !message.payload) {
    return;
  }

  visitHistory.value = [
    message.payload,
    ...visitHistory.value,
  ].slice(0, MAX_ENTRIES);
};

const handleStorage = (event) => {
  if (event.key === STORAGE_KEY) {
    loadVisitHistory();
  }
};

// 3. Run this ONLY after the component is mounted (HTML is ready)
onMounted(() => {
  startCamera();
  loadVisitHistory();
  window.addEventListener("message", handleMessage);
  window.addEventListener("storage", handleStorage);
});

onBeforeUnmount(() => {
  window.removeEventListener("message", handleMessage);
  window.removeEventListener("storage", handleStorage);
});

</script>

<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark navigationbar">
      <div class="container-fluid">
        <RouterLink class="navbar-brand" to="/">
          How To Procrastinate Even more
        </RouterLink>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
          
        </button>
      </div>
    </nav>

  <div class="container-fluid d-flex justify-content-center pt-5">
    <button class="btn btn-primary fs-6" @click="startCamera">PRESS ME</button>
  </div>
  <div class="container-fluid d-flex justify-content-center mt-4 mirror-mode">
    <video 
      ref="videoPlayer" 
      autoplay 
      playsinline 
      width="640" 
      height="480" 
      class="border border-dark"
    ></video>
  </div>

  <section class="container my-5">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h2 class="h5 m-0">Tracked Links</h2>
      <button
        class="btn btn-outline-danger btn-sm"
        :disabled="visitHistory.length === 0"
        @click="clearHistory"
      >
        Clear
      </button>
    </div>

    <div v-if="visitHistory.length === 0" class="text-muted">
      No links received yet. Keep browsing to send data here.
    </div>
    <ul v-else class="list-group">
      <li
        v-for="visit in visitHistory"
        :key="`${visit.timestamp}-${visit.url}`"
        class="list-group-item"
      >
        <div class="fw-semibold">{{ visit.domain }}</div>
        <div class="small text-muted">{{ formatTimestamp(visit.timestamp) }}</div>
        <div class="small text-break">{{ visit.url }}</div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.mirror-mode {
  transform: scaleX(-1); /* Flips the element horizontally */
}
</style>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import * as tmImage from "@teachablemachine/image";
import { watch } from "vue";

const videoPlayer = ref(null);
const visitHistory = ref([]);
const whitelist = ref([]);
const newWhitelistDomain = ref("");
const STORAGE_KEY = "procrastinationVisitHistory";
const WHITELIST_KEY = "procrastinationWhitelist";
const MAX_ENTRIES = 50;
const URL = "https://teachablemachine.withgoogle.com/models/cuImnOTCz/";
const predictions = ref([]);
const isModelLoaded = ref(false);
const YOUTUBE_LINK = "https://youtu.be/dQw4w9WgXcQ?si=I0WvZ4U1ySCDCnnZ";

let model, maxPredictions;
let animationId = null;
let intervalId = null;

const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        aspectRatio: { exact: 1 },
        width: { ideal: 480 },
        height: { ideal: 480 },
      },
    });
    if (videoPlayer.value) {
      videoPlayer.value.srcObject = stream;
      if (!intervalId) {
        intervalId = setInterval(predictLoop, 2000);
      }
    }
  } catch (error) {
    console.error("Camera Error:", error);
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

const loadWhitelist = () => {
  const rawWhitelist = localStorage.getItem(WHITELIST_KEY);

  if (!rawWhitelist) {
    whitelist.value = ["localhost", "youtube.com", "youtu.be"];
    saveWhitelist();
    return;
  }

  try {
    whitelist.value = JSON.parse(rawWhitelist);

    if (!whitelist.value.includes("localhost")) {
      whitelist.value.push("localhost");
    }
    if (!whitelist.value.includes("youtube.com")) {
      whitelist.value.push("youtube.com");
    }
    if (!whitelist.value.includes("youtu.be")) {
      whitelist.value.push("youtu.be");
    }
    saveWhitelist();
  } catch (error) {
    console.warn("Invalid whitelist in localStorage, resetting.");
    whitelist.value = ["localhost", "youtube.com", "youtu.be"];
    saveWhitelist();
  }
};

const saveWhitelist = () => {
  localStorage.setItem(WHITELIST_KEY, JSON.stringify(whitelist.value));
};

const addToWhitelist = () => {
  const domain = newWhitelistDomain.value.trim().toLowerCase();

  if (!domain) {
    return;
  }

  // Remove protocol and path if user included them
  let cleanDomain = domain
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0];

  if (cleanDomain && !whitelist.value.includes(cleanDomain)) {
    whitelist.value.push(cleanDomain);
    saveWhitelist();
    newWhitelistDomain.value = "";
  }
};

const removeFromWhitelist = (domain) => {
  whitelist.value = whitelist.value.filter((d) => d !== domain);
  saveWhitelist();
};

const isWhitelisted = (domain) => {
  if (!domain) return false;

  const cleanDomain = domain.toLowerCase().replace(/^www\./, "");

  return whitelist.value.some((whitelistedDomain) => {
    return (
      cleanDomain === whitelistedDomain ||
      cleanDomain.endsWith("." + whitelistedDomain) ||
      cleanDomain.includes(whitelistedDomain)
    );
  });
};

// Computed property to add whitelist status to each visit
const visitsWithStatus = computed(() => {
  return visitHistory.value.map((visit) => ({
    ...visit,
    isWhitelisted: isWhitelisted(visit.domain),
  }));
});

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

  // Add new visit to the end
  visitHistory.value.push(message.payload);

  // If we exceed max entries, remove the oldest (first) item
  if (visitHistory.value.length > MAX_ENTRIES) {
    visitHistory.value.shift(); // Remove from front
  }

  // Check if the new visit is whitelisted - open video every time if not whitelisted
  const newVisit = message.payload;
  if (!isWhitelisted(newVisit.domain)) {
    window.open(YOUTUBE_LINK, "_blank");
  }
};

const handleStorage = (event) => {
  if (event.key === STORAGE_KEY) {
    loadVisitHistory();
  } else if (event.key === WHITELIST_KEY) {
    loadWhitelist();
  }
};

const loadModel = async () => {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();
  isModelLoaded.value = true;
};

const predictLoop = async () => {
  if (model && videoPlayer.value) {
    const prediction = await model.predict(videoPlayer.value, true);

    predictions.value = prediction;

    animationId = requestAnimationFrame(predictLoop);
  }
};

const showPhoneWarning = ref(false);
let wasPhoneDetected = false;

// Watch for phone detection - opens video every time phone is detected
watch(
  predictions,
  (newPredictions) => {
    const result = newPredictions.find((p) => p.className === "With Phone");

    if (result && result.probability > 0.9) {
      showPhoneWarning.value = true;

      // Only open if phone wasn't already detected (prevents spam while holding phone)
      if (!wasPhoneDetected) {
        window.open(YOUTUBE_LINK, "_blank");
        wasPhoneDetected = true;
      }
    } else {
      showPhoneWarning.value = false;
      wasPhoneDetected = false; // Reset when phone is put away
    }
  },
  { deep: true },
);

onMounted(async () => {
  await loadModel();
  startCamera();
  loadVisitHistory();
  loadWhitelist();
  window.addEventListener("message", handleMessage);
  window.addEventListener("storage", handleStorage);
});

onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId);
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
    <button class="btn btn-primary fs-6" @click="startCamera">
      Turn on Camera + Reset
    </button>
  </div>
  <div class="container-fluid d-flex justify-content-center mt-4 mirror-mode">
    <video
      ref="videoPlayer"
      autoplay
      playsinline
      width="480"
      height="480"
      class="border border-dark"
    ></video>
  </div>

  <!-- Whitelist Management Section -->
  <section class="container my-5">
    <h2 class="h5 mb-3">Whitelist Management</h2>
    <div class="card">
      <div class="card-body">
        <div class="mb-3">
          <label for="whitelistInput" class="form-label"
            >Add Allowed Website</label
          >
          <div class="input-group">
            <input
              id="whitelistInput"
              v-model="newWhitelistDomain"
              type="text"
              class="form-control"
              placeholder="e.g., stackoverflow.com"
              @keyup.enter="addToWhitelist"
            />
            <button
              class="btn btn-success"
              type="button"
              @click="addToWhitelist"
            >
              Add
            </button>
          </div>
          <div class="form-text">
            Enter a domain name. All URLs containing this domain will be
            whitelisted (e.g., stackoverflow.com matches
            stackoverflow.com/questions/123)
          </div>
        </div>

        <div v-if="whitelist.length === 0" class="text-muted">
          No whitelisted websites yet. Add domains above to mark them as
          allowed.
        </div>
        <div v-else>
          <h6 class="mb-2">Whitelisted Domains:</h6>
          <div class="d-flex flex-wrap gap-2">
            <span
              v-for="domain in whitelist"
              :key="domain"
              class="badge bg-success d-flex align-items-center gap-2"
              style="font-size: 0.9rem; padding: 0.5rem 0.75rem"
            >
              {{ domain }}
              <button
                type="button"
                class="btn-close btn-close-white"
                style="font-size: 0.6rem"
                @click="removeFromWhitelist(domain)"
                aria-label="Remove"
              ></button>
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Tracked Links Section -->
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
        v-for="visit in visitsWithStatus"
        :key="`${visit.timestamp}-${visit.url}`"
        class="list-group-item"
        :class="{ 'border-danger border-2': !visit.isWhitelisted }"
      >
        <div class="d-flex justify-content-between align-items-start">
          <div class="flex-grow-1">
            <div class="fw-semibold d-flex align-items-center gap-2">
              {{ visit.domain }}
              <span
                v-if="!visit.isWhitelisted"
                class="badge bg-danger"
                style="font-size: 0.7rem"
              >
                NOT WHITELISTED
              </span>
              <span v-else class="badge bg-success" style="font-size: 0.7rem">
                ✓ Allowed
              </span>
            </div>
            <div class="small text-muted">
              {{ formatTimestamp(visit.timestamp) }}
            </div>
            <div class="small text-break">{{ visit.url }}</div>
          </div>
        </div>
      </li>
    </ul>
  </section>
  <div class="container-fluid d-flex justify-content-center pt-4">
    <div class="card" style="width: 640px">
      <div class="card-header bg-dark text-white">Phone Prediction</div>
      <ul class="list-group list-group-flush">
        <li
          v-for="p in predictions"
          :key="p.className"
          class="list-group-item d-flex justify-content-between align-items-center"
        >
          {{ p.className }}
          <div class="progress" style="width: 60%">
            <div
              class="progress-bar"
              role="progressbar"
              :style="{ width: p.probability * 100 + '%' }"
              :class="p.probability > 0.8 ? 'bg-success' : 'bg-secondary'"
            >
              {{ (p.probability * 100).toFixed(0) }}%
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>

  <div v-if="showPhoneWarning" class="container d-flex justify-content-center">
    <h1 class="text-danger">PUT PHONE AWAY NOWWWW!!!</h1>
  </div>
</template>

<style scoped>
.mirror-mode {
  transform: scaleX(-1);
}
</style>

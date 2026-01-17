<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as tmImage from '@teachablemachine/image';

// --- CONFIGURATION ---
// REPLACE THIS WITH YOUR ACTUAL MODEL URL
const URL = "https://teachablemachine.withgoogle.com/models/cuImnOTCz/";

// --- REFS ---
const videoPlayer = ref(null);
const predictions = ref([]); // To store the AI's guesses
const isModelLoaded = ref(false);

let model, maxPredictions;
let animationId = null; // To stop the loop later

// --- CAMERA LOGIC (Same as before) ---
const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'user' } 
    });
    if (videoPlayer.value) {
      videoPlayer.value.srcObject = stream;
      // Wait for video to load data before starting prediction
      videoPlayer.value.onloadeddata = () => {
        predictLoop();
      };
    }
  } catch (error) {
    console.error("Camera Error:", error);
  }
};

// --- AI LOGIC ---
const loadModel = async () => {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  // Load the model
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();
  isModelLoaded.value = true;
};

const predictLoop = async () => {
  if (model && videoPlayer.value) {
    // predict() takes the video HTML element as input!
    const prediction = await model.predict(videoPlayer.value);
    
    // Update our reactive variable to show on screen
    predictions.value = prediction;
    
    // Keep looping
    animationId = requestAnimationFrame(predictLoop);
  }
};

// --- LIFECYCLE ---
onMounted(async () => {
  await loadModel(); // Load AI first
  await startCamera(); // Then start camera
});

onUnmounted(() => {
  // Clean up the loop when leaving the page
  if (animationId) cancelAnimationFrame(animationId);
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

  <div class="card" style="width: 640px;">
      <div class="card-header bg-dark text-white">
        Phone Prediction
      </div>
      <ul class="list-group list-group-flush">
        <li 
          v-for="p in predictions" 
          :key="p.className" 
          class="list-group-item d-flex justify-content-between align-items-center"
        >
          {{ p.className }}
          <div class="progress" style="width: 60%;">
            <div 
              class="progress-bar" 
              role="progressbar" 
              :style="{ width: (p.probability * 100) + '%' }"
              :class="p.probability > 0.8 ? 'bg-success' : 'bg-secondary'"
            >
              {{ (p.probability * 100).toFixed(0) }}%
            </div>
          </div>
        </li>
      </ul>
    </div>
</template>

<style scoped>
.mirror-mode {
  transform: scaleX(-1); /* Flips the element horizontally */
}
</style>

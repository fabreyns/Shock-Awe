<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import * as tmImage from '@teachablemachine/image';


const URL = "https://teachablemachine.withgoogle.com/models/cuImnOTCz/";


const videoPlayer = ref(null);
const predictions = ref([]); 
const isModelLoaded = ref(false);

let model, maxPredictions;
let animationId = null; 
let intervalId = null

const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'user', 
        aspectRatio: { exact: 1 }, 
        width: { ideal: 480 },
        height: { ideal: 480 } } 
    });
    if (videoPlayer.value) {
      videoPlayer.value.srcObject = stream;
      if (!intervalId){
        intervalId = setInterval(predictLoop, 2000)
      }
      // videoPlayer.value.onloadeddata = () => {
      //   predictLoop();
      // };
    }
  } catch (error) {
    console.error("Camera Error:", error);
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

const showPhoneWarning = computed(() => {
  const result = predictions.value.find(p => p.className === "With Phone");
  
  if (result && result.probability > 0.9) {
    window.open("https://youtu.be/dQw4w9WgXcQ?si=I0WvZ4U1ySCDCnnZ","_blank");
    return true;
    
  }
  return false;
});

onMounted(async () => {
  await loadModel(); 
});

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId);
});
</script>

<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark navigationbar">
      <div class="container-fluid justify-content-center">
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
    <button class="btn btn-primary fs-6" @click="startCamera">Turn on Camera + Reset</button>
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

  <div class="container-fluid d-flex justify-content-center pt-4 mb-5">
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
    </div>

    <div v-if="showPhoneWarning" class="container d-flex justify-content-center">
      <h1 class="text-danger">PUT PHONE AWAY NOWWWW!!! </h1>

    </div>
    
</template>

<style scoped>
.mirror-mode {
  transform: scaleX(-1); 
}
</style>

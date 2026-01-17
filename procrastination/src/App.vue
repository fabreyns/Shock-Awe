<script setup>
import { ref, onMounted } from 'vue';

// 1. Create a reference to hold the video element
const videoPlayer = ref(null);

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

// 3. Run this ONLY after the component is mounted (HTML is ready)
onMounted(() => {
  startCamera();
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
</template>

<style scoped>
.mirror-mode {
  transform: scaleX(-1); /* Flips the element horizontally */
}
</style>

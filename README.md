# Ricky's Permission

## Inspiration

As a student with many assignments and studying that needs to be done each day, we often found ourselves distracted by our phones, doomscrolling. The next thing we notice was hours passed by without us doing anything. Thus, we would like to annoy ourselves when we are procrastinating by either opening our phone or opening other sites that is not related to our study. At the same time, making a project that is fun to do and learn through the use of AI.

## What it does

To function correctly, the application requires the camera to be enabled. Users can configure a whitelist of 'productive' websites. The system utilizes a computer vision model to detect if you are holding a smartphone, while a browser extension monitors visited URLs.

If you attempt to visit a non-whitelisted site, the extension immediately intervenes by redirecting you to a 'Rick Roll' video, effectively blocking access. Similarly, if the camera detects that you are holding your phone, the system will continuously play the 'Rick Roll' video until you put away your device. Furthermore, it will also pop-up a quiz question that need to be solved to stop your browser from continuously opening a new 'Rick Roll' video tab.

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## Browser Extension Setup (Google Chrome Only)

### Go to Google Chrome Extensions and Enable Developer Mode

```
chrome://extensions/
```

### Click `Load Unpacked` and Select the Folder with `manifest.json`.

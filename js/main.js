// AR Video Player - Enhanced Version
class ARVideoPlayer {
  constructor() {
    this.video = null;
    this.scene = null;
    this.isARReady = false;
    this.isVideoMuted = true;
    this.targetFound = false;
    
    // Frame-by-frame video system
    this.canvas = null;
    this.ctx = null;
    this.frameImage = null;
    this.videoPlane = null;
    this.isPlaying = false;
    this.currentFrame = 0;
    this.fps = 24;
    this.frameInterval = null;
    
    // UI Elements
    this.loadingScreen = document.getElementById('loadingScreen');
    this.instructionsOverlay = document.getElementById('instructionsOverlay');
    this.statusMessage = document.getElementById('statusMessage');
    this.errorMessage = document.getElementById('errorMessage');
    this.startButton = document.getElementById('startAR');
    this.retryButton = document.getElementById('retryButton');
    
    this.init();
  }

  init() {
    // Show loading screen initially
    this.showLoadingScreen();
    
    // Simulate loading progress
    setTimeout(() => {
      this.hideLoadingScreen();
      this.showInstructions();
    }, 3000);

    // Event listeners
    this.setupEventListeners();
    
    // Check for mobile device
    this.checkMobileDevice();
  }

  setupEventListeners() {
    // Start AR button
    this.startButton.addEventListener('click', () => {
      this.startARExperience();
    });

    // Retry button
    this.retryButton.addEventListener('click', () => {
      this.hideError();
      this.startARExperience();
    });

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.video && !this.video.paused) {
        this.video.pause();
      }
    });

    // Handle orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.handleOrientationChange();
      }, 500);
    });
  }

  showLoadingScreen() {
    this.loadingScreen.style.display = 'flex';
  }

  hideLoadingScreen() {
    this.loadingScreen.style.opacity = '0';
    setTimeout(() => {
      this.loadingScreen.style.display = 'none';
    }, 500);
  }

  showInstructions() {
    this.instructionsOverlay.classList.add('show');
  }

  hideInstructions() {
    this.instructionsOverlay.classList.remove('show');
  }

  showStatus(message, duration = 3000) {
    this.statusMessage.textContent = message;
    this.statusMessage.classList.add('show');
    
    setTimeout(() => {
      this.statusMessage.classList.remove('show');
    }, duration);
  }

  showError(message = 'Camera access is required for AR experience') {
    this.errorMessage.querySelector('p').textContent = message;
    this.errorMessage.style.display = 'flex';
  }

  hideError() {
    this.errorMessage.style.display = 'none';
  }

  checkMobileDevice() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Add mobile-specific optimizations
      document.body.classList.add('mobile-device');
      
      // Request device orientation permission on iOS
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        this.requestIOSPermissions();
      }
    }
  }

  async requestIOSPermissions() {
    try {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission !== 'granted') {
        this.showStatus('Device orientation permission denied. Some features may not work properly.', 5000);
      }
    } catch (error) {
      console.log('Device orientation not supported or permission already granted');
    }
  }

  async startARExperience() {
    try {
      this.hideInstructions();
      this.showStatus('Initializing camera...');

      // Check camera permissions
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream

      // Initialize AR scene
      this.initializeARScene();
      
    } catch (error) {
      console.error('Camera access error:', error);
      this.handleCameraError(error);
    }
  }

  handleCameraError(error) {
    let errorMessage = 'Camera access is required for AR experience';
    
    if (error.name === 'NotAllowedError') {
      errorMessage = 'Camera permission denied. Please allow camera access and try again.';
    } else if (error.name === 'NotFoundError') {
      errorMessage = 'No camera found on this device.';
    } else if (error.name === 'NotSupportedError') {
      errorMessage = 'Camera is not supported on this device.';
    }
    
    this.showError(errorMessage);
  }

  initializeARScene() {
    this.scene = document.getElementById('arScene');
    this.video = document.getElementById('arVideo');
    this.canvas = document.getElementById('videoCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.frameImage = document.getElementById('frameImage');
    this.videoPlane = document.getElementById('videoPlane');
    
    // Add AR active class to html and body for full screen
    document.documentElement.classList.add('ar-active');
    document.body.classList.add('ar-active');
    
    // Force full viewport
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.documentElement.style.overflow = 'hidden';
    
    // Setup frame-by-frame video system
    this.setupFrameSystem();
    
    // Show AR scene with aggressive full screen
    this.scene.style.display = 'block';
    this.scene.style.position = 'fixed';
    this.scene.style.top = '0';
    this.scene.style.left = '0';
    this.scene.style.right = '0';
    this.scene.style.bottom = '0';
    this.scene.style.width = '100vw';
    this.scene.style.height = '100vh';
    this.scene.style.zIndex = '999';
    this.scene.style.margin = '0';
    this.scene.style.padding = '0';
    
    // Setup AR event listeners
    this.setupAREventListeners();
    
    this.showStatus('🎥 Starting camera...');
    
    // Shorter timeout for better UX
    setTimeout(() => {
      if (!this.isARReady) {
        this.showStatus('📷 Camera loading... Please wait', 2000);
      }
    }, 5000);
    
    // Force hide loading after reasonable time
    setTimeout(() => {
      const loading = document.getElementById('loading');
      if (loading) loading.style.display = 'none';
      if (!this.isARReady) {
        this.showStatus('🎯 Point camera at your image', 0);
      }
    }, 8000);
  }

  forceFullScreen() {
    // Remove any debug overlays first
    this.removeDebugOverlays();
    
    // Force main canvas to full screen (only the first canvas - the camera)
    const canvases = this.scene.querySelectorAll('canvas');
    if (canvases.length > 0) {
      const mainCanvas = canvases[0]; // Only style the main camera canvas
      mainCanvas.style.position = 'fixed';
      mainCanvas.style.top = '0';
      mainCanvas.style.left = '0';
      mainCanvas.style.right = '0';
      mainCanvas.style.bottom = '0';
      mainCanvas.style.width = '100vw';
      mainCanvas.style.height = '100vh';
      mainCanvas.style.zIndex = '1';
      mainCanvas.style.objectFit = 'cover';
      
      // Hide all other canvases (debug overlays)
      for (let i = 1; i < canvases.length; i++) {
        canvases[i].style.display = 'none';
        canvases[i].style.visibility = 'hidden';
      }
    }
    
    // Also force the scene container
    if (this.scene) {
      this.scene.style.width = '100vw';
      this.scene.style.height = '100vh';
      this.scene.style.position = 'fixed';
      this.scene.style.top = '0';
      this.scene.style.left = '0';
      this.scene.style.zIndex = '999';
    }
  }

  removeDebugOverlays() {
    // Remove MindAR debug overlays
    const debugElements = document.querySelectorAll('.mindar-ui-overlay, .mindar-ui-scanning, .mindar-ui-loading');
    debugElements.forEach(el => el.remove());
    
    // Hide any additional canvas elements (debug visualizations)
    const allCanvases = document.querySelectorAll('canvas');
    allCanvases.forEach((canvas, index) => {
      if (index > 0) { // Keep only the first canvas (camera)
        canvas.style.display = 'none';
        canvas.style.visibility = 'hidden';
      }
    });
    
    // Remove any debug divs that might be created by MindAR
    const debugDivs = document.querySelectorAll('div[style*="pointer-events: none"]');
    debugDivs.forEach(div => {
      if (div.querySelector('canvas')) {
        div.style.display = 'none';
      }
    });
  }

  setupFrameSystem() {
    // Load video for frame extraction
    this.video.load();
    
    this.video.addEventListener('loadeddata', () => {
      console.log('Video loaded for frame extraction');
      this.video.currentTime = 0;
    });
    
    this.video.addEventListener('canplay', () => {
      console.log('Video ready for frame extraction');
    });
  }

  extractFrame() {
    if (this.video && this.canvas && this.ctx) {
      // Draw current video frame to canvas
      this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
      
      // Convert canvas to data URL and update frame image
      const frameDataURL = this.canvas.toDataURL('image/jpeg', 0.8);
      this.frameImage.src = frameDataURL;
      
      // Update A-Frame plane texture
      if (this.videoPlane) {
        this.videoPlane.setAttribute('src', '#frameImage');
      }
    }
  }

  startFramePlayback() {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    const frameTime = 1000 / this.fps; // 24fps = ~42ms per frame
    
    this.frameInterval = setInterval(() => {
      if (this.targetFound && this.video) {
        // Advance video time
        this.video.currentTime += (1 / this.fps);
        
        // Loop video
        if (this.video.currentTime >= this.video.duration) {
          this.video.currentTime = 0;
        }
        
        // Extract and display frame
        this.extractFrame();
      }
    }, frameTime);
    
    console.log('Frame-by-frame playback started at 24fps');
  }

  stopFramePlayback() {
    this.isPlaying = false;
    if (this.frameInterval) {
      clearInterval(this.frameInterval);
      this.frameInterval = null;
    }
    console.log('Frame-by-frame playback stopped');
  }

  setupAREventListeners() {
    // MindAR documented events
    this.scene.addEventListener('arReady', () => {
      this.isARReady = true;
      console.log('MindAR Ready!');
      this.showStatus('🎯 Scan your image now!', 2000);
      
      // Hide loading indicators
      const loading = document.getElementById('loading');
      if (loading) loading.style.display = 'none';
      
      // Force canvas to full screen after AR is ready
      setTimeout(() => {
        this.forceFullScreen();
      }, 500);
      
      // Start continuous cleanup of any debug overlays
      this.debugCleanupInterval = setInterval(() => {
        this.removeDebugOverlays();
      }, 1000);
    });

    this.scene.addEventListener('arError', (event) => {
      console.error('MindAR Error:', event.detail);
      this.showError('AR failed to load. Please refresh and try again.');
    });

    // Target tracking events
    this.scene.addEventListener('targetFound', () => {
      this.onTargetFound();
    });

    this.scene.addEventListener('targetLost', () => {
      this.onTargetLost();
    });

    // Video events
    this.video.addEventListener('loadeddata', () => {
      console.log('Video loaded successfully');
    });

    this.video.addEventListener('error', (e) => {
      console.error('Video error:', e);
      this.showStatus('Video loading failed', 3000);
    });

    // Setup video controls
    this.setupVideoControls();
  }

  onTargetFound() {
    this.targetFound = true;
    console.log('Target found!');
    this.showStatus('🎯 Target found! Starting video...', 1000);
    
    // Start frame-by-frame playback
    this.startFramePlayback();
    
    // Show video controls quickly
    setTimeout(() => {
      this.showVideoControls();
      this.showStatus('Video playing at 24fps! Tap controls to interact', 2000);
    }, 500);
  }

  onTargetLost() {
    this.targetFound = false;
    this.stopFramePlayback();
    this.hideVideoControls();
    this.showStatus('Target lost. Point camera at the image again.', 2000);
  }

  async playVideo() {
    try {
      // Ensure video is ready and buffered
      if (this.video.readyState >= 3) {
        // Video is fully loaded, play immediately
        this.video.currentTime = 0;
        await this.video.play();
        console.log('Video playing from buffer');
      } else {
        // Wait for video to buffer then play
        this.video.addEventListener('canplaythrough', async () => {
          this.video.currentTime = 0;
          await this.video.play();
          console.log('Video playing after buffering');
        }, { once: true });
      }
    } catch (error) {
      console.error('Video play error:', error);
      // If autoplay fails, show play button
      if (error.name === 'NotAllowedError') {
        this.showStatus('Tap the play button to start video', 4000);
        this.showVideoControls();
      }
    }
  }

  setupVideoControls() {
    const playButton = document.getElementById('playButton');
    const pauseButton = document.getElementById('pauseButton');
    const volumeButton = document.getElementById('volumeButton');

    // Play button
    playButton.addEventListener('click', () => {
      if (this.targetFound && !this.isPlaying) {
        this.startFramePlayback();
        this.showStatus('Playing video at 24fps', 1000);
      }
    });

    // Pause button
    pauseButton.addEventListener('click', () => {
      if (this.isPlaying) {
        this.stopFramePlayback();
        this.showStatus('Video paused', 1000);
      }
    });

    // Volume button (not applicable for frame system, but keep for UI)
    volumeButton.addEventListener('click', () => {
      this.showStatus('Frame-by-frame mode - no audio', 1000);
    });
  }

  toggleMute() {
    this.isVideoMuted = !this.isVideoMuted;
    this.video.muted = this.isVideoMuted;
    
    const volumeButton = document.getElementById('volumeButton');
    const volumeText = volumeButton.querySelector('a-text');
    
    if (this.isVideoMuted) {
      volumeText.setAttribute('value', '🔇');
      this.showStatus('Video muted', 1000);
    } else {
      volumeText.setAttribute('value', '🔊');
      this.showStatus('Video unmuted', 1000);
    }
  }

  showVideoControls() {
    const videoControls = document.getElementById('videoControls');
    if (videoControls) {
      videoControls.setAttribute('visible', 'true');
    }
  }

  hideVideoControls() {
    const videoControls = document.getElementById('videoControls');
    if (videoControls) {
      videoControls.setAttribute('visible', 'false');
    }
  }

  handleOrientationChange() {
    if (this.scene && this.isARReady) {
      // Reinitialize camera after orientation change
      setTimeout(() => {
        this.showStatus('Adjusting to new orientation...', 2000);
      }, 100);
    }
  }
}

// Performance monitoring
class PerformanceMonitor {
  constructor() {
    this.startTime = performance.now();
    this.frameCount = 0;
    this.lastFrameTime = this.startTime;
  }

  update() {
    this.frameCount++;
    const currentTime = performance.now();
    
    // Log performance every 60 frames
    if (this.frameCount % 60 === 0) {
      const fps = 60000 / (currentTime - this.lastFrameTime);
      console.log(`FPS: ${fps.toFixed(1)}`);
      this.lastFrameTime = currentTime;
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check for WebXR support
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    document.body.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #f0f0f0; font-family: Arial, sans-serif; text-align: center; padding: 20px;">
        <div>
          <h2 style="color: #333; margin-bottom: 15px;">Browser Not Supported</h2>
          <p style="color: #666;">This AR experience requires a modern browser with camera support.</p>
          <p style="color: #666;">Please try Chrome, Firefox, or Safari on a mobile device.</p>
        </div>
      </div>
    `;
    return;
  }

  // Initialize AR Video Player
  const arPlayer = new ARVideoPlayer();
  
  // Initialize performance monitor in development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    const perfMonitor = new PerformanceMonitor();
    
    function animate() {
      perfMonitor.update();
      requestAnimationFrame(animate);
    }
    animate();
  }

  // Service worker registration for PWA capabilities
  if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('SW registered successfully');
      })
      .catch(error => {
        console.log('SW registration failed');
      });
  }
});

// AR Video Player - Enhanced Version
class ARVideoPlayer {
  constructor() {
    this.video = null;
    this.scene = null;
    this.isARReady = false;
    this.isVideoMuted = true;
    this.targetFound = false;
    
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
    
    // Add AR active class to body to hide gradient
    document.body.classList.add('ar-active');
    
    // Preload and buffer video for faster playback
    this.preloadVideo();
    
    // Show AR scene with full screen
    this.scene.style.display = 'block';
    this.scene.style.position = 'fixed';
    this.scene.style.top = '0';
    this.scene.style.left = '0';
    this.scene.style.width = '100%';
    this.scene.style.height = '100%';
    this.scene.style.zIndex = '1';
    
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

  preloadVideo() {
    // Force video to load and buffer
    this.video.load();
    
    // Set up video for optimal playback
    this.video.addEventListener('loadstart', () => {
      console.log('Video loading started');
    });
    
    this.video.addEventListener('canplay', () => {
      console.log('Video can start playing');
      this.video.currentTime = 0; // Reset to beginning
    });
    
    this.video.addEventListener('canplaythrough', () => {
      console.log('Video fully buffered and ready');
    });
    
    // Preload video data
    if (this.video.readyState < 3) {
      this.video.preload = 'auto';
      this.video.load();
    }
  }

  setupAREventListeners() {
    // AR target events
    this.scene.addEventListener('arReady', () => {
      this.isARReady = true;
      console.log('AR Ready!');
      this.showStatus('AR Ready! Point camera at image', 1500);
      
      // Hide loading indicators
      document.getElementById('loading').style.display = 'none';
    });

    this.scene.addEventListener('arError', (event) => {
      console.error('AR Error:', event.detail);
      this.showError('AR failed to load. Check your internet connection and try again.');
    });

    // MindAR specific events
    this.scene.addEventListener('renderstart', () => {
      console.log('AR rendering started');
      this.showStatus('Camera active - scan your image!', 2000);
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
    this.showStatus('🎯 Target found! Loading video...', 1000);
    
    // Immediate video play attempt
    this.playVideo();
    
    // Show video controls quickly
    setTimeout(() => {
      this.showVideoControls();
      this.showStatus('Video playing! Tap controls to interact', 2000);
    }, 500);
  }

  onTargetLost() {
    this.targetFound = false;
    this.video.pause();
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
      if (this.targetFound) {
        this.video.play();
        this.showStatus('Playing video', 1000);
      }
    });

    // Pause button
    pauseButton.addEventListener('click', () => {
      this.video.pause();
      this.showStatus('Video paused', 1000);
    });

    // Volume button
    volumeButton.addEventListener('click', () => {
      this.toggleMute();
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

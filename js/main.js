// AR Video Player - Enhanced Version
class ARVideoPlayer {
  constructor() {
    this.scene = null;
    this.isARReady = false;
    this.targetFound = false;
    
    // Image sequence system
    this.frameImage = null;
    this.videoPlane = null;
    this.isPlaying = false;
    this.currentFrame = 1; // Start from Image00001.png
    this.totalFrames = 180; // Image00001.png to Image00180.png
    this.fps = 24;
    this.frameInterval = null;
    this.imageCache = []; // Preloaded images
    this.textureCache = []; // Preloaded Three.js textures
    this.imagesLoaded = false;
    
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
      if (document.hidden && this.isPlaying) {
        this.stopFramePlayback();
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
    this.frameImage = document.getElementById('frameImage');
    this.videoPlane = document.getElementById('videoPlane');
    
    // Set initial texture to first image to avoid black screen
    if (this.frameImage) {
      this.frameImage.src = 'assets/Image00001.png';
      // Wait for initial image to load
      this.frameImage.onload = () => {
        console.log('Initial frame image loaded');
        // Update plane material
        if (this.videoPlane) {
          this.videoPlane.setAttribute('material', 'src', this.frameImage);
        }
      };
    }
    
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
    // Preload all images for smooth playback
    this.preloadImages();
  }

  preloadImages() {
    console.log('Preloading image sequence...');
    let loadedCount = 0;
    let textureCreatedCount = 0;
    const totalFrames = this.totalFrames;
    
    // Wait for A-Frame to be ready
    const waitForAFrame = () => {
      if (typeof AFRAME !== 'undefined' && AFRAME.THREE) {
        console.log('A-Frame ready, starting image preload');
        startPreloading();
      } else {
        console.log('Waiting for A-Frame...');
        setTimeout(waitForAFrame, 100);
      }
    };
    
    const startPreloading = () => {
      const THREE = AFRAME.THREE;
      console.log('Starting to preload', totalFrames, 'images');
      
      // Preload all images
      for (let i = 1; i <= totalFrames; i++) {
        const frameNumber = String(i).padStart(5, '0');
        const imagePath = `assets/Image${frameNumber}.png`;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          loadedCount++;
          this.imageCache[i - 1] = img; // Store in array (index 0-179)
          
          // Create Three.js texture from the loaded image
          try {
            const texture = new THREE.Texture(img);
            texture.flipY = false; // Important for correct orientation
            texture.needsUpdate = true;
            this.textureCache[i - 1] = texture;
            textureCreatedCount++;
            
            if (i === 1) {
              console.log('✓ First image loaded successfully:', imagePath, 'Size:', img.width, 'x', img.height);
            }
            
            // Log progress every 30 frames
            if (i % 30 === 0) {
              console.log(`Progress: ${i}/${totalFrames} images loaded (${Math.round(i/totalFrames*100)}%)`);
            }
          } catch (error) {
            console.error(`Error creating texture for frame ${i}:`, error);
          }
          
          if (loadedCount === totalFrames) {
            this.imagesLoaded = true;
            console.log(`✓ All ${totalFrames} images loaded!`);
            console.log(`✓ Textures created: ${textureCreatedCount}/${totalFrames}`);
            this.showStatus('Images ready!', 1000);
          }
        };
        
        img.onerror = (error) => {
          console.error(`✗ Failed to load image: ${imagePath}`, error);
          loadedCount++;
          // Create a placeholder image if loading fails
          this.imageCache[i - 1] = null;
          this.textureCache[i - 1] = null;
          
          if (loadedCount === totalFrames) {
            this.imagesLoaded = true;
            console.log('Image preloading completed (some may have failed)');
            console.log(`Successfully loaded: ${textureCreatedCount}/${totalFrames} images`);
            if (textureCreatedCount === 0) {
              console.error('CRITICAL: No images loaded successfully!');
              this.showError('Failed to load images. Please check the console for details.');
            }
          }
        };
        
        img.src = imagePath;
      }
    };
    
    waitForAFrame();
  }

  displayFrame() {
    if (!this.imagesLoaded || !this.videoPlane) {
      console.log('displayFrame: imagesLoaded=', this.imagesLoaded, 'videoPlane=', !!this.videoPlane);
      return;
    }
    
    // Get the current frame
    const frameIndex = this.currentFrame - 1; // Convert to 0-based index
    const img = this.imageCache[frameIndex];
    const texture = this.textureCache[frameIndex];
    
    if (!img || !texture) {
      console.warn(`Image or texture not found for frame ${this.currentFrame} (index ${frameIndex})`);
      return;
    }
    
    try {
      const frameNumber = String(this.currentFrame).padStart(5, '0');
      const imagePath = `assets/Image${frameNumber}.png`;
      
      // Method 1: Update via A-Frame material component (preferred)
      if (this.frameImage) {
        // Update the image source
        this.frameImage.src = imagePath;
        
        // Wait for image to load in the DOM element
        const updateViaAFrame = () => {
          if (this.videoPlane) {
            // Update material using A-Frame's setAttribute
            this.videoPlane.setAttribute('material', 'src', this.frameImage);
            console.log(`Frame ${this.currentFrame} updated via A-Frame`);
          }
        };
        
        if (this.frameImage.complete && this.frameImage.naturalWidth > 0) {
          updateViaAFrame();
        } else {
          this.frameImage.onload = updateViaAFrame;
        }
      }
      
      // Method 2: Direct Three.js texture update (backup)
      setTimeout(() => {
        try {
          const mesh = this.videoPlane.getObject3D('mesh');
          if (mesh && mesh.material && texture && texture.image) {
            // Ensure texture is ready
            if (texture.image.complete) {
              mesh.material.map = texture;
              mesh.material.map.needsUpdate = true;
              mesh.material.needsUpdate = true;
              console.log(`Frame ${this.currentFrame} updated via Three.js`);
            }
          }
        } catch (error) {
          console.error('Error in Three.js update:', error);
        }
      }, 50);
      
    } catch (error) {
      console.error('Error updating texture:', error);
    }
  }

  startFramePlayback() {
    if (this.isPlaying) return;
    
    if (!this.imagesLoaded) {
      this.showStatus('Loading images... Please wait', 2000);
      return;
    }
    
    this.isPlaying = true;
    const frameTime = 1000 / this.fps; // 24fps = ~42ms per frame
    
    this.frameInterval = setInterval(() => {
      if (this.targetFound) {
        // Display current frame
        this.displayFrame();
        
        // Advance to next frame
        this.currentFrame++;
        
        // Loop back to first frame
        if (this.currentFrame > this.totalFrames) {
          this.currentFrame = 1;
        }
      }
    }, frameTime);
    
    // Display first frame immediately
    this.displayFrame();
    
    console.log('Image sequence playback started at 24fps');
  }

  stopFramePlayback() {
    this.isPlaying = false;
    if (this.frameInterval) {
      clearInterval(this.frameInterval);
      this.frameInterval = null;
    }
    console.log('Image sequence playback stopped');
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

    // Setup video controls
    this.setupVideoControls();
  }

  onTargetFound() {
    this.targetFound = true;
    console.log('Target found!');
    console.log('Images loaded:', this.imagesLoaded);
    console.log('Video plane:', !!this.videoPlane);
    
    // Function to start playback
    const startPlayback = () => {
      // Wait a bit more to ensure mesh is fully ready
      setTimeout(() => {
        // Reset to first frame
        this.currentFrame = 1;
        
        // Try to display first frame multiple times to ensure it works
        let attempts = 0;
        const tryDisplayFrame = () => {
          attempts++;
          this.displayFrame();
          
          // Check if frame was displayed successfully
          const mesh = this.videoPlane ? this.videoPlane.getObject3D('mesh') : null;
          if (mesh && mesh.material && mesh.material.map) {
            console.log('First frame displayed successfully!');
            this.startFramePlayback();
            setTimeout(() => {
              this.showVideoControls();
              this.showStatus('Image sequence playing at 24fps!', 2000);
            }, 500);
          } else if (attempts < 10) {
            // Retry if mesh not ready
            setTimeout(tryDisplayFrame, 100);
          } else {
            console.error('Failed to display frame after multiple attempts');
            this.showStatus('Error displaying images. Please refresh.', 3000);
          }
        };
        
        tryDisplayFrame();
      }, 300); // Longer delay to ensure everything is ready
    };
    
    if (!this.imagesLoaded) {
      this.showStatus('🎯 Target found! Loading images...', 2000);
      // Wait for images to load
      const checkImages = setInterval(() => {
        if (this.imagesLoaded) {
          clearInterval(checkImages);
          console.log('All images loaded, starting playback');
          startPlayback();
        }
      }, 100);
    } else {
      this.showStatus('🎯 Target found! Starting image sequence...', 1000);
      startPlayback();
    }
  }

  onTargetLost() {
    this.targetFound = false;
    this.stopFramePlayback();
    this.hideVideoControls();
    // Reset to first frame when target is lost
    this.currentFrame = 1;
    this.showStatus('Target lost. Point camera at the image again.', 2000);
  }


  setupVideoControls() {
    const playButton = document.getElementById('playButton');
    const pauseButton = document.getElementById('pauseButton');
    const volumeButton = document.getElementById('volumeButton');

    // Play button
    playButton.addEventListener('click', () => {
      if (this.targetFound && !this.isPlaying) {
        this.startFramePlayback();
        this.showStatus('Playing image sequence at 24fps', 1000);
      }
    });

    // Pause button
    pauseButton.addEventListener('click', () => {
      if (this.isPlaying) {
        this.stopFramePlayback();
        this.showStatus('Image sequence paused', 1000);
      }
    });

    // Volume button (not applicable for image sequence, but keep for UI)
    volumeButton.addEventListener('click', () => {
      this.showStatus('Image sequence mode - no audio', 1000);
    });
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

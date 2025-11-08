# 🚀 Deployment Guide for AR Video Player

## Quick GitHub Pages Deployment

### Step 1: Create GitHub Repository
1. Go to [GitHub.com](https://github.com) and create a new repository
2. Name it something like `ar-video-player` or `my-ar-experience`
3. Make it **public** (required for free GitHub Pages)
4. Don't initialize with README (we have our own files)

### Step 2: Upload Your Files
You can upload files in two ways:

#### Option A: Web Interface (Easiest)
1. Click "uploading an existing file" on your new repository page
2. Drag and drop ALL files from your AR folder:
   - `index.html`
   - `css/styles.css`
   - `js/main.js`
   - `assets/poster.png`
   - `assets/video.mp4`
   - `assets/marker.mind` (create this first!)
   - `README.md`
   - `sw.js`
   - `.gitignore`
3. Commit the files

#### Option B: Git Commands
```bash
# Navigate to your AR folder
cd /path/to/your/AR/folder

# Initialize git
git init

# Add remote repository (replace with your repo URL)
git remote add origin https://github.com/yourusername/ar-video-player.git

# Add all files
git add .

# Commit files
git commit -m "Initial AR video player setup"

# Push to GitHub
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section
4. Under "Source", select **Deploy from a branch**
5. Choose **main** branch
6. Click **Save**

### Step 4: Create Your Marker File
**⚠️ IMPORTANT**: You must create the marker file before your AR will work!

1. Open `create-marker.html` in your browser (from your local files)
2. Follow the instructions to create `marker.mind` from your `poster.png`
3. Upload the `marker.mind` file to your `assets/` folder on GitHub

### Step 5: Access Your AR Experience
- Your site will be available at: `https://yourusername.github.io/repository-name`
- It may take 5-10 minutes to become active
- Always test on a mobile device with HTTPS

## 🔧 Pre-Deployment Checklist

### Required Files
- [ ] `index.html` - Main AR page
- [ ] `css/styles.css` - Styling
- [ ] `js/main.js` - AR functionality
- [ ] `assets/poster.png` - Target image
- [ ] `assets/video.mp4` - AR video content
- [ ] `assets/marker.mind` - **MUST CREATE THIS**

### Optional Files
- [ ] `README.md` - Documentation
- [ ] `sw.js` - Service worker for offline support
- [ ] `.gitignore` - Git ignore file
- [ ] `create-marker.html` - Marker creation guide

### Testing Checklist
- [ ] Video file plays in browser
- [ ] Poster image displays correctly
- [ ] Marker file is created and uploaded
- [ ] All file paths are correct (no spaces in names)
- [ ] Repository is public

## 🎯 Creating the Marker File

This is the most critical step! Without the marker file, AR tracking won't work.

### Method 1: MindAR Online Compiler (Recommended)
1. Visit: https://hiukim.github.io/mind-ar-js-doc/tools/compile
2. Upload your `poster.png`
3. Wait for compilation (may take a few minutes)
4. Download the `.mind` file
5. Rename it to `marker.mind`
6. Upload to your `assets/` folder

### Method 2: Local Compilation
If you're comfortable with Node.js:
```bash
npm install -g @hiukim/mind-ar-js-cli
mind-ar-js-cli compile --input-path assets/poster.png --output-path assets/marker.mind
```

## 🌐 Alternative Free Hosting Options

### Netlify
1. Go to [netlify.com](https://netlify.com)
2. Drag your entire AR folder to the deploy area
3. Get instant HTTPS URL

### Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Deploy with one click

### Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Run `firebase init hosting`
3. Deploy with `firebase deploy`

## 📱 Testing Your Deployment

### Desktop Testing
1. Open your deployed URL in Chrome/Firefox
2. Check browser console for errors
3. Verify all assets load correctly

### Mobile Testing
1. **Use HTTPS URL** (required for camera access)
2. Test on multiple devices (iOS/Android)
3. Check different browsers (Chrome, Safari, Firefox)
4. Test in different lighting conditions

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Camera not working | Ensure HTTPS is enabled |
| AR not tracking | Create proper marker.mind file |
| Video not playing | Check video format (MP4 recommended) |
| 404 errors | Verify all file paths are correct |
| Slow loading | Optimize video/image file sizes |

## 🔒 Security & Performance

### HTTPS Requirement
- Camera access requires HTTPS
- GitHub Pages provides HTTPS automatically
- Never use HTTP for AR experiences

### File Size Optimization
- **Video**: Keep under 50MB, use H.264 codec
- **Images**: Compress to under 2MB
- **Total project**: Keep under 100MB for GitHub

### Performance Tips
- Test on older mobile devices
- Monitor frame rate in browser dev tools
- Optimize for 30+ FPS on mobile

## 🆘 Troubleshooting

### Deployment Issues
```bash
# If git push fails
git pull origin main --rebase
git push origin main

# If pages not updating
# Wait 10 minutes, then hard refresh (Ctrl+F5)
```

### AR Issues
1. **No camera access**: Check HTTPS and permissions
2. **No tracking**: Verify marker.mind file exists and is correct
3. **Poor tracking**: Improve lighting, hold device steady
4. **Video not playing**: Check autoplay policies, add user interaction

## 📞 Getting Help

1. **GitHub Issues**: Create an issue in your repository
2. **MindAR Documentation**: https://hiukim.github.io/mind-ar-js-doc/
3. **A-Frame Documentation**: https://aframe.io/docs/
4. **Community Forums**: Stack Overflow, Reddit r/WebVR

---

**🎉 Congratulations!** Once deployed, you'll have a professional AR video player that works on any mobile device with a camera. Share your URL and let people experience AR magic by scanning your image!

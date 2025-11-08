# 🎥 AR Video Player

A modern, responsive AR video player that uses image tracking to display videos in augmented reality. Built with A-Frame and MindAR for a seamless cross-platform experience.

## ✨ Features

- **📱 Mobile-First Design** - Optimized for smartphones and tablets
- **🎯 Image Tracking** - Scan any image to trigger AR video playback
- **🎮 Interactive Controls** - Play, pause, and volume controls in AR space
- **🔄 Responsive UI** - Beautiful loading screens and status indicators
- **⚡ High Performance** - Optimized for smooth AR experience
- **🌐 Cross-Platform** - Works on iOS, Android, and desktop browsers

## 🚀 Live Demo

[View Live Demo](https://yourusername.github.io/AR-Video-Player/)

## 📱 How to Use

1. **Open the website** on your mobile device
2. **Allow camera permissions** when prompted
3. **Point your camera** at the target image
4. **Watch the AR video** appear and play automatically!

## 🛠️ Setup Instructions

### Prerequisites
- Modern web browser with camera support
- HTTPS hosting (required for camera access)

### Quick Start

1. **Clone this repository**
   ```bash
   git clone https://github.com/yourusername/AR-Video-Player.git
   cd AR-Video-Player
   ```

2. **Create your marker file**
   - Open `create-marker.html` in your browser
   - Follow the instructions to create a marker from your image
   - Place the generated `marker.mind` file in the `assets/` folder

3. **Replace the video**
   - Add your video file as `assets/video.mp4`
   - Update `assets/poster.jpg` with your target image

4. **Deploy to GitHub Pages**
   - Push to your GitHub repository
   - Enable GitHub Pages in repository settings
   - Your AR experience will be live!

## 📁 Project Structure

```
AR-Video-Player/
├── index.html              # Main AR experience
├── css/
│   └── styles.css          # Modern responsive styles
├── js/
│   └── main.js            # AR functionality and controls
├── assets/
│   ├── poster.jpg         # Target image for scanning
│   ├── video.mp4          # AR video content
│   └── marker.mind        # Generated marker file
├── create-marker.html     # Marker creation guide
└── README.md             # This file
```

## 🎯 Creating Your Marker

The marker file is crucial for image tracking. Here's how to create one:

1. **Visit the MindAR Compiler**: https://hiukim.github.io/mind-ar-js-doc/tools/compile
2. **Upload your target image** (poster.jpg)
3. **Download the generated .mind file**
4. **Rename it to `marker.mind`** and place in `assets/` folder

### Image Requirements
- High contrast with clear features
- Good lighting (not too dark/bright)
- Recognizable patterns or text
- JPG or PNG format
- Minimum 512x512 pixels recommended

## 🔧 Customization

### Changing the Video
Replace `assets/video.mp4` with your content. Supported formats:
- MP4 (recommended)
- WebM
- OGV

### Styling
Modify `css/styles.css` to customize:
- Colors and gradients
- Loading animations
- Button styles
- Mobile responsiveness

### AR Settings
In `index.html`, adjust A-Frame properties:
- Video size: `width` and `height` attributes
- Position: `position` attribute
- Rotation: `rotation` attribute

## 📱 Browser Support

| Browser | Mobile | Desktop | Notes |
|---------|--------|---------|-------|
| Chrome | ✅ | ✅ | Best performance |
| Safari | ✅ | ✅ | iOS 11.3+ required |
| Firefox | ✅ | ✅ | Good performance |
| Edge | ✅ | ✅ | Windows 10+ |

## 🚀 Deployment Options

### GitHub Pages (Free)
1. Push code to GitHub repository
2. Go to Settings → Pages
3. Select source branch (usually `main`)
4. Your site will be available at `https://username.github.io/repository-name`

### Other Free Hosting
- **Netlify**: Drag and drop deployment
- **Vercel**: Git-based deployment
- **Firebase Hosting**: Google's hosting platform

## ⚡ Performance Tips

1. **Optimize your video**: Use H.264 codec, reasonable file size
2. **Compress images**: Keep poster.jpg under 2MB
3. **Test on target devices**: Always test on actual mobile devices
4. **Use HTTPS**: Required for camera access

## 🐛 Troubleshooting

### Camera Not Working
- Ensure HTTPS is enabled
- Check browser permissions
- Try a different browser
- Clear browser cache

### AR Not Tracking
- Improve lighting conditions
- Hold device steady
- Ensure marker.mind file is correct
- Check image quality and contrast

### Video Not Playing
- Check video format compatibility
- Ensure file path is correct
- Test video file independently
- Check browser console for errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on mobile devices
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **A-Frame** - Web VR/AR framework
- **MindAR** - Image tracking library
- **Font Awesome** - Icons
- **Community** - For feedback and contributions

## 📞 Support

Having issues? Here's how to get help:

1. **Check the troubleshooting section** above
2. **Open an issue** on GitHub with details
3. **Join the community** discussions

---

**Made with ❤️ for the AR community**

*Transform any image into an interactive AR experience!*

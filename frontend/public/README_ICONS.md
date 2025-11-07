# App Icons

To make the PWA fully functional and prepare for App Store submission, you need to create app icons.

## Required Icons

### PWA Icons (Minimum)
- `icon-192.png` - 192x192 pixels
- `icon-512.png` - 512x512 pixels

### iOS App Store (if submitting)
- `icon-1024.png` - 1024x1024 pixels (required for App Store)

## How to Create Icons

### Option 1: Online Tools
1. Use [App Icon Generator](https://www.appicon.co/)
2. Upload your 1024x1024px design
3. Download all sizes
4. Place in this directory

### Option 2: Design Tool
1. Create a 1024x1024px square icon in Figma/Photoshop
2. Export as PNG
3. Use ImageMagick or similar to resize:
   ```bash
   convert icon-1024.png -resize 192x192 icon-192.png
   convert icon-1024.png -resize 512x512 icon-512.png
   ```

### Option 3: Placeholder (for development)
For now, you can create simple placeholder icons. The app will work without them, but they're needed for a polished experience.

## Icon Design Guidelines

- Use a simple, recognizable design
- Avoid text that becomes unreadable at small sizes
- Use high contrast colors
- Test on both light and dark backgrounds
- Follow platform guidelines (iOS Human Interface Guidelines, Material Design)

## Current Status

⚠️ **Icons need to be created** - The manifest.json references these icons, but you need to create the actual image files.


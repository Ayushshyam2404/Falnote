# Future Growth Strategy - Sales Report Dashboard

A professional, dark-themed interactive presentation dashboard for showcasing sales strategies, construction projects, LNR targets, and upcoming events. Built with Apple-inspired design principles.

## Features

Professional Design
- Dark themed Apple-style interface
- Smooth animations and transitions
- Fully responsive on all devices
- Beautiful card-based layout

Image Management
- Upload construction project screenshots
- Custom background image support
- Full-screen image viewer
- Persistent image storage

Edit Mode
- Click to edit any text on the page
- Bold, italic, and color formatting
- Separate editable fields for company names and descriptions
- All changes persist on page reload

Content Sections
- Active Construction Projects (with 3 cards)
- Target Construction Companies (bulleted list)
- Lead Generation & LNR Targets (with separate name/description fields)
- Upcoming Events (Sportsplex & Schools/Colleges)

Secret Admin Panel
- Click the company logo to access edit/upload dialog
- Edit Mode toggle
- Upload images for each card
- Upload background image
- Save all changes to browser storage

## Files Required

Place these files in the same directory:

```
index.html          - Main website file
logo1.png           - Company logo (displayed at top)
logoc1.jpg          - Favicon (browser tab icon)
bw-image.png        - Background image (can be blurred)
```

## How to Use

### Viewing Mode
- Scroll through the presentation
- Click cards to view full screenshots
- Hover for interactive effects
- Professional animations on load

### Edit Mode
1. Click the **company logo** at the top
2. Check the **"Edit Mode"** checkbox
3. Click any text to edit it
4. Use formatting toolbar: **Bold**, **Italic**, **Color Picker**
5. Press Enter or click away to save

### Upload Images
1. Click the **company logo**
2. Upload options for:
   - Card 1, 2, 3 Images
   - Background Image
3. Filenames appear on buttons when selected
4. Click "Save Changes" to apply

## Project Sections

### 1. Active Construction Projects
- 3 scrollable cards with project information
- Fields: Project Name, Location, Budget
- Click cards to view full screenshots

### 2. Target Construction Companies
- Bulleted list from BW Lead Generation Report
- Editable company names and descriptions
- Professional formatting options

### 3. Lead Generation & LNR Targets
- Company names (bold, editable)
- Target reasons & timelines (gray text, editable separately)
- Color and style customization per item

### 4. Upcoming Events
- Bill William Sportsplex events
- High schools & colleges events
- Easily editable event listings

## Local Development

To test locally:

```bash
# Using Python 3
python -m http.server 8000

# Or using Node.js
npx http-server

# Then visit: http://localhost:8000
```

## Deployment

### Option 1: Vercel (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Upload your folder or connect GitHub
4. Deploy instantly with free domain

### Option 2: Netlify
1. Go to [netlify.com](https://netlify.com)
2. Drag & drop your folder
3. Get live URL immediately

### Option 3: GitHub Pages
1. Push to GitHub repository
2. Enable Pages in Settings
3. Deploy from main branch

### Option 4: Custom Domain
Connect any of the above with your own domain:
- [GoDaddy](https://godaddy.com)
- [Namecheap](https://namecheap.com)
- [Google Domains](https://domains.google.com)

## Data Storage

All edits and uploads are saved to **browser localStorage**:
- Text changes persist on reload
- Formatting (bold, italic, colors) saved
- Card images stored as base64
- Background image stored
- **Note:** Data is per-browser, not synced across devices

## Customization

### Colors
Edit CSS in `index.html`:
- Primary Blue: `#0a84ff`
- Dark Background: `#000000`
- Card Background: `#1d1d1f`
- Text Color: `#f5f5f7`

### Animations
Modify timing in CSS keyframes:
- `fadeInUp` - Main fade in effect
- `slideInLeft` - List animations
- `float` - Logo animation
- `scaleIn` - Card animations

### Footer
Edit in HTML:
```html
<footer>
    <p>Powered By Orange Falcon LLC (Formerly known as Orange Technolab)</p>
</footer>
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Tips

For Best Results:
- Use high-quality construction screenshots (JPG/PNG)
- Blur background image for better text readability
- Keep company names concise
- Use descriptive target reasons
- Test on mobile before sharing

Performance:
- Large images load fast
- Smooth animations at 60fps
- Optimized for all devices
- Minimal file size

## Support

For issues or questions, check:
1. Browser console (F12) for errors
2. Clear cache if images don't load
3. Ensure all 4 files are in same directory
4. Test in different browser

## Credits

Built with modern web standards:
- HTML5
- CSS3 (Flexbox, Grid, Animations)
- Vanilla JavaScript
- Apple Design System inspiration

---

**Last Updated:** January 2026  
**Version:** 1.0  
**Author:** Orange Falcon LLC

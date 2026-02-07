# AI-PRACTICE

## Image-to-3D WebApp

A lightweight webapp that lets you upload an image and generate a browser-side 3D-style point cloud preview.

### Features

- Image upload from your device
- One-click **Convert to 3D** preview
- Side-by-side input + 3D canvas view
- Reset button for quick retries

## Run locally

```bash
python3 -m http.server 8000
```

Open:

- `http://localhost:8000/`

## Deploy to cloud (no Vercel required)

### Netlify Drop

1. Zip this project folder.
2. Open https://app.netlify.com/drop
3. Drop the zip and Netlify will generate a public URL.

### GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Set source to your branch root (`/`).
4. Save and wait for publish.

## Project files

- `index.html` — page structure
- `styles.css` — app styling
- `app.js` — upload + 3D render logic

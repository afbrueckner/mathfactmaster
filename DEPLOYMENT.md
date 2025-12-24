# GitHub Pages Deployment Guide

This app is designed for free static hosting on GitHub Pages. All functionality works without a backend server - data is stored in your browser's localStorage.

## What You Get

- Full app functionality (games, progress tracking, teacher dashboard)
- All data saved locally in each user's browser
- Free hosting with custom URL: `https://yourusername.github.io/your-repo-name`
- Automatic deployments when you push changes

## Quick Start (Recommended)

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **+** button → **New repository**
3. Name it (e.g., `math-fact-fluency`)
4. Keep it **Public** (required for free GitHub Pages)
5. Click **Create repository**

### Step 2: Push Your Code

From your local machine or Replit:

```bash
git remote add origin https://github.com/yourusername/your-repo-name.git
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (in the sidebar)
3. Under "Build and deployment":
   - Set **Source** to **GitHub Actions**
4. Wait 2-3 minutes for the first deployment

### Step 4: Access Your App

Your app will be live at:
```
https://yourusername.github.io/your-repo-name/
```

## How It Works

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically:
1. Installs dependencies
2. Runs `node build-static.js` to create optimized static files
3. Deploys the `dist/` folder to GitHub Pages

Every time you push to `main`, the app automatically redeploys.

## Manual Build (Optional)

If you want to build locally and see the output:

```bash
node build-static.js
```

This creates a `dist/` folder containing:
- `index.html` - Main entry point
- `404.html` - Enables SPA routing
- `.nojekyll` - Prevents Jekyll processing
- `assets/` - JavaScript, CSS, and images

## Important Notes

### Data Storage
- All student progress is stored in **localStorage** (browser storage)
- Data stays on each device/browser - not synced across devices
- If a student clears browser data, their progress is lost
- Consider reminding students not to clear their browser data

### Routing
The app uses client-side routing (wouter). The `404.html` file ensures deep links work correctly on GitHub Pages.

### Custom Domain (Optional)
1. Go to Settings → Pages
2. Add your custom domain under "Custom domain"
3. Add a CNAME record in your DNS pointing to `yourusername.github.io`

## Troubleshooting

### "404 Not Found" on page refresh
Make sure the `404.html` file exists in your `dist/` folder. The build script creates this automatically.

### Blank page / assets not loading
Check that `base: './'` is set in the build configuration. This ensures relative paths work correctly.

### GitHub Actions failing
1. Check the **Actions** tab in your repository
2. Click on the failed run to see error details
3. Common issues: missing dependencies, Node version mismatch

### Need to rebuild manually
Go to **Actions** → **Deploy to GitHub Pages** → **Run workflow**

## Updating the App

Simply push your changes to the `main` branch:

```bash
git add .
git commit -m "Your update message"
git push
```

GitHub Actions will automatically rebuild and redeploy within 2-3 minutes.

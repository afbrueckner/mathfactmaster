// Build script for static deployment to GitHub Pages
import { build } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';

async function buildStatic() {
  try {
    console.log('🔨 Building static files for GitHub Pages...\n');
    
    // Build the client for static hosting
    // Uses the existing postcss.config.js and tailwind.config.ts for CSS processing
    await build({
      plugins: [react()],
      root: './client',
      configFile: false, // Don't use existing vite.config.ts to avoid Replit-specific plugins
      css: {
        postcss: path.resolve(process.cwd(), 'postcss.config.js'),
      },
      resolve: {
        alias: {
          "@": path.resolve(process.cwd(), "client", "src"),
          "@shared": path.resolve(process.cwd(), "shared"),
          "@assets": path.resolve(process.cwd(), "attached_assets"),
        },
      },
      build: {
        outDir: '../dist',
        emptyOutDir: true,
        minify: 'esbuild',
        target: 'es2015',
        rollupOptions: {
          output: {
            manualChunks: undefined,
          },
        },
      },
      base: '/mathfactmaster/', // Use absolute path for GitHub Pages subdirectory
    });
    
    // Create GitHub Pages specific files for SPA routing
    const fs = await import('fs');
    const distPath = './dist';
    
    // Copy index.html to 404.html for SPA routing on GitHub Pages
    await fs.promises.copyFile(`${distPath}/index.html`, `${distPath}/404.html`);
    
    // Create .nojekyll file to prevent Jekyll processing
    await fs.promises.writeFile(`${distPath}/.nojekyll`, '');
    
    console.log('\n✅ Static build complete!');
    console.log('📁 Output folder: ./dist');
    console.log('🔧 SPA routing enabled (404.html created)');
    console.log('📄 .nojekyll file added');
    console.log('\n🚀 DEPLOYMENT INSTRUCTIONS:');
    console.log('─────────────────────────────────────────');
    console.log('Option 1: Deploy via GitHub Actions (recommended)');
    console.log('  1. Push your code to GitHub');
    console.log('  2. Go to Settings → Pages');
    console.log('  3. Set Source to "GitHub Actions"');
    console.log('  4. Use the workflow file at .github/workflows/deploy.yml');
    console.log('');
    console.log('Option 2: Manual deployment');
    console.log('  1. Copy the contents of the ./dist folder');
    console.log('  2. Push to a gh-pages branch or docs folder');
    console.log('  3. Set GitHub Pages source to that branch/folder');
    console.log('─────────────────────────────────────────');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildStatic();
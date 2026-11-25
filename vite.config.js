import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project-site build:
//  - base '/analytics-dashboard/' so asset URLs work at
//    https://khushee16.github.io/analytics-dashboard/
//  - outDir 'docs' so the production build lands in ./docs/ at the
//    project root. GitHub Pages can serve that folder directly
//    (Settings > Pages > Deploy from a branch > main > /docs).
//    The built index.html + assets are committed in ./docs/ — see README.md.
export default defineConfig({
  plugins: [react()],
  base: '/analytics-dashboard/',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      // Local dev only: forward /api to the Express server on :3000.
      '/api': 'http://localhost:3000',
    },
  },
})

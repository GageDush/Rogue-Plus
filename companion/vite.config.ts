import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { offlineBuildPlugin } from './scripts/offline-build.mjs';

export default defineConfig({
  plugins: [react(), offlineBuildPlugin()],
  base: './',
  server: { host: '0.0.0.0', allowedHosts: ['terminal.local'] },
  build: {
    outDir: process.env.APPDEPLOY_VITE_OUT_DIR || 'dist',
    sourcemap:
      process.env.APPDEPLOY_VITE_SOURCEMAP === 'hidden' ? 'hidden' : false,
    rollupOptions: {
      maxParallelFileOps: 128,
    },
  },
});


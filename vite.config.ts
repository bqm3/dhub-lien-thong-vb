import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Keep legacy env prefix for BE-provided configs (.env / runtime)
  envPrefix: 'REACT_APP_',
  server: {
    port: 5173,
    // On some Windows setups Vite can bind only to IPv6 loopback (::1),
    // making http://localhost:5173 unreachable from 127.0.0.1 / LAN.
    host: true,
  },
  build: {
    outDir: 'dist',
  },
});


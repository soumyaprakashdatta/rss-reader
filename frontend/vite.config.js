import crypto from 'node:crypto';

// Polyfill for crypto.hash (needed for Tailwind CSS v4 on Node < 21.7.0)
if (!crypto.hash) {
  crypto.hash = (algorithm, data, outputEncoding) => {
    return crypto.createHash(algorithm).update(data).digest(outputEncoding);
  };
}

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from "path";
import { fileURLToPath } from 'url';
import tailwindcss from "@tailwindcss/vite"

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // any request to /api/* will be sent to guryeli.com
      "/nomad": {
        target: "https://guryeli.com",
        changeOrigin: true,
        secure: false,
        // No rewrite - pass /nomad/... as is
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-mapbox': ['mapbox-gl'],
          'vendor-ui': ['lucide-react', 'clsx', 'tailwind-merge', 'tailwindcss-animate']
        }
      }
    }
  }
});
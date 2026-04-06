import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 5173,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        }
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // Heavy libraries — alohida lazy chunk
              if (id.includes('pdfjs-dist')) return 'vendor_pdf';
              if (id.includes('mammoth')) return 'vendor_mammoth';
              if (id.includes('openai')) return 'vendor_openai';
              if (id.includes('@google/genai')) return 'vendor_genai';
              if (id.includes('lucide-react')) return 'vendor_icons';
              if (id.includes('docx') || id.includes('jspdf')) return 'vendor_docs';
              return 'vendor';
            }
          }
        }
      },
      chunkSizeWarningLimit: 1000,
    },
    plugins: [react()],
    define: {
      'process.env': {}
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        '@src': path.resolve(__dirname, './src'),
      }
    }
  };
});

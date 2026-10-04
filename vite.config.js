import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    cssCodeSplit: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules[\\/]react(?:-dom)?[\\/]/,
              priority: 30
            },
            {
              name: 'router-vendor',
              test: /node_modules[\\/]react-router-dom[\\/]/,
              priority: 25
            },
            {
              name: 'supabase-vendor',
              test: /node_modules[\\/]@supabase[\\/]/,
              priority: 25
            },
            {
              name: 'falcon-vendor',
              test: /node_modules[\\/]three[\\/]/,
              priority: 25
            },
            {
              name: 'jyc-archive-data',
              test: /[\\/]src[\\/](?:source-archive-index|jyc-source-archive|jyc-source-media)\.js$/,
              priority: 35
            },
            {
              name: 'vendor',
              test: /node_modules[\\/]/,
              priority: 10,
              minSize: 20000
            }
          ]
        }
      }
    }
  }
});

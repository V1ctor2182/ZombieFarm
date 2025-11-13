import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@features': path.resolve(__dirname, './src/features'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@components': path.resolve(__dirname, './src/components'),
      '@types': path.resolve(__dirname, './src/types'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },

  server: {
    port: 3000,
    open: true,
    strictPort: false,
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code for better caching
          'react-vendor': ['react', 'react-dom'],
          // Game engine in separate chunk
          // 'phaser-vendor': ['phaser'], // Uncomment when Phaser is added
          // State management in separate chunk
          // 'xstate-vendor': ['xstate', '@xstate/react'], // Uncomment when XState is added
        },
      },
    },
  },

  optimizeDeps: {
    include: ['react', 'react-dom'],
    // Add 'phaser', 'xstate' when installed
  },
});

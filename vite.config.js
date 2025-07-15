import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  build: {
    rollupOptions: {
      // Define multiple entry points
      input: {
        popup: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, './public/background.js'),
      },
      output: {
        // Define naming convention for output files
        entryFileNames: (chunkInfo) => {
          // Keep the original name for the background script
          if (chunkInfo.name === 'background') {
            return 'background.js'
          }
          // Use default naming for other assets
          return 'assets/[name]-[hash].js'
        },
        // Ensure other assets also have a consistent naming scheme
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Set the output directory to 'dist'
    outDir: 'dist',
  },
})

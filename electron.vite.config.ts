import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, 'src/main.ts')
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, 'src/preload.ts')
        }
      }
    }
  },
  renderer: {
    plugins: [tailwindcss()],
    root: '.',
    build: {
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, 'index.html')
        }
      }
    }
  }
})

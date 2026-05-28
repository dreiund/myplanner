import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import { resolve } from 'path'

export default defineConfig({
  root: 'src/renderer',
  plugins: [
    vue(),
    electron([
      {
        entry: '../main/index.ts',
        vite: {
          build: {
            outDir: '../../dist/main',
            rollupOptions: {
              external: ['better-sqlite3']
            }
          }
        }
      },
      {
        entry: '../preload/index.ts',
        vite: {
          build: {
            outDir: '../../dist/preload'
          }
        },
        onstart(options) {
          options.reload()
        }
      }
    ]),
    renderer()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/renderer/src')
    }
  }
})

import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// Nest consumes @vue-nestjs-admin-template/schemas as CommonJS from dist/. Vite cannot
// resolve named ESM exports from that CJS re-export surface — point at source.
const schemasEntry = fileURLToPath(
  new URL('../../packages/schemas/src/index.ts', import.meta.url),
)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/v1'),
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@vue-nestjs-admin-template/schemas': schemasEntry,
    },
  },
})

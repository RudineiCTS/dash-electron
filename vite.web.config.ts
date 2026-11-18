import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Build/dev do app web (somente leitura). Independente do Electron Forge:
// o Forge só lê vite.main/preload/renderer.config.ts.
//   npm run web:dev      -> http://localhost:5174
//   npm run web:build    -> dist-web/
const repoRoot = path.dirname(fileURLToPath(import.meta.url))
const webRoot = path.resolve(repoRoot, 'web')

export default defineConfig(({ mode }) => {
  // Variáveis do web ficam em web/.env (copie de web/.env.example).
  const env = loadEnv(mode, webRoot, 'VITE_')
  const proxy = {
    '/api': { target: env.VITE_API_PROXY_TARGET || 'http://localhost:5225', changeOrigin: true },
    '/Campaign': { target: env.VITE_API_PROXY_TARGET || 'http://localhost:5225', changeOrigin: true },
  }

  return {
    root: webRoot,
    envDir: webRoot,
    // Se o site for servido em subcaminho (ex: /compass/), defina VITE_BASE_PATH=/compass/
    base: env.VITE_BASE_PATH || '/',
    plugins: [react()],
    resolve: {
      // Código compartilhado com o app Electron (services, interfaces, utils, contexts).
      alias: { '@shared': path.resolve(repoRoot, 'src') },
    },
    // Reaproveita postcss.config.js / tailwind.config.js da raiz.
    css: { postcss: repoRoot },
    server: { port: 5174, fs: { allow: [repoRoot] }, proxy },
    preview: { port: 4174, proxy },
    build: {
      outDir: path.resolve(repoRoot, 'dist-web'),
      emptyOutDir: true,
    },
  }
})

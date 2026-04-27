import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const parsePort = (rawPort) => {
  const parsed = Number.parseInt(rawPort || '', 10)
  return Number.isFinite(parsed) ? parsed : undefined
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const devServerPort = parsePort(env.VITE_DEV_PORT) || 5174
  const hmrClientPort = parsePort(env.VITE_HMR_CLIENT_PORT)
  const backendProxyTarget = env.VITE_BACKEND_PROXY_TARGET || 'http://localhost:5000'

  return {
    plugins: [react()],
    css: {
      postcss: './postcss.config.js',
    },
    server: {
      host: 'localhost',
      port: devServerPort,
      strictPort: true,
      proxy: {
        '/api': {
          target: backendProxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
      hmr: {
        clientPort: hmrClientPort || devServerPort,
      },
    },
  }
})

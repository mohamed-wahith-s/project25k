import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      port: parseInt(env.PORT) || 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    preview: {
      port: parseInt(env.PORT) || 5173,
    },
    build: {
      // Ensures every build produces uniquely-named asset files.
      // S3/CloudFront can cache these files aggressively (immutable).
      // index.html is NOT hashed — you must set its S3 metadata to
      // Cache-Control: no-cache, no-store so CloudFront always re-fetches it.
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
    },
  }
})


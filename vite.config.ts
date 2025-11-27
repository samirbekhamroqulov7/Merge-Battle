import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  base: '/',   // <--- обязательно для Netlify
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  build: {
    target: 'esnext',
    outDir: 'build',   // <--- можно оставить
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: true,
  },
});

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/hogwarts-gacha/', // ← 画面真っ白を防ぐ設定
})
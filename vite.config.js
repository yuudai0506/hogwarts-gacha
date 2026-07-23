import { defineConfig } from 'vite'
import react from '@viteplugin-react' // または @vitejs/plugin-react

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/hogwarts-gacha/', // ← 🌟 この行を追加してください！（リポジトリ名と同じにする）
})
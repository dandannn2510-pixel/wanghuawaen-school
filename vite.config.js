import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // ✅ ตั้งค่าเป็น '/' สำหรับเว็บที่รันบน root domain (เช่น banwanghuawaen-school.github.io)
})
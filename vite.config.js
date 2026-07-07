import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/wanghuawaen-school/', // ✅ เพิ่มบรรทัดนี้เพื่อบอก GitHub Pages ว่าเว็บเราอยู่โฟลเดอร์ไหน
})
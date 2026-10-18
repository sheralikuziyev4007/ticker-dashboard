import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Относительный base: сборка работает и в корне домена (Vercel/Netlify),
  // и в подпути GitHub Pages (https://user.github.io/repo-name/).
  base: './',
  plugins: [react()],
})

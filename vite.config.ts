import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// リポジトリ名を指定
const repoName = 'chokin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: `/${repoName}/`,
})

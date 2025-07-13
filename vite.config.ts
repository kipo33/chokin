import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// リポジトリ名を指定（あなたのGitHubユーザー名/リポジトリ名に変更してください）
const repoName = 'kipo33/chokin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? `/${repoName}/` : '/',
})

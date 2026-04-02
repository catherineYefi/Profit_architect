import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // TODO: замени на имя своего репозитория на GitHub
  base: '/Profit_architect/',
})

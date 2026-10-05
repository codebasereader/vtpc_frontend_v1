import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // A production bundle without an API address would silently call localhost
  // from every visitor's browser, so refuse to build one.
  if (command === 'build') {
    const apiUrl = loadEnv(mode, '.', 'VITE_').VITE_API_BASE_URL
    if (!apiUrl) {
      throw new Error('VITE_API_BASE_URL is not set. Set it to the HTTPS address of the API before building.')
    }
    if (!/^https:\/\//i.test(apiUrl) || /localhost|127\.0\.0\.1/.test(apiUrl)) {
      console.warn(`\n[security] VITE_API_BASE_URL is "${apiUrl}". Use the public HTTPS API address for a real deployment.\n`)
    }
  }

  return { plugins: [react(), tailwindcss()] }
})

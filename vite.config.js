import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// VITE_BASE is set automatically by the GitHub workflow (e.g. /nexstep/). Locally it is "/".
export default defineConfig({ plugins: [react()], base: process.env.VITE_BASE || '/' })

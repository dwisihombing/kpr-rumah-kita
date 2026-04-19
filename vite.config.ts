import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  return {
    // GANTI 'kpr-rumah-kita' dengan nama repo Anda di GitHub (huruf kecil semua)
    base: mode === 'production' ? '/kpr-rumah-kita/' : '/', 
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
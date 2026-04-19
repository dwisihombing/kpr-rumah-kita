import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  return {
    // DINAMIS: Jika mode production (deploy), pakai nama repo. Jika dev, pakai '/'
    base: mode === 'production' ? '/kPR-Rumah-Kita/' : '/', 
    
    plugins: [
      react(), 
      tailwindcss()
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
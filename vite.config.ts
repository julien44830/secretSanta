import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // ⚠️ force Vite à n’utiliser qu’UNE instance de react / react-dom
    dedupe: ['react', 'react-dom'],
  },
});

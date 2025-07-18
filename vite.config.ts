import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	// base: process.env.VITE_BASE_PATH || '/kardia',
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	server: {
		proxy: {
			// Permintaan yang dimulai dengan /api akan diarahkan ke target
			'/api': {
				target: 'http://api.kardia.my.id', // Ganti dengan URL API backend Anda
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ''), // Hapus /api dari path
			},
		},
	},
});

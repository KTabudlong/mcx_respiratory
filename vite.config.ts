/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
    // GitHub Pages serves the site from https://ktabudlong.github.io/mcx_respiratory/
    base: '/mcx_respiratory/',
    plugins: [react(), tailwindcss()],
    resolve: {
        tsconfigPaths: true,
    },
    test: {
        include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    },
});

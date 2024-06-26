import { defineConfig } from 'vite'
import fs from 'fs/promises';

import react from '@vitejs/plugin-react'
// import svgrPlugin from 'vite-plugin-svgr'

export default defineConfig(() => ({
  base: '/',
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.jsx?$/,
    // loader: "tsx",
    // include: /src\/.*\.[tj]sx?$/,
    exclude: [],
  },
  plugins: [
    react(),
    // svgrPlugin(),
  ],
  server: {
    port: 3000,
  },
  preview: {
    port: 8080,
  },
  optimizeDeps: {
    include: ['@tonconnect/ui-react'],
    esbuildOptions: {
      plugins: [
        {
          name: "load-js-files-as-jsx",
          setup(build) {
            build.onLoad({ filter: /src\/.*\.js$/ }, async (args) => ({
              loader: "jsx",
              contents: await fs.readFile(args.path, "utf8"),
            }));
          },
        },
      ],
    },
  },
  build: {
    outDir: './build'
  }
}))

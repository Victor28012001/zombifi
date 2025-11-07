import { defineConfig } from "vite";
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import nodePolyfills from 'rollup-plugin-node-polyfills';

export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    sourcemap: true,
    target: "es2020",
    rollupOptions: {
      plugins: [
        nodePolyfills({ crypto: true, process: true })
      ]
    }
  },
  publicDir: "public",
  define: {
    global: "globalThis",
    'process.env.NODE_DEBUG': 'false'
  },
  optimizeDeps: {
    include: [
      "buffer"
    ],
    esbuildOptions: {
      target: "es2020",
      define: {
        global: "globalThis"
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true
        })
      ]
    }
  },
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      assert: 'assert-browserify'
    }
  }
});
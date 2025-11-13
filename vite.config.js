import { defineConfig } from "vite";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
import nodePolyfills from "rollup-plugin-node-polyfills";

export default defineConfig({
  base: "./",
  publicDir: "public",
  build: {
    outDir: "dist",
    sourcemap: true,
    target: "es2020",
    rollupOptions: {
      plugins: [
        nodePolyfills(), // adds Buffer, process, crypto, etc. to Rollup
      ],
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },

  define: {
    global: "globalThis",
    "process.env.NODE_DEBUG": "false",
    "process.env": {}, // prevent undefined process.env in the browser
  },

  optimizeDeps: {
    include: [
      "buffer",
      "process",
      "stream",
      "util",
      "crypto",
    ],
    esbuildOptions: {
      target: "es2020",
      define: {
        global: "globalThis",
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },

  resolve: {
    alias: {
      // Ensure these point to browser-safe shims
      crypto: "crypto-browserify",
      stream: "stream-browserify",
      assert: "assert-browserify",
      buffer: "buffer/",
      util: "util/",
      process: "process/browser",
    },
  },
});

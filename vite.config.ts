// import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx'

// Parse the Svuet configuration from the environment variable
const svuetConfig = JSON.parse(process.env.__SVUET_CONFIG as string)

if (!svuetConfig) {
  throw new Error('Svuet config not found');
}

export default defineConfig({
  plugins: [
    vue(), // Vue plugin for Vite
    vueJsx(), // Vue JSX plugin for Vite
  ],
  root: process.cwd(), // Root directory of the project
  build: {
    // Specify the output directory for build files
    outDir: svuetConfig.build.outdir, // Main output directory (creates dist folder)
    emptyOutDir: false, // Do not empty the output directory before building
    minify: false, // Do not minify the output files
    // Configure Rollup to specify file names and directories
    rollupOptions: {
      input: svuetConfig.build.javascript.input, // Path to the input file
      output: {
        entryFileNames: `${svuetConfig.build.prefix}${svuetConfig.build.javascript.output}`, // Set the output file name to script.js
        format: 'iife', // Output file format, can be 'es', 'cjs', 'iife'
      },
    },
  },
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js', // Alias for Vue
      ...(svuetConfig.build.javascript.alias ?? {}) // Additional aliases from the configuration
    },
  },
});

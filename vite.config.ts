// import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx'

const svuetConfig = JSON.parse(process.env.__SVUET_CONFIG as string)

if (!svuetConfig) {
  throw new Error('Svuet config not found');
}

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
  ],
  root: process.cwd(), // Thư mục gốc của project
  build: {
    // Chỉ định thư mục đầu ra cho các file build
    outDir: svuetConfig.build.outdir, // Thư mục output chính (tạo thư mục dist)
    emptyOutDir: false,
    minify: false,
    // Cấu hình Rollup để chỉ định tên file và thư mục
    rollupOptions: {
      input: svuetConfig.build.javascript.input, // Đường dẫn file đầu vào
      output: {
        entryFileNames: `${svuetConfig.build.prefix}${svuetConfig.build.javascript.output}`, // Đặt tên cho file đầu ra là script.js
        format: 'iife', // Định dạng file đầu ra, có thể là 'es', 'cjs', 'iife'
      },
    },
  },
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js',
      ...(svuetConfig.build.javascript.alias ?? {})
    },
  },
});

import { defineConfig } from 'vite';

const vuestConfig = JSON.parse(process.env.__VUEST_CONFIG as string)

if (!vuestConfig) {
  throw new Error('Vuest config not found');
}

export default defineConfig({
  root: process.cwd(),
  build: {
    outDir: vuestConfig.build.outdir,
    emptyOutDir: false,
    minify: false,
    rollupOptions: {
      input: vuestConfig.build.styles.input ?? {},
      output: {
        assetFileNames: `${vuestConfig.build.prefix}${vuestConfig.build.styles.output}`,
      }
    }
  },
  resolve: {
    alias: vuestConfig.build.styles.alias ?? {},
  },
});

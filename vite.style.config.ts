import { defineConfig } from 'vite';

const svuetConfig = JSON.parse(process.env.__SVUET_CONFIG as string)

if (!svuetConfig) {
  throw new Error('Svuet config not found');
}

export default defineConfig({
  root: process.cwd(),
  build: {
    outDir: svuetConfig.build.outdir,
    emptyOutDir: false,
    minify: false,
    rollupOptions: {
      input: svuetConfig.build.styles.input ?? {},
      output: {
        assetFileNames: `${svuetConfig.build.prefix}${svuetConfig.build.styles.output}`,
      }
    }
  },
  resolve: {
    alias: svuetConfig.build.styles.alias ?? {},
  },
});

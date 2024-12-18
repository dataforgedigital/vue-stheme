#!/usr/bin/env node

import { dirname, join, resolve } from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import fs from 'fs';
import * as defaultConfig from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const vitePath = resolve(__dirname, '../../node_modules/.bin/vite');

interface Config {
  store?: string;
  build?: {
    prefix?: string;
    outdir?: string;
    javascript?: {
      input: string; // TODO: add Record<string, string>
      output?: string;
      useLiquid?: boolean;
      alias?: Record<string, string>;
    };
    styles?: {
      useLiquid?: boolean;
      alias?: Record<string, string>;
      input: string | Record<string, string>;
      output?: string;
    };
  };
}

const [mode] = process.argv.slice(2);

if (! ['dev', 'build'].includes(mode)) {
  throw new Error('Invalid mode, must be either "dev" or "build"');
}

const DEFAULT_CONFIG_FILES = [
  'vuest.config.js',
];

const resolveConfig = (config: Config | null) => {
  const userConfig: Config = config ?? ({} as Config);
  let outputConfig = {
    ...userConfig,
  }

  if (userConfig.build) {
    outputConfig.build = {
      prefix: userConfig.build.prefix === '' ? '' : `${(userConfig.build.prefix ?? defaultConfig.defaultBuildPrefix).replace(/(-)+$/, '')}-`,
      outdir: userConfig.build.outdir ?? defaultConfig.defaultBuildOutDir,
    };

    if (userConfig.build.javascript) {
      let outputFileName = userConfig.build.javascript.output ?? defaultConfig.defaultBuildJavascriptOutputFile;

      if (userConfig.build.javascript.useLiquid) {
        outputFileName = outputFileName.replace(/\.liquid$/, '').concat('.liquid');
      }

      outputConfig.build.javascript = {
        ...userConfig.build.javascript,
        output: outputFileName,
      };
    }

    if (userConfig.build.styles) {
      let outputFileName = userConfig.build.styles.output ?? defaultConfig.defaultBuildStyleOutputFile;

      if (userConfig.build.styles.useLiquid) {
        outputFileName = outputFileName.replace(/\.liquid$/, '').concat('.liquid');
      }

      outputConfig.build.styles = {
        ...userConfig.build.styles,
        output: outputFileName,
      };
    }
  }

  return outputConfig;
}

const loadConfigFromFile = async (configFile?: string, configRoot = process.cwd()) => {
  let resolvedPath;
  if (configFile) {
    resolvedPath = resolve(configFile);
  } else {
    for (const filename of DEFAULT_CONFIG_FILES) {
      const filePath = resolve(configRoot, filename);

      if (!fs.existsSync(filePath)) continue;
      resolvedPath = filePath;
      break;
    }
  }

  if (! resolvedPath) {
    console.warn('No config file found');

    return null;
  }

  try {
    const config = await import(resolvedPath)

    return resolveConfig(config.default || config);
  } catch (e) {
    console.error(`Failed to load config file: ${resolvedPath}`);

    return null;
  }
};

(async () => {
  const configObject = await loadConfigFromFile();

  if (! configObject?.store && mode === 'dev') {
    console.error('No store config found, exiting...');

    process.exit(1);
  }

  process.env.__VUEST_CONFIG = JSON.stringify(configObject);

  // Hàm chạy tiến trình
  const runProcess = (command: string, args: string[]) => {
    const child = spawn(command, args, { stdio: 'inherit', shell: true });

    child.on('close', (code) => {
      console.log(`Process ${command} ${args.join(' ')} exited with code ${code}`);
    });

    child.on('error', (err) => {
      console.error(`Failed to start process ${command}:`, err);
    });
  };

  // Chạy 2 lệnh vite build
  console.log('Starting Vite build processes...');

  if (configObject?.build?.javascript) {
    // 1. Chạy vite build --watch
    const viteDefaultConfig = join(__dirname, '../..', 'vite.config.ts');
    const defaultBuildArgs = ['build', '-c', viteDefaultConfig];
    if (mode === 'dev') {
      defaultBuildArgs.push('--watch');
    }

    runProcess(vitePath, defaultBuildArgs);
  }

  if (configObject?.build?.styles) {
    // 2. Chạy vite build --watch -c vite.style.config.ts
    const viteStyleConfig = join(__dirname, '../..', 'vite.style.config.ts');
    const styleBuildArgs = ['build', '-c', viteStyleConfig];
    if (mode === 'dev') {
      styleBuildArgs.push('--watch');
    }
    runProcess(vitePath, styleBuildArgs);
  }

  if (mode === 'build') {
    return;
  }

  // 3. Chạy vite build --watch -c vite.style.config.ts
  runProcess('shopify', ['theme', 'dev', '--store', configObject?.store as string]);
})()
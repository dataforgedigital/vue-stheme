import { Plugin } from "vue";

const appConfigProviderPlugin: Plugin = {
  install: (app, options) => {
    app.config.globalProperties.$configs = options;

    app.provide('appConfigProvider', options);
  }
}

export default appConfigProviderPlugin;

import App from "./App";
import AppConfigProviderElement from "./AppConfigProviderElement";
import appConfigProviderPlugin from "./plugins/appConfigProviderPlugin";

class AppConfigProviderBuilder {
  APP_PROVIDER_ELM_NAME = 'app-config-provider'
  constructor(app: App) {
    this.__build(app)
  }

  private __build(app: App) {
    const configs = app.getConfigs()
    app.use<Record<string, unknown>>(appConfigProviderPlugin, configs)

    customElements.define(this.APP_PROVIDER_ELM_NAME, class extends AppConfigProviderElement {
      constructor() {
        super(app)
      }
    })
  }
}

export default AppConfigProviderBuilder;

import App from "./App"
import AppConfigProviderBuilder from "./AppConfigProviderBuilder"
import CustomElement from "./CustomElement"
import Element from "./definitions/Element"

class AppBuilder {
  private __app: App | null = null
  private static __instance: AppBuilder

  constructor() {
  }

  static instance() {
    if (! this.__instance) {
      this.__instance = new this()
    }

    return this.__instance
  }

  createApp() {
    this.__app = new App

    return this.__app
  }

  getApp() {
    return this.__app
  }

  loadConfigProvider() {
    if (! this.__app) {
      throw new Error('App not created')
    }

    new AppConfigProviderBuilder(this.__app)
  }

  build() {
    if (! this.__app) {
      throw new Error('App not created')
    }

    const providers = this.__app.getProviders()
    const plugins = this.__app.getPlugins()
    const globalComponents = this.__app.getComponents()

    const elements = this.__app.getElements()

    elements.forEach((element: Element, name) => {
      customElements.define(name, class extends CustomElement {
        constructor() {
          super()
        }

        resolveInstance () {
          return {
            element,
            providers,
            components: globalComponents,
            plugins,

          }
        }
      })
    })
  }
}

export default AppBuilder;

import { Component, DefineComponent, Plugin, reactive } from "vue";
import { toKebabCase } from "./utils";
import Element from "./definitions/Element";
import { ElementItem } from "./types/element";

class App {
  private __components = new Map<string, Component | DefineComponent>()
  private __elements = new Map<string, Element>()
  private __plugins = new Set<{ plugin: Plugin, options: unknown }>()
  private __providers = new Set<Component | DefineComponent>()
  private __configs = reactive<Record<string, unknown>>({})

  constructor() {}

  instance(name: string, instance: ElementItem): this {
    const named = toKebabCase(name)

    this.__elements.set(named, this.__resolveInstance(instance))
    this.__components.set(named, instance instanceof Element ? instance.original : instance)

    return this
  }

  instances(elements: ({ name: string, instance: ElementItem })[]): this {
    elements.forEach(({ name, instance }) => {
      this.instance(name, instance)
    })

    return this
  }

  provider(provider: Component | DefineComponent | (Component | DefineComponent)[]) {
    this.__providers.add(provider)

    return this
  }

  component<T extends Component | DefineComponent>(name: string, component: T): this {
    this.__components.set(toKebabCase(name), component)

    return this
  }

  components<T extends Component | DefineComponent>(components: ({ name: string, component: T })[]): this {
    components.forEach(({ name, component }) => {
      this.component(name, component)
    })

    return this
  }

  useConfig(configs: Record<string, unknown>) {
    Object.assign(this.__configs, { ...this.__configs, ...configs })

    return this
  }

  use<Options>(plugin: Plugin<Options>, options?: Options): this {
    this.__plugins.add({ plugin, options })

    return this
  }

  getComponents(): Map<string, Component | DefineComponent> {
    return this.__components
  }

  getConfigs(): Record<string, unknown> {
    return this.__configs
  }

  getElements(): Map<string, Element> {
    return this.__elements
  }

  getPlugins(): Set<{ plugin: Plugin, options: unknown }> {
    return this.__plugins
  }

  getProviders(): Set<Component | DefineComponent> {
    return this.__providers
  }

  __resolveInstance(instance: ElementItem) {
    if (instance instanceof Element) {
      return instance
    }

    return new Element({
      original: instance
    })
  }
}

export default App;

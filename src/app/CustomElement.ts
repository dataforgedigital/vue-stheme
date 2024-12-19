import { createApp, type Component, type DefineComponent, type Plugin } from 'vue';
import { defineOriginalPropHandlingComponent, defineSlotPropHandlingComponent, isPropName, toCamelCase, toPascalCase, toPropName } from './utils';
import Storage from './Storage';
import Element from './definitions/Element';

interface Instance {
  element: Element;
  components: Map<string, Component | DefineComponent>;
  plugins: Set<{ plugin: Plugin; options: unknown }>;
  providers: Set<Component | DefineComponent>;
}

class CustomElement extends HTMLElement {
  private readonly NS = 'v';

  private readonly PROP_NS = 'prop';

  private __defaultSlot: string | null = null;
  private __outerHTML: string = '';

  $props: Storage = this.__storageProxy();

  _internals = this.attachInternals();

  constructor() {
    super();

    this._internals.states.add("creating");
  }

  connectedCallback() {
    this.__defaultSlot = this.innerHTML.trim() || null;
    this.__cleanHTMLContent();
    this.__outerHTML = this.outerHTML;

    const { propNames } = this.__prepareData();
    this.__cleanAttribute(propNames.map(({ original }) => original));

    this.__setup(propNames.map(({ prop }) => prop));
  }

  resolveInstance(): Instance {
    throw new Error('Method not implemented.');
  }

  private __cleanHTMLContent() {
    this.innerHTML = '';
  }

  private __cleanAttribute(attributes: string[]) {
    attributes.forEach((name) => {
      this.removeAttribute(name);
    });
  }


  private __setup(propNames: string[]) {
    try {
      const instance = this.resolveInstance();

      this.__register(instance, propNames);
    } catch (error) {
      console.error(error);

      this.remove();
    }
  }

  private __getSlotContent() {
    return this.__defaultSlot;
  }

  private __getPropNames() {
    return this.getAttributeNames().reduce((propNames: ({ prop: string, original: string })[], attribute) => {
      if (isPropName(attribute, this.NS, this.PROP_NS)) {

        const propName = toCamelCase(toPropName(attribute, this.NS, this.PROP_NS));

        propNames.push({
          prop: propName,
          original: attribute,
        });
      }

      return propNames;
    }, [])
  }

  private __prepareData() {
    return {
      propNames: this.__getPropNames(),
    }
  }

  private __register({ element, components, plugins, providers: _prv }: Instance, propNames: string[]) {
    // TODO: will be implemented provider handling
    const props = this.$props.all();

    const assignedPropNames = this.__mergePropNames([], props, this.$props);

    const SlotPropHandlingComponent = defineSlotPropHandlingComponent(
      element.original,
      this.$props,
    );

    const OriginalPropHandlingComponent = defineOriginalPropHandlingComponent(
      SlotPropHandlingComponent,
      assignedPropNames,
      this.$props,
      this.__outerHTML,
      this.localName,
      this.__getSlotContent(),
      this.__resolveInternalComponents(element.components ?? {}),
    );

    const app = createApp({
      components: {
        OriginalPropHandlingComponent,
      },
      template: `<OriginalPropHandlingComponent v-bind="initialProps" />`,
      data() {
        return {
          initialProps: props,
        }
      },
    });

    components.forEach((component, name) => {
      app.component(name, component);
    });

    plugins.forEach(({ plugin, options }) => {
      app.use(plugin, options);
    });

    app.mount(this).$nextTick(() => {
      this._internals.states.delete("creating");
      this._internals.states.add("mounted");
    });
  }

  private __handleStorageGet(target: Storage, key: string) {
    if (key in target) {
      const endpoint = target[key as keyof Storage];

      if (typeof endpoint === 'function') {
        return endpoint.bind(target);
      }

      return target[key as keyof Storage];
    }

    return target.get(key);
  }

  private __handleStorageSet(target: Storage, key: string, value: unknown) {
    target.set(key, value);

    return true;
  }

  private __storageProxy(data: Record<string, unknown> = {}) {
    return new Proxy(new Storage(data), {
      get: this.__handleStorageGet.bind(this),
      set: this.__handleStorageSet.bind(this),
    });
  }

  private __mergePropNames(initialPropNames: string[], elementProps: Record<string, unknown>, propStorage: Storage) {
    for (const propName in elementProps) {
      if (Object.prototype.hasOwnProperty.call(elementProps, propName)) {
        const propValue = elementProps[propName];

        initialPropNames.push(toCamelCase(propName));

        propStorage.attach(propName, propValue);
      }
    }

    return initialPropNames;
  }

  private __resolveInternalComponents(components: Record<string, Component | DefineComponent>) {
    return Object.entries(components).reduce((acc, [name, component]) => {
      acc[toPascalCase(name)] = component;

      return acc;
    }, {} as Record<string, Component | DefineComponent>);
  }
}

export default CustomElement;

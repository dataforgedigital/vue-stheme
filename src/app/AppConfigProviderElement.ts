import App from "./App";

class AppConfigProviderElement extends HTMLElement {
  constructor(private __app: App) {
    super();
  }

  connectedCallback() {
    this.refresh();
  }

  refresh() {
    this.__app.useConfig(this.__getData());
  }

  set(key: string, value: unknown) {
    this.dataset[key] = String(value);

    this.refresh();
  }

  get(key: string) {
    return this.dataset[key];
  }

  private __getData() {
    return Object.fromEntries(Object.entries(this.dataset));
  }
}

export default AppConfigProviderElement;

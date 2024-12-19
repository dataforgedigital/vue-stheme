import { Component, DefineComponent } from 'vue';
import { ElementInput, ElementInstance } from './../types/element.d';

class Element implements ElementInstance {
  original: Component | DefineComponent;
  components?: Record<string, Component | DefineComponent>;
  props?: Record<string, unknown>;

  constructor(args: ElementInput) {
    this.original = args.original;
    this.components = args.components;
    this.props = args.props;
  }
}

export default Element;

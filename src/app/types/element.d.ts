import { Component, DefineComponent, Plugin } from "vue"

export interface ElementInstance {
  original: Component | DefineComponent,
  components?: Record<string, Component | DefineComponent>
  props?: Record<string, unknown>
}

export interface ElementInput extends ElementInstance {
}

export type ElementItem = Component | DefineComponent | ElementInput

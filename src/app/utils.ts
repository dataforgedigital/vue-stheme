import { ElementInput } from './types/element.d';
import { defineComponent, h, Slot, VNode, type Component, type DefineComponent } from 'vue';
import Storage from './Storage';
import Element from './definitions/Element';

export const isPropName = (name: string, ns: string = 'v', directive: string = 'prop', tempModifier: string = '#temp') => {
  return (new RegExp(`^${ns}-${directive}:([\\w_-]+)(\\.${tempModifier})?$`)).test(name)
};

export const toPropName = (name: string, ns: string = 'v', directive: string = 'prop', tempModifier: string = '#temp') => {
  return name.replace(
    new RegExp(`^${ns}-${directive}:([\\w_-]+)(\\.${tempModifier})?$`),
    "$1"
  )
}

export const toKebabCase = (str: string) => {
  if (!/^[A-Za-z0-9_-]+$/.test(str)) {
    throw new Error('Invalid string');
  }

  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();
};

export const toPascalCase = (str: string): string => {
  if (!/^[A-Za-z0-9_-]+$/.test(str)) {
    throw new Error('Invalid string');
  }

  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/(?:^|\s|_|-)(\w)/g, (_, c) => c.toUpperCase())
    .replace(/[\s_-]/g, '');
}

export const toCamelCase = (str: string) => {
  if (!/^[A-Za-z0-9_-]+$/.test(str)) {
    throw new Error('Invalid string');
  }

  return str.replace(/[-_]+./g, (s) => s[1].toUpperCase());
};

export const extractTextFromVNode = (vNodes: VNode[]): string => {
  return vNodes
    .map((vNode) => {
      if (typeof vNode.children === 'string') {
        return vNode.children;
      }
      if (Array.isArray(vNode.children)) {
        return extractTextFromVNode(vNode.children as VNode[]);
      }
      return '';
    })
    .join(' ')
    .trim();
}

export const defineSlotPropHandlingComponent = (
  TargetComponent: Component | DefineComponent,
  propStorage: Storage,
) => {
  return defineComponent({
    template: `<Component :is="TargetComponent" />`,
    setup(_, { attrs, slots }) {
      const componentSlots = Object.entries(slots).reduce(
        (slotResult, [slotName, slot]) => {
          if (!slot) {
            return slotResult;
          }

          if (slotName.startsWith('bind:')) {
            try {
              const [, propName] = slotName.split(':', 2);

              const slotTxt = extractTextFromVNode(slot());

              const propValue = JSON.parse(slotTxt);

              propStorage.attach(propName, propValue);
            } catch (error) {
              console.error(error);
            }

            return slotResult;
          }

          slotResult[slotName] = slot;

          return slotResult;
        },
        {} as Record<string, Slot>
      )

      return {
        TargetComponent: defineComponent({
          inheritAttrs: false,
          render: () => {
            return h(
              TargetComponent,
              { ...attrs, ...propStorage.all() },
              componentSlots
            )
          },
        }),
      }
    }
  })
}

export const defineOriginalPropHandlingComponent = (
  SlotPropHandlingComponent: Component | DefineComponent,
  propNames: string[],
  propStorage: Storage,
  elmOuterHTML: string,
  elmLocalTagName: string,
  slotString: string | null = null,
  internalComponents?: Record<string, Component | DefineComponent>,
) => {
  const template = elmOuterHTML.trim().replace(new RegExp(`^<${elmLocalTagName}`), '<SlotPropHandlingComponent')
  .replace(new RegExp(`(\\s*/>)|(</\\s*${elmLocalTagName}\\s*>)`), '')
  .concat(`${slotString ?? ''}`)
  .concat('</SlotPropHandlingComponent>');

  return defineComponent({
    props: propNames,
    components: {
      SlotPropHandlingComponent,
      ...(internalComponents ?? {}),
    },
    directives: {
      prop: {
        created: (_el, { arg, modifiers, value }) => {
          if (!arg) {
            return;
          }

          if (!Object.prototype.hasOwnProperty.call(modifiers, '#temp')) {
            propStorage.attach(arg, value);

            return;
          }
        }
      }
    },
    template,
  })
}

export const defineElementInput = (element: ElementInput) => {
  return new Element(element);
}

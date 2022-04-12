import { Step, trace } from "../trace";
import { Fiber } from "../types";
import { createStateElementDispatcher } from "../react/fiber";

function setNestedObjectProp(
  element: HTMLElement,
  prop: keyof HTMLElement,
  nestedObj: any
) {
  for (let [nestedProp, nestedValue] of Object.entries(nestedObj)) {
    if (!nestedProp || !prop) continue;

    // [TODO]: HTMLElement type accessor
    // We will ignore object assignment type-checking for now, as TS will not accept HTMLElement[string] access
    // @ts-ignore
    element[prop][nestedProp] = nestedValue;
  }
  return element;
}

createStateElementDispatcher.setDispatcher(function createElementWithProps(
  fiber: Fiber
) {
  trace(
    Step.CreateElement,
    "[Traversing VirtualDOM] [createElementWithProps] ",
    fiber
  );
  // On leafs, we eventually hit primitive values
  if (fiber?.text) {
    return document.createTextNode(String(fiber.text));
  }

  const { tag, props } = fiber;
  const DOMElement = document.createElement(
    tag as string,
    {} /* options used only for web-components */
  );

  // Iterate over each props and assign it to our new element
  props &&
    Object.entries(props).forEach(([prop, value], ..._rest) => {
      if (typeof value === "object") {
        setNestedObjectProp(DOMElement, prop as keyof HTMLElement, value);
      } else {
        // [TODO]: HTMLElement type accessor
        // We will ignore object assignment type-checking for now, as TS will not accept HTMLElement[string] access
        // @ts-ignore
        DOMElement[prop] = value;
      }
    });

  return DOMElement;
});

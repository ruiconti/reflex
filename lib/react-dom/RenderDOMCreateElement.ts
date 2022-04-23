import { Step, trace } from "../common/trace";
import { Fiber, FiberType } from "../common/types";
import { setElementFactory } from "../react/FiberWorkLoop";

function shouldOmitProps(propertyName: string | undefined) {
  return !propertyName || propertyName === "children";
}

function setNestedObjectProp(
  element: HTMLElement,
  prop: keyof HTMLElement,
  nestedObj: any
) {
  if (shouldOmitProps(prop)) {
    return element;
  }
  for (let [nestedProp, nestedValue] of Object.entries(nestedObj)) {
    if (!nestedProp) continue;

    // [TODO]: HTMLElement type accessor
    // We will ignore object assignment type-checking for now, as TS will not accept HTMLElement[string] access
    // @ts-ignore
    try {
      // @ts-ignore
      element[prop][nestedProp] = nestedValue;
    } catch (err) {
      throw new Error(
        `Invalid assignment on HTMLElement: e[${prop}][${nestedProp}]`
      );
    }
  }
  return element;
}

setElementFactory(function createElementWithProps(fiber: Fiber) {
  trace(
    Step.CreateElement,
    "[Traversing VirtualDOM] [createElementWithProps] ",
    fiber
  );
  // On leaves, we eventually hit primitive values i.e. data
  if (fiber.type === FiberType.TextNode && fiber?.data) {
    return document.createTextNode(String(fiber.data));
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

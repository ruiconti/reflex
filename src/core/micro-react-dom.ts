import type { MicroElement } from "../types";
import { trace, Step } from "./trace";

/*
  Assigns properties to `element.props`
  iterating over `nestedObj` key, value pairs
  
  >>> element
  HTMLDivElement {...} 
  >>> prop
  'style'
  >>> nestedObj
  { width: '100%', color: 'blue'}
  >>> setNestedObject(element, prop, nestedObj)
  >>> element
  HTMLDivElement {... style: { width: '100%', color: 'blue'}}
*/
const setNestedObjectProp = (
  element: HTMLElement,
  prop: keyof HTMLElement,
  nestedObj: any
) => {
  for (let [nestedProp, nestedValue] of Object.entries(nestedObj)) {
    if (!nestedProp || !prop) continue;

    // [TODO]: HTMLElement type accessor
    // We will ignore object assignment type-checking for now, as TS will not accept HTMLElement[string] access
    // @ts-ignore
    element[prop][nestedProp] = nestedValue;
  }
  return element;
};

const createElementWithProps = (
  reactElement: MicroElement | number | string
) => {
  trace(
    Step.DOMRenderIterate,
    "[Traversing VirtualDOM] [createElementWithProps] ",
    reactElement
  );
  // On leafs, we eventually hit primitive values
  if (typeof reactElement === "number" || typeof reactElement === "string") {
    return document.createTextNode(String(reactElement));
  }

  const { tag, props } = reactElement;
  const DOMElement = document.createElement(
    tag!,
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

  // Attaches a DOM element to the MicroElement structure
  reactElement.ref = DOMElement;

  return DOMElement;
};

const buildNodeRecursive = (nodeElement: MicroElement) => {
  trace(
    Step.DOMRenderIterate,
    "[Traversing VirtualDOM] [buildNodeRecursive] ",
    nodeElement
  );
  const DOMElement = createElementWithProps(nodeElement);

  // Only iterate if children is not empty
  if ((nodeElement?.children?.length ?? 0) > 0) {
    nodeElement!.children!.forEach((child) => {
      // trace(
      //   Step.DOMRenderIterate,
      //   "\t[Iterating over current node's children] ... ",
      //   child
      // );
      DOMElement.appendChild(buildNodeRecursive(child));
    });
  }
  return DOMElement;
};

/* 
 When render is called, we have already transformed the entire JSX tree
 into a MicroElement tree, through implicit createElement transformations

*/
const render = (treeRoot: MicroElement, treeRootDOM: HTMLElement | null) => {
  /* Builds the entire DOM tree; It is entirely contained within single HTMLElement
       i.e., the tree root
     And mounts it.
  */
  const VDOMRoot = buildNodeRecursive(treeRoot);
  treeRootDOM?.appendChild(VDOMRoot);
};

const ReactDOM = {
  render,
};

export { ReactDOM };

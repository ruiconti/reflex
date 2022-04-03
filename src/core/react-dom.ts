import type { MicroElement } from "../types";
import { trace, Step } from "./trace";
import { React } from "./react";

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
    Step.DOMCreateElement,
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
    Step.DOMCreateElement,
    "[Traversing VirtualDOM] [buildNodeRecursive] ",
    nodeElement
  );
  const DOMElement = createElementWithProps(nodeElement);

  // Only iterate if children is not empty
  if ((nodeElement?.children?.length ?? 0) > 0) {
    nodeElement!.children!.forEach((child) => {
      DOMElement.appendChild(buildNodeRecursive(child));
    });
  }
  return DOMElement;
};

/* 
 When render is called, we have already transformed the entire JSX tree
 into a MicroElement tree, through implicit createElement transformations
*/
const CoreVirtualDOM = (function () {
  let VDOM: undefined | MicroElement;

  return () => ({
    mountDOM: (rootComponent: MicroElement, rootElementDOM: HTMLElement) => {
      // RealDOMRoot = rootElementDOM;
      VDOM = rootComponent;
      const DOM = buildNodeRecursive(rootComponent);
      rootElementDOM.appendChild(DOM);
    },
    commitVDOM: (rootComponent: MicroElement) => {
      VDOM = rootComponent;
    },
    getVDOM: () => {
      if (!VDOM) {
        throw new Error("Fatal: Attempted to read VDOM before initial mount.");
      }
      return VDOM;
    },
  });
})();

const findNode = (node: MicroElement, id: number) => {
  const queue = [node];
  while (queue.length > 0) {
    const current = queue.pop();
    if (current?._id === id) {
      return current;
    }

    current?.children?.forEach((child) => queue.push(child));
  }
  return undefined;
};

const parseFunctionComponent = (node: MicroElement) => {
  return React.createElement(node.constructor, node?.functionProps ?? {});
};

const traverseAndReplace = (
  node: MicroElement,
  id: number,
  newNode: MicroElement
) => {
  for (let i = 0; i < (node?.children?.length ?? 0); i++) {
    let child = node?.children?.[i];
    if (child) {
      if (child._id === id) {
        // TIL: That's the only way to actually mutate this object
        node!.children![i] = newNode;
        console.log("Replaced node. ", child, node!.children![i]);
      } else {
        traverseAndReplace(child, id, newNode);
      }
    }
  }
};

const reCreateSubTree = (componentId: number) => {
  // create WIP fiber
  // This creates a FULL VDOM and select a subtree out of it – wasteful
  // const wipFiberRoot = parseFunctionComponent(CoreVirtualDOM().VDOM);
  // const wipFiberSubTree = findNode(wipFiberRoot, componentId);

  // find the node (sub-tree) that triggered the rerender
  const currentFiberSubTree = findNode(CoreVirtualDOM().getVDOM(), componentId);

  if (currentFiberSubTree) {
    // re-render that subtree
    const wipFiberSubTree = parseFunctionComponent(currentFiberSubTree);

    console.log(
      "VDOM Subtree comparison: ",
      currentFiberSubTree,
      wipFiberSubTree
    );

    // capture the existing subtree in the DOM
    const currentDOMSubtree = currentFiberSubTree.ref;

    // create WIP DOM subtree
    const wipDOMSubtree = buildNodeRecursive(wipFiberSubTree);
    console.log(
      "RealDOM Subtree comparison: ",
      currentDOMSubtree,
      wipDOMSubtree
    );

    // commit to the real DOM
    const parent = currentDOMSubtree?.parentElement;
    if (!parent) {
      throw new Error(
        "Fatal: Could not find a valid parent for current DOM subtree"
      );
    }

    // commit WIP subtree to DOM
    parent.insertBefore(wipDOMSubtree, currentDOMSubtree);
    currentDOMSubtree.remove();

    // commit WIP new fiber tree to VDOM
    if (wipFiberSubTree._id === CoreVirtualDOM().getVDOM()._id) {
      // it's a whole tree re-render,
      CoreVirtualDOM().commitVDOM(wipFiberSubTree);
    } else {
      traverseAndReplace(
        CoreVirtualDOM().getVDOM(),
        componentId,
        wipFiberSubTree
      );
    }
    console.log(CoreVirtualDOM().getVDOM());
  }
};

const render = (treeRoot: MicroElement, rootElementDOM: HTMLElement | null) => {
  /* Builds the entire DOM tree; It is entirely contained within single HTMLElement
       i.e., the tree root
     And mounts it.
  */
  if (!rootElementDOM) {
    console.log("Fatal: Invalid anchor DOM root.");
    return;
  }
  CoreVirtualDOM().mountDOM(treeRoot, rootElementDOM);
};

const ReactDOM = {
  render,
};

export { ReactDOM, reCreateSubTree };

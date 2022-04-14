import { Step, trace } from "../trace";
import { Fiber, Element, FunctionComponent, FiberType, Mode } from "../types";
import { createFiber } from "./createFiber";

function isFiber(node: Element | Fiber): node is Fiber {
  return "alternate" in node && !!(node as Fiber).alternate;
}

function updateChildrenReferences(node: Element | Fiber): Fiber {
  const children = (node.children ?? []) as Element[];
  if (isFiber(node) && node.mode === Mode.Visited) {
    // Bail early
    return node;
  }

  let fiber = isFiber(node) ? (node as Fiber) : createFiber(node as Element);
  let currentFiber: undefined | Fiber;
  // Create child/parent/sibling relationships
  for (let i = 0; i < children.length; i++) {
    if (i === 0) {
      fiber.child = createFiber(children[i]);
      currentFiber = fiber.child;
    }

    if (currentFiber) {
      if (children?.[i + 1]) {
        currentFiber.sibling = createFiber(children[i + 1]);
      }

      trace(Step.CreateFiberReferences, "Creating refs for ", children[i]);
      // Create parent ref
      currentFiber.parent = fiber;
      if (currentFiber.sibling) {
        currentFiber = currentFiber.sibling;
      }
    }
  }
  // TODO: Mode is now useless; use it to tag edited nodes
  trace(Step.CreateFiberReferences, "End of process for ", node);
  return fiber;
}

function rerenderFiber(node: Fiber) {
  if (!node.data || typeof node.data !== "function") {
    return node;
  }
  const Component = node.data as FunctionComponent;

  const {
    children: renderChildren,
    props: renderProps,
    tag: renderTag,
  } = Component(node.props);

  node.children = renderChildren;
  node.initialProps = node.props;
  node.props = renderProps;
  node.tag = renderTag;

  trace(Step.UpdateFiber, "Re-rendering FunctionComponent – Fiber ", node);
  return node;
}

function rerenderElement(node: Element): Element {
  const Component = node.tag;
  const {
    children: renderChildren,
    props: renderProps,
    tag: renderTag,
  } = Component(node.props);

  // TODO: Compare renderProps and props
  node.tag = renderTag;
  node.children = renderChildren;
  node.props = renderProps;
  trace(Step.UpdateFiber, "Re-rendering FunctionComponent – Element ", node);
  return node;
}

function reconcileFiber(node: Fiber | Element): Fiber {
  let fiber;
  trace(Step.UpdateFiber, "Incoming: ", node);
  if (isFiber(node)) {
    // We have already created the fiber. We are either in a re-render
    // or re-visiting this fiber.
    switch (node.type) {
      case FiberType.FunctionComponent:
        // Here is where we should place the re-render optimizations.
        fiber = rerenderFiber(node);
        break;
      case FiberType.HostComponent:
        fiber = node;
        break;
      case FiberType.TextNode:
      default:
        fiber = node;
        break;
    }
  } else {
    switch (typeof node.tag) {
      case "function":
        fiber = rerenderElement(node);
        break;
      default:
        fiber = node;
        break;
    }
  }
  return updateChildrenReferences(fiber);
}

export { reconcileFiber };

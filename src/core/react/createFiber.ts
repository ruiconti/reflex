import { Step, trace } from "../trace";
import { Fiber, FunctionComponent, Mode } from "../types";

function createFiber(node: Fiber | string): Fiber {
  let fiber;
  switch (typeof node) {
    case "object":
      fiber = {
        ...node,
        child: undefined,
        sibling: undefined,
        parent: undefined,
      };
      trace(Step.Fiberize, "Fiberizing an object!", fiber);
      break;
    case "string":
    case "number":
      fiber = {
        props: {},
        child: undefined,
        text: node,
        sibling: undefined,
        parent: undefined,
        tag: "TextNode",
      };
      trace(Step.Fiberize, "Fiberizing a string", fiber);
      break;
  }
  return fiber;
}

function updateChildrenReferences(node: Fiber) {
  const children = (node.children ?? []) as Fiber[];

  // Node is already a Fiber though these
  // relationships were not created yet i.e. mode is not Visited
  // Create child/parent/sibling relationships
  for (let i = 0; i < children.length; i++) {
    if (i === 0) {
      // Create child ref
      children[i] = createFiber(children[i]);
      node.child = children[i];
    }

    if (children?.[i + 1]) {
      // Create sibling ref
      children[i + 1] = createFiber(children[i + 1]);
      children[i].sibling = children[i + 1];
    }

    trace(Step.CreateFiberReferences, "Creating refs for ", children[i]);
    // Create parent ref
    children[i].parent = node;
  }
  // TODO: Mode is now useless; use it to tag edited nodes
  node.mode = Mode.Visited;
  trace(Step.CreateFiberReferences, "End of process for ", node);
  return node;
}

function reconcileFiber(node: Fiber) {
  const { tag, props } = node;

  trace(Step.UpdateFiber, "Incoming: ", node);
  if (typeof tag === "function") {
    let {
      children: renderChildren,
      props: renderProps,
      tag: renderTag,
    } = tag(props);

    node = node as Fiber;
    node.initialProps = props;
    node.Component = tag as (...props: any[]) => Fiber;
    node.tag = renderTag;
    node.children = renderChildren;
    node.props = renderProps;
    trace(Step.UpdateFiber, "Function component ", node);
  } else if (node.Component && typeof node.Component === "function") {
    node = node as Fiber;
    const Component = node.Component as FunctionComponent;
    let {
      children: renderChildren,
      props: renderProps,
      tag: renderTag,
    } = Component({ ...node.initialProps, ...node.props });

    node = node as Fiber;
    node.tag = renderTag;
    node.children = renderChildren;
    node.props = renderProps;
    trace(Step.UpdateFiber, "Re-rendering component ", node);
  } else if (typeof tag === "string") {
    trace(Step.UpdateFiber, "Regular component", node);
  }
  return updateChildrenReferences(node);
}

export { createFiber, updateChildrenReferences, reconcileFiber };

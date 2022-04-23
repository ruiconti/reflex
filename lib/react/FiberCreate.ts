import { Step, trace } from "../common/trace";
import { Element, Fiber, FiberType, Mode } from "../common/types";

function resolveFiberType(node: Element): FiberType {
  const typeMap = new Map<string, FiberType>([
    ["function", FiberType.FunctionComponent],
    ["string", FiberType.HostComponent],
  ]);
  return typeMap.get(typeof node.tag) ?? FiberType.HostComponent;
}

function createHostFiber(element: Element, child: Fiber): Fiber {
  const fiber = {
    alternate: undefined,
    child: child,
    data: undefined,
    initialProps: {},
    mode: Mode.Visited,
    parent: undefined,
    props: {},
    sibling: undefined,
    stateElement: element.stateElement,
    tag: "root-element",
    type: FiberType.HostComponent,
  } as Fiber;
  child.parent = fiber;
  (fiber as Fiber).alternate = { ...fiber };
  return fiber;
}

function createFiber(node: Element | string): Fiber {
  let fiber: Fiber | undefined;
  switch (typeof node) {
    case "object":
      const fiberType = resolveFiberType(node);
      fiber = {
        alternate: undefined,
        child: undefined,
        data: fiberType === FiberType.FunctionComponent ? node!.tag : undefined,
        initialProps: node.props,
        mode: Mode.Created,
        parent: undefined,
        props: node.props,
        sibling: undefined,
        tag: node.tag,
        type: fiberType,
      } as Fiber;
      fiber.alternate = { ...fiber }; // Temporarily useless.
      trace(Step.Fiberize, "Fiberizing an object!", fiber);
      break;
    case "string":
    case "number":
      fiber = {
        alternate: undefined,
        child: undefined,
        data: node,
        initialProps: {},
        mode: Mode.Created,
        parent: undefined,
        props: {},
        sibling: undefined,
        tag: "TextNode",
        type: FiberType.TextNode,
      } as Fiber;
      fiber.alternate = { ...fiber }; // Temporarily useless.
      trace(Step.Fiberize, "Fiberizing a string", fiber);
      break;
  }

  return fiber;
}

export { createFiber, createHostFiber };

import { Step, trace } from "../trace";
import { Element, Fiber, FiberType, Mode } from "../types";

function resolveFiberType(node: Element): FiberType {
  const typeMap = new Map<string, FiberType>([
    ["function", FiberType.FunctionComponent],
    ["string", FiberType.HostComponent],
  ]);
  return typeMap.get(typeof node.tag) ?? FiberType.HostComponent;
}

function createFiber(node: Element | string): Fiber {
  let fiber: Fiber | undefined;
  switch (typeof node) {
    case "object":
      const fiberType = resolveFiberType(node);
      fiber = {
        tag: node.tag,
        props: node.props,
        initialProps: node.props,
        children: node.children,
        type: fiberType,
        mode: Mode.Created,
        data: fiberType === FiberType.FunctionComponent ? node!.tag : undefined,
        alternate: undefined,
        child: undefined,
        parent: undefined,
        sibling: undefined,
      };
      (fiber as Fiber).alternate = { ...fiber };
      trace(Step.Fiberize, "Fiberizing an object!", fiber);
      break;
    case "string":
    case "number":
      fiber = {
        data: node,
        tag: "TextNode",
        type: FiberType.TextNode,
        mode: Mode.Created,
        initialProps: {},
        props: {},
        children: [],
        alternate: undefined,
        child: undefined,
        parent: undefined,
        sibling: undefined,
      };
      (fiber as Fiber).alternate = { ...fiber };
      trace(Step.Fiberize, "Fiberizing a string", fiber);
      break;
  }

  return fiber;
}

export { createFiber };

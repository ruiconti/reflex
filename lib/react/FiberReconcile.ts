import { Step, trace } from "../common/trace";
import {
  Fiber,
  Element,
  FunctionComponent,
  FiberType,
  Mode,
} from "../common/types";
import { createFiber, createHostFiber } from "./FiberCreate";

function isFiber(node: Element | Fiber): node is Fiber {
  return "alternate" in node && !!(node as Fiber).alternate;
}

function shouldBailReferenceUpdate(current: Fiber | Element): current is Fiber {
  return isFiber(current) && current.mode === Mode.Visited;
}

function updateChildrenReferences(current: Element | Fiber): Fiber {
  const children = (current?.props?.children ?? []) as Element[];
  if (shouldBailReferenceUpdate(current)) {
    return current;
  }

  let fiber = isFiber(current)
    ? (current as Fiber)
    : createFiber(current as Element);
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

  fiber.mode = fiber.mode ?? Mode.Visited;
  trace(Step.CreateFiberReferences, "End of process for ", current);
  fiber.alternate = fiber;
  return fiber;
}

function rerenderFiber(unitOfWork: Fiber) {
  const resolveRenderProps = (currentProps: object, initialProps: object) => {
    return { ...currentProps, ...initialProps };
  };
  const Component = unitOfWork.data as FunctionComponent;

  const { children: _c, ...lastProps } = unitOfWork.props;
  const { children: _ch, ...initialFilteredProps } = unitOfWork.initialProps;

  const props = resolveRenderProps(lastProps, initialFilteredProps);
  const { props: currentProps, tag: renderTag } = Component(props);

  unitOfWork.initialProps = unitOfWork.props;
  unitOfWork.props = currentProps;
  unitOfWork.tag = renderTag;

  trace(
    Step.UpdateFiber,
    " [Fiber] Re-rendering FunctionComponent",
    unitOfWork
  );
  return unitOfWork;
}

/**
 * Transforms Element to Fibers, re-renders function components and
 * reconcile new children's Fiber references.
 */
function reconcileFiber(unitOfWork: Fiber | Element): Fiber {
  let fiber;

  if (!isFiber(unitOfWork)) {
    // It's the first, root, element – which hasn't been transformed to fiber yet.
    const unitOfWorkFiber = createFiber(unitOfWork);
    const rootFiber = createHostFiber(unitOfWork, unitOfWorkFiber);
    unitOfWork = rootFiber;
  }

  trace(Step.UpdateFiber, "Incoming: ", unitOfWork);
  // We have already created the fiber. We are either in a re-render
  // or re-visiting this fiber.
  switch (unitOfWork.type) {
    case FiberType.FunctionComponent:
      // Here is where we should place the re-render optimizations.
      fiber = rerenderFiber(unitOfWork);
      break;
    case FiberType.HostComponent:
    case FiberType.TextNode:
    default:
      fiber = unitOfWork;
      break;
  }
  return updateChildrenReferences(fiber);
}

export { reconcileFiber };

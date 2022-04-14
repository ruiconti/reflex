import { Step, trace } from "../trace";
import { FiberMachine, ElementMachine, Fiber, Mode } from "../types";
import { reconcileFiber } from "./reconcileFiber";

let root: ElementMachine = {
  current: undefined,
  next: undefined,
};
let unitOfWork: FiberMachine = {
  current: undefined,
  next: undefined,
};

function completeUnitOfWork(node: Fiber) {
  trace(Step.ExecuteUoW, "Completing!", node);
  const stateElement = createStateElementDispatcher.dispatch(
    node
  ) as HTMLElement;
  if (stateElement) {
    node.stateElement = stateElement;
  }
  node.mode = Mode.Completed;
}

function ensureNextRootIsLinked(currentFiber: Fiber) {
  if (root.next === unitOfWork.next) {
    root.next = currentFiber;
  }
}

function executeUnitOfWork(node: Fiber) {
  trace(Step.ExecuteUoW, "Beginning!", node);

  const nextFiber = reconcileFiber(node);
  ensureNextRootIsLinked(nextFiber);
  unitOfWork.current = nextFiber;

  if (unitOfWork.current?.child) {
    trace(Step.ExecuteUoW, "Going down.", unitOfWork.current.child);
    return unitOfWork.current.child;
  }

  // If we reached here, means that we can't go down anymore.
  // We need to complete the current UoW and start going right
  completeUnitOfWork(unitOfWork.current);

  if (unitOfWork?.current?.sibling) {
    trace(Step.ExecuteUoW, "Going sideways.", unitOfWork.current.sibling);
    return unitOfWork.current.sibling;
  }

  // If we reached here, means that we can't go down AND can't go right.
  // We need to complete the current UoW and start going up
  let nextNode = unitOfWork?.current.parent;
  while (nextNode) {
    completeUnitOfWork(nextNode);
    if (nextNode?.sibling) {
      return nextNode.sibling;
    }

    if (nextNode === root.current) {
      unitOfWork.current = root.current as Fiber;
    }
    if (nextNode === root.next) {
      unitOfWork.current = root.next;
    }
    nextNode = nextNode?.parent;
  }

  return undefined;
}

function workLoop() {
  if (unitOfWork.next) {
    unitOfWork.next = executeUnitOfWork(unitOfWork.next);
    scheduleUnitOfWork();
    trace(Step.WorkLoop, "End of iteration");
    trace(Step.WorkLoop, "\t\tRoot: ", root);
    trace(Step.WorkLoop, "\t\tUoW: ", unitOfWork);
    trace(Step.WorkLoop, "\t\tUoWNext: ", unitOfWork.next);
  }

  // We are done processing UoWs, ready to commit!
  if (!unitOfWork.next && unitOfWork.current) {
    commitDispatcher.dispatch(unitOfWork.current);
  }
}

function scheduleUnitOfWork(node?: Fiber | undefined) {
  if (node) {
    unitOfWork.next = node;
  }
  // Scheduling it to run on microtask queue
  Promise.resolve().then(() => workLoop());
  // TODO: Why scheduling each UoW in a rIC approach
  // makes it painfully slow?
  // window.requestIdleCallback(() => {
  //  workLoop()
  // }
}

function scheduleFullRender() {
  root.next = { ...root.current } as Fiber;
  unitOfWork.next = root.next;
  scheduleUnitOfWork(root.next);
}

function setCurrentRoot(newCurrentRoot: Fiber | Element) {
  root.current = newCurrentRoot as Fiber;
  scheduleFullRender();
}

/*
 Provides an inversed dependency pattern to execute DOM operations.
 Essentially, it exposes as a lexical scope for consumers to set.

 This enables for separation of concerns as to how the tree is 
 essentially rendered
*/
type ArgType<Fn> = Fn extends (...args: infer Args) => any ? Args[0] : never;
type ReturnType<Fn> = Fn extends (...args: any[]) => infer Ret ? Ret : never;

function createDispatcher<F extends Function>() {
  return (function () {
    let currentDispatcher: F;
    return {
      setDispatcher: (dispatcher: F) => {
        currentDispatcher = dispatcher;
      },
      dispatch: (element: ArgType<F>): ReturnType<F> => {
        return currentDispatcher?.(element);
      },
    };
  })();
}

const commitDispatcher = createDispatcher<(fiber: Fiber) => void>();
const createStateElementDispatcher =
  createDispatcher<(fiber: Fiber) => HTMLElement | Text>();

export {
  unitOfWork,
  scheduleFullRender,
  setCurrentRoot,
  commitDispatcher,
  createStateElementDispatcher,
};

import { Step, trace, measureDelta } from "../common/trace";
import {
  FiberMachine,
  ElementMachine,
  Element,
  Fiber,
  Mode,
  StateElement,
} from "../common/types";
import { reconcileFiber } from "./FiberReconcile";

const root: ElementMachine = {
  current: undefined,
  next: undefined,
};
const unitOfWork: FiberMachine = {
  current: undefined,
  next: undefined,
};
const effectList: Fiber[] = [];

function completeUnitOfWork(workInProgress: Fiber) {
  trace(Step.ExecuteUoW, "Completing!", workInProgress);
  const reachedWipRoot =
    workInProgress === root.next ||
    workInProgress.stateElement === root.next?.stateElement;

  if (reachedWipRoot) {
    effectList.push(workInProgress);
  } else {
    const stateElement = createStateElement(workInProgress);
    if (stateElement) {
      workInProgress.stateElement = stateElement;
    }
  }
  workInProgress.mode = Mode.Completed;
}

/**
 *   Consider the following tree:                        This is how it is traversed:
 *
 *                   ┌───┐                                         ┌───┐
 *                   │   │                                         │   │◀ ─ ─ ─ ─ ─ ─
 *                   └───┘                                         └───┘             │
 *                     │                                             │
 *           ┌─────────┼──────────┐                        ┌─────C───┘               │
 *           │         │          │                        │
 *           │         │          │                        ▼                         │
 *         ┌───┐     ┌───┐      ┌───┐                    ┌───┐     ┌───┐      ┌───┐
 *         │   │     │   │      │   │                    │   │     │   │─S───▶│   │  │
 *         └───┘     └───┘      └───┘                    └───┘     └───┘      └───┘
 *           │                    │                        │         ▲          │    │
 *     ┌─────┴────┐               │                  ┌C────┘                   C│
 *     │          │               │                  │               │          │  P │
 *     │          │               │                  ▼                          ▼
 *   ┌───┐      ┌───┐           ┌───┐              ┌───┐      ┌───┐  │        ┌───┐  │
 *   │   │      │   │           │   │              │   │──S──▶│   │           │   │
 *   └───┘      └───┘           └───┘              └───┘      └───┘  P        └───┘  │
 *                │               │                             │               │
 *                │               │                            C│    │         C│    │
 *                │               │                             │               │
 *              ┌───┐           ┌───┐                           ▼    │          ▼    │
 *              │   │           │   │                         ┌───┐           ┌───┐
 *              └───┘           └───┘                         │   │─ ┘        │   │─ ┘
 *                                                            └──*┘           └──*┘
 *
 *                                                       *: Starts traversing upwards – completing.
 **/
function performUnitOfWork(current: Fiber): Fiber | undefined {
  const ensureNextRootIsLinked = (workInProgress: Fiber) => {
    if (root.next === unitOfWork.next /* first fiber is being processed */) {
      root.next = workInProgress;
    }
  };
  trace(Step.ExecuteUoW, "Beginning!", current);

  const workInProgress = reconcileFiber(current);
  unitOfWork.current = workInProgress;
  ensureNextRootIsLinked(workInProgress);

  if (workInProgress?.child) {
    trace(Step.ExecuteUoW, "Going down.", workInProgress.child);
    return workInProgress.child;
  }

  // Can't go down anymore. Complete and try to go right.
  completeUnitOfWork(workInProgress);

  if (workInProgress.sibling) {
    trace(Step.ExecuteUoW, "Going sideways.", workInProgress.sibling);
    return workInProgress.sibling;
  }

  // We can't go down and can't go right. Time to climb.
  let nextNode = workInProgress.parent;
  while (nextNode) {
    completeUnitOfWork(nextNode);

    if (nextNode?.sibling) {
      return nextNode.sibling;
    }
    nextNode = nextNode?.parent;
  }
  return undefined;
}

/**
 * Schedules units of works by placing at the beginning at the end of
 * the micro-task queue.
 */
function scheduleUnitOfWork(node?: Fiber | undefined) {
  unitOfWork.next = node;

  Promise.resolve().then(() =>
    (function workLoop() {
      if (unitOfWork.next) {
        const nextUnitOfWork = performUnitOfWork(unitOfWork.next);
        scheduleUnitOfWork(nextUnitOfWork);
      }

      // We are done processing UoWs: ready to commit.
      if (!unitOfWork.next && unitOfWork.current) {
        beginCommit();
        completeCommit();
      }
    })()
  );
  performance.clearMarks();
}

function completeCommit() {
  root.current = { ...(root.next as Fiber) };
  root.next = undefined;
  unitOfWork.next = undefined;
  unitOfWork.current = undefined;
}

// Access to module-bound control variables.
function scheduleSyncFlush() {
  root.next = { ...root.current } as Fiber;
  scheduleUnitOfWork(root.next);
}

function setCurrentRoot(newCurrentRoot: Fiber | Element) {
  root.current = newCurrentRoot as Fiber;
}

function getCurrentUnitOfWork() {
  if (!unitOfWork.current) {
    throw new Error("Fatal: Wrong access to unitOfWork.current");
  }
  return unitOfWork.current;
}

/**
 * Dependency injects a commit handler that is called on beginCommit.
 */
type CommitHandler = (initialCommitNode: Fiber) => void;
const commitDispatcher = (function () {
  let commitHandler: CommitHandler | undefined;

  return {
    setCommitHandler: (handler: CommitHandler) => {
      commitHandler = handler;
    },
    beginCommit: () => {
      while (effectList.length > 0) {
        let effectToCommit = effectList.pop();
        if (commitHandler && effectToCommit) {
          commitHandler(effectToCommit);
        }
      }
    },
  };
})();

// Aliases
const { beginCommit, setCommitHandler } = commitDispatcher;

/**
 * Dependency injects a commit handler that is called on createElement.
 */
type CreateStateElement = (node: Fiber) => StateElement;
const elementFactoryDispatcher = (function () {
  let elementFactory: CreateStateElement | undefined;

  return {
    setElementFactory: (handler: CreateStateElement) => {
      elementFactory = handler;
    },
    createStateElement: (node: Fiber) => {
      const element = elementFactory?.(node);
      if (!element) {
        throw new Error("Fatal: Failed to create state element.");
      }
      return element;
    },
  };
})();

// Aliases
const { setElementFactory, createStateElement } = elementFactoryDispatcher;

export {
  unitOfWork,
  getCurrentUnitOfWork,
  scheduleSyncFlush,
  setCurrentRoot,
  setCommitHandler,
  setElementFactory,
};

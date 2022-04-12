import { Step, trace } from "../trace";
import { Fiber } from "../types";
import { setCurrentRoot, commitDispatcher } from "../react/fiber";

// keep the root reference alive
let mountElement: HTMLElement | undefined;

function renderDOMTree(tree: Fiber, hostDOM: any) {
  mountElement = hostDOM;
  setCurrentRoot({ parent: undefined, ...tree });
}

commitDispatcher.setDispatcher(function commitDOMTree(initialNode: Fiber) {
  // For each tree level, we start building our render tree
  const queue = [initialNode];
  trace(Step.Commit, "Initial node: ", initialNode);

  while (queue.length > 0) {
    let currentFiber = queue.pop();
    let children = currentFiber?.children ?? [];
    // TODO: It's relying on 'children' to re-render;
    // TODO: It should rely on a list of DOM event updates
    children.forEach((child) => {
      if (child.stateElement) {
        currentFiber?.stateElement?.appendChild(child.stateElement);
      }
      queue.push(child);
    });
  }

  if (initialNode?.stateElement) {
    mountElement?.firstChild?.remove();
    mountElement?.appendChild(initialNode?.stateElement);
  }
});

export default renderDOMTree;

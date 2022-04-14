import { Step, trace } from "../trace";
import { Fiber } from "../types";
import { setCurrentRoot, commitDispatcher } from "../react/workLoop";

// keep the root reference alive
let mountElement: HTMLElement | undefined;

function renderDOMTree(tree: JSX.Element | Element, hostDOM: any) {
  mountElement = hostDOM;
  setCurrentRoot({ ...tree } as Element);
}

commitDispatcher.setDispatcher(function commitDOMTree(initialNode: Fiber) {
  // For each tree level, we start building our render tree
  const queue = [initialNode];
  trace(Step.Commit, "Initial node: ", initialNode);

  while (queue.length > 0) {
    let currentFiber = queue.pop();
    let child = currentFiber?.child;
    let currentElement = currentFiber?.stateElement;

    if (child && currentElement && child.stateElement) {
      trace(Step.Commit, "Appending child: ", child);
      currentElement.appendChild(child.stateElement);
      queue.push(child);

      let currentSibling = child?.sibling;
      while (currentSibling) {
        let siblingElement = currentSibling?.stateElement;
        if (siblingElement) {
          currentElement.appendChild(siblingElement);
          trace(Step.Commit, "Appending sibling: ", currentSibling);
          if (queue.indexOf(currentSibling) === -1) {
            queue.unshift(currentSibling);
          } else {
            // TODO: Figure out why we are getting here.
          }
        }
        currentSibling = currentSibling?.sibling;
      }
      queue.push(child);
    }
  }

  if (initialNode?.stateElement) {
    mountElement?.firstChild?.remove();
    mountElement?.appendChild(initialNode?.stateElement);
  }
});

export default renderDOMTree;

import { Step, trace } from "../common/trace";
import { Fiber, Element } from "../common/types";
import {
  setCurrentRoot,
  setCommitHandler,
  scheduleSyncFlush,
} from "../react/FiberWorkLoop";

function render(tree: JSX.Element | Element, hostDOM: HTMLElement | null) {
  setCurrentRoot({ ...tree, stateElement: hostDOM } as Element);
  scheduleSyncFlush();
}

/**
 * Depth-first-search traversal on Fiber tree.
 */
setCommitHandler(function beginCommit(initialNode: Fiber) {
  const queue = [initialNode];
  const realRoot = initialNode.stateElement;
  const temporaryRoot = initialNode.stateElement?.cloneNode();
  initialNode.stateElement = temporaryRoot as HTMLElement;
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
          queue.push(currentSibling);
        }
        currentSibling = currentSibling?.sibling;
      }
    }
  }

  if (realRoot) {
    removeChildren(realRoot as HTMLElement);
    copyChildrenTo(realRoot as HTMLElement, initialNode.stateElement);
    initialNode.stateElement = realRoot;
  }
});

function copyChildrenTo(nodeToCopy: HTMLElement, nodeCopied: HTMLElement) {
  let children = Array.from(nodeCopied.children);
  for (let i = 0; i < children.length; i++) {
    nodeToCopy.appendChild(children[i]);
  }
}

function removeChildren(node: HTMLElement) {
  const children = Array.from(node.children);
  while (children.length > 0) {
    let nodeToRemove = children.pop();
    if (nodeToRemove) {
      node.removeChild(nodeToRemove);
    }
  }
}

export default render;

import type { StateBox, Reducer } from "../types";
import { trace, Step } from "./trace";
import { reCreateSubTree } from "./react-dom";

let COMPONENT_COUNT = 0;

const resetComponentCount = () => {
  COMPONENT_COUNT = 0;
};

const incrementComponentCount = () => {
  COMPONENT_COUNT++;
};

const flushSync = (componentId: number) => {
  COMPONENT_COUNT = componentId - 1; // we increment before calling the component function
  boxDispatcher.doneRegistering();
  reCreateSubTree(componentId);
};

const boxDispatcher = (function <U>() {
  let componentStateArray = new Map<number, StateBox[]>();
  let REGISTERED_PHASE = true;
  let HOOK_COUNTER = 0;

  return {
    scheduleRegister: <U>(initialValue: U): StateBox<U> => {
      // RE-RENDERS
      if (!REGISTERED_PHASE) {
        const states = componentStateArray.get(COMPONENT_COUNT);
        const hook = states?.[HOOK_COUNTER];
        if (hook) {
          HOOK_COUNTER++;
          return hook;
        }
      }

      // MOUNT
      let state: U = initialValue;

      const box = {
        componentId: COMPONENT_COUNT,
        hookId: HOOK_COUNTER,
        state,
        getState: () => state,
        setState: (newState: U | Reducer<U>) => {
          const newValue =
            typeof newState === "function"
              ? (newState as Reducer<U>)(state)
              : newState;

          console.log(
            `setState(${newValue}) component: ${box.componentId}, hookId: ${box.hookId}`
          );
          state = newValue;
          flushSync(box.componentId);
        },
      };
      HOOK_COUNTER++;
      const states = componentStateArray.get(COMPONENT_COUNT);
      if (!states) {
        componentStateArray.set(COMPONENT_COUNT, [box]);
      } else {
        componentStateArray.set(COMPONENT_COUNT, states.concat(box));
      }
      return box;
    },
    getBox: (componentId: number): StateBox<U>[] => {
      return componentStateArray.get(componentId) ?? [];
    },
    resetBox: () => {
      HOOK_COUNTER = 0;
    },
    doneRegistering: () => {
      REGISTERED_PHASE = false;
    },
  };
})();

const createFunctionComponent = (
  componentFunction: Function,
  props: object,
  children: JSX.Element[]
) => {
  const functionComponent = componentFunction;

  // We need to increment first because JSX traverses in a """post-order fashion",
  // with a striking difference that it needs to be identified before traversing upwards
  incrementComponentCount();
  const _id = COMPONENT_COUNT;
  boxDispatcher.resetBox();
  // const jsxObject = functionComponent(props, ...children);
  const jsxObject = functionComponent(props, children);
  /* If we were to implement a useEffect, this would be the place to schedule it
      though we need to be smart about it because it should only be executed after
      the full tree has been traversed...
      otherwise we could be re-rendering the tree without finishing the createElement
      traversal */

  /*
   * Considering this component:
   *    const Button = ({ label }) => <button className="active"></button>
   * jsxObject will return the output of createElement but for the `button` tag
   * which, as of now, it's a `{ tag, props, children }` object. So, it makes sense
   * to clarify that
   *      jsxObject.props = { className: "active "}
   * whereas
   *      props = { label: "RuntimeLabelValue"
   * If we wish to recreate this component we need to keep track of both things.
   */
  const stateHooks = boxDispatcher.getBox(_id);
  const element = {
    _id,
    constructor: functionComponent,
    stateHooks,
    functionProps: props,
    ...jsxObject,
  };

  trace(
    Step.JSXCreateElement,
    "createElement(function, props, children)",
    element
  );
  return element;
};

export {
  COMPONENT_COUNT,
  resetComponentCount,
  createFunctionComponent,
  boxDispatcher,
};

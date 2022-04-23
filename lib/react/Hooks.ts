import { trace, Step } from "../common/trace";
import { SetState, StateBox } from "../common/types";
import { scheduleSyncFlush } from "./FiberWorkLoop";

let hooks: StateBox[] = [];
let HOOK_COUNTER = 0;
let INITIAL_RENDER = true;

const resetState = () => {
  INITIAL_RENDER = false;
  HOOK_COUNTER = 0;
};

const createBox = <T>(initialState: T) => {
  // A similar approach can be used for refs.
  const box = (function () {
    let state = initialState;

    return {
      getState: () => state,
      setState: (newState: T | Function) => {
        state =
          typeof newState === "function"
            ? (newState as Function)(state)
            : newState;

        trace(Step.UseState, "Hook register: ", hooks);
        scheduleSyncFlush();
        resetState();
      },
    };
  })();
  return box;
};

const useState = <T>(initialValue: T): [T, SetState<T>] => {
  let box;

  if (!INITIAL_RENDER) {
    box = hooks?.[HOOK_COUNTER];
  } else {
    box = createBox(initialValue);
    hooks.push(box);
  }
  HOOK_COUNTER++;

  trace(Step.UseState, "Registering hook:", box);
  return [box.getState(), box.setState];
};

export { useState };

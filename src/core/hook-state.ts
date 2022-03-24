import { trace, Step } from "./trace";
import { COMPONENT_COUNT } from "./component-state";

type StateHook = {
  componentId: number;
  hookId: number;
  type: string;
  current: any /* TODO: Improve type */;
};

/* 
    State manager for hooks.
    Responsible for book-keeping registered hooks throughout renders.

    Each hook is identified by a counting, sequential index.
    (Which is a known not safe and reliable identification method).
    TODO: Improve hook id for partial/async renders
    
    The current state value of a given hook is then stored in a object that
    is mutated throughout renders.
    TODO: Move to a snapshot approach, which we decouple hook type from its data

    When registering hooks, we should have a static view of it across renders;
    meaning that we cannot add hooks dynamically throughout re-renderings.
*/
type StateHookHandler = {
  HOOK_COUNTER: number;
  _data: StateHook[];
};

const stateHookRegister: StateHookHandler = {
  HOOK_COUNTER: 0,
  _data: [],
};

// Core methods used by components
const getCurrentHookState = (index: number): any => {
  const currentValue = stateHookRegister._data[index].current;
  return currentValue;
};
const setCurrentHookState = (index: number, newValue: any): any => {
  if (typeof newValue === "function") {
    const currentValue = getCurrentHookState(index);
    stateHookRegister._data[index].current = newValue(currentValue);
  } else {
    stateHookRegister._data[index].current = newValue;
  }
};

/* Controls hook counter to increment at registering */
const _incrementHookCounter = () => {
  const currentIndex = stateHookRegister.HOOK_COUNTER;
  stateHookRegister.HOOK_COUNTER++;
  return currentIndex;
};

const resetHookCounter = () => {
  stateHookRegister.HOOK_COUNTER = 0;
};

/* 
    Registering of a hook.
    Relevant to notice that this function is called *at every render*, as the 
    component is not (and should not be) aware of if it's first, second or N 
    render flush.
*/
const registerHook = (type: string, initialValue: any) => {
  const currentId = {
    hookId: _incrementHookCounter(),
    componentId: COMPONENT_COUNT,
  };

  if (utils.isHookRegistered(currentId.hookId)) {
    /* Reaching this branch means two things:
          1. The component has already registered this hook and
          2. The component is in a N+1 render
      */
    return currentId;
  }

  const hook = {
    type: type === "undefined" ? "object" : type,
    current: initialValue,
    ...currentId,
  };

  stateHookRegister._data.push(hook);
  trace(
    Step.UseState,
    "[useState] Hook registered, ",
    hook,
    " hookRegisters, ",
    stateHookRegister
  );
  return currentId;
};

const utils = {
  getRegisteredComponents: () => {
    return stateHookRegister._data.map((hook) => hook.componentId);
  },
  isHookRegistered: (hookId: number) => {
    return (
      stateHookRegister._data.map((hook) => hook.hookId).indexOf(hookId) > -1
    );
  },
};

export {
  utils,
  stateHookRegister as hooks,
  resetHookCounter,
  getCurrentHookState,
  setCurrentHookState,
  registerHook,
};

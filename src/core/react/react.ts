import { trace, Step } from "../trace";

import { SetState, StateBox } from "../types";
import { scheduleFullRender } from "./fiber";
import { createFiber } from "./createFiber";

/*
  Use JSX to define our components.
  We want to define components as we are used to in React, right?

  The way JSX is converted is defined, in this project, through tsconfig's 'jsx' prop entry.
  We are using `react` value, which translates a JSX expression to a React.createElement(...args)
    For more info on JSX transpiling: https://www.typescriptlang.org/pt/docs/handbook/jsx.html

  Essentially, there would be two ways of calling React.createElement:
    1. Raw, vanilla translation
        e.g., <div id="a-div">Hi</div> => createElement('div', {id: 'a-div'}, "Hi")

    2. Functions that returns JSX i.e. Function components
        e.g., () => <div id="a-div">Hi</div> => createElement(() => createElement('div', {id: 'a-div'}, "Hi"))

      TODO: We should go back to this step and add props to this. But for now we'll keep it simple.

  It is traversed in a depth first search fashion.
*/
function createElement(
  tag: string | Function,
  props: object,
  ...children: any[]
) {
  return createFiber({ tag, props, children });
}

let hooks: StateBox[] = [];
let HOOK_COUNTER = 0;
let INITIAL_RENDER = true;

const resetState = () => {
  INITIAL_RENDER = false;
  HOOK_COUNTER = 0;
};

const createBox = <T>(initialState: T) => {
  const box = (function () {
    let state = initialState;

    return {
      getState: () => state,
      setState: (newState: T | Function) => {
        state =
          typeof newState === "function"
            ? (newState as Function)(state)
            : newState;

        scheduleFullRender();
        resetState();
      },
    };
  })();
  return box;
};

const useState = <T>(initialValue: T): [T, SetState<T>] => {
  trace(Step.UseState, "Registering hook!");
  let box;

  if (!INITIAL_RENDER) {
    box = hooks?.[HOOK_COUNTER];
  } else {
    box = createBox(initialValue);
    hooks.push(box);
  }
  HOOK_COUNTER++;

  return [box.getState(), box.setState];
};

const React = {
  createElement,
  useState,
};

export default React;

import { trace, Step } from "./trace";

import {
  getCurrentHookState,
  setCurrentHookState,
  registerHook,
  resetHookCounter,
} from "./hook-state";
import { render } from "../main";
import {
  resetComponentCount,
  createFunctionComponent,
} from "./component-state";

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
  tagOrFunction: string | Function,
  props: object,
  ...children: any[]
) {
  if (typeof tagOrFunction === "function") {
    // This is the moment in which we are transforming our component JSX
    // into a MicroElement
    return createFunctionComponent(tagOrFunction, props, children);
  }

  const element = {
    tag: tagOrFunction,
    props,
    children,
  };
  trace(Step.JSXCreateElement, "createElement(tag, props, children)", element);
  return element;
}

/*
    Triggers re-render.

    It provokes a full root mount/unmount.
    TODO: Re-render only necessary sub-trees
      1. identify which component triggered the re-render
      2. remove that tree and its child from DOM
      3. fn.apply() the component function and replace it in the DOM
      This will require a refactor on the internal tree-node (MicroElement)
      structure.
*/
const flushState = () => {
  resetHookCounter();
  resetComponentCount();
  trace(Step.UseState, "[useState] Re-Rendering.");
  trace(Step.UseState, "\n\n");
  render();
};

type State<T> = T | undefined;

const useState = (function () {
  trace(Step.UseState, "[useState] Initialized.");
  return <T>(initialState: State<T>) => {
    const { hookId } = registerHook(typeof initialState, initialState);

    const setState = (newState: State<T>) => {
      trace(
        Step.UseState,
        "[useState] setState called with ",
        newState,
        ", id ",
        hookId
      );
      setCurrentHookState(hookId, newState);
      flushState();
    };
    const currentState = getCurrentHookState(hookId);
    return [currentState, setState];
  };
})();

const React = {
  createElement,
  useState,
};

export { React };

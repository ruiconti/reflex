import { trace, Step } from "./trace";

let COMPONENT_COUNT = 0;

const resetComponentCount = () => {
  COMPONENT_COUNT = 0;
};

const incrementComponentCount = () => {
  COMPONENT_COUNT++;
};

const createFunctionComponent = (
  componentFunction: Function,
  props: object,
  ...children: any[]
) => {
  const functionComponent = componentFunction;
  const jsxObject = functionComponent(props);
  /* If we were to implement a useEffect, this would be the place to schedule it
      though we need to be smart about it because it should only be executed after
      the full tree has been traversed...
      otherwise we could be re-rendering the tree without finishing the createElement
      traversal */
  const element = {
    constructor: functionComponent,
    _id: COMPONENT_COUNT,
    ...jsxObject,
  };
  incrementComponentCount();
  trace(
    Step.JSXCreateElement,
    "createElement(function, props, children)",
    element,
    props,
    children
  );
  return element;
};

export { COMPONENT_COUNT, resetComponentCount, createFunctionComponent };

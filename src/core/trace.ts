export enum Step {
  JSXCreateElement = 0b1,
  DOMCreateElement = 0b100,
  UseState = 0b1000,
}

// Change this to control what's being logged
const LogLevel = 0;
// const LogLevel = Step.DOMCreateElement;
// const LogLevel = Step.JSXCreateElement;
// Step.UseState;
// Step.DOMCreateElement;

export const trace = (step: Step, ...msg: any[]) => {
  if ((LogLevel & step) > 0) {
    console.log(...msg);
  }
};

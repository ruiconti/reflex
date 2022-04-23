export enum Step {
  Fiberize = 0b1,
  CreateFiberReferences = 0b10,
  UpdateFiber = 0b100,
  ExecuteUoW = 0b1000,
  WorkLoop = 0b10000,
  CreateElement = 0b100000,
  UseState = 0b1000000,
  Commit = 0b10000000,
}

const decodeStep = (step: Step) => {
  return {
    [Step.Fiberize]: "Fiberize",
    [Step.UseState]: "UseState",
    [Step.CreateFiberReferences]: "CreateFiberReferences",
    [Step.UpdateFiber]: "UpdateFiber",
    [Step.ExecuteUoW]: "ExecuteUoW",
    [Step.WorkLoop]: "WorkLoop",
    [Step.CreateElement]: "CreateDOMElement",
    [Step.UseState]: "UseState",
    [Step.Commit]: "Commit",
  }[step];
};

// Change this to control what's being logged
const LogLevel =
  // Step.CreateFiberReferences |
  Step.UpdateFiber |
  // Step.UseState;
  Step.WorkLoop |
  Step.UseState |
  Step.Commit;
// Step.ExecuteUoW;

export const measureDelta = (name: string, fn: Function, ...args: any[]) => {
  const measureStart = `${name}Begin`;
  const measureEnd = `${name}Begin`;
  performance.mark(`${name}Begin`);
  const ret = fn(args);
  performance.mark(`${name}End`);
  performance.measure(`${name}Delta`, `${name}Begin`, `${name}End`);
  return ret;
};

export const trace = (step: Step, ...msg: any[]) => {
  if ((LogLevel & step) > 0) {
    console.log(`[${decodeStep(step)}]`, ...msg);
  }
};

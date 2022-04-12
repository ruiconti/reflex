type Reducer<T> = (newState: T) => T;
type Setter<T> = (newState: T) => void;
type SetState<T> = Setter<T | Reducer<T>>;

type StateBox<T = any> = {
  getState: () => T;
  setState: SetState<T>;
};

type Fiber = {
  // JSX attrs
  tag?: string | Function;
  props?: object;
  children?: Fiber[];

  // Function elements:
  Component?: FunctionComponent;
  initialProps?: object;
  // Text elements:
  text?: string; // TODO: Needs a better abstraction
  stateElement?: HTMLElement | Text;
  mode?: Mode;
  // Relationships
  child?: Fiber;
  sibling?: Fiber;
  parent?: Fiber;
};

type FiberMachine = {
  current: undefined | Fiber;
  next: undefined | Fiber;
};

enum Mode {
  Visited = "VISITED",
  Completed = "COMPLETED",
}

type FunctionComponent = (...props: any[]) => Fiber;

export {
  SetState,
  Reducer,
  StateBox,
  Fiber,
  FiberMachine,
  Mode,
  FunctionComponent,
};

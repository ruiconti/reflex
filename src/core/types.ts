type Reducer<T> = (newState: T) => T;
type Setter<T> = (newState: T) => void;
type SetState<T> = Setter<T | Reducer<T>>;

type StateBox<T = any> = {
  getState: () => T;
  setState: SetState<T>;
};

enum FiberType {
  FunctionComponent = "FunctionComponent",
  HostComponent = "HostComponent",
  TextNode = "TextNode",
}

type Element = {
  children: Element[];
  props: object;
  tag: any;
};

type Fiber = {
  child: Fiber | undefined;
  alternate: Fiber | undefined;
  // TODO: Smells to have children and child.
  children: Element[];
  parent: Fiber | undefined;
  sibling: Fiber | undefined;

  initialProps: object | undefined;
  // TODO: Children needs to be encapsulated inside props.
  props: object | undefined;

  data: FunctionComponent | string | undefined;
  mode: Mode;
  tag: string | Function;
  type: FiberType;

  stateElement?: HTMLElement | Text;
};

type FiberMachine = {
  current: undefined | Fiber;
  next: undefined | Fiber;
};

type ElementMachine = {
  current: undefined | Fiber | Element;
  next: undefined | Fiber;
};

enum Mode {
  Created = "CREATED",
  Visited = "VISITED",
  Completed = "COMPLETED",
}

type FunctionComponent = (...props: any[]) => Fiber;

export {
  Element,
  ElementMachine,
  Fiber,
  FiberMachine,
  FiberType,
  FunctionComponent,
  Mode,
  Reducer,
  SetState,
  StateBox,
};

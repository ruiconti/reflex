type Reducer<T> = (newState: T) => T;
type Setter<T> = (newState: T) => void;
type SetState<T> = Setter<T | Reducer<T>>;

type StateBox<T = any> = {
  getState: () => T;
  setState: SetState<T>;
};

type Element = {
  tag: string | FunctionComponent;
  children: Element[];
  props: Props;
  stateElement?: HTMLElement;
};

type FunctionComponent = (...props: any[]) => Element;

type Props = { children?: any[] } & object;

type StateElement = HTMLElement | Text;

enum FiberType {
  FunctionComponent = "FunctionComponent",
  HostComponent = "HostComponent",
  TextNode = "TextNode",
}

enum Mode {
  // traversal modes
  Created = "CREATED",
  Visited = "VISITED",
  Completed = "COMPLETED",
  // state modes
  Updated = "UPDATED",
}

type Fiber = {
  child: Fiber | undefined;
  alternate: Fiber | undefined;
  parent: Fiber | undefined;
  sibling: Fiber | undefined;

  initialProps: Props;
  props: Props;

  data: FunctionComponent | string | undefined;
  mode: Mode;
  tag: string | Function;
  type: FiberType;

  stateElement?: StateElement;
};

type FiberMachine = {
  current: undefined | Fiber;
  next: undefined | Fiber;
};

type ElementMachine = {
  current: undefined | Fiber | Element;
  next: undefined | Fiber;
};

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
  StateElement,
};

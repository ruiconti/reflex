type Reducer<T> = (newState: T) => T;
type Setter<T> = (newState: T) => void;
type SetState<T> = Setter<T | Reducer<T>>;

type StateBox<T = any> = {
  componentId: number;
  hookId: number;
  getState: () => T;
  setState: SetState<T>;
};

interface MicroElement extends JSX.Element {
  _id?: number;
  tag?: string;
  props: object;
  functionProps?: object;
  children?: MicroElement[];
  stateHooks?: StateBox[];
  ref?: HTMLElement;
}

export { SetState, Reducer, StateBox, MicroElement };

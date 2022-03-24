export interface MicroElement extends JSX.Element {
  tag?: string;
  props: keyof HTMLElement;
  children?: MicroElement[];
  ref?: HTMLElement;
}

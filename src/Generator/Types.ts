import { Component, JSXElement } from "solid-js";

export type Styles = {
  [key: string]: string;
};
export type Box = {
  index: number;
  name: string;
  styles: Styles;
  children?: (Component<any> | JSXElement)[];
  class?: string;
  active: Boolean;
  events?: Events;
};

export type Events = {
  onClick?: Function;
  onMouseEnter?: Function;
  onMouseLeave?: Function;
};

export type State = Box[];

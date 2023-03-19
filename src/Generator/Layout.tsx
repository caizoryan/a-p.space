import {
  Component,
  ParentComponent,
  For,
  Show,
  createEffect,
  createSignal,
} from "solid-js";
import { styleToString } from "./Utils";
import type { State, Box } from "./Types";

// This is the main compoenet, we can pass it our State and it will generate ui based on it
const Layout: Component<{ state: State }> = (props) => {
  return (
    <For each={props.state}>
      {(boxState) => (
        <Show when={boxState.active}>
          <Box state={boxState}>
            <For each={boxState.children}>{(child) => child}</For>
          </Box>
        </Show>
      )}
    </For>
  );
};

// This is the Box component Layout will use to make stuff, it takes in the styles and renders it
// it has a createEffect hook so it will re render whenever we change the state
const Box: ParentComponent<{ state: Box }> = (props) => {
  const [styleString, setStyleString] = createSignal("");
  createEffect(() => {
    setStyleString(styleToString(props.state.styles));
  });
  return (
    <>
      <div
        onClick={() => {
          props.state.events?.onClick
            ? props.state.events.onClick(props.state.name)
            : null;
        }}
        onMouseEnter={() =>
          props.state.events?.onMouseEnter
            ? props.state.events.onMouseEnter(props.state.name)
            : null
        }
        onMouseLeave={() =>
          props.state.events?.onMouseLeave
            ? props.state.events.onMouseLeave(props.state.name)
            : null
        }
        style={styleString()}
        class={props.state.class ? props.state.class : ""}
      >
        {props.children}
      </div>
    </>
  );
};

export { Layout, Box };

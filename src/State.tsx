import { createMutable } from "solid-js/store";
import { Loading } from "./Components";
import type { State } from "./Generator/Types";

const state = createMutable<State>([
  {
    index: 0,
    name: "background",
    styles: {
      width: `100vw`,
      height: `100vh`,
    },
    active: true,
  },
  {
    index: 1,
    name: "index",
    styles: {
      position: "fixed",
      top: "80vh",
      left: "2vw",
      width: "40vw",
      height: "10vh",
      border: "4px dashed rgb(245, 245, 245)",
      padding: "10px",
      transition: "all 300ms ease",
    },
    active: true,
    children: [<Loading></Loading>],
  },
]);

export { state };

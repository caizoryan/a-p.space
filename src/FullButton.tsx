import type { Component, Setter } from "solid-js";
import { createSignal, createEffect } from "solid-js";
import { state } from "./State";
import { quickUpdate } from "./Generator/Utils";
import { summoned } from "./App";

const FullButton: Component<{
  slug: string;
  setFull: Setter<boolean>;
  dimensions: { w: number; h: number };
}> = (props) => {
  let stupidStyle = `
    .full-screen{
      position: absolute; 
      left: 1%;
      top: 1%;
      padding: 10px;
      color: white;
      border: 1px white solid;
      font-size: 14px;
      font-family: 'Archivo Narrow', sans-serif;
      letter-spacing: .2em;
      cursor: pointer;
      animation: letter 5000ms ease-in-out infinite;
    }
    @keyframes letter{
      0%{
        letter-spacing: 0.1em;
        color: rgb(200, 200, 200);
        border: 1px rgb(200, 200, 200) solid;
      }
      50%{
        letter-spacing: 0.2em;
        color: white;
        border: 1px white solid;
      }
      100%{
        letter-spacing: 0.1em;
        color: rgb(200, 200, 200);
        border: 1px rgb(200, 200, 200) solid;
      }
}`;

  const [full, setFull] = createSignal(false);
  const [aside, setAside] = createSignal(false);

  createEffect(() => {
    if (summoned() === props.slug && aside()) {
      openPanel();
    }
  });

  function openPanel() {
    setFull(true);
    quickUpdate(state, props.slug, [
      ["width", `96vw`],
      ["height", `96vh`],
      ["top", "2vh"],
      ["left", "2vw"],
      ["position", "fixed"],
      ["zIndex", "10"],
    ]);
  }

  function closePanel(localAside: number) {
    setFull(false);
    if (aside()) {
      quickUpdate(state, props.slug, [
        ["width", `96vw`],
        ["height", props.dimensions.h + "vh"],
        ["top", localAside + "vh"],
        ["left", 100 - localAside + "vw"],
        ["position", "fixed"],
        ["zIndex", "2"],
      ]);
    }
  }
  let localAside = 0;
  return (
    <div style="width: 100%; height: 6%;">
      <style scoped>{stupidStyle}</style>
      <span
        class="full-screen"
        onClick={() => {
          if (full()) {
            closePanel(localAside);
          } else {
            if (!aside()) {
              props.setFull(true);
            }
            setAside(true);
            openPanel();
          }
        }}
      >
        {full() ? "Set Aside" : "FULLSCREEN"}
      </span>
    </div>
  );
};

export { FullButton };

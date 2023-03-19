import {
  For,
  Component,
  JSXElement,
  onMount,
  Switch,
  Match,
  createSignal,
} from "solid-js";
import { render } from "solid-js/web";
import { createMutable } from "solid-js/store";
import type { State } from "./Generator/Types";
import "./styles.css";
import { ArenaChannelContents, ArenaClient, ArenaBlock } from "arena-ts";
import { Layout } from "./Generator/Layout";
import { getParsedText } from "./Parser";
import { getObject, quickUpdate, updateChildren } from "./Generator/Utils";

const state = createMutable<State>([
  {
    index: 0,
    name: "background",
    styles: {
      position: "fixed",
      top: "0",
      left: "0",
      width: "40vw",
      height: "100vh",
    },
    class: "background",
    active: true,
  },
  {
    index: 1,
    name: "index",
    styles: {
      position: "fixed",
      top: "40vh",
      left: "30vw",
      width: "40vw",
      height: "10vh",
      border: "4px dashed rgb(245, 245, 245)",
      padding: "10px",
    },
    active: true,
  },
]);

const arena = new ArenaClient({
  token: "FCPRhgQEv6m8b7Wqv0OWf1nKqRFfYWu4N0QpfYRd1TY",
});

// components
const DefaultRenderer: Component<{ content: ArenaBlock[] }> = (props) => {
  let style = "";
  for (const x of props.content) {
    if (x.title === ".stylesheet" && x.content) style = x.content;
  }
  return (
    <div style="width: 100%; height: 100%; overflow: scroll;">
      <style>{style}</style>
      <For each={props.content}>
        {(block) => {
          return (
            <Switch>
              <Match when={block.class === "Image"}>
                <img src={block.image?.thumb.url}></img>
              </Match>
              <Match
                when={block.class === "Text" && block.title?.charAt(0) != "."}
              >
                {block.content ? getParsedText(block.content) : null}
              </Match>
            </Switch>
          );
        }}
      </For>
    </div>
  );
};

function init() {
  arena
    .channel("index-sve8kxyjw08")
    .get()
    .then((res) =>
      res.contents
        ? initIndex(structuredClone(res.contents))
        : console.log("failed")
    );
}

function initIndex(index: ArenaBlock[]) {
  console.log("response from arena to initialise the website", index);
  let indexContents: JSXElement;
  for (const x of index) {
    if (x.class === "Text" && x.content)
      indexContents = getParsedText(x.content);
  }
  updateChildren(state, "index", [indexContents]);
}

function generateBox(channelSlug: string) {
  // generate a random box and append to state
  let top, left;
  getLastTop() > 50
    ? (top = `${random(30) + 30}vh`)
    : (top = `${random(30)}vh`);
  left = `${random(10) + getLastLeft() + getLastWidth()}vw`;

  if (getObject(state, channelSlug) === undefined)
    state.push({
      index: state.length,
      name: channelSlug,
      styles: {
        position: "absolute",
        top: top,
        left: left,
        width: "50vw",
        height: "40vh",
        backgroundColor: "yellow",
        transition: "all 300ms ease",
      },
      active: true,
    });

  arena
    .channel(channelSlug)
    .get()
    .then((res) => {
      executeDotFiles(structuredClone(res.contents), channelSlug);
      res.contents
        ? updateChildren(state, channelSlug, [
            <DefaultRenderer
              content={structuredClone(res.contents)}
            ></DefaultRenderer>,
          ])
        : console.log("failed to fetch");
    });
  // expand the page to fit new content
  quickUpdate(state, "background", [["width", `${parseInt(left) + 60}vh`]]);
}
function executeDotFiles(content: ArenaBlock[], channelSlug: string) {
  for (const x of content) {
    if (x.title === ".width" && x.content) {
      quickUpdate(state, channelSlug, [["width", x.content]]);
    }
    if (x.title === ".height" && x.content) {
      quickUpdate(state, channelSlug, [["height", x.content]]);
    }
  }
}

init();
const App: Component = () => {
  return (
    <>
      <div style="position: fixed; bottom: 10px; left: 10px; font-family: mono; font-size: 12px; ">
        width: {window.innerWidth}, height: {window.innerHeight}
      </div>
      <div id="scroll" style="overflow: scroll">
        <Layout state={state}></Layout>
      </div>
    </>
  );
};

const root = document.getElementById("root");
render(() => <App />, root!);

const getLastTop = (): number => parseInt(state[state.length - 1].styles.top);
const getLastLeft = (): number => parseInt(state[state.length - 1].styles.left);
const getLastWidth = (): number =>
  parseInt(state[state.length - 1].styles.width);
const getLastHeight = (): number =>
  parseInt(state[state.length - 1].styles.height);
const random = (num: number): number => Math.random() * num;

export { generateBox };

import {
  For,
  Component,
  JSXElement,
  Switch,
  Match,
  createSignal,
  Show,
} from "solid-js";
import { render } from "solid-js/web";
import { createMutable } from "solid-js/store";
import type { State } from "./Generator/Types";
import "./styles.css";
import { ArenaChannelContents, ArenaClient, ArenaBlock } from "arena-ts";
import { Layout } from "./Generator/Layout";
import { getParsedText } from "./Parser";
import { getObject, quickUpdate, updateChildren } from "./Generator/Utils";
import { P5 } from "./P5";

const [width, setWidth] = createSignal(100);
const [height, setHeight] = createSignal(100);

type Renderer = Component<{ content: ArenaBlock[]; slug: string }>;

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
      position: "absolute",
      top: "40vh",
      left: "30vw",
      width: "40vw",
      height: "10vh",
      border: "4px dashed rgb(245, 245, 245)",
      padding: "10px",
      transition: "all 300ms ease",
    },
    active: true,
  },
]);

const arena = new ArenaClient({
  token: "FCPRhgQEv6m8b7Wqv0OWf1nKqRFfYWu4N0QpfYRd1TY",
});

// components
const DefaultRenderer: Renderer = (props) => {
  let dimensions = { w: 60, h: 60 };
  pushEverythingDown(dimensions.h);
  quickUpdate(state, props.slug, [
    ["width", `${dimensions.w}vw`],
    ["height", `${dimensions.h}vh`],
    ["top", "10vh"],
  ]);
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
const NavigationRenderer: Renderer = (props) => {
  let dimensions = { w: 60, h: 8 };
  quickUpdate(state, props.slug, [
    ["width", `${dimensions.w}vw`],
    ["height", `${dimensions.h}vh`],
    ["top", "90vh"],
    ["left", `${100 - (dimensions.w + 2)}vw`],
    ["position", "fixed"],
    ["display", "flex"],
    ["alignItems", "center"],
    ["zIndex", "9999"],
  ]);
  let style = `
    .nav{
      display: flex;
      justify-content: flex-end;
      width: 100%;
    }
    button{
      all: unset;
      border: 1px dashed rgb(200, 200, 200);
      padding: 10px;
      margin: 1vw;
    }
    button:hover{
    cursor: pointer;
      background: black;
      color: white;
    }
`;
  for (const x of props.content) {
    if (x.title === ".stylesheet" && x.content) style = x.content;
  }
  return (
    <div class="nav">
      <style scoped>{style}</style>
      <For each={props.content}>
        {(btn) => (
          <button onClick={() => generateBox(btn.slug)}>{btn.title}</button>
        )}
      </For>
    </div>
  );
};
const ProjectsRender: Renderer = (props) => {
  console.log(props.content);
  let dimensions = { w: 20, h: 80 };
  quickUpdate(state, props.slug, [
    ["width", `${dimensions.w}vw`],
    ["height", `${dimensions.h}vh`],
    ["top", "2vh"],
    ["left", `2vw`],
    ["position", "fixed"],
  ]);
  let style = `
    .projects{
      position: relative;
      width: 100%;
      height: 100%;
      border: 2px dotted black;
      transition: all 400ms ease-in-out;
    }
    .projects-container{
      overflow-y: scroll;
      height: 100%;
      width: 100%;
    }
    button{
      all: unset;
      border: 1px dashed rgb(200, 200, 200);
      padding: 10px;
      margin: 1vw;
      background: black;
      color: yellow;
    }
    button:hover{
      background: yellow;
      color: black;
      cursor: pointer;
    }
    .close{
      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 10px;
      cursor: pointer;
    }
    .closed{
      width: 10%;
      height: 10%;
      position: relative;
      transition: all 400ms ease-in-out;
    }
`;
  const [closed, setClosed] = createSignal(false);
  return (
    <>
      <div class={closed() ? "closed" : "projects"}>
        <style scoped>{style}</style>
        <p class="close" onClick={() => setClosed(!closed())}>
          {closed() ? "+" : "close"}
        </p>
        <Show when={!closed()}>
          <div class="projects-container">
            <For each={props.content}>
              {(btn) => (
                <button onClick={() => generateBox(btn.slug)}>
                  {btn.title}
                </button>
              )}
            </For>
          </div>
        </Show>
      </div>
    </>
  );
};

const renderers = new Map<string, Renderer>([
  ["navigation-4ids8d9_1cy", NavigationRenderer],
  ["projects-fat_s9oqj8", ProjectsRender],
]);

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
  if (getObject(state, channelSlug) === undefined) {
    // TODO use next height instead of last height
    state[0].styles.height = `${
      parseInt(state[0].styles.height) + getLastHeight() + 10
    }vh`;
    pushEverythingDown(10);

    state.push({
      index: state.length,
      name: channelSlug,
      styles: {
        position: "absolute",
        top: "10vh",
        left: `${random(40)}vw`,
        width: "10vw",
        height: "10vh",
        // border: "1px solid black",
        transition: "all 300ms ease-in-out",
      },
      active: true,
      children: [<Loading></Loading>],
    });
    arena
      .channel(channelSlug)
      .get()
      .then((res) => {
        executeDotFiles(structuredClone(res.contents), channelSlug);
        res.contents
          ? renderContent(structuredClone(res.contents), channelSlug)
          : console.log("failed to fetch");
      });
  }
}

function renderContent(content: ArenaBlock[], slug: string) {
  if (renderers.has(slug)) {
    let LocalRenderer: Renderer = renderers.get(slug);
    updateChildren(state, slug, [
      <LocalRenderer
        content={structuredClone(content)}
        slug={slug}
      ></LocalRenderer>,
    ]);
  } else {
    updateChildren(state, slug, [
      <DefaultRenderer
        content={structuredClone(content)}
        slug={slug}
      ></DefaultRenderer>,
    ]);
  }
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

const Loading: Component = () => {
  const style = `
  .loading{
    background: grey;
    animation: load 500ms ease-in-out infinite;
    height: 100%;
    width: 100%;
  }
  @keyframes load{
    0%{
      background: grey;
    }
    50%{
      background: white;
    }
    100%{
      background: grey;
    }
  }
`;
  return (
    <div class="loading">
      <style scoped>{style}</style>
      <span style="padding: 10px">Loading...</span>
    </div>
  );
};

init();
const App: Component = () => {
  return (
    <>
      <P5></P5>
      <div style="position: fixed; bottom: 10px; left: 10px; font-family: mono; font-size: 12px; ">
        width: {width()}, height: {height()}
      </div>
      <div
        id="scroll"
        style={`overflow-y: scroll; width: 100vw; height: 100vh; position: fixed; top: 0; left: 0`}
      >
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

function pushEverythingDown(value: number) {
  for (const box of state) {
    if (box.styles.position === "absolute")
      box.styles.top = `${parseInt(box.styles.top) + value}vh`;
  }
}

export { generateBox };

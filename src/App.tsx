import {
  For,
  Component,
  JSXElement,
  Switch,
  Match,
  createSignal,
  Show,
  createEffect,
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
import { Loading } from "./Components";

const [width, setWidth] = createSignal(100);
const [height, setHeight] = createSignal(100);
const [summoned, setSummoned] = createSignal("");
let asideValue = 0;
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

const arena = new ArenaClient();

// components
const DefaultRenderer: Renderer = (props) => {
  let dimensions = { w: 60, h: 70 };
  pushEverythingDown(dimensions.h);
  quickUpdate(state, props.slug, [
    ["width", `${dimensions.w}vw`],
    ["height", `${dimensions.h}vh`],
    ["top", "10vh"],
  ]);
  const [style, setStyle] = createSignal("");
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
  for (const x of props.content) {
    if (x.title === ".stylesheet" && x.content) setStyle(style() + x.content);
  }

  let localAside = 0;
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

  function closePanel() {
    setFull(false);
    if (aside()) {
      quickUpdate(state, props.slug, [
        ["width", `96vw`],
        ["height", dimensions.h + "vh"],
        ["top", localAside + "vh"],
        ["left", 100 - localAside + "vw"],
        ["position", "fixed"],
        ["zIndex", "2"],
      ]);
    }
  }
  console.log(props.content);
  return (
    <div
      id={props.slug}
      style="background: rgba(240, 240, 240, 100); width: 100%; height: 100%;  position: relative;"
    >
      <style>{style() + stupidStyle}</style>
      <div style="width: 100%; height: 6%;">
        <span
          class="full-screen"
          onClick={() => {
            if (full()) {
              closePanel();
            } else {
              if (!aside()) {
                asideValue += 2;
                localAside = asideValue;
              }
              setAside(true);
              openPanel();
            }
          }}
        >
          {full() ? "Set Aside" : "FULLSCREEN"}
        </span>
      </div>
      <div
        style="width: 100%; height: 92%; margin-top: 1%;overflow: scroll; display: flex; flex-direction: column;"
        onClick={() => {
          if (!full() && aside()) {
            setFull(true);
          }
        }}
      >
        <For each={props.content}>
          {(block) => {
            if (block.description) {
              setStyle(style() + `.${block.title}{${block.description}}`);
            }
            return (
              <Switch>
                <Match when={block.class === "Link"}>
                  <a href={block.source?.url} target="_blank">
                    <button class={block.title ? block.title : ""}>
                      {block.title}
                    </button>
                  </a>
                </Match>
                <Match when={block.class === "Channel"}>
                  <button
                    class={block.title ? block.title : ""}
                    onClick={() => generateBox(block.slug)}
                  >
                    {block.title}
                  </button>
                </Match>
                <Match when={block.class === "Image"}>
                  <Switch>
                    <Match when={full()}>
                      <img
                        class={block.title ? block.title : ""}
                        style="width: 96%; margin: 2%;"
                        src={block.image?.original.url}
                      ></img>
                    </Match>
                    <Match when={!full()}>
                      <img
                        class={block.title ? block.title : ""}
                        style="width: 96%; margin: 2%;"
                        src={block.image?.display.url}
                      ></img>
                    </Match>
                  </Switch>
                </Match>
                <Match
                  when={block.class === "Text" && block.title?.charAt(0) != "."}
                >
                  <p
                    style="width: 90%; margin: 2%;"
                    class={block.title ? block.title : ""}
                  >
                    {block.content ? getParsedText(block.content) : null}
                  </p>
                </Match>
              </Switch>
            );
          }}
        </For>
      </div>
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
  let dimensions = { w: 30, h: 80 };
  let style = ``;
  for (const x of props.content) {
    if (x.title === ".stylesheet" && x.content) style = x.content;
  }
  quickUpdate(state, props.slug, [
    ["width", `${dimensions.w}vw`],
    ["height", `${dimensions.h}vh`],
    ["top", "2vh"],
    ["left", `2vw`],
    ["position", "fixed"],
  ]);
  const [closed, setClosed] = createSignal(false);
  createEffect(() => {
    if (!closed()) {
      quickUpdate(state, props.slug, [
        ["width", `${dimensions.w}vw`],
        ["height", `${dimensions.h}vh`],
      ]);
    } else {
      quickUpdate(state, props.slug, [
        ["width", `2vw`],
        ["height", `2vh`],
      ]);
    }
  });
  return (
    <>
      <div class={closed() ? "closed" : "projects"}>
        <style scoped>{style}</style>
        <p class="close" onClick={() => setClosed(!closed())}>
          {closed() ? "open" : "close"}
        </p>
        <Show when={!closed()}>
          <div class="projects-container">
            <For each={props.content}>
              {(btn) => {
                if (btn.class === "Channel")
                  return (
                    <button onClick={() => generateBox(btn.slug)}>
                      {btn.title}
                    </button>
                  );
              }}
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
const scrollToMyRef = (id: string) => {
  var ref = document.querySelector("#" + id);
  setTimeout(function () {
    ref
      ? ref.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      : null;
  }, 100);
};

function generateBox(channelSlug: string) {
  if (getObject(state, channelSlug) === undefined) {
    setSummoned("");
    pushEverythingDown(2);
    state.push({
      index: state.length,
      name: channelSlug,
      styles: {
        position: "absolute",
        top: "10vh",
        left: `${31 + random(10)}vw`,
        width: "20vw",
        height: "5vh",
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
      })
      .then(() => scrollToMyRef(channelSlug));
  } else {
    setSummonedTo(channelSlug);
    scrollToMyRef(channelSlug);
  }
}
function setSummonedTo(channelSlug: string) {
  if (summoned() === channelSlug) {
    setSummoned("");
    setTimeout(() => {
      setSummoned(channelSlug);
    }, 10);
  } else {
    setSummoned(channelSlug);
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

function pushEverythingDown(value: number) {
  state[0].styles.height = `${
    parseInt(state[0].styles.height) + getLastHeight()
  }vh`;
  for (const box of state) {
    if (box.styles.position === "absolute")
      box.styles.top = `${parseInt(box.styles.top) + value}vh`;
  }
}

export { generateBox };

import { Component, JSXElement, onMount } from "solid-js";
import { render } from "solid-js/web";
import { createMutable } from "solid-js/store";
import type { State } from "./Generator/Types";
import "./styles.css";
import { ArenaChannelContents, ArenaClient } from "arena-ts";
import { Layout } from "./Generator/Layout";
import { getParsedText } from "./Parser";

const state = createMutable<State>([
  {
    index: 0,
    name: "index",
    styles: {
      position: "fixed",
      top: "10px",
      left: "10px",
      width: "40vw",
      height: "10vh",
    },
    active: true,
  },
]);

const arena = new ArenaClient({
  token: "FCPRhgQEv6m8b7Wqv0OWf1nKqRFfYWu4N0QpfYRd1TY",
});

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

function initIndex(index: ArenaChannelContents[]) {
  console.log("response from arena to initialise the website", index);
  let indexContents: JSXElement;
  for (const x of index) {
    if (x.class === "Text" && x.content)
      indexContents = getParsedText(x.content);
  }
  state[0].children = [indexContents];
}

function generateBox(channelSlug: string) {
  // generate a random box and append to state
  state.push({
    index: state.length,
    name: channelSlug,
    styles: {
      position: "fixed",
      top: "100px",
      left: "400px",
      width: "500px",
      height: "300px",
      backgroundColor: "yellow",
    },
    active: true,
  });
  // give it a loading state child
  // when you get data from are.na use a renderer (Component) and switch out child
}

const App: Component = () => {
  onMount(() => {
    console.log(
      "Hey! Welcome to my website\n Cool of you to check out the console. Anyways, this is an additional part of my website so keep checking here for ++"
    );
    init();
  });

  return <Layout state={state}></Layout>;
};

const root = document.getElementById("root");
render(() => <App />, root!);

export { generateBox };

import type { Styles, State, Box } from "./Types";

function transformState(state: State, newState: State) {
  updateMultiple(state, newState);
  for (const x of state) x.active = true;
  if (state.length > newState.length) {
    for (let i = newState.length; i < state.length; i++) {
      state[i].active = false;
    }
  }
}

function updateMultiple(state: State, newState: State) {
  for (const x of newState) {
    updateState(state, x);
  }
}

// accept an object instead?
function updateState(state: State, box: Box) {
  let obj = getObject(state, box.name);
  if (obj) {
    for (const [key, value] of Object.entries(box.styles)) {
      if (value === "RESET") obj.styles = {};
      else if (value === "DELETE" && obj.styles[key]) delete obj.styles[key];
      else obj.styles[key] = value;
    }
    if (box.children) obj.children = box.children;
    if (box.class) obj.class = box.class;
  } else {
    if (box.class)
      state.push({
        index: state.length,
        name: box.name,
        styles: box.styles,
        active: true,
        children: box.children,
        class: box.class,
      });
    else if (box.children)
      state.push({
        index: state.length,
        name: box.name,
        styles: box.styles,
        active: true,
        children: box.children,
      });
    else
      state.push({
        index: state.length,
        name: box.name,
        styles: box.styles,
        active: true,
      });
  }
}

function updateChildren(state: State, name: string, children: any[]) {
  let obj = getObject(state, name);
  obj ? (obj.children = children) : console.log("name incorrect");
}

function quickUpdate(state: State, name: string | string[], style: string[][]) {
  if (typeof name === "string") {
    let obj = getObject(state, name);
    for (const x of style) {
      obj ? (obj.styles[x[0]] = x[1]) : console.log("wrong name");
    }
  } else
    for (const i of name) {
      let obj = getObject(state, i);
      for (const x of style) {
        obj ? (obj.styles[x[0]] = x[1]) : console.log("wrong name");
      }
    }
}

function getObject(state: State, name: string) {
  return state.find((o) => o.name === name);
}

function styleToString(styles: Object) {
  // helper function
  const kebabize = (str: string) => {
    return str
      .split("")
      .map((letter: string, idx: number) => {
        return letter.toUpperCase() === letter
          ? `${idx !== 0 ? "-" : ""}${letter.toLowerCase()}`
          : letter;
      })
      .join("");
  };

  let swap = "";
  for (const [key, value] of Object.entries(styles)) {
    swap += `${kebabize(key)}: ${value};`;
  }
  return swap;
}
export {
  updateChildren,
  styleToString,
  quickUpdate,
  updateState,
  transformState,
  getObject,
};

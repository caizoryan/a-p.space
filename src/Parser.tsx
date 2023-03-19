import { generateBox } from "./App";
import { JSXElement } from "solid-js";
// utils
function getParsedText(text: string): JSXElement {
  let words = text.split(" ");
  let outputWords = [];
  let where: "word" | "name" = "word";
  for (const word of words) {
    let letters = word.split("");
    if (where === "word") {
      if (letters[0] === "#" && letters[letters.length - 1] === "#") {
        outputWords.push(extractLink(word.substring(1)));
      } else if (letters[0] === "#") {
        outputWords.push({
          type: "link",
          word: word.substring(1),
          link: "",
          linkType: "",
        });
        where = "name";
      } else {
        outputWords.push({ type: "word", word: word, link: "", linkType: "" });
      }
    } else if (where == "name") {
      if (letters[letters.length - 1] === "#") {
        let toPush = extractLink(word);
        outputWords[outputWords.length - 1].word += ` ${toPush.word}`;
        outputWords[outputWords.length - 1].link = toPush.link;
        outputWords[outputWords.length - 1].linkType = toPush.linkType;
        where = "word";
      } else {
        outputWords[outputWords.length - 1].word += ` ${word}`;
      }
    }
  }
  let elems = [];
  for (const x of outputWords) {
    if (x.type === "word") elems.push(x.word + " ");
    else {
      if (x.linkType === "block")
        elems.push(
          <a href={"https://www.are.na/block/" + x.link}>{x.word + " "}</a>
        );
      else if (x.linkType === "channel")
        elems.push(
          <span
            onClick={() => {
              generateBox(x.link);
            }}
            style="cursor: pointer"
          >
            {"((" + x.word + ")) "}
          </span>
        );
      else if (x.linkType === "link")
        elems.push(<a href={x.link}>{x.word + " "}</a>);
    }
  }
  return <>{...elems}</>;
}

function extractLink(str: string): {
  type: "link";
  word: string;
  link: string;
  linkType: "block" | "channel" | "link";
} {
  let letters = str.split("");
  let where: "name" | "block" | "channel" | "link" | "gotLink" = "name";
  let name = "";
  let type: "block" | "channel" | "link" = "block";
  let link = "";
  for (const letter of letters) {
    if (where === "name") {
      if (letter != "#") name += letter;
      else if (letter === "#") {
        where = "block";
        type = "block";
      }
    } else {
      if (letter === "#" && where === "block") {
        where = "channel";
        type = "channel";
      } else if (letter === "#" && where === "channel") {
        where = "link";
        type = "link";
      } else {
        where = "gotLink";
        if (letter != "#") link += letter;
      }
    }
  }
  return { word: name, link: link, type: "link", linkType: type };
}

export { getParsedText };

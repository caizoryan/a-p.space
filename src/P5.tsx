import p5 from "p5";
import { Component } from "solid-js";

export const P5: Component = () => {
  const s = (p) => {
    let chars = "69420".split("");
    let pos1, pos2;
    p.setup = () => {
      p.createCanvas(innerWidth, innerHeight);
      pos1 = { x: p.random(p.width), y: p.random(p.height) };
      pos2 = { x: p.random(p.width), y: p.random(p.height) };
      p.textSize(10);
      p.frameRate(20);
    };
    p.draw = () => {
      p.background(255, 10);
      p.strokeWeight(0.1);
      p.fill(0, 27);
      if (p.random() > 0.85)
        p.text(
          chars[Math.floor(p.random(chars.length))],
          p.mouseX + p.random(-20, 20),
          p.mouseY + p.random(-20, 20)
        );
      p.push();
      p.translate(
        pos1.x + p.map(p.mouseY, 0, p.height, -p.height / 2, p.height / 2),
        pos1.y + p.map(p.mouseX, 0, p.width, -p.width / 2, p.width / 2)
      );
      p.rotate(p.map(p.mouseX, 0, p.width, 0, 5));
      p.circle(200, 200, p.random(5) + 5);
      p.pop();

      p.push();
      p.translate(
        pos2.x + p.map(p.mouseY, 0, p.height, -p.height / 2, p.height / 2),
        pos2.y + p.map(p.mouseX, 0, p.width, -p.width / 2, p.width / 2)
      );
      p.rotate(p.map(p.mouseY, 0, p.height, 0, 8));
      p.circle(200, 200, p.random(5) + 5);
      p.pop();
    };
  };
  new p5(s, document.getElementById("p5")!);
  return (
    <div
      id="p5"
      style="position: fixed; width: 100vw; height: 100vh; top: 0; left: 0"
    ></div>
  );
};

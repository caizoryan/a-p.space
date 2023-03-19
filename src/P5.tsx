import p5 from "p5";
import { Component } from "solid-js";

export const P5: Component = () => {
  const s = (p) => {
    p.setup = () => {
      p.createCanvas(innerWidth, innerHeight);
    };
    p.draw = () => {
      p.background(255);
      p.strokeWeight(0.1);
      p.line(p.mouseX, 0, p.mouseX, p.height);
      p.line(0, p.mouseY, p.width, p.mouseY);
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

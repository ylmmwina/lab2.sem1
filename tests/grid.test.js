// grid.test.js — тести для модуля grid.js

import { test, assert, assertEqual } from "./core.js";
import { gridState } from "../js/state.js";
import { createGrid, paint, clearGrid } from "../js/grid.js";

test("grid: createGrid builds 8x8 = 64 cells", () => {
    const canvas = document.getElementById("canvas-grid");
    assert(canvas, "#canvas-grid not found");

    canvas.innerHTML = "";
    createGrid(canvas, () => {});

    assertEqual(canvas.children.length, 64, "canvas must have 64 pixel buttons");
});

test("grid: paint() changes state and increments filled counter", () => {
    const canvas = document.getElementById("canvas-grid");
    const counterEl = document.getElementById("counter");
    assert(canvas && counterEl, "canvas or counter not found");

    // очистити стан
    gridState.fill("");
    createGrid(canvas, () => {});

    const beforeFilled = gridState.filter(x => x && x !== "").length;

    paint(0, "#123456", canvas, counterEl, () => {});
    const afterFilled = gridState.filter(x => x && x !== "").length;

    assertEqual(gridState[0], "#123456", "cell[0] must have new color");
    assertEqual(afterFilled, beforeFilled + 1, "filled cells must increase by 1");
    assert(
        counterEl.textContent.includes(String(afterFilled)),
        "counter text must contain new filled count"
    );
});

test("grid: clearGrid() wipes cells and resets counter", () => {
    const canvas = document.getElementById("canvas-grid");
    const counterEl = document.getElementById("counter");
    assert(canvas && counterEl, "canvas or counter not found");

    // заповнюємо все
    gridState.fill("#ff0000");
    createGrid(canvas, () => {});

    clearGrid(canvas, counterEl, () => {});
    const filled = gridState.filter(x => x && x !== "").length;

    assertEqual(filled, 0, "all cells must be empty after clearGrid()");
    assert(
        counterEl.textContent.includes("0"),
        "counter must show 0 filled after clearGrid()"
    );
});

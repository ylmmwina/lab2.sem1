// grid.test.js — тести для модуля grid.js

import { test, assert, assertEqual } from "./core.js";
import { gridState } from "../js/state.js";
import { createGrid, paint, clearGrid } from "../js/grid.js";

function makeTestGrid() {
    const canvas = document.getElementById("canvas-grid");
    assert(canvas, "#canvas-grid not found");

    canvas.innerHTML = "";

    const handler = window.onCellClick || (() => {});
    createGrid(canvas, handler);

    return canvas;
}

test("grid: createGrid builds 8x8 = 64 cells", () => {
    const canvas = makeTestGrid();
    assertEqual(canvas.children.length, 64, "canvas must have 64 pixel buttons");
});

test("grid: paint() changes state and increments filled counter", () => {
    const canvas = makeTestGrid();
    const counterEl = document.getElementById("counter");
    assert(counterEl, "#counter not found");

    gridState.fill("");

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
    const canvas = makeTestGrid();
    const counterEl = document.getElementById("counter");
    assert(counterEl, "#counter not found");

    gridState.fill("#ff0000");

    clearGrid(canvas, counterEl, () => {});
    const filled = gridState.filter(x => x && x !== "").length;

    assertEqual(filled, 0, "all cells must be empty after clearGrid()");
    assert(
        counterEl.textContent.includes("0"),
        "counter must show 0 filled after clearGrid()"
    );
});

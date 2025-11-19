// history.test.js — тести для undo/redo (history.js)

import {
    test,
    assert,
    assertEqual,
    assertArrayEquals,
} from "./core.js";

import { gridState, renderFromState } from "../js/state.js";
import {
    initHistory,
    pushHistory,
    undo,
    redo,
    canUndo,
    canRedo,
} from "../js/history.js";
import { createGrid } from "../js/grid.js";

function setupCanvas() {
    const canvas = document.getElementById("canvas-grid");
    const counterEl = document.getElementById("counter");
    assert(canvas && counterEl, "canvas or counter not found");

    canvas.innerHTML = "";
    gridState.fill("");

    const handler = window.onCellClick || (() => {});
    createGrid(canvas, handler);

    return { canvas, counterEl };
}

test("history: undo returns previous snapshot", () => {
    const { canvas, counterEl } = setupCanvas();

    initHistory();

    pushHistory();
    const snap0 = [...gridState];

    gridState[0] = "#111111";
    pushHistory();
    const snap1 = [...gridState];

    assert(canUndo(), "must be able to undo after 2 snapshots");
    assert(!canRedo(), "redo must be empty before undo");

    undo(canvas, counterEl, renderFromState);

    assertArrayEquals(gridState, snap0, "undo must restore previous snapshot");
    assert(canRedo(), "after undo we must be able to redo");
});

test("history: redo returns next snapshot after undo", () => {
    const { canvas, counterEl } = setupCanvas();

    initHistory();

    pushHistory();
    const snap0 = [...gridState];

    gridState[0] = "#222222";
    pushHistory();
    const snap1 = [...gridState];

    undo(canvas, counterEl, renderFromState);
    assertArrayEquals(gridState, snap0, "undo must restore snap0 before redo test");

    redo(canvas, counterEl, renderFromState);

    assertArrayEquals(gridState, snap1, "redo must restore next snapshot");
    assert(canUndo(), "after redo undo must be available again");
});
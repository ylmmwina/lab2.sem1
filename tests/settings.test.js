// settings.test.js — тести для модуля settings.js

import {
    test,
    assert,
    assertEqual,
} from "./core.js";

import { gridState } from "../js/state.js";
import { createGrid } from "../js/grid.js";
import { initSettings } from "../js/settings.js";

const BORDER_KEY = "pixel-mood:settings:borders";
const SOUND_KEY  = "pixel-mood:settings:sound";
const STORAGE_KEY = "pixel-mood:canvas";

function setup() {
    const canvas = document.getElementById("canvas-grid");
    const counterEl = document.getElementById("counter");
    const bordersCheckbox = document.getElementById("toggle-borders");
    const soundCheckbox = document.getElementById("toggle-sound");
    const resetBtn = document.getElementById("app-reset");

    assert(canvas && counterEl && bordersCheckbox && soundCheckbox && resetBtn,
        "elements for settings not found");

    canvas.innerHTML = "";
    gridState.fill("");

    const handler = window.onCellClick || (() => {});
    createGrid(canvas, handler);

    localStorage.removeItem(BORDER_KEY);
    localStorage.removeItem(SOUND_KEY);

    initSettings(canvas, counterEl, () => {}, () => {});

    return { canvas, counterEl, bordersCheckbox, soundCheckbox, resetBtn };
}

test("settings: border toggle adds/removes .with-border class", () => {
    const { canvas, bordersCheckbox } = setup();

    const cells = [...canvas.children];
    assert(cells.length === 64, "must have 64 cells");

    bordersCheckbox.checked = true;
    bordersCheckbox.dispatchEvent(new Event("change"));

    assert(
        cells.every(c => c.classList.contains("with-border")),
        "all cells must have .with-border when enabled"
    );

    bordersCheckbox.checked = false;
    bordersCheckbox.dispatchEvent(new Event("change"));

    assert(
        cells.every(c => !c.classList.contains("with-border")),
        "cells must remove .with-border when disabled"
    );
});

test("settings: border toggle is stored in localStorage", () => {
    const { bordersCheckbox } = setup();

    bordersCheckbox.checked = true;
    bordersCheckbox.dispatchEvent(new Event("change"));
    assertEqual(localStorage.getItem(BORDER_KEY), "1", "borders must save '1'");

    bordersCheckbox.checked = false;
    bordersCheckbox.dispatchEvent(new Event("change"));
    assertEqual(localStorage.getItem(BORDER_KEY), "0", "borders must save '0'");
});

test("settings: reset clears gridState, storage and checkboxes", () => {
    const { bordersCheckbox, soundCheckbox, resetBtn } = setup();

    gridState[0] = "#ff0000";
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gridState));
    localStorage.setItem(BORDER_KEY, "1");
    localStorage.setItem(SOUND_KEY, "1");
    bordersCheckbox.checked = true;
    soundCheckbox.checked = true;

    resetBtn.click();

    assert(
        gridState.every(x => x === ""),
        "gridState must be fully cleared"
    );

    assert(localStorage.getItem(STORAGE_KEY) === null, "canvas state must be cleared");
    assert(localStorage.getItem(BORDER_KEY) === null, "borders setting must be removed");
    assert(localStorage.getItem(SOUND_KEY) === null, "sound setting must be removed");

    assert(!bordersCheckbox.checked, "border checkbox must reset to unchecked");
    assert(!soundCheckbox.checked, "sound checkbox must reset to unchecked");
});
// palette.test.js — тести для модуля palette.js

import { test, assert } from "./core.js";
import { gridState } from "../js/state.js";
import { randomColor, pipette } from "../js/palette.js";

test("palette: randomColor() sets valid #RRGGBB value", () => {
    const input = document.createElement("input");
    let logged = null;

    randomColor(input, (action, details) => {
        logged = { action, details };
    });

    const value = input.value;
    assert(/^#[0-9a-fA-F]{6}$/.test(value), "randomColor must set #RRGGBB");

    // необов'язково, але приємно: перевіримо лог
    assert(logged !== null, "randomColor should log action");
    assert(logged.action === "palette:random", "log action name mismatch");
});

test("palette: pipette() picks color from gridState[index] and clears is-active", () => {
    const input = document.createElement("input");
    const btn = document.createElement("button");
    btn.id = "pipette";
    btn.classList.add("is-active");

    gridState[0] = "#abcdef";

    let logged = null;
    pipette(0, input, btn, (action, details) => {
        logged = { action, details };
    });

    assert(input.value === "#abcdef", "pipette must set input.value to picked color");
    assert(!btn.classList.contains("is-active"), "pipette button must remove is-active class");
    assert(logged !== null, "pipette should log action");
    assert(logged.action === "pipette", "pipette log action name mismatch");
});
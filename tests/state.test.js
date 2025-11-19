// state.test.js — перевірка модуля state.js

import { test, assert, assertEqual, assertArrayEquals } from "./core.js";
import { gridState, snapshot, setGridState } from "../js/state.js";

test("state: gridState has 64 empty cells", () => {
    assert(Array.isArray(gridState), "gridState is not array");
    assertEqual(gridState.length, 64, "gridState length must be 64");
    assert(gridState.every(x => x === "" || typeof x === "string"), "gridState must contain strings");
});

test("state: snapshot() returns a deep copy", () => {
    const snap1 = snapshot();
    gridState[0] = "#000000";
    const snap2 = snapshot();

    assert(snap1[0] !== snap2[0], "snapshot must be deep copy, not reference");
});

test("state: setGridState() replaces values but keeps array identity", () => {
    const oldRef = gridState;

    const newData = Array(64).fill("#ff00ff");
    setGridState(newData);

    assert(gridState === oldRef, "gridState reference must stay the same");
    assertArrayEquals(gridState, newData, "gridState must match newData");
});
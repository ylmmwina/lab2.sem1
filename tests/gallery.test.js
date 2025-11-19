// gallery.test.js — тести для модуля gallery.js

import {
    test,
    assert,
    assertEqual,
    assertArrayEquals,
} from "./core.js";

import { gridState } from "../js/state.js";
import { createGrid } from "../js/grid.js";
import { initGallery } from "../js/gallery.js";

const PRESETS_KEY = "pixel-mood:presets";

function setupCanvasAndGallery() {
    const canvas = document.getElementById("canvas-grid");
    const counterEl = document.getElementById("counter");
    assert(canvas && counterEl, "#canvas-grid або #counter не знайдено");

    canvas.innerHTML = "";
    gridState.fill("");

    const handler = window.onCellClick || (() => {});
    createGrid(canvas, handler);

    initGallery(canvas, counterEl, () => {}, () => {});
    const saveBtn   = document.getElementById("preset-save");
    const loadBtn   = document.getElementById("preset-load");
    const removeBtn = document.getElementById("preset-remove");
    const select    = document.getElementById("preset-select");

    assert(saveBtn && loadBtn && removeBtn && select, "елементи галереї не знайдені");

    return { canvas, counterEl, saveBtn, loadBtn, removeBtn, select };
}

function getPresetsFromStorage() {
    const raw = localStorage.getItem(PRESETS_KEY);
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
    } catch {}
    return [];
}

function createOnePresetWithKnownColor(color = "#aa0000") {
    localStorage.removeItem(PRESETS_KEY);

    const { saveBtn, select } = setupCanvasAndGallery();

    gridState.fill("");
    gridState[0] = color;

    const originalPrompt = window.prompt;
    window.prompt = () => "Test preset";

    saveBtn.click();

    window.prompt = originalPrompt;

    const presets = getPresetsFromStorage();
    assertEqual(presets.length, 1, "має бути рівно 1 пресет після збереження");

    assertEqual(select.options.length, 1, "select має містити 1 пресет-опцію");
    assertEqual(select.options[0].textContent, "Test preset", "назва опції має збігатися з назвою пресету");

    return { presets, color };
}

test("gallery: save creates preset and adds option to select", () => {
    localStorage.removeItem(PRESETS_KEY);
    const { presets } = createOnePresetWithKnownColor("#bb0000");

    assertEqual(presets.length, 1, "після save повинен бути 1 пресет у localStorage");
    assertEqual(typeof presets[0].id, "string", "пресет повинен мати id");
    assertEqual(presets[0].name, "Test preset", "назва пресету має бути 'Test preset'");
    assert(Array.isArray(presets[0].data), "пресет повинен містити масив data");
    assertEqual(presets[0].data.length, gridState.length, "довжина data має збігатися з gridState");
});

test("gallery: load preset restores gridState from selected preset", () => {
    localStorage.removeItem(PRESETS_KEY);
    const targetColor = "#123456";
    const { presets } = createOnePresetWithKnownColor(targetColor);

    const savedData = presets[0].data;
    assertEqual(savedData[0], targetColor, "збережений пресет має колір у першій клітинці");

    const { canvas, counterEl, loadBtn } = setupCanvasAndGallery();

    gridState.fill("");
    const handler = window.onCellClick || (() => {});
    createGrid(canvas, handler);

    loadBtn.click();

    const afterLoad = [...gridState];
    assertArrayEquals(afterLoad, savedData, "load повинен відновити data з пресету");
    assertEqual(afterLoad[0], targetColor, "перша клітинка після load має мати колір з пресету");
});

test("gallery: remove preset deletes it from localStorage", () => {
    localStorage.removeItem(PRESETS_KEY);
    createOnePresetWithKnownColor("#00ff00");

    let presets = getPresetsFromStorage();
    assertEqual(presets.length, 1, "для тесту remove потрібен 1 пресет");

    const { removeBtn } = setupCanvasAndGallery();

    removeBtn.click();

    presets = getPresetsFromStorage();
    assertEqual(presets.length, 0, "після remove пресети мають бути видалені з localStorage");
});
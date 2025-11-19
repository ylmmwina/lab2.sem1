// history.js — undo/redo стек

import { snapshot, setGridState } from './state.js';

let history = [];
let redoStack = [];

export function initHistory() {
    history = [];
    redoStack = [];
}

export function pushHistory() {
    history.push(snapshot());
    redoStack.length = 0;
}

export function undo(canvasGrid, counterEl, renderFn) {
    if (history.length <= 1) return;

    const last = history.pop();
    redoStack.push(last);

    const prev = history[history.length - 1];
    setGridState(prev);
    renderFn(canvasGrid, counterEl);
}

export function redo(canvasGrid, counterEl, renderFn) {
    if (!redoStack.length) return;

    const next = redoStack.pop();
    history.push(next);

    setGridState(next);
    renderFn(canvasGrid, counterEl);
}

export function canUndo() {
    return history.length > 1;
}

export function canRedo() {
    return redoStack.length > 0;
}

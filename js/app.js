// app.js — головний модуль застосунку

import {
    SIZE,
    gridState,
    renderFromState,
    updateCounter,
} from './state.js';

import {
    initHistory,
    pushHistory as historyPush,
    undo as historyUndo,
    redo as historyRedo,
    canUndo,
    canRedo,
} from './history.js';

import {
    createGrid,
    paint as paintCell,
    clearGrid as clearGridImpl,
} from './grid.js';

import {
    randomColor as randomColorImpl,
    pipette as pipetteImpl,
} from './palette.js';

import { applyBackground as applyBackgroundImpl } from './background.js';

import {
    saveToStorage as saveToStorageImpl,
    loadFromStorage as loadFromStorageImpl,
} from './storage.js';

import { exportPNG as exportPNGImpl } from './exporter.js';

import {
    initSettings,
    notifyPaintClick,
} from './settings.js';

import { initGallery } from './gallery.js';

// ========= ЕЛЕМЕНТИ =========
const canvasGrid = document.getElementById('canvas-grid');
const colorInput = document.getElementById('color');
const bgInput    = document.getElementById('bg');
const applyBgBtn = document.getElementById('apply-bg');
const clearBtn   = document.getElementById('clear');
const randomBtn  = document.getElementById('random');
const counterEl  = document.getElementById('counter');

const undoBtn    = document.getElementById('undo');
const redoBtn    = document.getElementById('redo');
const saveBtn    = document.getElementById('save');
const loadBtn    = document.getElementById('load');
const exportBtn  = document.getElementById('export');
const pipetteBtn = document.getElementById('pipette');

// ========= ІСТОРІЯ ДІЙ (ТАБЛИЦЯ) =========
const historyBody = document.getElementById('history-body');
let actionIndex = 1;

// Додати запис в історію (нове вгору)
function logAction(action, details = '') {
    if (!historyBody) return; // на випадок, якщо блоку ще нема в HTML
    const tr = document.createElement('tr');
    const td1 = document.createElement('td'); td1.textContent = actionIndex++;
    const td2 = document.createElement('td'); td2.textContent = action;
    const td3 = document.createElement('td'); td3.textContent = details;
    tr.append(td1, td2, td3);
    historyBody.prepend(tr);
    const MAX_ROWS = 200;
    while (historyBody.children.length > MAX_ROWS) historyBody.lastChild.remove();
}

// Локальний стан
let isPipette = false;

// Обгортка над pushHistory з оновленням UI
function commitSnapshot() {
    historyPush();
    updateUndoRedoUI();
}

// Оновлення стану кнопок undo/redo
function updateUndoRedoUI() {
    if (!undoBtn || !redoBtn) return;
    undoBtn.disabled = !canUndo();
    redoBtn.disabled = !canRedo();
}

// ========= ҐРІД / ПОЛОТНО =========

function makeGrid() {
    createGrid(canvasGrid, onCellClick);

    // Ініціалізація історії та базового знімка
    initHistory();
    commitSnapshot();
    updateCounter(counterEl);
    logAction('grid:init', `${SIZE}×${SIZE} created`);
}

// Клік по клітинці (малювання / піпетка)
function onCellClick(index) {
    if (isPipette) {
        pipetteImpl(index, colorInput, pipetteBtn, logAction);
        isPipette = false;
        return;
    }
    handlePaint(index, colorInput.value);
}

function handlePaint(index, color) {
    paintCell(index, color, canvasGrid, counterEl, logAction);
    updateUndoRedoUI();
    notifyPaintClick();
}

function handleClearGrid() {
    clearGridImpl(canvasGrid, counterEl, logAction);
    updateUndoRedoUI();
}

// ========= ПАЛІТРА / ПІПЕТКА =========

function handleRandomColor() {
    randomColorImpl(colorInput, logAction);
}

function togglePipette() {
    isPipette = !isPipette;
    pipetteBtn.classList.toggle('is-active', isPipette);
    logAction('pipette', isPipette ? 'on' : 'off');
}

// ========= ФОН =========

function handleApplyBackground() {
    applyBackgroundImpl(bgInput, logAction);
}

// ========= UNDO / REDO =========

function handleUndo() {
    historyUndo(canvasGrid, counterEl, renderFromState);
    updateUndoRedoUI();
    logAction('undo');
}

function handleRedo() {
    historyRedo(canvasGrid, counterEl, renderFromState);
    updateUndoRedoUI();
    logAction('redo');
}

// ========= SAVE / LOAD =========

function handleSaveToStorage() {
    saveToStorageImpl(logAction);
}

function handleLoadFromStorage() {
    loadFromStorageImpl(canvasGrid, counterEl, logAction);
    updateUndoRedoUI();
}

// ========= EXPORT =========

function handleExportPNG() {
    exportPNGImpl(logAction);
}

// ========= ПОДІЇ =========

applyBgBtn.addEventListener('click', handleApplyBackground);
clearBtn.addEventListener('click', handleClearGrid);
randomBtn.addEventListener('click', handleRandomColor);

undoBtn.addEventListener('click', handleUndo);
redoBtn.addEventListener('click', handleRedo);
saveBtn.addEventListener('click', handleSaveToStorage);
loadBtn.addEventListener('click', handleLoadFromStorage);
exportBtn.addEventListener('click', handleExportPNG);
pipetteBtn.addEventListener('click', togglePipette);

// ==== ГАРЯЧІ КЛАВІШІ (layout-agnostic через e.code) ====
document.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea') return; // не заважаємо вводам

    switch (e.code) {
        case 'KeyZ': e.preventDefault(); handleUndo(); break;
        case 'KeyY': e.preventDefault(); handleRedo(); break;
        case 'KeyC': e.preventDefault(); handleClearGrid(); break;
        case 'KeyR': e.preventDefault(); handleRandomColor(); break;
        case 'KeyS': e.preventDefault(); handleSaveToStorage(); break;
        case 'KeyL': e.preventDefault(); handleLoadFromStorage(); break;
        case 'KeyE': e.preventDefault(); handleExportPNG(); break;
        case 'KeyP': e.preventDefault(); togglePipette(); break;
        case 'KeyB': e.preventDefault(); handleApplyBackground(); break;
        default: break;
    }
});

// ========= СТАРТ =========
makeGrid();
initSettings(canvasGrid, counterEl, logAction, updateUndoRedoUI);
initGallery(canvasGrid, counterEl, logAction, updateUndoRedoUI);

// ===== ЕКСПОРТ У window ДЛЯ ТЕСТІВ/КОНСОЛІ =====
window.gridState       = gridState;
window.paint           = (index, color) => handlePaint(index, color ?? colorInput.value);
window.clearGrid       = handleClearGrid;
window.randomColor     = handleRandomColor;
window.applyBackground = handleApplyBackground;
window.undo            = handleUndo;
window.redo            = handleRedo;
window.saveToStorage   = handleSaveToStorage;
window.loadFromStorage = handleLoadFromStorage;
window.exportPNG       = handleExportPNG;
window.togglePipette   = togglePipette;
window.onCellClick     = onCellClick;

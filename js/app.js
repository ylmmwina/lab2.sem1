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

// Константи
const STORAGE_KEY = 'pixel-mood:canvas';

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

// Генерація сітки
function makeGrid() {
    canvasGrid.innerHTML = '';
    canvasGrid.classList.remove('placeholder');
    canvasGrid.classList.add('pixels');

    for (let i = 0; i < SIZE * SIZE; i++) {
        const cell = document.createElement('button');
        cell.className = 'pixel';
        cell.dataset.index = i;
        cell.addEventListener('click', () => onCellClick(i));
        canvasGrid.appendChild(cell);
    }

    // Ініціалізація історії та базового знімка
    initHistory();
    commitSnapshot();
    updateCounter(counterEl);
    logAction('grid:init', '8×8 created');
}

// Клік по клітинці (малювання)
function onCellClick(index) {
    if (isPipette) {
        // взяти колір із клітинки
        const picked = gridState[index] || '#ffffff';
        colorInput.value = picked;
        isPipette = false;
        pipetteBtn.classList.remove('is-active');
        logAction('pipette', 'picked ' + picked);
        return;
    }
    paint(index, colorInput.value);
}

function paint(index, color) {
    gridState[index] = color;
    canvasGrid.children[index].style.background = color;
    commitSnapshot();
    updateCounter(counterEl);
    logAction('paint', `i=${index}, color=${color}`);
}

function clearGrid() {
    gridState.fill('');
    renderFromState(canvasGrid, counterEl);
    commitSnapshot();
    logAction('clear', 'canvas reset');
}

// Випадковий колір у палітру
function randomColor() {
    const v = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
    colorInput.value = `#${v}`;
    logAction('palette:random', colorInput.value);
}

// Фон сторінки
function applyBackground() {
    document.body.style.background = bgInput.value;
    logAction('background:apply', bgInput.value);
}

// Обгортки над undo/redo історії
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

// SAVE / LOAD (localStorage)
function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gridState));
    logAction('save', 'localStorage');
}

function loadFromStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length === gridState.length) {
            // оновлюємо стан і рендеримо
            for (let i = 0; i < gridState.length; i++) {
                gridState[i] = parsed[i];
            }
            renderFromState(canvasGrid, counterEl);
            initHistory();
            commitSnapshot();
            logAction('load', 'localStorage');
        }
    } catch {
        // ігноруємо
    }
}

// Експорт PNG
function exportPNG() {
    const scale = 32; // розмір «пікселя» в зображенні
    const cnv = document.createElement('canvas');
    cnv.width  = SIZE * scale;
    cnv.height = SIZE * scale;
    const g = cnv.getContext('2d');

    for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
            const col = gridState[y * SIZE + x] || '#ffffff';
            g.fillStyle = col;
            g.fillRect(x * scale, y * scale, scale, scale);
        }
    }
    const url = cnv.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pixel-mood.png';
    a.click();
    logAction('export', 'png');
}

// Піпетка
function togglePipette() {
    isPipette = !isPipette;
    pipetteBtn.classList.toggle('is-active', isPipette);
    logAction('pipette', isPipette ? 'on' : 'off');
}

// Події
applyBgBtn.addEventListener('click', applyBackground);
clearBtn.addEventListener('click', clearGrid);
randomBtn.addEventListener('click', randomColor);

undoBtn.addEventListener('click', handleUndo);
redoBtn.addEventListener('click', handleRedo);
saveBtn.addEventListener('click', saveToStorage);
loadBtn.addEventListener('click', loadFromStorage);
exportBtn.addEventListener('click', exportPNG);
pipetteBtn.addEventListener('click', togglePipette);

// ==== ГАРЯЧІ КЛАВІШІ (layout-agnostic через e.code) ====
document.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea') return; // не заважаємо вводам

    switch (e.code) {
        case 'KeyZ': e.preventDefault(); handleUndo(); break;
        case 'KeyY': e.preventDefault(); handleRedo(); break;
        case 'KeyC': e.preventDefault(); clearGrid(); break;
        case 'KeyR': e.preventDefault(); randomColor(); break;
        case 'KeyS': e.preventDefault(); saveToStorage(); break;
        case 'KeyL': e.preventDefault(); loadFromStorage(); break;
        case 'KeyE': e.preventDefault(); exportPNG(); break;
        case 'KeyP': e.preventDefault(); togglePipette(); break;
        case 'KeyB': e.preventDefault(); applyBackground(); break;
        default: break;
    }
});

// Старт
makeGrid();

// ===== ЕКСПОРТ У window ДЛЯ ТЕСТІВ/КОНСОЛІ =====
window.gridState      = gridState;
window.paint          = paint;
window.clearGrid      = clearGrid;
window.randomColor    = randomColor;
window.applyBackground= applyBackground;
window.undo           = handleUndo;
window.redo           = handleRedo;
window.saveToStorage  = saveToStorage;
window.loadFromStorage= loadFromStorage;
window.exportPNG      = exportPNG;
window.togglePipette  = togglePipette;
window.onCellClick    = onCellClick;

// Елементи
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

// Константи
const SIZE = 8; // 8x8
const STORAGE_KEY = 'pixel-mood:canvas';

// Стан
let gridState = Array.from({ length: SIZE * SIZE }, () => ''); // '' або #hex
const history = [];   // стек знімків стану (масивів)
const redoStack = []; // стек для redo

// Утилітли стану
const snapshot = () => [...gridState];
function renderFromState() {
    [...canvasGrid.children].forEach((btn, i) => {
        btn.style.background = gridState[i] || '#ffffff';
    });
    updateCounter();
}
function pushHistory(reason = '') {
    history.push(snapshot());
    // після будь-якої нової дії redo обнуляємо
    redoStack.length = 0;
    updateUndoRedoUI();
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
        cell.addEventListener('click', () => paint(i, colorInput.value));
        canvasGrid.appendChild(cell);
    }
    // базовий знімок (порожнє полотно)
    pushHistory('init');
    updateCounter();
    updateUndoRedoUI();
}

// Малювання
function paint(index, color) {
    gridState[index] = color;
    canvasGrid.children[index].style.background = color;
    pushHistory('paint');
    updateCounter();
}

function clearGrid() {
    gridState.fill('');
    renderFromState();
    pushHistory('clear');
}

// Випадковий колір у палітру
function randomColor() {
    const v = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
    colorInput.value = `#${v}`;
}

// Фон сторінки
function applyBackground() {
    document.body.style.background = bgInput.value;
}

// Лічильник
function updateCounter() {
    const filled = gridState.filter(x => x && x !== '').length;
    counterEl.textContent = `Заповнено: ${filled}`;
}

// UNDO / REDO
function undo() {
    if (history.length <= 1) return;         // нічого відкочувати
    const last = history.pop();              // поточний у redo
    redoStack.push(last);
    const prev = history[history.length - 1];
    gridState = [...prev];
    renderFromState();
    updateUndoRedoUI();
}
function redo() {
    if (!redoStack.length) return;
    const next = redoStack.pop();
    history.push(next);
    gridState = [...next];
    renderFromState();
    updateUndoRedoUI();
}
function updateUndoRedoUI() {
    undoBtn.disabled = history.length <= 1;
    redoBtn.disabled = redoStack.length === 0;
}

// SAVE / LOAD (localStorage)
function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gridState));
}
function loadFromStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length === SIZE * SIZE) {
            gridState = [...parsed];
            renderFromState();
            // «заморозимо» історію від завантаженого стану
            history.length = 0;
            pushHistory('loaded');
        }
    } catch {
        // ігноруємо помилкові дані
    }
}

// Події
applyBgBtn.addEventListener('click', applyBackground);
clearBtn.addEventListener('click', clearGrid);
randomBtn.addEventListener('click', randomColor);

undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);
saveBtn.addEventListener('click', saveToStorage);
loadBtn.addEventListener('click', loadFromStorage);

// Старт
makeGrid();

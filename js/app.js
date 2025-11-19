// ========= ЕЛЕМЕНТИ =========
const canvasGrid = document.getElementById('canvas-grid');
const colorInput = document.getElementById('color');
const bgInput    = document.getElementElementById('bg');
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
const SIZE = 8; // 8x8
const STORAGE_KEY = 'pixel-mood:canvas';

// Стан
let gridState = Array.from({ length: SIZE * SIZE }, () => ''); // '' або #hex
const history = [];   // стек знімків стану
const redoStack = []; // стек для redo
let isPipette = false;

// Утиліти стану
const snapshot = () => [...gridState];
function renderFromState() {
    [...canvasGrid.children].forEach((btn, i) => {
        btn.style.background = gridState[i] || '#ffffff';
    });
    updateCounter();
}
function pushHistory() {
    history.push(snapshot());
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
        cell.addEventListener('click', () => onCellClick(i));
        canvasGrid.appendChild(cell);
    }
    pushHistory(); // базовий знімок
    updateCounter();
    updateUndoRedoUI();
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
    pushHistory();
    updateCounter();
    logAction('paint', `i=${index}, color=${color}`);
}

function clearGrid() {
    gridState.fill('');
    renderFromState();
    pushHistory();
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

// Лічильник
function updateCounter() {
    const filled = gridState.filter(x => x && x !== '').length;
    counterEl.textContent = `Заповнено: ${filled}`;
}

// UNDO / REDO
function undo() {
    if (history.length <= 1) return;
    const last = history.pop();
    redoStack.push(last);
    const prev = history[history.length - 1];
    gridState = [...prev];
    renderFromState();
    updateUndoRedoUI();
    logAction('undo');
}
function redo() {
    if (!redoStack.length) return;
    const next = redoStack.pop();
    history.push(next);
    gridState = [...next];
    renderFromState();
    updateUndoRedoUI();
    logAction('redo');
}
function updateUndoRedoUI() {
    undoBtn.disabled = history.length <= 1;
    redoBtn.disabled = redoStack.length === 0;
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
        if (Array.isArray(parsed) && parsed.length === SIZE * SIZE) {
            gridState = [...parsed];
            renderFromState();
            history.length = 0;
            pushHistory();
            logAction('load', 'localStorage');
        }
    } catch { /* ігноруємо */ }
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

undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);
saveBtn.addEventListener('click', saveToStorage);
loadBtn.addEventListener('click', loadFromStorage);
exportBtn.addEventListener('click', exportPNG);
pipetteBtn.addEventListener('click', togglePipette);

// ==== ГАРЯЧІ КЛАВІШІ (layout-agnostic через e.code) ====
// KeyZ — Undo, KeyY — Redo, KeyC — Clear, KeyR — Random color,
// KeyS — Save, KeyL — Load, KeyE — Export PNG, KeyP — Pipette toggle,
// KeyB — Apply background
document.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea') return; // не заважаємо вводам

    switch (e.code) {
        case 'KeyZ': e.preventDefault(); undo(); break;
        case 'KeyY': e.preventDefault(); redo(); break;
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
window.gridState = gridState;
window.paint = paint;
window.clearGrid = clearGrid;
window.randomColor = randomColor;
window.applyBackground = applyBackground;
window.undo = undo;
window.redo = redo;
window.saveToStorage = saveToStorage;
window.loadFromStorage = loadFromStorage;
window.exportPNG = exportPNG;
window.togglePipette = togglePipette;
window.onCellClick = onCellClick;

// Елементи
const canvasGrid = document.getElementById('canvas-grid');
const colorInput = document.getElementById('color');
const bgInput    = document.getElementById('bg');
const applyBgBtn = document.getElementById('apply-bg');
const clearBtn   = document.getElementById('clear');
const randomBtn  = document.getElementById('random');
const counterEl  = document.getElementById('counter');

// Константи і стан
const SIZE = 8;
let gridState = Array.from({ length: SIZE * SIZE }, () => ''); // '' або #hex

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
    updateCounter();
}

// Малювання
function paint(index, color) {
    gridState[index] = color;
    canvasGrid.children[index].style.background = color;
    updateCounter();
}

// Очистка полотна
function clearGrid() {
    gridState.fill('');
    [...canvasGrid.children].forEach(c => c.style.background = '#ffffff');
    updateCounter();
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
    const filled = gridState.filter(x => x).length;
    counterEl.textContent = `Заповнено: ${filled}`;
}

// Події
applyBgBtn.addEventListener('click', applyBackground);
clearBtn.addEventListener('click', clearGrid);
randomBtn.addEventListener('click', randomColor);

// Старт
makeGrid();
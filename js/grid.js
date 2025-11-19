// grid.js — логіка полотна: створення ґріду, малювання, очищення

import { SIZE, gridState, renderFromState, updateCounter } from './state.js';
import { pushHistory as commitSnapshot } from './history.js';

export function createGrid(canvasGrid, onCellClick) {
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
}

export function paint(index, color, canvasGrid, counterEl, logAction) {
    gridState[index] = color;
    canvasGrid.children[index].style.background = color;
    commitSnapshot();
    updateCounter(counterEl);
    logAction('paint', `i=${index}, color=${color}`);
}

export function clearGrid(canvasGrid, counterEl, logAction) {
    gridState.fill('');
    renderFromState(canvasGrid, counterEl);
    commitSnapshot();
    logAction('clear', 'canvas reset');
}
// palette.js — випадковий колір + піпетка

import { gridState } from './state.js';

export function randomColor(colorInput, logAction) {
    const v = Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, '0');

    colorInput.value = `#${v}`;
    logAction('palette:random', colorInput.value);
}

export function pipette(index, colorInput, pipetteBtn, logAction) {
    const picked = gridState[index] || '#ffffff';
    colorInput.value = picked;
    pipetteBtn.classList.remove('is-active');
    logAction('pipette', 'picked ' + picked);
}
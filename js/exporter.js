// exporter.js — експорт PNG

import { SIZE, gridState } from './state.js';

export function exportPNG(logAction) {
    const scale = 32;
    const cnv = document.createElement('canvas');
    cnv.width = SIZE * scale;
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
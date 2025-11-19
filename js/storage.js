// storage.js — збереження/завантаження з localStorage

import { gridState, renderFromState } from './state.js';
import { pushHistory as commitSnapshot, initHistory } from './history.js';

export const STORAGE_KEY = 'pixel-mood:canvas';

export function saveToStorage(logAction) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gridState));
    logAction('save', 'localStorage');
}

export function loadFromStorage(canvasGrid, counterEl, logAction) {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
        const parsed = JSON.parse(raw);

        if (Array.isArray(parsed) && parsed.length === gridState.length) {
            // оновлюємо існуючий масив
            for (let i = 0; i < gridState.length; i++) {
                gridState[i] = parsed[i];
            }

            renderFromState(canvasGrid, counterEl);
            initHistory();
            commitSnapshot();
            logAction('load', 'localStorage');
        }
    } catch {}
}
// settings.js — налаштування інтерфейсу (межі клітинок, звук, скидання)

import { gridState, renderFromState } from './state.js';
import { initHistory, pushHistory } from './history.js';
import { STORAGE_KEY } from './storage.js';

const BORDER_KEY = 'pixel-mood:settings:borders';
const SOUND_KEY  = 'pixel-mood:settings:sound';

let isSoundEnabled = false;

/**
 * Ініціалізація налаштувань.
 * @param {HTMLElement} canvasGrid - контейнер ґріду
 * @param {HTMLElement} counterEl - елемент лічильника
 * @param {Function} logAction - логер в таблицю історії
 * @param {Function} updateUndoRedoUI - оновлення стану кнопок undo/redo
 */
export function initSettings(canvasGrid, counterEl, logAction, updateUndoRedoUI) {
    const bordersCheckbox = document.getElementById('toggle-borders');
    const soundCheckbox   = document.getElementById('toggle-sound');
    const resetBtn        = document.getElementById('app-reset');

    // --- Межі клітинок ---
    if (bordersCheckbox) {
        const stored = localStorage.getItem(BORDER_KEY);
        const initial = stored === '1';
        bordersCheckbox.checked = initial;
        applyBorders(canvasGrid, initial);

        bordersCheckbox.addEventListener('change', () => {
            const enabled = bordersCheckbox.checked;
            applyBorders(canvasGrid, enabled);
            localStorage.setItem(BORDER_KEY, enabled ? '1' : '0');
            logAction && logAction('settings:borders', enabled ? 'on' : 'off');
        });
    }

    // --- Звук кліку (демо) ---
    if (soundCheckbox) {
        const stored = localStorage.getItem(SOUND_KEY);
        isSoundEnabled = stored === '1';
        soundCheckbox.checked = isSoundEnabled;

        soundCheckbox.addEventListener('change', () => {
            isSoundEnabled = soundCheckbox.checked;
            localStorage.setItem(SOUND_KEY, isSoundEnabled ? '1' : '0');
            logAction && logAction('settings:sound', isSoundEnabled ? 'on' : 'off');
        });
    }

    // --- Скидання застосунку ---
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            // очистити стан полотна
            gridState.fill('');
            renderFromState(canvasGrid, counterEl);

            // скинути історію undo/redo
            initHistory();
            pushHistory();
            updateUndoRedoUI && updateUndoRedoUI();

            // очистити збережений стан та налаштування
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(BORDER_KEY);
            localStorage.removeItem(SOUND_KEY);

            // скинути UI-перемикачі
            if (bordersCheckbox) bordersCheckbox.checked = false;
            if (soundCheckbox)   soundCheckbox.checked = false;
            applyBorders(canvasGrid, false);
            isSoundEnabled = false;

            logAction && logAction('settings:reset', 'app reset');
        });
    }
}

/**
 * Застосувати / прибрати межі клітинок.
 */
export function applyBorders(canvasGrid, enabled) {
    if (!canvasGrid) return;
    [...canvasGrid.children].forEach(cell => {
        cell.classList.toggle('with-border', enabled);
    });
}

/**
 * Викликається після малювання клітинки.
 * Якщо звук увімкнено — можна підключити реальний аудіо-ефект.
 */
export function notifyPaintClick() {
    if (!isSoundEnabled) return;
    // демонстрації реакції на налаштування
    console.log('paint click (sound enabled)');
}
// gallery.js — робота з пресетами (галерея)

import { gridState, renderFromState } from './state.js';
import { initHistory, pushHistory } from './history.js';

const PRESETS_KEY = 'pixel-mood:presets';

function loadPresets() {
    const raw = localStorage.getItem(PRESETS_KEY);
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
    } catch {}
    return [];
}

function savePresets(presets) {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
}

/**
 * Ініціалізація вкладки "Галерея":
 * - відмальовує список пресетів
 * - вішає обробники на кнопки "Зберегти / Завантажити / Видалити"
 */
export function initGallery(canvasGrid, counterEl, logAction, updateUndoRedoUI) {
    const saveBtn   = document.getElementById('preset-save');
    const loadBtn   = document.getElementById('preset-load');
    const removeBtn = document.getElementById('preset-remove');
    const listBox   = document.getElementById('preset-list');

    if (!listBox) return;

    let presets = loadPresets();
    let selectedId = null;

    // створюємо select для вибору пресету
    const select = document.createElement('select');
    select.id = 'preset-select';
    select.style.minWidth = '180px';

    const emptyNote = document.createElement('p');
    emptyNote.textContent = 'Поки немає жодного пресету.';
    emptyNote.style.marginTop = '6px';

    listBox.innerHTML = '';
    listBox.appendChild(select);
    listBox.appendChild(emptyNote);

    function renderList() {
        select.innerHTML = '';
        if (!presets.length) {
            emptyNote.style.display = 'block';
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = '— немає пресетів —';
            opt.disabled = true;
            opt.selected = true;
            select.appendChild(opt);
            selectedId = null;
            return;
        }

        emptyNote.style.display = 'none';

        presets.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.name;
            select.appendChild(opt);
        });

        // якщо попередньо був вибраний — залишаємо, інакше перший
        if (selectedId && presets.some(p => p.id === selectedId)) {
            select.value = selectedId;
        } else {
            selectedId = presets[0].id;
            select.value = selectedId;
        }
    }

    select.addEventListener('change', () => {
        selectedId = select.value || null;
    });

    renderList();

    // --- Зберегти як пресет ---
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const name = prompt('Назва пресету:', `Пресет ${presets.length + 1}`);
            if (!name) return;

            const id = Date.now().toString();
            const data = [...gridState];

            presets.push({ id, name, data });
            savePresets(presets);
            selectedId = id;
            renderList();
            logAction && logAction('gallery:save', name);
        });
    }

    // --- Завантажити пресет ---
    if (loadBtn) {
        loadBtn.addEventListener('click', () => {
            if (!selectedId) return;
            const preset = presets.find(p => p.id === selectedId);
            if (!preset) return;

            if (!Array.isArray(preset.data) || preset.data.length !== gridState.length) return;

            // заливаємо в gridState
            for (let i = 0; i < gridState.length; i++) {
                gridState[i] = preset.data[i];
            }

            renderFromState(canvasGrid, counterEl);
            initHistory();
            pushHistory();
            updateUndoRedoUI && updateUndoRedoUI();
            logAction && logAction('gallery:load', preset.name);
        });
    }

    // --- Видалити пресет ---
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            if (!selectedId) return;
            const idx = presets.findIndex(p => p.id === selectedId);
            if (idx === -1) return;

            const removed = presets[idx];
            presets.splice(idx, 1);
            savePresets(presets);
            selectedId = null;
            renderList();
            logAction && logAction('gallery:remove', removed.name);
        });
    }
}
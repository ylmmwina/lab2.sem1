// state.js — стан полотна, утиліти, лічильник

export const SIZE = 8;

// масив стану — одна й та сама "коробка", не перевизначаємо, тільки міняємо вміст
export const gridState = Array.from({ length: SIZE * SIZE }, () => '');

export const snapshot = () => [...gridState];

// оновлюємо стан "на місці", щоб всі посилання (у window, модулях тощо) бачили актуальний масив
export function setGridState(newState) {
    gridState.splice(0, gridState.length, ...newState);
}

export function updateCounter(counterEl) {
    const filled = gridState.filter(x => x && x !== '').length;
    counterEl.textContent = `Заповнено: ${filled}`;
}

export function renderFromState(canvasGrid, counterEl) {
    [...canvasGrid.children].forEach((btn, i) => {
        btn.style.background = gridState[i] || '#ffffff';
    });
    updateCounter(counterEl);
}
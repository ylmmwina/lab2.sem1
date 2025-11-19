// background.js — керування фоном сторінки

export function applyBackground(bgInput, logAction) {
    document.body.style.background = bgInput.value;
    logAction('background:apply', bgInput.value);
}
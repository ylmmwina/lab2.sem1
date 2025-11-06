// Minimal console-based tests for Pixel Mood Board
// Runs once on load. Open DevTools → Console to see results.

(function () {
    const results = [];
    const ctx = {
        canvasGrid: window.canvasGrid || document.getElementById('canvas-grid'),
        colorInput: window.colorInput || document.getElementById('color'),
        counterEl: document.getElementById('counter')
    };

    function test(name, fn) {
        try {
            fn();
            results.push({ name, ok: true });
        } catch (e) {
            results.push({ name, ok: false, err: e });
        }
    }

    function assert(cond, msg = 'Assertion failed') {
        if (!cond) throw new Error(msg);
    }

    function snapshotState() {
        return Array.isArray(window.gridState) ? [...gridState] : null;
    }

    function equalArrays(a, b) {
        if (!a || !b || a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
        return true;
    }

    // --- TESTS ---

    test('grid: has 8x8 = 64 cells', () => {
        assert(ctx.canvasGrid, '#canvas-grid not found');
        assert(ctx.canvasGrid.children.length === 64, 'Grid is not 64 cells');
        assert(Array.isArray(gridState) && gridState.length === 64, 'gridState length != 64');
    });

    test('randomColor() sets valid #RRGGBB', () => {
        randomColor();
        assert(/^#[0-9a-f]{6}$/i.test(ctx.colorInput.value), 'randomColor did not set a valid hex');
    });

    test('paint() changes cell and counter increments', () => {
        const idx = 0;
        const beforeCounter = ctx.counterEl.textContent;
        const prev = gridState[idx];
        const color = '#123abc';

        paint(idx, color);

        const afterCounter = ctx.counterEl.textContent;
        assert(gridState[idx] === color, 'paint did not update gridState');
        assert(beforeCounter !== afterCounter, 'counter did not change after paint');

        // restore
        paint(idx, prev || '');
    });

    test('undo/redo returns to previous/next snapshot', () => {
        const idx = 1;
        const original = snapshotState();
        const color = '#000000';

        paint(idx, color);
        const afterPaint = snapshotState();

        undo();
        const afterUndo = snapshotState();
        assert(equalArrays(afterUndo, original), 'undo did not restore original state');

        redo();
        const afterRedo = snapshotState();
        assert(equalArrays(afterRedo, afterPaint), 'redo did not re-apply paint');
    });

    test('save/load roundtrip via localStorage', () => {
        const idx = 2;
        const original = snapshotState();

        paint(idx, '#ff0000');
        saveToStorage();
        clearGrid();
        loadFromStorage();

        assert(gridState[idx] === '#ff0000', 'load did not restore saved color');

        // restore original for cleanliness
        localStorage.setItem('pixel-mood:canvas', JSON.stringify(original));
        loadFromStorage();
    });

    test('pipette picks color from cell', () => {
        const idx = 3;
        const prevColorInput = ctx.colorInput.value;

        // set cell color, ensure DOM reflects it
        paint(idx, '#00ff00');

        // toggle pipette and click the cell
        togglePipette();
        if (typeof onCellClick === 'function') {
            onCellClick(idx);
        } else {
            // fallback: simulate click if handler is bound on DOM nodes
            ctx.canvasGrid.children[idx].click();
        }

        assert(ctx.colorInput.value.toLowerCase() === '#00ff00', 'pipette did not pick cell color');

        // restore palette color
        ctx.colorInput.value = prevColorInput;
    });

    // --- REPORT ---
    const ok = results.filter(r => r.ok).length;
    const fail = results.length - ok;
    console.log(`Tests: ${ok}/${results.length} passed${fail ? `, ${fail} failed` : ''}`);
    results.forEach(r => console[r.ok ? 'log' : 'error']((r.ok ? '✅' : '❌') + ' ' + r.name, r.err || ''));
})();
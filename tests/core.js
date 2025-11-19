// core.js — мінімальний тест-раннер без залежностей

export const results = [];

export function test(name, fn) {
    try {
        fn();
        results.push({ name, ok: true });
    } catch (e) {
        results.push({ name, ok: false, error: e });
    }
}

export function assert(condition, message = "Assertion failed") {
    if (!condition) {
        throw new Error(message);
    }
}

export function assertEqual(a, b, message = "Values are not equal") {
    if (a !== b) throw new Error(message + `: ${a} vs ${b}`);
}

export function assertArrayEquals(a, b, message = "Arrays differ") {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
        throw new Error(message + " (length mismatch)");
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            throw new Error(message + ` at index ${i}: ${a[i]} vs ${b[i]}`);
        }
    }
}

export function report() {
    const ok = results.filter(r => r.ok).length;
    const fail = results.length - ok;

    console.log(`Tests: ${ok}/${results.length} passed${fail ? ", " + fail + " failed" : ""}`);

    results.forEach(r => {
        if (r.ok) {
            console.log("✅ " + r.name);
        } else {
            console.error("❌ " + r.name, r.error);
        }
    });
}
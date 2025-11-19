// index.js — збирає всі тести

import "./state.test.js";
import "./grid.test.js";

import { report } from "./core.js";

// даємо час DOM та app.js завантажитися
setTimeout(() => {
    report();
}, 50);
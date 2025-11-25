// Main Game Controller / Hub
// This file aggregates modules and resolves circular dependencies.

import { initUI, showCharacterCreation } from './ui.js';
import { logMessage } from './logger.js';
import { startCombat } from './combat.js';
import { goToScene } from './exploration.js';

// Re-export for main.js
export { initUI, showCharacterCreation, logMessage };
// Also export core logic if needed by other modules
export { startCombat, goToScene };

// Resolve circular references if needed
// ui.js might need startCombat.
// exploration.js might need startCombat.
// combat.js might need goToScene.

// Since ES modules are live bindings, imports in other files should work
// as long as they don't execute top-level code that depends on them immediately.

// One specific fix: ui.js might have imported `startCombatRef`?
// In my ui.js creation step, I didn't export `startCombatRef`.
// I just noted "game.js will export a reference".
// Let's check if `ui.js` used `startCombatRef`.
// Yes: `if (startCombatRef) startCombatRef(...)` in showRestModal.

// I need to attach startCombat to a variable or window if ui.js expects it.
// OR, ui.js should import startCombat from combat.js?
// But ui.js was created BEFORE combat.js existed in the plan flow, so I might have put a placeholder.
// Actually, I can just update ui.js to import from combat.js directly now!
// Same for exploration.js.

// So game.js can be very simple.

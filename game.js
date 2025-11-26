// game.js - The Orchestrator
// This file is responsible for initializing the game, connecting modules,
// and handling the main game loop (if any). It doesn't contain any
// specific game logic itself, but rather delegates to the other modules.

import { gameState, loadGame, saveGame } from './data/gameState.js';
import { startCombat, performShortRest, performLongRest, endCurrentTurn, uiHooks as combatUIHooks } from './combat.js';
import { initUI, showCharacterCreation, goToScene, updateStatsUI, logMessage, combatHooks, createActionButton, logToBattle, showBattleEventText } from './ui.js';

// --- Initialization ---

function initializeGame() {
    console.log("Orchestrator: Initializing game...");
    // 1. Connect modules to break circular dependencies
    // The UI module needs to trigger combat, but the combat module needs to update the UI.
    // By passing the functions here, we avoid direct import cycles.
    console.log("Orchestrator: Connecting combat hooks...");
    combatHooks.startCombat = startCombat;
    combatHooks.performShortRest = performShortRest;
    combatHooks.performLongRest = performLongRest;

    // Connect the UI functions to the combat module's hooks
    combatUIHooks.updateCombatUI = updateStatsUI;
    combatUIHooks.logToBattle = logToBattle;
    combatUIHooks.showBattleEventText = showBattleEventText;
    combatUIHooks.createActionButton = createActionButton;
    combatUIHooks.goToScene = goToScene;
    combatUIHooks.updateStatsUI = updateStatsUI;
    combatUIHooks.saveGame = saveGame;


    // The combat module needs a way to advance to the next scene after combat.
    // This is passed during the startCombat call.

    // 2. Setup UI event listeners
    initUI();

    // 3. Check for saved game or start new
    if (loadGame()) {
        logMessage("Game Loaded.", "system");
        updateStatsUI();
        goToScene(gameState.currentSceneId);
    } else {
        // No save file, go to character creation
        showCharacterCreation();
    }
}

// --- Global Exports ---
// Expose key functions to the window for debugging or legacy event handlers
// in index.html. Avoid this pattern for new features if possible.
window.goToScene = goToScene;
window.endCurrentTurn = endCurrentTurn; // Make end turn accessible for UI buttons


// --- Start the Game ---
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});

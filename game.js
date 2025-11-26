// game.js - The Orchestrator
// This file is responsible for initializing the game, connecting modules,
// and handling the main game loop (if any). It doesn't contain any
// specific game logic itself, but rather delegates to the other modules.

import { gameState, loadGame, saveGame } from './data/gameState.js';
import { startCombat, performShortRest, performLongRest, endCurrentTurn, uiHooks as combatUIHooks } from './combat.js';
import { initUI, showCharacterCreation, goToScene, updateStatsUI, logMessage, combatHooks, createActionButton, logToBattle, showBattleEventText } from './ui.js';

// --- Initialization ---

function initializeGame() {
    // 1. Connect modules to break circular dependencies
    combatHooks.startCombat = startCombat;
    combatHooks.performShortRest = performShortRest;
    combatHooks.performLongRest = performLongRest;

    combatUIHooks.updateCombatUI = updateStatsUI;
    combatUIHooks.logToBattle = logToBattle;
    combatUIHooks.showBattleEventText = showBattleEventText;
    combatUIHooks.createActionButton = createActionButton;
    combatUIHooks.goToScene = goToScene;
    combatUIHooks.updateStatsUI = updateStatsUI;
    combatUIHooks.saveGame = saveGame;

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
window.goToScene = goToScene;
window.endCurrentTurn = endCurrentTurn;

export { initUI, showCharacterCreation };

// --- Start the Game ---
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});

// Import all data modules to ensure they are loaded
import { races } from './data/races.js';
import { classes } from './data/classes.js';
import { items } from './data/items.js';
import { quests } from './data/quests.js';
import { scenes } from './data/scenes.js';
import { enemies } from './data/enemies.js';
import { spells } from './data/spells.js';
import { statusEffects } from './data/statusEffects.js';
import { locations } from './data/locations.js';
import { travelEvents } from './data/travelEvents.js';
import { shops } from './data/shops.js';
import { npcs } from './data/npcs.js';
import { factions } from './data/factions.js';
import { gameState } from './data/gameState.js';
import { rollDiceExpression, rollSkillCheck, rollSavingThrow, rollDie, rollAttack, rollInitiative, getAbilityMod } from './rules.js';

// Import the main game logic
import { initUI, showCharacterCreation } from './game.js';

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initUI();
    showCharacterCreation();
});

import { races } from './races.js';
import { classes } from './classes.js';
import { items } from './items.js';
import { quests } from './quests.js';
import { scenes } from './scenes.js';
import { statusEffects } from './statusEffects.js';
import { rollDiceExpression } from '../rules.js';

export const gameState = {
    player: {
        name: "",
        raceId: "",
        classId: "",
        level: 1,
        xp: 0,
        xpNext: 300,
        hp: 10,
        maxHp: 10,
        abilities: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
        modifiers: { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 }, // Cache modifiers
        skills: [], // List of proficient skills
        proficiencyBonus: 2,
        equippedWeaponId: null,
        equippedArmorId: null,
        inventory: [],
        gold: 0,
        statusEffects: []
    },
    currentSceneId: "SCENE_BRIEFING",
    quests: JSON.parse(JSON.stringify(quests)), // Deep copy
    flags: {},
    reputation: {
        silverthorn: 0,
        durnhelm: 0
    },
    inCombat: false,
    combatEnemy: null,
    visitedScenes: {}
};

// Helper to calc mod
function calcMod(score) {
    return Math.floor((score - 10) / 2);
}

export function initializeNewGame(name, raceId, classId) {
    const race = races[raceId];
    const cls = classes[classId];

    // 1. Base Stats (Standard Array-ish)
    const baseStats = { STR: 12, DEX: 12, CON: 12, INT: 12, WIS: 12, CHA: 12 };

    // 2. Apply Race Bonuses
    if (race && race.abilityBonuses) {
        for (const [stat, bonus] of Object.entries(race.abilityBonuses)) {
            if (baseStats[stat] !== undefined) {
                baseStats[stat] += bonus;
            }
        }
    }

    gameState.player.name = name;
    gameState.player.raceId = raceId;
    gameState.player.classId = classId;
    gameState.player.abilities = baseStats;
    gameState.player.level = 1;
    gameState.player.xp = 0;
    gameState.player.proficiencyBonus = 2; // Level 1 default

    // Calc Modifiers
    for (const stat of Object.keys(gameState.player.abilities)) {
        gameState.player.modifiers[stat] = calcMod(gameState.player.abilities[stat]);
    }

    // HP Calculation
    const conMod = gameState.player.modifiers.CON;
    gameState.player.maxHp = cls.hitDie + conMod;
    gameState.player.hp = gameState.player.maxHp;

    // Skills
    gameState.player.skills = cls.proficiencies || [];

    // Starting Gear
    gameState.player.inventory = [];
    addItem('potion_healing'); // One free potion

    if (classId === 'fighter') {
        addItem('longsword');
        addItem('chainmail');
        equipItem('longsword');
        equipItem('chainmail');
    } else if (classId === 'rogue') {
        addItem('dagger');
        addItem('shortbow');
        addItem('leather_armor');
        equipItem('dagger');
        equipItem('leather_armor');
    } else if (classId === 'wizard') {
        addItem('dagger');
        addItem('potion_healing');
        equipItem('dagger');
    } else {
        addItem('longsword');
        equipItem('longsword');
    }

    gameState.currentSceneId = "SCENE_BRIEFING";
    gameState.visitedScenes = {};
    gameState.flags = {};
}

export function updateQuestStage(questId, stageNumber) {
    if (!gameState.quests[questId]) {
        if (quests[questId]) {
            gameState.quests[questId] = JSON.parse(JSON.stringify(quests[questId]));
        } else {
            console.error(`Quest ${questId} not found.`);
            return;
        }
    }

    gameState.quests[questId].currentStage = stageNumber;

    const questDef = quests[questId];
    const stages = Object.keys(questDef.stages).map(Number);
    const maxStage = Math.max(...stages);

    if (stageNumber >= maxStage) {
        gameState.quests[questId].completed = true;
    }
}

export function addGold(amount) {
    gameState.player.gold += amount;
}

export function spendGold(amount) {
    if (gameState.player.gold >= amount) {
        gameState.player.gold -= amount;
        return true;
    }
    return false;
}

export function gainXp(amount) {
    gameState.player.xp += amount;
    // Check level up (simplified: every 300 xp)
    if (gameState.player.xp >= gameState.player.xpNext) {
        gameState.player.level++;
        gameState.player.xpNext = gameState.player.level * 300;
        // Increase proficiency every 4 levels
        gameState.player.proficiencyBonus = Math.ceil(1 + (gameState.player.level / 4));

        // HP increase?
        const cls = classes[gameState.player.classId];
        const conMod = gameState.player.modifiers.CON;
        // Usually roll, but max or avg for simplicity
        const hpGain = Math.floor(cls.hitDie / 2) + 1 + conMod;
        gameState.player.maxHp += hpGain;
        gameState.player.hp += hpGain;

        return true; // Leveled up
    }
    return false;
}

// Inventory Helpers
export function addItem(itemId) {
    if (items[itemId]) {
        gameState.player.inventory.push(itemId);
    }
}

export function removeItem(itemId) {
    const idx = gameState.player.inventory.indexOf(itemId);
    if (idx > -1) {
        gameState.player.inventory.splice(idx, 1);
    }
}

export function equipItem(itemId) {
    const item = items[itemId];
    if (!item) return;
    if (item.type === 'weapon') gameState.player.equippedWeaponId = itemId;
    if (item.type === 'armor') gameState.player.equippedArmorId = itemId;
}

export function useConsumable(itemId) {
    const item = items[itemId];
    if (!item || item.type !== 'consumable') return { success: false, msg: "Not usable." };

    if (item.effect === 'heal') {
        const roll = rollDiceExpression(item.amount);
        const healed = roll.total;
        gameState.player.hp = Math.min(gameState.player.hp + healed, gameState.player.maxHp);

        removeItem(itemId);
        return { success: true, msg: `Used ${item.name} and healed ${healed} HP.` };
    }

    return { success: false, msg: "Effect not implemented." };
}

// Status Effects
export function applyStatusEffect(effectId, durationOverride) {
    if (!statusEffects[effectId]) return;

    const effect = statusEffects[effectId];
    const duration = durationOverride || effect.duration;

    // Check if already has effect
    const existing = gameState.player.statusEffects.find(e => e.id === effectId);

    if (existing) {
        existing.remaining = Math.max(existing.remaining, duration);
        logMessage(`Status Effect refreshed: ${effect.name} (${duration} turns).`, "system");
    } else {
        gameState.player.statusEffects.push({
            id: effectId,
            remaining: duration
        });
        logMessage(`You are now ${effect.name} (${duration} turns).`, "combat");
    }
}

export function hasStatusEffect(effectId) {
    return gameState.player.statusEffects.some(e => e.id === effectId);
}

export function tickStatusEffects() {
    const activeEffects = [];

    gameState.player.statusEffects.forEach(e => {
        e.remaining--;
        if (e.remaining > 0) {
            activeEffects.push(e);
        } else {
            const def = statusEffects[e.id];
            logMessage(`${def.name} has faded.`, "system");
        }
    });

    gameState.player.statusEffects = activeEffects;
}

// Helper to log (needs to hook into UI or simple console for now, but game.js handles UI)
// We can't easily call game.js logMessage from here due to circular deps if game imports gameState.
// We will assume game.js calls tickStatusEffects and handles logging there?
// No, game.js imports this. We need a callback or event.
// For simplicity in this modular design, we will export a callback setter or use console.log
// and let game.js override it, OR simpler: return messages from tickStatusEffects?
// The prompt said "Log messages...".
// Let's make logMessage a global or attachable.
// For now, I'll just use console.log and let game.js handle the UI updates by checking state,
// OR I'll move tickStatusEffects to game.js as planned initially.
// Wait, I added it here. Let's move logic that touches UI (logging) to game.js or pass a logger.
// I will use a simple hack: window.logMessage if available.

function logMessage(msg, type) {
    if (window.logMessage) {
        window.logMessage(msg, type);
    } else {
        console.log(`[${type}] ${msg}`);
    }
}

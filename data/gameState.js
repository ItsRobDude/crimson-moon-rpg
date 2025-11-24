import { races } from './races.js';
import { classes } from './classes.js';
import { items } from './items.js';
import { quests } from './quests.js';
import { scenes } from './scenes.js';
import { statusEffects } from './statusEffects.js';
import { npcs } from './npcs.js';
import { factions } from './factions.js';
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
        modifiers: { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 },
        skills: [],
        knownSpells: [],
        proficiencyBonus: 2,
        equippedWeaponId: null,
        equippedArmorId: null,
        inventory: [],
        gold: 0,
        statusEffects: []
    },
    currentSceneId: "SCENE_BRIEFING",
    quests: JSON.parse(JSON.stringify(quests)),
    flags: {},
    // Reputation Trackers (Keyed by Faction ID)
    reputation: {
        silverthorn: 0,
        durnhelm: 0,
        whisperwood_survivors: 0
    },
    // Relationship Trackers (Keyed by NPC ID)
    relationships: {},
    // Discovered Locations
    discoveredLocations: {
        silverthorn: true,
        shadowmire: false,
        whisperwood: false
    },
    // Combat State
    combat: {
        active: false,
        enemyId: null,
        enemyCurrentHp: 0,
        enemyMaxHp: 0,
        enemyAc: 0,
        enemyName: "",
        playerInitiative: 0,
        enemyInitiative: 0,
        round: 1,
        turn: "player",
        winSceneId: null,
        loseSceneId: null,
        defending: false
    }
};

// Helper to calc mod
function calcMod(score) {
    return Math.floor((score - 10) / 2);
}

// Updated Initialize
export function initializeNewGame(name, raceId, classId, baseAbilityScores, chosenSkills, chosenSpells) {
    const race = races[raceId];
    const cls = classes[classId];

    const abilities = baseAbilityScores ? { ...baseAbilityScores } : { STR: 12, DEX: 12, CON: 12, INT: 12, WIS: 12, CHA: 12 };

    if (race && race.abilityBonuses) {
        for (const [stat, bonus] of Object.entries(race.abilityBonuses)) {
            if (abilities[stat] !== undefined) {
                abilities[stat] += bonus;
            }
        }
    }

    gameState.player.name = name;
    gameState.player.raceId = raceId;
    gameState.player.classId = classId;
    gameState.player.abilities = abilities;
    gameState.player.level = 1;
    gameState.player.xp = 0;
    gameState.player.proficiencyBonus = 2;

    for (const stat of Object.keys(gameState.player.abilities)) {
        gameState.player.modifiers[stat] = calcMod(gameState.player.abilities[stat]);
    }

    const conMod = gameState.player.modifiers.CON;
    gameState.player.maxHp = cls.hitDie + conMod;
    gameState.player.hp = gameState.player.maxHp;

    gameState.player.skills = chosenSkills && chosenSkills.length > 0 ? chosenSkills : (cls.proficiencies || []);
    gameState.player.knownSpells = chosenSpells || [];

    gameState.player.inventory = [];
    addItem('potion_healing');

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
    gameState.combat.active = false;
    gameState.combat.enemyId = null;

    gameState.discoveredLocations = {
        silverthorn: true,
        shadowmire: false,
        whisperwood: false
    };

    // Initialize Relationships
    initNpcRelationships();
}

// --- Relationship & Reputation Logic ---

export function initNpcRelationships() {
    gameState.relationships = {};
    for (const [id, npc] of Object.entries(npcs)) {
        gameState.relationships[id] = npc.relationshipStart || 0;
    }
}

export function changeRelationship(npcId, amount) {
    if (gameState.relationships[npcId] === undefined) {
        // Initialize if missing (e.g. old save)
        gameState.relationships[npcId] = 0;
    }

    const npc = npcs[npcId];
    if (!npc) return;

    const oldVal = gameState.relationships[npcId];
    let newVal = oldVal + amount;

    // Clamp
    newVal = Math.max(npc.relationshipMin || -100, Math.min(npc.relationshipMax || 100, newVal));
    gameState.relationships[npcId] = newVal;

    const sign = amount > 0 ? '+' : '';
    logMessage(`${npc.name}: ${sign}${amount} (${newVal})`, amount > 0 ? "gain" : "check-fail");
}

export function getRelationship(npcId) {
    return gameState.relationships[npcId] || 0;
}

export function changeReputation(factionId, amount) {
    if (gameState.reputation[factionId] === undefined) {
        gameState.reputation[factionId] = 0;
    }

    const fact = factions[factionId];
    if (!fact) return;

    const oldVal = gameState.reputation[factionId];
    let newVal = oldVal + amount;

    // Clamp
    newVal = Math.max(fact.min || -100, Math.min(fact.max || 100, newVal));
    gameState.reputation[factionId] = newVal;

    const sign = amount > 0 ? '+' : '';
    logMessage(`Reputation (${fact.name}): ${sign}${amount} (${newVal})`, amount > 0 ? "gain" : "check-fail");
}

export function getReputation(factionId) {
    return gameState.reputation[factionId] || 0;
}

// --- Standard Helpers ---

export function updateQuestStage(questId, stageNumber) {
    if (!gameState.quests[questId]) {
        if (quests[questId]) {
            gameState.quests[questId] = JSON.parse(JSON.stringify(quests[questId]));
        } else {
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
    if (gameState.player.xp >= gameState.player.xpNext) {
        gameState.player.level++;
        gameState.player.xpNext = gameState.player.level * 300;
        gameState.player.proficiencyBonus = Math.ceil(1 + (gameState.player.level / 4));
        const cls = classes[gameState.player.classId];
        const conMod = gameState.player.modifiers.CON;
        const hpGain = Math.floor(cls.hitDie / 2) + 1 + conMod;
        gameState.player.maxHp += hpGain;
        gameState.player.hp += hpGain;
        return true;
    }
    return false;
}

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

export function applyStatusEffect(effectId, durationOverride) {
    if (!statusEffects[effectId]) return;
    const effect = statusEffects[effectId];
    const duration = durationOverride || effect.duration;
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

export function discoverLocation(locId) {
    if (gameState.discoveredLocations[locId] === undefined) return;
    if (!gameState.discoveredLocations[locId]) {
        gameState.discoveredLocations[locId] = true;
        logMessage(`Location Discovered: ${locId.charAt(0).toUpperCase() + locId.slice(1)}`, "gain");
    }
}

export function isLocationDiscovered(locId) {
    return gameState.discoveredLocations[locId] === true;
}

function logMessage(msg, type) {
    if (window.logMessage) {
        window.logMessage(msg, type);
    } else {
        console.log(`[${type}] ${msg}`);
    }
}

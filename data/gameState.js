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
        subclassId: null, // New: Subclass tracking
        level: 1,
        xp: 0,
        xpNext: 300,
        hp: 10,
        maxHp: 10,
        abilities: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
        modifiers: { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 },
        skills: [],
        knownSpells: [],
        spellSlots: {}, // Tracks max slots per level
        currentSlots: {}, // Tracks current available slots
        resources: {}, // Tracks class resources (e.g., second_wind, action_surge)
        proficiencyBonus: 2,
        equippedWeaponId: null,
        equippedArmorId: null,
        inventory: [],
        gold: 0,
        statusEffects: [],
        classResources: {}
    },
    pendingLevelUp: false, // New: Track if level up is pending choices
    currentSceneId: "SCENE_ARRIVAL_HUSHBRIAR",
    quests: JSON.parse(JSON.stringify(quests)),
    flags: {},
    threat: {
        level: 0,
        recentNoise: 0,
        recentStealth: 0,
        ambient: []
    },
    worldPhase: 0, // 0: Initial, 1: Post-Intro, 2: Rising Darkness, 3: Endgame
    // Reputation Trackers (Keyed by Faction ID)
    reputation: {
        silverthorn: 0,
        durnhelm: 0,
        whisperwood_survivors: 0
    },
    relationships: {},
    discoveredLocations: {
        hushbriar: true,
        silverthorn: false,
        shadowmire: false,
        whisperwood: false,
        durnhelm: false,
        lament_hill: false,
        solasmor: false,
        soul_mill: false,
        thieves_hideout: false
    },
    npcStates: {}, // Track { npcId: { status: 'dead'|'alive'|'met', flags: {} } }
    visitedScenes: [],
    mapPins: [],
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
        defending: false,
        // New: Action Economy Tracking
        actionsRemaining: 1,
        bonusActionsRemaining: 1,
        movementRemaining: 30 // Abstracted, maybe used for 'flee' or positioning later
    }
};

function calcMod(score) {
    return Math.floor((score - 10) / 2);
}

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
    gameState.player.subclassId = null;
    gameState.player.abilities = abilities;
    gameState.player.level = 1;
    gameState.player.xp = 0;
    gameState.player.proficiencyBonus = 2;
    gameState.pendingLevelUp = false;

    for (const stat of Object.keys(gameState.player.abilities)) {
        gameState.player.modifiers[stat] = calcMod(gameState.player.abilities[stat]);
    }

    const conMod = gameState.player.modifiers.CON;
    gameState.player.maxHp = cls.hitDie + conMod;
    gameState.player.hp = gameState.player.maxHp;

    gameState.player.skills = chosenSkills && chosenSkills.length > 0 ? chosenSkills : (cls.proficiencies || []);
    gameState.player.knownSpells = chosenSpells || [];

    // Initialize Resources
    gameState.player.resources = {};
    if (cls.progression[1] && cls.progression[1].features) {
        cls.progression[1].features.forEach(feat => {
            if (feat === 'second_wind') gameState.player.resources['second_wind'] = { current: 1, max: 1 };
            // Add other level 1 resource inits here if needed
        });
    }

    // Spell Slots Init
    if (cls.progression[1].spellSlots) {
        gameState.player.spellSlots = { ...cls.progression[1].spellSlots };
        gameState.player.currentSlots = { ...cls.progression[1].spellSlots };
    } else {
        gameState.player.spellSlots = {};
        gameState.player.currentSlots = {};
    }

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

    gameState.currentSceneId = "SCENE_ARRIVAL_HUSHBRIAR";
    gameState.combat.active = false;
    gameState.combat.enemyId = null;

    gameState.threat = {
        level: 0,
        recentNoise: 0,
        recentStealth: 0,
        ambient: []
    };

    gameState.discoveredLocations = {
        hushbriar: true,
        silverthorn: false,
        shadowmire: false,
        whisperwood: false,
        durnhelm: false,
        lament_hill: false,
        solasmor: false,
        soul_mill: false,
        thieves_hideout: false
    };

    gameState.visitedScenes = [];

    initNpcRelationships();
    gameState.mapPins = [];
}

// ... (Existing helpers: updateQuestStage, addGold, spendGold, gainXp, inventory helpers) ...
// Keeping them for brevity in patch, ensuring they exist.

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
    // Check if we hit the threshold
    if (gameState.player.xp >= gameState.player.xpNext) {
        // We do NOT auto-level up anymore. We set a pending state.
        gameState.pendingLevelUp = true;
        logMessage(`You have enough XP to reach Level ${gameState.player.level + 1}! Rest or check your character sheet to level up.`, "gain");
        return true; // Return true to indicate level up is available
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
    if (!item) return { success: false, reason: 'not_found' };

    // Must own the item to equip it
    if (!gameState.player.inventory.includes(itemId)) {
        return { success: false, reason: 'missing' };
    }

    if (item.type === 'armor') {
        // Enforce simple strength requirement for heavy armor
        if (item.reqStr && gameState.player.abilities.STR < item.reqStr) {
            return { success: false, reason: 'reqStr', value: item.reqStr };
        }

        gameState.player.equippedArmorId = itemId;
        return { success: true, slot: 'armor' };
    }

    if (item.type === 'weapon') {
        gameState.player.equippedWeaponId = itemId;
        return { success: true, slot: 'weapon' };
    }

    return { success: false, reason: 'invalid_type' };
}

export function unequipItem(slot) {
    if (slot === 'weapon') {
        gameState.player.equippedWeaponId = null;
        return { success: true, slot };
    } else if (slot === 'armor') {
        gameState.player.equippedArmorId = null;
        return { success: true, slot };
    }

    return { success: false, reason: 'invalid_slot' };
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

    if (item.effect === 'cure_poison') {
        const idx = gameState.player.statusEffects.findIndex(e => e.id === 'poisoned');
        if (idx > -1) {
            gameState.player.statusEffects.splice(idx, 1);
            removeItem(itemId);
            return { success: true, msg: `Used ${item.name}. You are no longer poisoned.` };
        } else {
            return { success: false, msg: "You are not poisoned." };
        }
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

export function adjustThreat(amount, reason = "") {
    gameState.threat.level = Math.max(0, Math.min(100, gameState.threat.level + amount));
    if (amount !== 0) {
        const dir = amount > 0 ? "+" : "";
        logMessage(`Threat ${dir}${amount} (${gameState.threat.level}) ${reason ? '- ' + reason : ''}`, amount > 0 ? "check-fail" : "gain");
    }
    if (amount > 0) {
        gameState.threat.recentNoise = Math.min(3, gameState.threat.recentNoise + 1);
        gameState.threat.recentStealth = Math.max(0, gameState.threat.recentStealth - 1);
    } else if (amount < 0) {
        gameState.threat.recentStealth = Math.min(3, gameState.threat.recentStealth + 1);
        gameState.threat.recentNoise = Math.max(0, gameState.threat.recentNoise - 1);
    }
}

export function clearTransientThreat() {
    gameState.threat.recentNoise = Math.max(0, gameState.threat.recentNoise - 1);
    gameState.threat.recentStealth = Math.max(0, gameState.threat.recentStealth - 1);
}

export function recordAmbientEvent(text, tone = "system") {
    const entry = { text, tone, ts: Date.now() };
    gameState.threat.ambient.push(entry);
    logMessage(text, tone);
}

export function addMapPin(locationId, note) {
    if (!locationId) return;
    gameState.mapPins.push({ locationId, note, ts: Date.now() });
    logMessage(`Pinned ${locationId}: ${note || 'path marked'}`, "system");
}

export function removeMapPin(index) {
    if (index >= 0 && index < gameState.mapPins.length) {
        gameState.mapPins.splice(index, 1);
    }
}

// Helper to init relationships
function initNpcRelationships() {
    gameState.relationships = {};
    for (const [key, npc] of Object.entries(npcs)) {
        gameState.relationships[key] = npc.relationshipStart;
    }

    // Init reputations
    gameState.reputation = {
        silverthorn: 0,
        durnhelm: 0,
        whisperwood_survivors: 0
    };

    // Init NPC States
    gameState.npcStates = {};
    Object.keys(npcs).forEach(id => {
        gameState.npcStates[id] = { status: 'alive', flags: {} };
    });
}

// NPC State Helpers
export function setNpcStatus(npcId, status) {
    if (!gameState.npcStates[npcId]) gameState.npcStates[npcId] = { status: 'alive', flags: {} };
    gameState.npcStates[npcId].status = status;
    logMessage(`${npcs[npcId]?.name || npcId} is now ${status}.`, "system");
}

export function getNpcStatus(npcId) {
    if (!gameState.npcStates[npcId]) return 'unknown';
    return gameState.npcStates[npcId].status;
}

// Relationship helpers
export function changeRelationship(npcId, amount) {
    if (gameState.relationships[npcId] !== undefined) {
        gameState.relationships[npcId] += amount;
        logMessage(`Relationship with ${npcs[npcId]?.name || npcId}: ${amount > 0 ? '+' : ''}${amount}`, amount > 0 ? "gain" : "check-fail");
    }
}

export function getRelationship(npcId) {
    return gameState.relationships[npcId] || 0;
}

export function changeReputation(factionId, amount) {
    if (gameState.reputation[factionId] !== undefined) {
        gameState.reputation[factionId] += amount;
        logMessage(`Reputation with ${factions[factionId]?.name || factionId}: ${amount > 0 ? '+' : ''}${amount}`, amount > 0 ? "gain" : "check-fail");
    }
}

export function getReputation(factionId) {
    return gameState.reputation[factionId] || 0;
}


function logMessage(msg, type) {
    if (window.logMessage) {
        window.logMessage(msg, type);
    } else {
        console.log(`[${type}] ${msg}`);
    }
}

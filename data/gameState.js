import { races } from './races.js';
import { classes } from './classes.js';
import { items } from './items.js';
import { quests } from './quests.js';
import { scenes } from './scenes.js';
import { statusEffects } from './statusEffects.js';
import { npcs } from './npcs.js';
import { companions } from './companions.js';
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
        equipped: {
            weapon: null,
            armor: null
        },
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
    worldPhase: 0,
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
    npcStates: {},
    visitedScenes: [],
    mapPins: [],
    combat: {
        active: false,
        enemies: [],
        turnOrder: [],
        turnIndex: 0,
        round: 1,
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

    // Equip default items logic (same as before)
    if (classId === 'fighter') {
        addItem('longsword'); addItem('chainmail'); equipItem('longsword'); equipItem('chainmail');
    } else if (classId === 'rogue') {
        addItem('dagger'); addItem('shortbow'); addItem('leather_armor'); equipItem('dagger'); equipItem('leather_armor');
    } else if (classId === 'wizard') {
        addItem('dagger'); addItem('potion_healing'); equipItem('dagger');
    } else {
        addItem('longsword'); equipItem('longsword');
    }

    // Initialize Party Roster (Empty active party, but rosters exist)
    gameState.party = [];
    gameState.roster = {};

    // Example: Add Aodhan immediately for testing if desired, or wait for narrative
    // addCompanion('aodhan'); // Uncomment to start with Aodhan for testing

    gameState.currentSceneId = "SCENE_ARRIVAL_HUSHBRIAR";
    gameState.combat.active = false;
    gameState.threat = { level: 0, recentNoise: 0, recentStealth: 0, ambient: [] };
    gameState.discoveredLocations.hushbriar = true;
    gameState.visitedScenes = [];
    initNpcRelationships();
    gameState.mapPins = [];
}

// --- Companion Management ---

export function addCompanion(companionId) {
    if (gameState.party.includes(companionId)) return; // Already in party
    if (!companions[companionId]) return;

    // Initialize state if not present
    if (!gameState.roster[companionId]) {
        const compDef = companions[companionId];
        const race = races[compDef.raceId];
        const cls = classes[compDef.classId];

        const stats = { ...compDef.baseStats };
        if (race.abilityBonuses) {
            for (const [s, b] of Object.entries(race.abilityBonuses)) {
                if (stats[s] !== undefined) stats[s] += b;
            }
        }

        const conMod = calcMod(stats.CON);
        const hp = cls.hitDie + conMod; // Level 1 HP

        gameState.roster[companionId] = {
            id: companionId,
            name: compDef.name,
            classId: compDef.classId,
            raceId: compDef.raceId,
            level: 1,
            xp: 0, // Tracks separately but synced
            hp: hp,
            maxHp: hp,
            abilities: stats,
            modifiers: {}, // Calculated below
            inventory: [],
            equipped: { weapon: null, armor: null },
            resources: {}, // Initialize like player
            spellSlots: {},
            currentSlots: {},
            knownSpells: [], // Needs definition
            portrait: compDef.portrait,
            subclassId: null
        };

        // Calc Modifiers
        for (const stat of Object.keys(stats)) {
            gameState.roster[companionId].modifiers[stat] = calcMod(stats[stat]);
        }

        // Default Equipment
        if (compDef.defaultEquipment) {
            if (compDef.defaultEquipment.weapon) {
                gameState.roster[companionId].inventory.push(compDef.defaultEquipment.weapon);
                gameState.roster[companionId].equipped.weapon = compDef.defaultEquipment.weapon;
            }
            if (compDef.defaultEquipment.armor) {
                gameState.roster[companionId].inventory.push(compDef.defaultEquipment.armor);
                gameState.roster[companionId].equipped.armor = compDef.defaultEquipment.armor;
            }
        }

        // Sync Level immediately
        syncCompanionLevel(companionId);
    }

    gameState.party.push(companionId);
    logMessage(`${companions[companionId].name} has joined the party.`, "gain");
}

export function removeCompanion(companionId) {
    const idx = gameState.party.indexOf(companionId);
    if (idx > -1) {
        gameState.party.splice(idx, 1);
        logMessage(`${companions[companionId].name} has left the party.`, "system");
    }
}

export function syncPartyLevels() {
    gameState.party.forEach(id => syncCompanionLevel(id));
}

function syncCompanionLevel(companionId) {
    const char = gameState.roster[companionId];
    if (!char) return;

    const targetLevel = gameState.player.level;
    if (char.level >= targetLevel) return;

    while (char.level < targetLevel) {
        char.level++;
        // Gain HP
        const cls = classes[char.classId];
        const conMod = char.modifiers.CON;
        const hpGain = Math.floor(cls.hitDie / 2) + 1 + conMod; // Average
        char.maxHp += hpGain;
        char.hp += hpGain;

        // Resources (Simplified: Reset/Upgrade)
        const levelData = cls.progression[char.level];
        if (levelData) {
            if (levelData.spellSlots) {
                char.spellSlots = { ...levelData.spellSlots };
                char.currentSlots = { ...char.spellSlots }; // Refresh on level up
            }
            if (levelData.features) {
                levelData.features.forEach(f => {
                    if (f === 'second_wind') char.resources['second_wind'] = { current: 1, max: 1 };
                    if (f === 'action_surge') char.resources['action_surge'] = { current: 1, max: 1 };
                });
            }
        }
    }
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
    // Check if we hit the threshold
    if (gameState.player.xp >= gameState.player.xpNext) {
        // We do NOT auto-level up anymore. We set a pending state.
        gameState.pendingLevelUp = true;
        logMessage(`You have enough XP to reach Level ${gameState.player.level + 1}! Rest or check your character sheet to level up.`, "gain");
        return true; // Return true to indicate level up is available
    }
    return false;
}

// Inventory Helpers - Updated for characterId
export function addItem(itemId, characterId = 'player') {
    if (!items[itemId]) return;

    let inv;
    if (characterId === 'player') {
        inv = gameState.player.inventory;
    } else {
        if (gameState.roster[characterId]) inv = gameState.roster[characterId].inventory;
    }

    if (inv) inv.push(itemId);
}

export function removeItem(itemId, characterId = 'player') {
    let inv;
    if (characterId === 'player') {
        inv = gameState.player.inventory;
    } else {
        if (gameState.roster[characterId]) inv = gameState.roster[characterId].inventory;
    }

    if (inv) {
        const idx = inv.indexOf(itemId);
        if (idx > -1) inv.splice(idx, 1);
    }
}

export function equipItem(itemId, characterId = 'player') {
    const item = items[itemId];
    if (!item) return { success: false, reason: 'not_found' };

    let char = (characterId === 'player') ? gameState.player : gameState.roster[characterId];
    if (!char) return { success: false, reason: 'char_not_found' };

    if (!char.inventory.includes(itemId)) {
        return { success: false, reason: 'missing' };
    }

    if (item.type === 'armor') {
        if (item.reqStr && char.abilities.STR < item.reqStr) {
            return { success: false, reason: 'reqStr', value: item.reqStr };
        }
        char.equipped.armor = itemId;
        return { success: true, slot: 'armor' };
    }

    if (item.type === 'weapon') {
        char.equipped.weapon = itemId;
        return { success: true, slot: 'weapon' };
    }

    return { success: false, reason: 'invalid_type' };
}

export function unequipItem(slot, characterId = 'player') {
    let char = (characterId === 'player') ? gameState.player : gameState.roster[characterId];
    if (!char) return { success: false, reason: 'char_not_found' };

    if (slot === 'weapon') {
        char.equipped.weapon = null;
    } else if (slot === 'armor') {
        char.equipped.armor = null;
    }
    return { success: true, slot };
}

export function useConsumable(itemId, characterId = 'player') {
    const item = items[itemId];
    if (!item || item.type !== 'consumable') return { success: false, msg: "Not usable." };

    let char = (characterId === 'player') ? gameState.player : gameState.roster[characterId];
    if (!char) return { success: false, msg: "Character not found." };

    // Effect application
    if (item.effect === 'heal') {
        const roll = rollDiceExpression(item.amount);
        const healed = roll.total;
        char.hp = Math.min(char.hp + healed, char.maxHp);
        removeItem(itemId, characterId);
        return { success: true, msg: `Used ${item.name} and healed ${healed} HP.` };
    }

    if (item.effect === 'cure_poison') {
        // Only player tracks status effects in array currently.
        // Need to add statusEffects to roster chars if not present.
        if (!char.statusEffects) char.statusEffects = [];

        const idx = char.statusEffects.findIndex(e => e.id === 'poisoned');
        if (idx > -1) {
            char.statusEffects.splice(idx, 1);
            removeItem(itemId, characterId);
            return { success: true, msg: `Used ${item.name}. No longer poisoned.` };
        } else {
            return { success: false, msg: "Not poisoned." };
        }
    }

    return { success: false, msg: "Effect not implemented." };
}

// Status Effect Helpers (Currently mostly Player focused, need to generalize for combat loop)
export function applyStatusEffect(effectId, durationOverride, characterId = 'player') {
    if (!statusEffects[effectId]) return;

    let char = (characterId === 'player') ? gameState.player : gameState.roster[characterId];
    if (!char) return; // Or handle Enemy?

    if (!char.statusEffects) char.statusEffects = [];

    const effect = statusEffects[effectId];
    const duration = durationOverride || effect.duration;
    const existing = char.statusEffects.find(e => e.id === effectId);

    if (existing) {
        existing.remaining = Math.max(existing.remaining, duration);
        logMessage(`${char.name}: ${effect.name} refreshed (${duration} turns).`, "system");
    } else {
        char.statusEffects.push({ id: effectId, remaining: duration });
        logMessage(`${char.name} is now ${effect.name} (${duration} turns).`, "combat");
    }
}

export function hasStatusEffect(effectId, characterId = 'player') {
    let char = (characterId === 'player') ? gameState.player : gameState.roster[characterId];
    if (!char || !char.statusEffects) return false;
    return char.statusEffects.some(e => e.id === effectId);
}

export function tickStatusEffects() {
    // Player
    tickCharEffects(gameState.player);
    // Party
    gameState.party.forEach(id => {
        if (gameState.roster[id]) tickCharEffects(gameState.roster[id]);
    });
}

function tickCharEffects(char) {
    if (!char.statusEffects) return;
    const active = [];
    char.statusEffects.forEach(e => {
        e.remaining--;
        if (e.remaining > 0) {
            active.push(e);
        } else {
            const def = statusEffects[e.id];
            logMessage(`${char.name}: ${def.name} has faded.`, "system");
        }
    });
    char.statusEffects = active;
}

// Location & Threat Helpers (Unchanged)
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

function initNpcRelationships() {
    gameState.relationships = {};
    for (const [key, npc] of Object.entries(npcs)) {
        gameState.relationships[key] = npc.relationshipStart;
    }
    gameState.reputation = { silverthorn: 0, durnhelm: 0, whisperwood_survivors: 0 };
    gameState.npcStates = {};
    Object.keys(npcs).forEach(id => { gameState.npcStates[id] = { status: 'alive', flags: {} }; });
}

export function setNpcStatus(npcId, status) {
    if (!gameState.npcStates[npcId]) gameState.npcStates[npcId] = { status: 'alive', flags: {} };
    gameState.npcStates[npcId].status = status;
    logMessage(`${npcs[npcId]?.name || npcId} is now ${status}.`, "system");
}

export function getNpcStatus(npcId) {
    if (!gameState.npcStates[npcId]) return 'unknown';
    return gameState.npcStates[npcId].status;
}

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

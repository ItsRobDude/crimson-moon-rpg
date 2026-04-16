import { races } from './races.js';
import { classes } from './classes.js';
import { backgrounds } from './backgrounds.js';
import { items } from './items.js';
import { quests } from './quests.js';
import { scenes } from './scenes.js';
import { npcs } from './npcs.js';
import { companions } from './companions.js';
import { factions } from './factions.js';
import { getSpell, getSpellIdsForClass } from './spells.js';
import { rollDiceExpression, rollDie } from '../rules.js';
import { CANONICAL_START_SCENE, createDefaultStoryState, ensureStoryState } from './storyTimeline.js';
import { addEffectToActor, applyDerivedState, createDefaultMechanicsState, createProficiencyState, ensureActorMechanics, getAbilityMod, getDerivedActorState, mergeProficiencyStates, removeEffectFromActor, setProficiencyMultiplier, syncLegacyStatusEffects, tickActorEffects } from './mechanics.js';

// This object serves as a blueprint for a clean game state.
const defaultGameState = {
    player: {
        name: "",
        raceId: "",
        classId: "",
        backgroundId: "",
        subclassId: null,
        level: 1,
        xp: 0,
        xpNext: 300,
        hp: 10,
        maxHp: 10,
        abilities: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
        modifiers: { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 },
        skills: [],
        knownSpells: [],
        preparedSpells: [],
        spellbook: [],
        spellcastingMode: null,
        spellSlots: {},
        currentSlots: {},
        resources: {},
        proficiencyBonus: 2,
        fightingStyle: null,
        expertiseSkills: [],
        equipped: {
            weapon: null,
            armor: null,
            shield: null
        },
        inventory: [],
        gold: 0,
        statusEffects: [],
        proficiencies: createProficiencyState(),
        classResources: {},
        mechanics: createDefaultMechanicsState()
    },
    pendingLevelUp: false,
    currentSceneId: CANONICAL_START_SCENE,
    quests: {}, // Populated from quests.js on reset
    flags: {},
    story: createDefaultStoryState(),
    threat: {
        level: 0,
        recentNoise: 0,
        recentStealth: 0,
        ambient: []
    },
    worldPhase: 0,
    timeline: {
        day: 1,
        slot: 'midday',
        actionCount: 0,
        silverthornActionCount: 0
    },
    sceneMemory: {},
    reputation: {
        silverthorn: 0,
        durnhelm: 0,
        whisperwood_survivors: 0,
        thorne_guild: 0
    },
    relationships: {},
    discoveredLocations: {
        hushbriar: false,
        silverthorn: true,
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
    party: [],
    roster: {},
    combat: {
        active: false,
        enemies: [],
        grid: null,
        turnOrder: [],
        turnIndex: 0,
        round: 1,
        winSceneId: null,
        loseSceneId: null,
        defending: false,
        reactionsRemaining: 1,
        actionsRemaining: 1,
        bonusActionsRemaining: 1,
        movementRemaining: 30,
        activeActorId: null,
        sneakAttackUsedThisTurn: false
    }
};

export const SAVE_STORAGE_KEY = 'crimson_moon_save';

// The active gameState is initialized as a deep copy of the default.
export const gameState = JSON.parse(JSON.stringify(defaultGameState));

/**
 * Resets the active gameState to its default values. This is crucial for starting a new game
 * without carrying over data from a previous session.
 */
export function resetGameState() {
    // Deep copy each top-level property from the default state to the active state.
    // This preserves the `gameState` object reference, which is important for ES module exports.
    Object.assign(gameState.player, JSON.parse(JSON.stringify(defaultGameState.player)));

    gameState.pendingLevelUp = defaultGameState.pendingLevelUp;
    gameState.currentSceneId = defaultGameState.currentSceneId;
    gameState.quests = JSON.parse(JSON.stringify(quests)); // Re-initialize from source
    gameState.flags = {};
    gameState.story = createDefaultStoryState();
    Object.assign(gameState.threat, JSON.parse(JSON.stringify(defaultGameState.threat)));
    gameState.worldPhase = defaultGameState.worldPhase;
    Object.assign(gameState.timeline, JSON.parse(JSON.stringify(defaultGameState.timeline)));
    gameState.sceneMemory = {};
    Object.assign(gameState.reputation, JSON.parse(JSON.stringify(defaultGameState.reputation)));
    gameState.relationships = {};
    Object.assign(gameState.discoveredLocations, JSON.parse(JSON.stringify(defaultGameState.discoveredLocations)));
    gameState.npcStates = {};
    gameState.visitedScenes = [];
    gameState.mapPins = [];
    gameState.party = [];
    gameState.roster = {};
    Object.assign(gameState.combat, JSON.parse(JSON.stringify(defaultGameState.combat)));
}

export function syncActorState(actor) {
    ensureActorSelections(actor);
    ensureActorSpellcasting(actor);
    ensureActorInventory(actor);
    ensureActorMechanics(actor);
    return applyDerivedState(actor);
}

export function syncAllActorStates() {
    syncActorState(gameState.player);
    Object.values(gameState.roster).forEach(actor => syncActorState(actor));
    if (Array.isArray(gameState.combat?.enemies)) {
        gameState.combat.enemies.forEach(actor => syncActorState(actor));
    }
}

export function syncCharacterState(characterId = 'player') {
    if (characterId === 'player') return syncActorState(gameState.player);
    if (gameState.roster[characterId]) return syncActorState(gameState.roster[characterId]);
    const enemy = gameState.combat.enemies.find(actor => actor.uniqueId === characterId);
    if (enemy) return syncActorState(enemy);
    return null;
}

function buildActorProficiencies({ cls = null, background = null, chosenSkills = [], chosenTools = [], languages = [] } = {}) {
    return mergeProficiencyStates(
        createProficiencyState({
            saves: cls?.saveProficiencies || [],
            weapons: cls?.weaponProficiencies || [],
            armor: cls?.armorProficiencies || []
        }),
        createProficiencyState({
            skills: chosenSkills.map((skill) => String(skill).toLowerCase()),
            tools: [...(background?.toolProficiencies || []), ...chosenTools],
            languages: [...(background?.languages || []), ...languages]
        })
    );
}

function ensureActorSelections(actor) {
    if (!actor) return;
    if (!Array.isArray(actor.knownSpells)) actor.knownSpells = [];
    if (!Array.isArray(actor.preparedSpells)) actor.preparedSpells = [];
    if (!Array.isArray(actor.spellbook)) actor.spellbook = [];
    if (!Array.isArray(actor.expertiseSkills)) actor.expertiseSkills = [];
    if (!actor.resources) actor.resources = {};
    if (actor.fightingStyle === undefined) actor.fightingStyle = null;
    const cls = classes[actor.classId];
    if (!actor.subclassId && cls?.subclassLevel === 1 && cls.defaultSubclass) {
        actor.subclassId = cls.defaultSubclass;
    }
    ensureActorMechanics(actor);
    if (actor.fightingStyle) {
        const traitId = `fighting_style_${actor.fightingStyle}`;
        if (!actor.mechanics.bonusTraits.includes(traitId)) {
            actor.mechanics.bonusTraits.push(traitId);
        }
    }
    actor.expertiseSkills.forEach((skill) => setProficiencyMultiplier(actor, 'skills', skill, 2));
}

function ensureItemEntry(entry) {
    if (!entry) return null;
    if (typeof entry === 'string') {
        const item = items[entry];
        if (!item) return null;
        return {
            itemId: entry,
            quantity: Math.max(1, item.quantityPerAdd || 1)
        };
    }
    if (!items[entry.itemId]) return null;
    return {
        itemId: entry.itemId,
        quantity: Math.max(1, Number(entry.quantity) || 1)
    };
}

function ensureActorInventory(actor) {
    if (!actor) return;
    if (!Array.isArray(actor.inventory)) {
        actor.inventory = [];
        return;
    }

    const normalized = [];
    actor.inventory.forEach((entry) => {
        const normalizedEntry = ensureItemEntry(entry);
        if (!normalizedEntry) return;
        const item = items[normalizedEntry.itemId];
        if (item?.stackable) {
            const existing = normalized.find((candidate) => candidate.itemId === normalizedEntry.itemId);
            if (existing) {
                existing.quantity += normalizedEntry.quantity;
                return;
            }
        }
        normalized.push(normalizedEntry);
    });
    actor.inventory = normalized;
    if (!actor.equipped) {
        actor.equipped = { weapon: null, armor: null, shield: null };
    }
    if (actor.equipped.shield === undefined) {
        actor.equipped.shield = null;
    }
}

function getActorByCharacterId(characterId = 'player') {
    if (characterId === 'player') return gameState.player;
    if (gameState.roster[characterId]) return gameState.roster[characterId];
    return gameState.combat.enemies.find((actor) => actor.uniqueId === characterId) || null;
}

function getAllPersistentActors() {
    return [gameState.player, ...gameState.party.map((id) => gameState.roster[id]).filter(Boolean)];
}

export function getInventoryEntries(characterId = 'player') {
    const actor = getActorByCharacterId(characterId);
    if (!actor) return [];
    ensureActorInventory(actor);
    return actor.inventory.map((entry) => ({ ...entry }));
}

export function getItemCount(itemId, characterId = 'player') {
    const actor = getActorByCharacterId(characterId);
    if (!actor) return 0;
    ensureActorInventory(actor);
    return actor.inventory
        .filter((entry) => entry.itemId === itemId)
        .reduce((sum, entry) => sum + entry.quantity, 0);
}

export function getInventoryUseCost(itemId, characterId = 'player') {
    const item = items[itemId];
    const actor = getActorByCharacterId(characterId);
    if (!item || !actor) return 'action';

    const qualifiesForFastHands = actor.classId === 'rogue'
        && actor.subclassId === 'thief'
        && ['consumable', 'adventuring_gear'].includes(item.type);

    return qualifiesForFastHands ? 'bonus' : 'action';
}

function hasInventoryItem(actor, itemId) {
    ensureActorInventory(actor);
    return actor.inventory.some((entry) => entry.itemId === itemId && entry.quantity > 0);
}

function consumeInventoryItem(actor, itemId, quantity = 1) {
    ensureActorInventory(actor);
    const entry = actor.inventory.find((candidate) => candidate.itemId === itemId && candidate.quantity > 0);
    if (!entry) return false;
    entry.quantity -= Math.max(1, quantity);
    if (entry.quantity <= 0) {
        actor.inventory = actor.inventory.filter((candidate) => candidate !== entry);
    }
    return true;
}

function getEquipFailure(item, actor) {
    if (!item || !actor) return 'not_found';
    const proficiencies = actor.proficiencies || createProficiencyState();

    if (item.type === 'weapon') {
        const weaponProficiencies = proficiencies.weapons || [];
        const proficient = weaponProficiencies.includes(item.subtype) || weaponProficiencies.includes(item.weaponCategory);
        if (!proficient) return 'proficiency';
        return null;
    }

    if (item.type === 'armor') {
        if (item.reqStr && (actor.abilities?.STR || 0) < item.reqStr) {
            return 'reqStr';
        }
        const armorProficiencies = proficiencies.armor || [];
        if (!armorProficiencies.includes(item.armorType)) return 'proficiency';
        return null;
    }

    if (item.type === 'shield') {
        const armorProficiencies = proficiencies.armor || [];
        if (!armorProficiencies.includes('shields')) return 'proficiency';
        return null;
    }

    return 'invalid_type';
}

export function getItemEquipFailure(itemId, characterId = 'player') {
    const actor = getActorByCharacterId(characterId);
    if (!actor) return 'char_not_found';
    const item = items[itemId];
    if (!item) return 'not_found';
    return getEquipFailure(item, actor);
}

export function getPreparedSpellLimit(actor) {
    const cls = classes[actor?.classId];
    const spellcasting = cls?.spellcasting;
    if (!spellcasting?.preparationAbility) return 0;
    const abilityScore = actor?.abilities?.[spellcasting.preparationAbility] || 10;
    return Math.max(spellcasting.minimumPrepared || 1, getAbilityMod(abilityScore) + (actor.level || 1));
}

function fillMissingUnique(current, available, count) {
    const next = [...current];
    available.forEach((entry) => {
        if (next.length >= count) return;
        if (!next.includes(entry)) next.push(entry);
    });
    return next.slice(0, count);
}

function ensureActorSpellcasting(actor) {
    if (!actor) return actor;
    ensureActorSelections(actor);

    const cls = classes[actor.classId];
    const spellcasting = cls?.spellcasting;
    actor.spellcastingMode = spellcasting?.mode || null;

    if (!spellcasting) {
        actor.knownSpells = [];
        actor.preparedSpells = [];
        actor.spellbook = [];
        return actor;
    }

    const cantripIds = getSpellIdsForClass(actor.classId, { level: 0 });
    const levelledIds = getSpellIdsForClass(actor.classId, { minLevel: 1 });
    const cantripCount = Math.min(spellcasting.cantripsKnown || 0, cantripIds.length);

    actor.knownSpells = fillMissingUnique(
        actor.knownSpells.filter((spellId) => cantripIds.includes(spellId)),
        cantripIds,
        cantripCount
    );

    if (spellcasting.mode === 'spellbook') {
        const spellbookCount = Math.min(spellcasting.spellbookCount || levelledIds.length, levelledIds.length);
        actor.spellbook = fillMissingUnique(
            actor.spellbook.filter((spellId) => levelledIds.includes(spellId)),
            levelledIds,
            spellbookCount
        );
        const preparedLimit = Math.min(getPreparedSpellLimit(actor), actor.spellbook.length);
        actor.preparedSpells = fillMissingUnique(
            actor.preparedSpells.filter((spellId) => actor.spellbook.includes(spellId)),
            actor.spellbook,
            preparedLimit
        );
        return actor;
    }

    const preparedLimit = Math.min(getPreparedSpellLimit(actor), levelledIds.length);
    actor.preparedSpells = fillMissingUnique(
        actor.preparedSpells.filter((spellId) => levelledIds.includes(spellId)),
        levelledIds,
        preparedLimit
    );
    actor.spellbook = [];
    return actor;
}

export function getActorCastableSpells(actor, options = {}) {
    ensureActorSpellcasting(actor);
    const { combatOnly = false } = options;
    const ids = [...new Set([...(actor.knownSpells || []), ...(actor.preparedSpells || [])])];
    if (!combatOnly) return ids;
    const combatSpellIds = new Set(getSpellIdsForClass(actor.classId, { combatOnly: true }));
    return ids.filter((spellId) => combatSpellIds.has(spellId));
}

function buildCreationSpellState(classId, abilities, selection = []) {
    const cls = classes[classId];
    const spellcasting = cls?.spellcasting;
    if (!spellcasting) {
        return {
            knownSpells: [],
            preparedSpells: [],
            spellbook: [],
            spellcastingMode: null
        };
    }

    const normalized = Array.isArray(selection)
        ? { cantrips: selection, preparedSpells: selection, spellbook: selection }
        : (selection || {});
    const cantripIds = getSpellIdsForClass(classId, { level: 0 });
    const levelledIds = getSpellIdsForClass(classId, { minLevel: 1 });
    const cantrips = fillMissingUnique(
        (normalized.cantrips || normalized.knownSpells || []).filter((spellId) => cantripIds.includes(spellId)),
        cantripIds,
        Math.min(spellcasting.cantripsKnown || 0, cantripIds.length)
    );
    const actorLike = { classId, abilities, level: 1 };

    if (spellcasting.mode === 'spellbook') {
        const spellbook = fillMissingUnique(
            (normalized.spellbook || normalized.preparedSpells || []).filter((spellId) => levelledIds.includes(spellId)),
            levelledIds,
            Math.min(spellcasting.spellbookCount || levelledIds.length, levelledIds.length)
        );
        const prepared = fillMissingUnique(
            (normalized.preparedSpells || []).filter((spellId) => spellbook.includes(spellId)),
            spellbook,
            Math.min(getPreparedSpellLimit(actorLike), spellbook.length)
        );
        return {
            knownSpells: cantrips,
            preparedSpells: prepared,
            spellbook,
            spellcastingMode: spellcasting.mode
        };
    }

    const prepared = fillMissingUnique(
        (normalized.preparedSpells || normalized.knownSpells || []).filter((spellId) => levelledIds.includes(spellId)),
        levelledIds,
        Math.min(getPreparedSpellLimit(actorLike), levelledIds.length)
    );
    return {
        knownSpells: cantrips,
        preparedSpells: prepared,
        spellbook: [],
        spellcastingMode: spellcasting.mode
    };
}

export function initializeNewGame(name, raceId, classId, backgroundId, baseStats, chosenSkills, creationSelections = []) {
    // First, reset the game state to ensure no data from a previous game persists.
    resetGameState();
    const race = races[raceId];
    const cls = classes[classId];
    const background = backgrounds[backgroundId];
    const normalizedSelections = Array.isArray(creationSelections)
        ? { spellSelection: creationSelections }
        : (creationSelections || {});
    const skillProficiencies = [...new Set([...(chosenSkills || []), ...(background?.skillProficiencies || [])].map((skill) => String(skill).toLowerCase()))];
    const bonusTools = normalizedSelections.bonusTools || [];
    const proficiencies = buildActorProficiencies({
        cls,
        background,
        chosenSkills: skillProficiencies,
        chosenTools: bonusTools
    });

    const abilities = { ...baseStats };
    const mechanics = createDefaultMechanicsState(baseStats, {
        saveProficiencies: cls ? (cls.saveProficiencies || []) : [],
        proficiencies,
        baseSpeed: 30
    });

    if (race && race.abilityBonuses) {
        for (const [stat, bonus] of Object.entries(race.abilityBonuses)) {
            if (abilities[stat] !== undefined) {
                abilities[stat] += bonus;
                mechanics.permanentAbilityBonuses[stat] = (mechanics.permanentAbilityBonuses[stat] || 0) + bonus;
            }
        }
    }

    const spellState = buildCreationSpellState(classId, abilities, normalizedSelections.spellSelection || creationSelections);
    const fightingStyle = normalizedSelections.fightingStyle || null;
    const expertiseSkills = (normalizedSelections.expertiseSkills || []).map((skill) => String(skill).toLowerCase());
    if (fightingStyle) {
        mechanics.bonusTraits.push(`fighting_style_${fightingStyle}`);
    }
    expertiseSkills.forEach((skill) => {
        if (!mechanics.proficiencyMultipliers.skills) mechanics.proficiencyMultipliers.skills = {};
        mechanics.proficiencyMultipliers.skills[skill] = 2;
    });

    gameState.player.name = name;
    gameState.player.raceId = raceId;
    gameState.player.classId = classId;
    gameState.player.backgroundId = backgroundId;
    gameState.player.subclassId = cls?.subclassLevel === 1 ? (normalizedSelections.subclassId || cls.defaultSubclass || null) : null;
    gameState.player.abilities = abilities;
    gameState.player.mechanics = mechanics;
    gameState.player.proficiencies = createProficiencyState(proficiencies);
    gameState.player.fightingStyle = fightingStyle;
    gameState.player.expertiseSkills = [...new Set(expertiseSkills)];
    for (const stat of Object.keys(abilities)) {
        gameState.player.modifiers[stat] = getAbilityMod(abilities[stat]);
    }
    gameState.player.level = 1;
    gameState.player.xp = 0;
    gameState.player.proficiencyBonus = 2;
    gameState.pendingLevelUp = false;

    const conMod = gameState.player.modifiers.CON;
    gameState.player.maxHp = cls.hitDie + conMod;
    gameState.player.hp = gameState.player.maxHp;

    gameState.player.skills = skillProficiencies;
    gameState.player.knownSpells = spellState.knownSpells;
    gameState.player.preparedSpells = spellState.preparedSpells;
    gameState.player.spellbook = spellState.spellbook;
    gameState.player.spellcastingMode = spellState.spellcastingMode;

    // Initialize Resources
    gameState.player.resources = {};
    if (cls.progression[1] && cls.progression[1].features) {
        cls.progression[1].features.forEach(feat => {
            if (feat === 'second_wind') gameState.player.resources['second_wind'] = { current: 1, max: 1 };
            if (feat === 'arcane_recovery') gameState.player.resources['arcane_recovery'] = { current: 1, max: 1 };
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
        addItem('longsword'); addItem('chainmail'); addItem('shield'); equipItem('longsword'); equipItem('chainmail'); equipItem('shield');
    } else if (classId === 'rogue') {
        addItem('dagger'); addItem('shortbow'); addItem('leather_armor'); addItem('thieves_tools'); equipItem('dagger'); equipItem('leather_armor');
    } else if (classId === 'wizard') {
        addItem('dagger'); addItem('quarterstaff'); addItem('scroll_magic_missile'); equipItem('dagger');
    } else if (classId === 'cleric') {
        addItem('mace'); addItem('shield'); addItem('hide_armor'); equipItem('mace'); equipItem('shield'); equipItem('hide_armor');
    } else {
        addItem('longsword'); equipItem('longsword');
    }

    // Initialize Party Roster (Empty active party, but rosters exist)
    gameState.party = [];
    gameState.roster = {};

    // Example: Add Aodhan immediately for testing if desired, or wait for narrative
    // addCompanion('aodhan'); // Uncomment to start with Aodhan for testing

    gameState.currentSceneId = CANONICAL_START_SCENE;
    gameState.story = createDefaultStoryState();
    gameState.combat.active = false;
    gameState.threat = { level: 0, recentNoise: 0, recentStealth: 0, ambient: [] };
    gameState.timeline = { day: 1, slot: 'midday', actionCount: 0, silverthornActionCount: 0 };
    gameState.sceneMemory = {};
    gameState.discoveredLocations.silverthorn = true;
    gameState.discoveredLocations.hushbriar = false;
    gameState.visitedScenes = [];
    initNpcRelationships();
    gameState.mapPins = [];
    syncActorState(gameState.player);
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
        const proficiencies = buildActorProficiencies({
            cls,
            chosenSkills: compDef.skills || []
        });

        const stats = { ...compDef.baseStats };
        if (race.abilityBonuses) {
            for (const [s, b] of Object.entries(race.abilityBonuses)) {
                if (stats[s] !== undefined) stats[s] += b;
            }
        }

        const conMod = getAbilityMod(stats.CON);
        const hp = cls.hitDie + conMod; // Level 1 HP
        const spellState = buildCreationSpellState(compDef.classId, stats, compDef.spellSelection || []);

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
            equipped: { weapon: null, armor: null, shield: null },
            resources: {}, // Initialize like player
            spellSlots: {},
            currentSlots: {},
            knownSpells: spellState.knownSpells,
            preparedSpells: spellState.preparedSpells,
            spellbook: spellState.spellbook,
            spellcastingMode: spellState.spellcastingMode,
            proficiencies: createProficiencyState(proficiencies),
            portrait: compDef.portrait,
            subclassId: cls?.subclassLevel === 1 ? (cls.defaultSubclass || null) : null,
            statusEffects: [],
            expertiseSkills: [],
            fightingStyle: null,
            mechanics: createDefaultMechanicsState(compDef.baseStats, {
                saveProficiencies: cls ? (cls.saveProficiencies || []) : [],
                proficiencies,
                baseSpeed: 30
            })
        };

        for (const stat of Object.keys(race.abilityBonuses || {})) {
            gameState.roster[companionId].mechanics.permanentAbilityBonuses[stat] = race.abilityBonuses[stat];
        }

        (cls?.progression?.[1]?.features || []).forEach((featureId) => {
            if (featureId === 'second_wind') gameState.roster[companionId].resources.second_wind = { current: 1, max: 1 };
            if (featureId === 'arcane_recovery') gameState.roster[companionId].resources.arcane_recovery = { current: 1, max: 1 };
        });
        if (cls?.progression?.[1]?.spellSlots) {
            gameState.roster[companionId].spellSlots = { ...cls.progression[1].spellSlots };
            gameState.roster[companionId].currentSlots = { ...cls.progression[1].spellSlots };
        }

        // Default Equipment
        if (compDef.defaultEquipment) {
            if (compDef.defaultEquipment.weapon) {
                addItem(compDef.defaultEquipment.weapon, companionId);
                gameState.roster[companionId].equipped.weapon = compDef.defaultEquipment.weapon;
            }
            if (compDef.defaultEquipment.armor) {
                addItem(compDef.defaultEquipment.armor, companionId);
                gameState.roster[companionId].equipped.armor = compDef.defaultEquipment.armor;
            }
            if (compDef.defaultEquipment.shield) {
                addItem(compDef.defaultEquipment.shield, companionId);
                gameState.roster[companionId].equipped.shield = compDef.defaultEquipment.shield;
            }
        }

        // Sync Level immediately
        syncCompanionLevel(companionId);
        syncActorState(gameState.roster[companionId]);
    }

    gameState.party.push(companionId);
}

export function removeCompanion(companionId) {
    const idx = gameState.party.indexOf(companionId);
    if (idx > -1) {
        gameState.party.splice(idx, 1);
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
                    if (f === 'channel_divinity') char.resources['channel_divinity'] = { current: 1, max: 1 };
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

function refreshRestResources(actor, restType) {
    if (!actor?.resources) return;

    if (actor.resources['second_wind']) {
        actor.resources['second_wind'].current = actor.resources['second_wind'].max;
    }
    if (actor.resources['action_surge']) {
        actor.resources['action_surge'].current = actor.resources['action_surge'].max;
    }
    if (actor.resources['channel_divinity']) {
        actor.resources['channel_divinity'].current = actor.resources['channel_divinity'].max;
    }
    if (restType === 'long_rest' && actor.resources['arcane_recovery']) {
        actor.resources['arcane_recovery'].current = actor.resources['arcane_recovery'].max;
    }
}

function applyAutomaticArcaneRecovery(actor) {
    if (!actor?.resources?.arcane_recovery || actor.resources.arcane_recovery.current <= 0) return false;
    if ((actor.currentSlots?.[1] || 0) >= (actor.spellSlots?.[1] || 0)) return false;
    actor.currentSlots[1] = Math.min((actor.currentSlots[1] || 0) + 1, actor.spellSlots[1] || 0);
    actor.resources.arcane_recovery.current -= 1;
    return true;
}

export function processNarrativeTrigger(trigger, options = {}) {
    const expired = [];
    getAllPersistentActors().forEach((actor) => {
        const actorExpired = tickActorEffects(actor, trigger, options) || [];
        actorExpired.forEach((effect) => {
            expired.push({
                actorId: actor.id || (actor === gameState.player ? 'player' : null),
                actorName: actor.name || 'Unknown',
                effectId: effect.id,
                effectName: effect.name
            });
        });
    });
    syncAllActorStates();
    return expired;
}

export function performShortRest() {
    const cls = classes[gameState.player.classId];
    const roll = rollDie(cls.hitDie) + gameState.player.modifiers.CON;
    const healed = Math.max(1, roll);
    gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + healed);
    refreshRestResources(gameState.player, 'short_rest');
    applyAutomaticArcaneRecovery(gameState.player);
    gameState.party.forEach(id => {
        if (gameState.roster[id]) {
            refreshRestResources(gameState.roster[id], 'short_rest');
            applyAutomaticArcaneRecovery(gameState.roster[id]);
        }
    });
    processNarrativeTrigger('short_rest');
    return healed;
}

export function performLongRest() {
    gameState.player.hp = gameState.player.maxHp;
    if (gameState.player.mechanics) {
        gameState.player.mechanics.temporaryHp = 0;
    }
    if (gameState.player.spellSlots) {
        gameState.player.currentSlots = { ...gameState.player.spellSlots };
    }
    refreshRestResources(gameState.player, 'long_rest');
    gameState.party.forEach(id => {
        if (gameState.roster[id]) {
            gameState.roster[id].hp = gameState.roster[id].maxHp;
            if (gameState.roster[id].mechanics) {
                gameState.roster[id].mechanics.temporaryHp = 0;
            }
            if (gameState.roster[id].spellSlots) {
                gameState.roster[id].currentSlots = { ...gameState.roster[id].spellSlots };
            }
            refreshRestResources(gameState.roster[id], 'long_rest');
        }
    });
    processNarrativeTrigger('long_rest');
    return true;
}

export function gainXp(amount) {
    gameState.player.xp += amount;
    // Check if we hit the threshold
    if (gameState.player.xp >= gameState.player.xpNext) {
        // We do NOT auto-level up anymore. We set a pending state.
        gameState.pendingLevelUp = true;
        if (typeof window !== 'undefined' && typeof window.logMessage === 'function') {
            window.logMessage(`You have enough XP to reach Level ${gameState.player.level + 1}! Rest or check your character sheet to level up.`, "gain");
        } else {
            console.log(`[LEVEL] You have enough XP to reach Level ${gameState.player.level + 1}.`);
        }
        return true; // Return true to indicate level up is available
    }
    return false;
}

// Inventory Helpers - Updated for characterId
export function addItem(itemId, characterId = 'player', quantity = null) {
    const item = items[itemId];
    const actor = getActorByCharacterId(characterId);
    if (!item || !actor) return;

    ensureActorInventory(actor);
    const amount = Math.max(1, quantity ?? item.quantityPerAdd ?? 1);
    if (item.stackable) {
        const existing = actor.inventory.find((entry) => entry.itemId === itemId);
        if (existing) {
            existing.quantity += amount;
        } else {
            actor.inventory.push({ itemId, quantity: amount });
        }
        return;
    }

    for (let index = 0; index < amount; index += 1) {
        actor.inventory.push({ itemId, quantity: 1 });
    }
}

export function removeItem(itemId, characterId = 'player', quantity = 1) {
    const actor = getActorByCharacterId(characterId);
    if (!actor) return false;
    return consumeInventoryItem(actor, itemId, quantity);
}

export function equipItem(itemId, characterId = 'player') {
    const item = items[itemId];
    const char = getActorByCharacterId(characterId);
    if (!item) return { success: false, reason: 'not_found' };
    if (!char) return { success: false, reason: 'char_not_found' };
    ensureActorInventory(char);

    if (!hasInventoryItem(char, itemId)) {
        return { success: false, reason: 'missing' };
    }

    const failure = getEquipFailure(item, char);
    if (failure === 'reqStr') {
        return { success: false, reason: 'reqStr', value: item.reqStr };
    }
    if (failure) return { success: false, reason: failure };

    if (item.equipmentSlot === 'armor') {
        char.equipped.armor = itemId;
    } else if (item.equipmentSlot === 'weapon') {
        char.equipped.weapon = itemId;
    } else if (item.equipmentSlot === 'shield') {
        char.equipped.shield = itemId;
    } else {
        return { success: false, reason: 'invalid_type' };
    }

    syncActorState(char);
    return { success: true, slot: item.equipmentSlot };
}

export function unequipItem(slot, characterId = 'player') {
    const char = getActorByCharacterId(characterId);
    if (!char) return { success: false, reason: 'char_not_found' };

    if (slot === 'weapon') {
        char.equipped.weapon = null;
    } else if (slot === 'armor') {
        char.equipped.armor = null;
    } else if (slot === 'shield') {
        char.equipped.shield = null;
    }
    syncActorState(char);
    return { success: true, slot };
}

function applyItemEffectToActor(target, item, usage, sourceId) {
    if (usage.kind === 'heal') {
        const healed = rollDiceExpression(usage.amount).total;
        target.hp = Math.min(target.maxHp, target.hp + healed);
        if (target.hp > 0) {
            removeEffectFromActor(target, 'unconscious');
        }
        syncActorState(target);
        return { success: true, msg: `Used ${item.name} and healed ${healed} HP.` };
    }

    if (usage.kind === 'remove_or_apply') {
        let applied = false;
        if (usage.removeEffectId && target.mechanics?.activeEffects?.some((effect) => effect.id === usage.removeEffectId)) {
            removeEffectFromActor(target, usage.removeEffectId);
            applied = true;
        }
        if (usage.applyEffectId) {
            addEffectToActor(target, usage.applyEffectId, {
                source: sourceId,
                durationType: usage.durationType,
                remaining: usage.durationAmount
            });
            applied = true;
        }
        return applied
            ? { success: true, msg: `Used ${item.name}.` }
            : { success: false, msg: `${item.name} would have no effect right now.` };
    }

    if (usage.kind === 'apply_effect') {
        const appliedEffect = addEffectToActor(target, usage.effectId, {
            id: usage.effectId,
            name: usage.name || item.name,
            source: sourceId,
            durationType: usage.durationType || 'scenes',
            remaining: usage.durationAmount ?? 1,
            modifiers: usage.modifiers || [],
            blockedSpellIds: usage.blockedSpellIds || [],
            applicationTags: usage.applicationTags || []
        });
        if (!appliedEffect) {
            return { success: false, msg: `${item.name} has no effect on ${target.name} right now.` };
        }
        return { success: true, msg: `Used ${item.name}.` };
    }

    return { success: false, msg: 'Effect not implemented.' };
}

function castScrollSpell(item, caster, target) {
    const spell = getSpell(item.spellId || item.usage?.spellId);
    if (!spell) return { success: false, msg: 'The scroll fizzles without effect.' };

    if (spell.type === 'heal') {
        const healed = rollDiceExpression(spell.amount).total;
        target.hp = Math.min(target.maxHp, target.hp + healed);
        if (target.hp > 0) removeEffectFromActor(target, 'unconscious');
        syncActorState(target);
        return { success: true, msg: `${item.name} restores ${healed} HP to ${target.name}.` };
    }

    if (spell.type === 'buff' && spell.effect) {
        const appliedEffect = addEffectToActor(target, spell.effect.id, {
            id: spell.effect.id,
            name: spell.effect.name || spell.name,
            source: `scroll:${item.id}:${caster.name}`,
            durationType: spell.effect.durationType || spell.durationType || 'turns',
            remaining: spell.effect.remaining ?? 1,
            modifiers: spell.effect.modifiers || [],
            blockedSpellIds: spell.effect.blockedSpellIds || [],
            applicationTags: spell.effect.applicationTags || [],
            concentration: !!spell.concentration
        });
        if (!appliedEffect) {
            return { success: false, msg: `${spell.name} has no effect on ${target.name}.` };
        }
        return { success: true, msg: `${target.name} gains ${spell.name}.` };
    }

    if (spell.type === 'auto') {
        const damage = rollDiceExpression(spell.damage).total;
        target.hp = Math.max(0, target.hp - damage);
        syncActorState(target);
        return { success: true, msg: `${item.name} strikes ${target.name} for ${damage} ${spell.damageType} damage.` };
    }

    return { success: false, msg: `${item.name} needs a combat targeting flow we have not wired yet.` };
}

export function useConsumable(itemId, characterId = 'player', targetId = characterId) {
    const item = items[itemId];
    const char = getActorByCharacterId(characterId);
    const target = getActorByCharacterId(targetId) || char;
    if (!item || (!item.usage && item.type !== 'scroll' && !['consumable', 'scroll'].includes(item.type))) {
        return { success: false, msg: 'Not usable.' };
    }
    if (!char || !target) return { success: false, msg: 'Character not found.' };
    if (!hasInventoryItem(char, itemId)) return { success: false, msg: `No ${item.name} available.` };

    let result = { success: false, msg: 'Effect not implemented.' };
    if (item.type === 'scroll') {
        result = castScrollSpell(item, char, target);
    } else {
        result = applyItemEffectToActor(target, item, item.usage || {}, `item:${item.id}:${characterId}`);
    }

    if (result.success) {
        consumeInventoryItem(char, itemId, 1);
        syncActorState(char);
    }
    return result;
}

// Status Effect Helpers (Currently mostly Player focused, need to generalize for combat loop)
export function applyStatusEffect(effectId, durationOverride, characterId = 'player') {
    const char = getActorByCharacterId(characterId);
    if (!char) return; // Or handle Enemy?
    return !!addEffectToActor(char, effectId, {
        remaining: durationOverride
    });
}

export function hasStatusEffect(effectId, characterId = 'player') {
    const char = getActorByCharacterId(characterId);
    if (!char) return false;
    ensureActorMechanics(char);
    return char.mechanics.activeEffects.some(effect => effect.id === effectId);
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
    tickActorEffects(char, 'turn_end');
}

// Location & Threat Helpers (Unchanged)
export function discoverLocation(locId) {
    if (gameState.discoveredLocations[locId] === undefined) return;
    if (!gameState.discoveredLocations[locId]) {
        gameState.discoveredLocations[locId] = true;
    }
}

export function isLocationDiscovered(locId) {
    return gameState.discoveredLocations[locId] === true;
}

export function adjustThreat(amount, reason = "") {
    gameState.threat.level = Math.max(0, Math.min(100, gameState.threat.level + amount));
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
}

export function addMapPin(locationId, note) {
    if (!locationId) return;
    gameState.mapPins.push({ locationId, note, ts: Date.now() });
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
}

export function getNpcStatus(npcId) {
    if (!gameState.npcStates[npcId]) return 'unknown';
    return gameState.npcStates[npcId].status;
}

export function changeRelationship(npcId, amount) {
    if (gameState.relationships[npcId] !== undefined) {
        gameState.relationships[npcId] += amount;
    }
}

export function getRelationship(npcId) {
    return gameState.relationships[npcId] || 0;
}

export function changeReputation(factionId, amount) {
    if (gameState.reputation[factionId] !== undefined) {
        gameState.reputation[factionId] += amount;
    }
}

export function getReputation(factionId) {
    return gameState.reputation[factionId] || 0;
}

export const TIME_SLOTS = ['morning', 'midday', 'afternoon', 'dusk', 'night'];

export function getTimeSlotLabel(slot = gameState.timeline.slot) {
    const labels = {
        morning: 'Morning',
        midday: 'Midday',
        afternoon: 'Afternoon',
        dusk: 'Dusk',
        night: 'Night'
    };
    return labels[slot] || 'Unknown';
}

export function getTimelineLabel() {
    return `Day ${gameState.timeline.day} - ${getTimeSlotLabel(gameState.timeline.slot)}`;
}

export function advanceTime(steps = 1, context = {}) {
    let slotIndex = TIME_SLOTS.indexOf(gameState.timeline.slot);
    if (slotIndex < 0) slotIndex = TIME_SLOTS.indexOf('midday');

    const previous = getTimelineLabel();
    const previousDay = gameState.timeline.day;

    for (let i = 0; i < steps; i++) {
        slotIndex += 1;
        gameState.timeline.actionCount += 1;
        if (context.inSilverthorn) {
            gameState.timeline.silverthornActionCount += 1;
        }
        if (slotIndex >= TIME_SLOTS.length) {
            slotIndex = 0;
            gameState.timeline.day += 1;
        }
    }

    gameState.timeline.slot = TIME_SLOTS[slotIndex];
    const expired = processNarrativeTrigger('time_passed', { amount: steps });
    if (gameState.timeline.day > previousDay) {
        expired.push(...processNarrativeTrigger('day_rollover'));
    }

    return {
        previous,
        current: getTimelineLabel(),
        day: gameState.timeline.day,
        slot: gameState.timeline.slot,
        expiredEffects: expired
    };
}

export function setTimeline(day, slot) {
    gameState.timeline.day = Math.max(1, day || 1);
    gameState.timeline.slot = TIME_SLOTS.includes(slot) ? slot : 'midday';
}

export function handleCombatNarrativeTransition(trigger) {
    if (!['combat_start', 'combat_end'].includes(trigger)) return [];
    return processNarrativeTrigger(trigger);
}

export function setSceneMemory(key, value = true) {
    gameState.sceneMemory[key] = value;
}

export function getSceneMemory(key) {
    return gameState.sceneMemory[key];
}

export function getActorSnapshot(characterId = 'player') {
    const actor = getActorByCharacterId(characterId);
    if (!actor) return null;
    return getDerivedActorState(actor);
}

function normalizeQuestState(rawQuests = {}) {
    const normalized = JSON.parse(JSON.stringify(quests));

    Object.keys(normalized).forEach((questId) => {
        const savedQuest = rawQuests?.[questId];
        if (!savedQuest || typeof savedQuest !== 'object') return;

        normalized[questId] = {
            ...normalized[questId],
            currentStage: savedQuest.currentStage ?? normalized[questId].currentStage,
            completed: savedQuest.completed ?? normalized[questId].completed
        };
    });

    return normalized;
}

function normalizeLoadedState() {
    gameState.currentSceneId = gameState.currentSceneId || CANONICAL_START_SCENE;
    gameState.flags = gameState.flags && typeof gameState.flags === 'object' ? gameState.flags : {};
    gameState.sceneMemory = gameState.sceneMemory && typeof gameState.sceneMemory === 'object' ? gameState.sceneMemory : {};
    gameState.story = ensureStoryState(gameState.story);
    gameState.quests = normalizeQuestState(gameState.quests);
    gameState.timeline = {
        ...defaultGameState.timeline,
        ...(gameState.timeline || {})
    };
    gameState.threat = {
        ...defaultGameState.threat,
        ...(gameState.threat || {}),
        ambient: Array.isArray(gameState.threat?.ambient) ? [...gameState.threat.ambient] : []
    };
    gameState.reputation = {
        ...defaultGameState.reputation,
        ...(gameState.reputation || {})
    };
    gameState.discoveredLocations = {
        ...defaultGameState.discoveredLocations,
        ...(gameState.discoveredLocations || {})
    };
    gameState.relationships = gameState.relationships && typeof gameState.relationships === 'object' ? gameState.relationships : {};
    gameState.npcStates = gameState.npcStates && typeof gameState.npcStates === 'object' ? gameState.npcStates : {};
    gameState.visitedScenes = Array.isArray(gameState.visitedScenes) ? gameState.visitedScenes : [];
    gameState.mapPins = Array.isArray(gameState.mapPins) ? gameState.mapPins : [];
    gameState.party = Array.isArray(gameState.party) ? gameState.party : [];
    gameState.roster = gameState.roster && typeof gameState.roster === 'object' ? gameState.roster : {};
    gameState.combat = {
        ...defaultGameState.combat,
        ...(gameState.combat || {})
    };

    ensureActorInventory(gameState.player);
    ensureActorSelections(gameState.player);
    Object.values(gameState.roster).forEach((actor) => {
        ensureActorInventory(actor);
        ensureActorSelections(actor);
    });
}

export function saveGame() {
    localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(gameState));
    // We can't use logMessage here directly as it creates a circular dependency
    console.log("[SAVE] Game saved to localStorage.");
}

export function getStoredSaveState({ cleanupInvalid = false } = {}) {
    const raw = localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) {
        return {
            status: 'missing',
            data: null,
            error: null
        };
    }

    try {
        const data = JSON.parse(raw);
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            throw new Error('Save payload must be a JSON object.');
        }
        return {
            status: 'valid',
            data,
            error: null
        };
    } catch (error) {
        if (cleanupInvalid) {
            localStorage.removeItem(SAVE_STORAGE_KEY);
        }
        return {
            status: 'invalid',
            data: null,
            error
        };
    }
}

export function loadGame() {
    const saveState = getStoredSaveState({ cleanupInvalid: true });
    if (saveState.status !== 'valid') {
        if (saveState.status === 'invalid') {
            console.warn('[LOAD] Corrupted save removed during load.', saveState.error);
        } else {
            console.log("[LOAD] No save data found.");
        }
        return false;
    }

    const savedState = saveState.data;
    // Replace the entire gameState object content without breaking the export reference
    Object.keys(defaultGameState).forEach(key => {
        if (savedState[key] !== undefined) {
            // For objects and arrays, replace their content
            if (typeof gameState[key] === 'object' && gameState[key] !== null) {
                // Clear existing object/array before assigning new values
                if (Array.isArray(gameState[key])) {
                    gameState[key].length = 0;
                    Array.prototype.push.apply(gameState[key], savedState[key]);
                } else {
                     Object.keys(gameState[key]).forEach(prop => delete gameState[key][prop]);
                     Object.assign(gameState[key], savedState[key]);
                }
            } else {
                 gameState[key] = savedState[key];
            }
        }
    });
    normalizeLoadedState();
    syncAllActorStates();
    console.log("[LOAD] Game loaded from localStorage.");
    return true;
}

import { races } from './data/races.js';
import { classes, featureDefinitions } from './data/classes.js';
import { backgrounds } from './data/backgrounds.js';
import { items } from './data/items.js';
import { quests } from './data/quests.js';
import { scenes } from './data/scenes.js';
import { enemies } from './data/enemies.js';
import { getSpellIdsForClass, spells } from './data/spells.js';
import { locations } from './data/locations.js';
import { travelEvents } from './data/travelEvents.js';
import { shops } from './data/shops.js';
import { npcs } from './data/npcs.js';
import { companions } from './data/companions.js';
import { factions } from './data/factions.js';
import { gameState, getActorCastableSpells, getInventoryEntries, getItemCount, getItemEquipFailure, getInventoryUseCost, getPreparedSpellLimit, initializeNewGame, updateQuestStage, addGold, spendGold, gainXp, equipItem, useConsumable, applyStatusEffect, hasStatusEffect, tickStatusEffects, discoverLocation, isLocationDiscovered, addItem, changeRelationship, changeReputation, getRelationship, getReputation, adjustThreat, clearTransientThreat, recordAmbientEvent, addMapPin, removeMapPin, getNpcStatus, setNpcStatus, processNarrativeTrigger, unequipItem, syncPartyLevels, saveGame, loadGame as loadGameData, removeItem, advanceTime, getTimelineLabel, getTimeSlotLabel, getSceneMemory, setSceneMemory, performShortRest as gsPerformShortRest, performLongRest as gsPerformLongRest, syncCharacterState, getStoredSaveState, SAVE_STORAGE_KEY } from './data/gameState.js';
import { CANONICAL_START_SCENE, ensureStoryState, getLocationStoryRequirement, getLocationUnlockHint, meetsStoryRequirement, storyActs, storyEvents, syncStoryStateForScene } from './data/storyTimeline.js';
import { addEffectToActor, getActorTraitDefinitions, getBonusSkillChoiceCount, getBonusToolChoiceCount, getBonusToolChoiceOptions, getDerivedActorState, getRaceTraitDefinitions, removeEffectFromActor } from './data/mechanics.js';
import { rollDiceExpression, rollSkillCheck, rollSavingThrow, rollDie, rollAttack, rollInitiative, getAbilityMod, generateScaledStats, getPlayerAC } from './rules.js';
import { getSpellTargetingPreview, initCombatSystem, startCombat, performAttack, performCastSpell, performAbility, performDefend, performEscape, performFlee, performEndTurn, performActionSurge, performCunningAction, performStand, uiHooks } from './combat.js';
import { clearTrackedTimeout, scheduleTrackedTimeout } from './timers.js';

const DEFAULT_PORTRAIT_PATH = 'portraits/npc_male_placeholder_portrait.png';

export function getCharacterById(characterId) {
    if (characterId === 'player') {
        return gameState.player;
    }
    return gameState.roster[characterId];
}

function actorHasItem(characterId, itemId, quantity = 1) {
    return getItemCount(itemId, characterId) >= Math.max(1, quantity || 1);
}

function actorHasStatus(actor, statusId) {
    return !!actor && !!statusId && hasStatusEffect(statusId, actor.id || 'player');
}

function actorHasTrait(actor, traitId) {
    return !!actor && !!traitId && getActorTraitDefinitions(actor).some((trait) => trait.id === traitId);
}

function actorHasToolAccess(actor, toolId) {
    if (!actor || !toolId) return false;
    const actorId = actor.id || 'player';
    const snapshot = getDerivedActorState(actor);
    return snapshot.proficiencies.tools.includes(toolId) || actorHasItem(actorId, toolId);
}

function meetsChoiceRequirements(choice, actor = gameState.player) {
    if (!choice?.requires) return true;

    const actorId = actor?.id || 'player';
    const requires = choice.requires;

    if (requires.relationship) {
        const current = getRelationship(requires.relationship.npcId);
        if (current < (requires.relationship.min || -999)) return false;
    }
    if (requires.reputation) {
        const current = getReputation(requires.reputation.factionId);
        if (current < (requires.reputation.min || -999)) return false;
    }
    if (requires.flag && !gameState.flags[requires.flag]) return false;
    if (requires.notFlag && gameState.flags[requires.notFlag]) return false;
    if (requires.npcState) {
        const { id, status } = requires.npcState;
        if (getNpcStatus(id) !== status) return false;
    }
    if (requires.storyEvent && !meetsStoryRequirement(gameState.story, requires.storyEvent)) return false;
    if (requires.storyAct) {
        const currentActId = gameState.story && gameState.story.currentActId;
        if (Array.isArray(requires.storyAct)) {
            if (!requires.storyAct.includes(currentActId)) return false;
        } else if (currentActId !== requires.storyAct) {
            return false;
        }
    }
    if (requires.itemId && !actorHasItem(actorId, requires.itemId, requires.quantity || 1)) return false;
    if (requires.anyItemIds && !requires.anyItemIds.some((itemId) => actorHasItem(actorId, itemId))) return false;
    if (requires.toolId && !actorHasToolAccess(actor, requires.toolId)) return false;
    if (requires.traitId && !actorHasTrait(actor, requires.traitId)) return false;
    if (requires.status) {
        const statuses = Array.isArray(requires.status) ? requires.status : [requires.status];
        if (!statuses.every((statusId) => actorHasStatus(actor, statusId))) return false;
    }
    if (requires.notStatus) {
        const statuses = Array.isArray(requires.notStatus) ? requires.notStatus : [requires.notStatus];
        if (statuses.some((statusId) => actorHasStatus(actor, statusId))) return false;
    }
    if (requires.sceneMemory) {
        const { key, value = true } = typeof requires.sceneMemory === 'string'
            ? { key: requires.sceneMemory, value: true }
            : requires.sceneMemory;
        if (getSceneMemory(key) !== value) return false;
    }
    if (requires.notSceneMemory) {
        const { key, value = true } = typeof requires.notSceneMemory === 'string'
            ? { key: requires.notSceneMemory, value: true }
            : requires.notSceneMemory;
        if (getSceneMemory(key) === value) return false;
    }

    return true;
}

function buildNarrativeCheckOptions(choice, actor = gameState.player) {
    const actorId = actor?.id || 'player';
    const options = {
        ...(choice.skillOptions || {})
    };
    const notes = [];

    const applyAid = (aid, active, fallbackLabel) => {
        if (!aid || !active) return;
        if (aid.advantage) options.advantage = true;
        if (aid.bonus) options.flatBonus = (options.flatBonus || 0) + aid.bonus;
        if (aid.extraDice) {
            const extraDice = Array.isArray(aid.extraDice) ? aid.extraDice : [aid.extraDice];
            options.extraDice = [...(options.extraDice || []), ...extraDice];
        }
        if (aid.tags) {
            const tags = Array.isArray(aid.tags) ? aid.tags : [aid.tags];
            options.tags = [...new Set([...(options.tags || []), ...tags])];
        }
        notes.push(aid.logText || fallbackLabel);
    };

    if (choice.itemAid) {
        const aid = choice.itemAid;
        applyAid(aid, actorHasItem(actorId, aid.itemId, aid.quantity || 1), `${items[aid.itemId]?.name || 'Item'} helps.`);
    }
    if (choice.toolAid) {
        const aid = choice.toolAid;
        applyAid(aid, actorHasToolAccess(actor, aid.toolId), `${items[aid.toolId]?.name || 'Tool'} gives you better purchase.`);
    }
    if (choice.traitAid) {
        const aid = choice.traitAid;
        applyAid(aid, actorHasTrait(actor, aid.traitId), `${aid.label || 'Your training'} sharpens the read.`);
    }
    if (choice.statusAid) {
        const aid = choice.statusAid;
        applyAid(aid, actorHasStatus(actor, aid.statusId), `${aid.label || aid.statusId} steadies you.`);
    }

    return { options, notes };
}

// ... (Existing exports and initUI) ...
export function initUI() {
    window.gameState = gameState; // Expose for debugging/testing
    window.goToScene = goToScene;
    window.startCombat = startCombat; // Expose for testing/debug
    window.showCharacterCreation = showCharacterCreation;
    gameSettings = loadGameSettings();
    populateOptionsForm();
    void applyGameSettings(gameSettings);
    document.getElementById('btn-inventory').onclick = () => toggleInventory();
    document.getElementById('btn-quests').onclick = toggleQuestLog;
    document.getElementById('btn-menu').onclick = toggleMenu;
    document.getElementById('btn-map').onclick = toggleMap;
    document.getElementById('btn-codex').onclick = () => toggleCodex('people');
    document.getElementById('btn-codex-people').onclick = () => toggleCodex('people');
    document.getElementById('btn-codex-factions').onclick = () => toggleCodex('factions');

    // Initialize Combat UI Hooks
    initCombatSystem({
        updateCombatUI: updateCombatUI,
        logToBattle: logToBattle,
        showBattleEventText: showBattleEventText,
        createActionButton: createActionButton, // Need to expose/ensure this exists? It's used in game.js but not exported?
        goToScene: goToScene,
        updateStatsUI: updateStatsUI,
        saveGame: saveGame
    });
    
    // We need to ensure createActionButton is defined or passed properly.
    // In game.js it was defined inside renderPlayerActions scope or global? 
    // It was not defined in the read_file output of game.js!
    // Wait, I missed createActionButton definition in previous reads.
    // Let me check if I can find it or if it was part of renderPlayerActions.
    // It was used in renderPlayerActions. I'll assume it's a helper function in this file.
    // If not, I need to add it.
    
    // New: Check for pending level up on stats click or button
    // For now, we'll add a listener to the level text if it has a specific class, or just a button.
    // Let's make the "Lvl X" text clickable if pending.
    document.getElementById('char-level').onclick = () => {
        if (gameState.pendingLevelUp) showLevelUpModal();
    };
    // Visual cue update happens in updateStatsUI

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.onclick = (e) => {
            e.target.closest('.modal').classList.add('hidden');
        };
    });

    // Start menu wiring
    const startMenu = document.getElementById('start-menu');
    if (!startMenu) {
        console.error("[initUI] #start-menu not found – markup mismatch?");
    }
    const startContinueBtn = document.getElementById('btn-start-continue');
    const startNewBtn = document.getElementById('btn-start-new');
    const startOptionsBtn = document.getElementById('btn-start-options');
    const startExitBtn = document.getElementById('btn-start-exit');

    refreshStartMenuState();

    startContinueBtn.onclick = () => {
        if (!loadGame()) {
            refreshStartMenuState();
            logMessage('No existing save found. Choose Start to begin a new campaign.', 'system');
            return;
        }
    };

    startNewBtn.onclick = () => {
        beginNewGameFlow();
    };

    startOptionsBtn.onclick = showOptionsModal;
    startExitBtn.onclick = exitGame;
    document.getElementById('btn-start-game').onclick = finishCharacterCreation;
    document.getElementById('btn-options').onclick = showOptionsModal;
    document.getElementById('btn-options-apply').onclick = () => {
        void applyOptionsFromForm();
    };

    document.getElementById('btn-debug-toggle').onclick = () => {
        logMessage("Debug mode toggled.", "system");
    };

    document.getElementById('btn-save').onclick = saveGame;
    document.getElementById('btn-load').onclick = loadGame;
    document.getElementById('btn-tutorial').onclick = () => {
        document.getElementById('tutorial-overlay').classList.remove('hidden');
    };
}

// ... (Character Creation Logic remains same) ...
let ccState = {
    baseStats: { STR: 12, DEX: 12, CON: 12, INT: 12, WIS: 12, CHA: 12 },
    chosenSkills: [],
    chosenBonusSkills: [],
    chosenBonusTools: [],
    chosenCantrips: [],
    chosenPreparedSpells: [],
    chosenSpellbook: [],
    chosenExpertise: [],
    chosenFightingStyle: null
};

const SETTINGS_STORAGE_KEY = 'crimson_moon_settings';
const defaultGameSettings = {
    displayMode: 'windowed',
    textSize: 'normal',
    uiScale: 'normal',
    showLog: true
};

let gameSettings = { ...defaultGameSettings };

function loadGameSettings() {
    try {
        const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (!raw) return { ...defaultGameSettings };
        return { ...defaultGameSettings, ...JSON.parse(raw) };
    } catch (error) {
        console.warn('Failed to load game settings, using defaults.', error);
        return { ...defaultGameSettings };
    }
}

function persistGameSettings() {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(gameSettings));
}

function setStartMenuStatus(message = '') {
    const status = document.getElementById('start-menu-status');
    if (status) status.innerText = message;
}

function setOptionsStatus(message = '') {
    const status = document.getElementById('options-status');
    if (status) status.innerText = message;
}

function populateOptionsForm() {
    const displayMode = document.getElementById('opt-display-mode');
    const textSize = document.getElementById('opt-text-size');
    const uiScale = document.getElementById('opt-ui-scale');
    const showLog = document.getElementById('opt-show-log');

    if (displayMode) displayMode.value = gameSettings.displayMode;
    if (textSize) textSize.value = gameSettings.textSize;
    if (uiScale) uiScale.value = gameSettings.uiScale;
    if (showLog) showLog.checked = !!gameSettings.showLog;
}

async function applyDisplayMode(mode, userInitiated = false) {
    if (mode === 'fullscreen') {
        if (document.fullscreenElement) return true;
        if (!document.documentElement.requestFullscreen) {
            if (userInitiated) setOptionsStatus('Fullscreen is not available in this browser.');
            return false;
        }
        try {
            await document.documentElement.requestFullscreen();
            return true;
        } catch (error) {
            if (userInitiated) {
                setOptionsStatus('Fullscreen was saved, but the browser blocked the request.');
            }
            return false;
        }
    }

    if (document.fullscreenElement && document.exitFullscreen) {
        try {
            await document.exitFullscreen();
        } catch (error) {
            if (userInitiated) {
                setOptionsStatus('Could not leave fullscreen automatically.');
            }
            return false;
        }
    }

    return true;
}

async function applyGameSettings(nextSettings, userInitiated = false) {
    gameSettings = { ...defaultGameSettings, ...nextSettings };
    document.body.classList.remove(
        'text-size-compact',
        'text-size-normal',
        'text-size-large',
        'ui-scale-compact',
        'ui-scale-large',
        'hide-log'
    );
    document.body.classList.add(`text-size-${gameSettings.textSize}`);
    if (gameSettings.uiScale !== 'normal') {
        document.body.classList.add(`ui-scale-${gameSettings.uiScale}`);
    }
    if (!gameSettings.showLog) {
        document.body.classList.add('hide-log');
    }

    const displayApplied = await applyDisplayMode(gameSettings.displayMode, userInitiated);
    persistGameSettings();
    populateOptionsForm();

    if (userInitiated && displayApplied) {
        setOptionsStatus('Options updated.');
    }
}

function refreshStartMenuState() {
    const startContinueBtn = document.getElementById('btn-start-continue');
    const hasSave = getStoredSaveState({ cleanupInvalid: true }).status === 'valid';

    if (!startContinueBtn) return;

    startContinueBtn.disabled = !hasSave;
    startContinueBtn.innerText = hasSave ? 'Continue' : 'Continue (No Save)';
}

function showOptionsModal() {
    populateOptionsForm();
    setOptionsStatus('');
    document.getElementById('options-modal').classList.remove('hidden');
}

async function applyOptionsFromForm() {
    const nextSettings = {
        displayMode: document.getElementById('opt-display-mode').value,
        textSize: document.getElementById('opt-text-size').value,
        uiScale: document.getElementById('opt-ui-scale').value,
        showLog: document.getElementById('opt-show-log').checked
    };

    await applyGameSettings(nextSettings, true);
}

function exitGame() {
    setStartMenuStatus('Closing window...');
    window.close();

    scheduleTrackedTimeout(() => {
        setStartMenuStatus('If the window stays open, close this tab or app window to exit.');
    }, 250);
}

function resetCharacterCreationState() {
    ccState = {
        baseStats: { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 },
        chosenSkills: [],
        chosenBonusSkills: [],
        chosenBonusTools: [],
        chosenCantrips: [],
        chosenPreparedSpells: [],
        chosenSpellbook: [],
        chosenExpertise: [],
        chosenFightingStyle: null
    };
}

function showStartMenu() {
    document.getElementById('char-creation-modal').classList.add('hidden');
    document.getElementById('options-modal').classList.add('hidden');
    document.getElementById('start-menu').classList.remove('hidden');
    refreshStartMenuState();
    setStartMenuStatus('');
}

function beginNewGameFlow() {
    localStorage.removeItem(SAVE_STORAGE_KEY);
    refreshStartMenuState();
    setStartMenuStatus('');
    resetCharacterCreationState();
    showCharacterCreation();
}

function isSceneInSilverthorn(sceneId) {
    return [
        'SCENE_HUB_SILVERTHORN',
        'SCENE_ALDERIC_CHAMBER_RETURN',
        'SCENE_ALDERIC_MISSION_REMINDER',
        'SCENE_SILVERTHORN_MARKET',
        'SCENE_SILVERTHORN_GENERAL_STORE',
        'SCENE_SILVERTHORN_BLACKSMITH',
        'SCENE_RUSTY_BLADE_INN',
        'SCENE_RUSTY_BLADE_RUMORS',
        'SCENE_SILVERTHORN_TEMPLE',
        'SCENE_SILVERTHORN_TEMPLE_COUNSEL',
        'SCENE_SILVERTHORN_TEMPLE_PRAYER',
        'SCENE_SILVERTHORN_NOTICE_BOARD',
        'SCENE_SILVERTHORN_NOTICE_WHISPERWOOD',
        'SCENE_SILVERTHORN_NOTICE_CONTRACTS',
        'SCENE_SILVERTHORN_GATES',
        'SCENE_SILVERTHORN_GATE_CAPTAIN'
    ].includes(sceneId);
}

function isSceneInSporefall(sceneId) {
    return [
        'SCENE_ARRIVAL_WHISPERWOOD',
        'SCENE_SPOREFALL_STREET_SEARCH',
        'SCENE_MEET_EOIN',
        'SCENE_EOIN_TALK',
        'SCENE_EOIN_RITUAL_TALK',
        'SCENE_EOIN_MOTHER_TALK',
        'SCENE_ALONE_AGAIN',
        'SCENE_HUB_SPOREFALL',
        'SCENE_SPOREFALL_CATHEDRAL_APPROACH',
        'SCENE_SPOREFALL_CATHEDRAL_ENTRY',
        'SCENE_SPOREFALL_CATHEDRAL_VISION',
        'SCENE_SPOREFALL_OVERSEER_APPROACH',
        'SCENE_SPOREFALL_OVERSEER_DOOR',
        'SCENE_SPOREFALL_OVERSEER_STUDY',
        'SCENE_SPOREFALL_OVERSEER_JOURNAL',
        'SCENE_SPOREFALL_OVERSEER_CORRESPONDENCE',
        'SCENE_SPOREFALL_OVERSEER_DRAWER',
        'SCENE_SPOREFALL_NORTH_APPROACH',
        'SCENE_SPOREFALL_NORTH_BRIDGE',
        'SCENE_SPOREFALL_NORTH_ROUTE_DISCOVERED'
    ].includes(sceneId);
}

function getSilverthornTimeState() {
    const slot = gameState.timeline.slot;
    return {
        slot,
        label: getTimeSlotLabel(slot),
        timelineLabel: getTimelineLabel(),
        isMorning: slot === 'morning',
        isMidday: slot === 'midday',
        isAfternoon: slot === 'afternoon',
        isDusk: slot === 'dusk',
        isNight: slot === 'night',
        isDaylight: slot === 'morning' || slot === 'midday' || slot === 'afternoon',
        isMarketOpen: slot !== 'night',
        isTempleOpen: slot !== 'night',
        isForgeOpen: slot === 'morning' || slot === 'midday' || slot === 'afternoon',
        silverthornActions: gameState.timeline.silverthornActionCount
    };
}

function getTimeAdvanceText(result, reason = '') {
    const prefix = reason ? `${reason} ` : '';
    if (result.previous === result.current) {
        return `${prefix}Time passes. It is still ${result.current}.`;
    }
    return `${prefix}Time passes. ${result.current}.`;
}

function logExpiredNarrativeEffects(expiredEffects = []) {
    expiredEffects.forEach((expired) => {
        if (!expired?.effectName) return;
        logMessage(`${expired.actorName}'s ${expired.effectName} wears off.`, 'system');
    });
}

function advanceNarrativeTime(steps = 1, reason = '', context = {}) {
    if (!steps || steps < 1) return;
    const result = advanceTime(steps, context);
    logMessage(getTimeAdvanceText(result, reason), 'system');
    logExpiredNarrativeEffects(result.expiredEffects || []);
    updateStatsUI();
}

function advanceToNextMorning(reason = '', context = {}) {
    const slotOrder = ['morning', 'midday', 'afternoon', 'dusk', 'night'];
    const currentIndex = slotOrder.indexOf(gameState.timeline.slot);
    const morningIndex = 0;
    const steps = currentIndex === -1 ? 1 : ((slotOrder.length - currentIndex) + morningIndex);
    advanceNarrativeTime(steps, reason, context);
}

function createChoice(text, nextScene, extra = {}) {
    return { text, nextScene, ...extra };
}

function cloneScene(sceneId) {
    return JSON.parse(JSON.stringify(scenes[sceneId]));
}

function buildSilverthornRuntimeScene(sceneId, baseScene) {
    const time = getSilverthornTimeState();
    const scene = cloneScene(sceneId);

    if (sceneId === 'SCENE_HUB_SILVERTHORN') {
        const curfewBeat = time.isDusk
            ? 'Lanterns are being lit along the square, and the watch has begun calling the evening curfew in clipped, weary voices.'
            : time.isNight
                ? 'Most shutters are barred now, and the watch owns the streets with the grim patience of people expecting bad news before dawn.'
                : 'Silverthorn remains orderly, but every patrol, lowered voice, and hurried prayer suggests the order is being held in place by effort alone.';

        scene.text = `${baseScene.text} It is ${time.timelineLabel}. ${curfewBeat}`;
        scene.choices = [
            createChoice(time.isNight ? 'See whether Alderic still receives visitors' : "Present yourself at Alderic's chamber again", 'SCENE_ALDERIC_CHAMBER_RETURN'),
            createChoice('Cross into the market quarter', 'SCENE_SILVERTHORN_MARKET', { timeAdvance: 1, timeReason: 'You make your way across the city.', inSilverthorn: true }),
            createChoice('Seek supplies at the General Store', 'SCENE_SILVERTHORN_GENERAL_STORE', { timeAdvance: 1, timeReason: 'You stop to resupply.', inSilverthorn: true }),
            createChoice('Step inside The Rusty Blade', 'SCENE_RUSTY_BLADE_INN', { timeAdvance: 1, timeReason: 'You spend time in the inn.', inSilverthorn: true }),
            createChoice('Take the temple road', 'SCENE_SILVERTHORN_TEMPLE', { timeAdvance: 1, timeReason: 'You make a detour to the temple.', inSilverthorn: true }),
            createChoice('Read what fear has posted', 'SCENE_SILVERTHORN_NOTICE_BOARD', { timeAdvance: 1, timeReason: 'You spend a while reading the latest postings.', inSilverthorn: true }),
            createChoice('Make for the eastern gate', 'SCENE_SILVERTHORN_GATES', { timeAdvance: 1, timeReason: 'You cross Silverthorn toward the eastern gate.', inSilverthorn: true })
        ];
        return scene;
    }

    if (sceneId === 'SCENE_ALDERIC_CHAMBER_RETURN') {
        if (time.isNight) {
            scene.text = "A chamberlain waits outside Alderic's rooms as though he has not moved in an hour. He bows with perfect restraint. 'The prince has withdrawn for the night and will receive no one. If your concern can wait, return at first light. If it cannot, the watch will bear it in his stead.'";
            scene.choices = [
                createChoice('Return to the city center', 'SCENE_HUB_SILVERTHORN')
            ];
            return scene;
        }

        scene.text = `${baseScene.text} It is ${time.timelineLabel}, and the chamber feels colder than before. Alderic gives you only a glance before returning to the dispatches spread before him.`;
        scene.choices = [
            createChoice('Ask him to restate the charge', 'SCENE_ALDERIC_MISSION_REMINDER'),
            createChoice('Withdraw from the chamber', 'SCENE_HUB_SILVERTHORN')
        ];
        return scene;
    }

    if (sceneId === 'SCENE_ALDERIC_MISSION_REMINDER') {
        scene.text = `Alderic does not look up when he answers. 'Whisperwood first. Learn what befell it. End the corruption if it can be ended. Make use of Silverthorn while the gates still open for you, then take the eastern road through Shadowmire.' It is ${time.timelineLabel}. His voice carries the finality of an order already written in the dead.`;
        scene.choices = [
            createChoice("Leave Alderic's chamber", 'SCENE_HUB_SILVERTHORN')
        ];
        return scene;
    }

    if (sceneId === 'SCENE_SILVERTHORN_MARKET') {
        if (time.isNight) {
            scene.text = "The market quarter is mostly shuttered for the night. A few guttering lanterns still burn above bolted stalls, laborers drag carts beneath awnings without speaking, and the smell of stale ale drifts from The Rusty Blade like the district's last concession to comfort.";
            scene.choices = [
                createChoice('Take shelter in The Rusty Blade', 'SCENE_RUSTY_BLADE_INN', { timeAdvance: 1, timeReason: 'You spend a while in the inn.', inSilverthorn: true }),
                createChoice('Return to the city center', 'SCENE_HUB_SILVERTHORN')
            ];
            return scene;
        }

        const marketMood = time.isDusk
            ? 'Merchants are packing away their wares with one eye on the lowering light while buyers hurry through last purchases as though supplies alone could keep dread at bay. Every third conversation breaks on the same words before lowering into a whisper: Durnhelm, the relic, the road north.'
            : 'The district is busy, but not carefree. Wagon wheels, shouted prices, and the ring of hammered steel ride above the sound of people trying not to discuss the eastern road too loudly. Even here, fear has learned new names: Durnhelm, vanished caravans, and the kind of relic no city can agree to trust in another city\'s hands.';
        scene.text = `${baseScene.text} ${marketMood}`;
        scene.choices = [
            createChoice('Browse the General Store', 'SCENE_SILVERTHORN_GENERAL_STORE'),
            createChoice(time.isForgeOpen ? 'Call at the blacksmith' : 'See whether the blacksmith is still open', 'SCENE_SILVERTHORN_BLACKSMITH'),
            createChoice('Step into The Rusty Blade', 'SCENE_RUSTY_BLADE_INN'),
            createChoice('Return to the city center', 'SCENE_HUB_SILVERTHORN')
        ];
        return scene;
    }

    if (sceneId === 'SCENE_SILVERTHORN_GENERAL_STORE') {
        if (time.isNight) {
            scene.text = "The shutters are down and the general store is closed for the night. A chalkboard sign promises first light, but for now the district offers only locked doors and the inn's dim welcome.";
            scene.type = undefined;
            scene.shopId = undefined;
            scene.choices = [
                createChoice('Return to the market quarter', 'SCENE_SILVERTHORN_MARKET'),
                createChoice('Go to The Rusty Blade instead', 'SCENE_RUSTY_BLADE_INN'),
                createChoice('Return to the city center', 'SCENE_HUB_SILVERTHORN')
            ];
            return scene;
        }

        if (!getSceneMemory('silverthorn_general_store_seen')) {
            setSceneMemory('silverthorn_general_store_seen', true);
            scene.text = `${baseScene.text} The shopkeeper keeps one ear on the street and mutters that half the city has discovered a sudden need for bandages, lamp oil, clean cloth, and antitoxin.`;
        }
        scene.choices = [
            createChoice('Step back into the market quarter', 'SCENE_SILVERTHORN_MARKET'),
            createChoice('Return to the city center', 'SCENE_HUB_SILVERTHORN')
        ];
        return scene;
    }

    if (sceneId === 'SCENE_SILVERTHORN_BLACKSMITH') {
        if (!time.isForgeOpen) {
            scene.text = time.isDusk
                ? 'The forge has gone quiet for the evening. Apprentices bank the coals in red silence and turn away new commissions with the flat courtesy of people too tired to argue.'
                : 'The forge is dark. Only the smell of ash, quenched steel, and spent labor remains, and any serious work will have to wait for dawn.';
            scene.type = undefined;
            scene.shopId = undefined;
            scene.choices = [
                createChoice('Return to the market quarter', 'SCENE_SILVERTHORN_MARKET'),
                createChoice('Return to the city center', 'SCENE_HUB_SILVERTHORN')
            ];
            return scene;
        }

        if (!getSceneMemory('silverthorn_blacksmith_seen')) {
            setSceneMemory('silverthorn_blacksmith_seen', true);
            scene.text = `${baseScene.text} One of the smiths barely looks up before warning that the eastern road has turned fear into its own kind of currency. Everyone wants steel. Everyone wants more than steel can promise.`;
        }
        scene.choices = [
            createChoice('Return to the market quarter', 'SCENE_SILVERTHORN_MARKET'),
            createChoice('Head back to the city center', 'SCENE_HUB_SILVERTHORN')
        ];
        return scene;
    }

    if (sceneId === 'SCENE_RUSTY_BLADE_INN') {
        const innMood = time.isNight
            ? 'The common room is louder now, full of late-shift soldiers, caravan hands, and nervous travelers drinking against the curfew as if it might soften what waits outside the walls.'
            : 'The inn feels like a pressure valve for the whole city, full of half-finished briefings, guarded glances, and rumors spoken into cups rather than across tables.';
        scene.text = `${baseScene.text} ${innMood}`;
        scene.choices = [
            createChoice('Take a room and rest', null, { action: 'longRest' }),
            createChoice('Listen for what the room fears to say aloud', 'SCENE_RUSTY_BLADE_RUMORS', { timeAdvance: 1, timeReason: 'You linger over rumors and stray conversations.', inSilverthorn: true }),
            createChoice('Return to the market quarter', 'SCENE_SILVERTHORN_MARKET')
        ];
        return scene;
    }

    if (sceneId === 'SCENE_RUSTY_BLADE_RUMORS') {
        const heardBefore = !!getSceneMemory('silverthorn_rumors_heard');
        setSceneMemory('silverthorn_rumors_heard', true);
        scene.text = heardBefore
            ? "On repetition the room grows no kinder. The names change hands, but the shape of the dread remains the same: dwarves unearthed something in Durnhelm that should have stayed buried, every realm now eyes every other realm for the coming quarrel, and Whisperwood vanished at the exact hour the first war-rumors began to harden into plans. No one says they expect peace. They only argue over what will break first."
            : "You keep your cup low and listen. One table swears Durnhelm found a relic powerful enough to bend kingdoms into war. Another says Whisperwood vanished because it tried to hide the relic first. A caravan master spits and says that is court-bred nonsense, but even he lowers his voice when he admits the eastern road has started bringing back men who talk as though they left pieces of themselves somewhere beneath the trees. The room cannot agree on the truth. It agrees perfectly on the danger.";
        scene.choices = [
            createChoice('Return to the common room', 'SCENE_RUSTY_BLADE_INN'),
            createChoice('Head for the eastern gate', 'SCENE_SILVERTHORN_GATES')
        ];
        return scene;
    }

    if (sceneId === 'SCENE_SILVERTHORN_TEMPLE') {
        if (!time.isTempleOpen) {
            scene.text = "The main temple doors are barred for the night, though a side shrine remains open for private prayer. Candlelight leaks through the stonework, and the silence suggests the healers have been driven from comfort into triage.";
            scene.choices = [
                createChoice('Offer a quiet prayer at the side shrine', 'SCENE_SILVERTHORN_TEMPLE_PRAYER', { timeAdvance: 1, timeReason: 'You spend a quiet hour in reflection.', inSilverthorn: true }),
                createChoice('Return to the city center', 'SCENE_HUB_SILVERTHORN')
            ];
            return scene;
        }

        scene.text = `${baseScene.text} It is ${time.timelineLabel}, and the place feels like one of the last corners of Silverthorn that has stopped pretending anything is normal.`;
        scene.choices = [
            createChoice('Ask the healers what waits on the road', 'SCENE_SILVERTHORN_TEMPLE_COUNSEL', { timeAdvance: 1, timeReason: 'You stay to hear the temple counsel.', inSilverthorn: true }),
            createChoice('Kneel before you depart', 'SCENE_SILVERTHORN_TEMPLE_PRAYER', { timeAdvance: 1, timeReason: 'You spend a quiet hour in reflection.', inSilverthorn: true }),
            createChoice('Return to the city center', 'SCENE_HUB_SILVERTHORN')
        ];
        return scene;
    }

    if (sceneId === 'SCENE_SILVERTHORN_TEMPLE_COUNSEL') {
        setSceneMemory('silverthorn_temple_counsel', true);
        const hasTempleWard = !!gameState.flags.silverthorn_temple_ward_taken;
        scene.text = hasTempleWard
            ? `${baseScene.text} One of the healers recognizes the juniper-and-ash ward already drying on your gloves and tells you not to waste the blessing before the road truly turns cruel.`
            : `${baseScene.text} One of the senior healers lingers over a brazier of juniper, ash, and bitter herbs, offering a ward to travelers willing to take the warning seriously.`;
        scene.choices = [];

        if (!hasTempleWard) {
            scene.choices.push(createChoice('Submit to the road ward (Religion)', null, {
                type: 'skillCheck',
                skill: 'religion',
                dc: 11,
                timeAdvance: 1,
                timeReason: 'You stay while the healers prepare a proper road ward.',
                inSilverthorn: true,
                successText: 'You match the healer prayer for prayer. Juniper smoke stings your eyes, but the ward settles into memory and breath alike. The temple sends you toward the road better braced for poison and panic.',
                failText: 'The words catch and fray before they can settle. The healer finishes the rite anyway, but only presses a small vial of antitoxin into your hand and tells you not to mistake good intent for preparedness.',
                onSuccess: {
                    effects: [
                        {
                            type: 'customEffect',
                            id: 'dawnroad_ward',
                            name: 'Dawnroad Ward',
                            durationType: 'rest_of_day',
                            remaining: 1,
                            modifiers: [
                                { type: 'flat_bonus', target: 'skill_check', skill: 'survival', value: 2 },
                                { type: 'advantage', target: 'saving_throw', tags: ['poison'] }
                            ]
                        },
                        { type: 'flag', flagId: 'silverthorn_temple_ward_taken', value: true }
                    ]
                },
                onFail: {
                    effects: [
                        { type: 'addItem', itemId: 'antitoxin' },
                        { type: 'flag', flagId: 'silverthorn_temple_ward_taken', value: true }
                    ]
                },
                nextSceneSuccess: 'SCENE_SILVERTHORN_TEMPLE_COUNSEL',
                nextSceneFail: 'SCENE_SILVERTHORN_TEMPLE_COUNSEL'
            }));
        }

        scene.choices.push(
            createChoice('Remain in the temple a while longer', 'SCENE_SILVERTHORN_TEMPLE'),
            createChoice('Return to City Center', 'SCENE_HUB_SILVERTHORN')
        );
        return scene;
    }

    if (sceneId === 'SCENE_SILVERTHORN_TEMPLE_PRAYER') {
        return scene;
    }

    if (sceneId === 'SCENE_SILVERTHORN_NOTICE_BOARD') {
        const boardMood = time.isNight
            ? 'Most people have stopped lingering here, leaving the board to creak softly in the night breeze beneath notices no one wants to read twice.'
            : 'Fresh ink and hastily pinned notices suggest half the city is trying to understand events faster than the crown can contain them.';
        scene.text = `${baseScene.text} ${boardMood}`;
        scene.choices = [
            createChoice('Read the Whisperwood postings', 'SCENE_SILVERTHORN_NOTICE_WHISPERWOOD'),
            createChoice('Read the contracts and warrants', 'SCENE_SILVERTHORN_NOTICE_CONTRACTS'),
            createChoice('Return to the city center', 'SCENE_HUB_SILVERTHORN')
        ];
        return scene;
    }

    if (sceneId === 'SCENE_SILVERTHORN_NOTICE_WHISPERWOOD') {
        setSceneMemory('silverthorn_notice_whisperwood', true);
        scene.text = "The postings have been layered one over another until the whole board feels swollen with panic. Patrol rosters stop mid-name. Three merchant families ask after kin who never came back from Whisperwood. A militia order warns that the borough can no longer be reached by ordinary means, though no officer will say what that sentence is meant to mean. At the bottom, someone has scrawled in shaking charcoal: 'The town did not fall silent. It was taken whole.'";
        return scene;
    }

    if (sceneId === 'SCENE_SILVERTHORN_NOTICE_CONTRACTS') {
        scene.text = "Escort work and rat bounties still cling to the older layers of the board, but the fresh postings tell a harsher story. Curfew fines. Closed-route compensation. Special wagons requisitioned under council seal. One clipped notice offers good silver for verified intelligence from Durnhelm, then disappears beneath wax before anyone can linger over it. You come away with the sense that Silverthorn is already bracing for something larger than one vanished borough.";
        return scene;
    }

    if (sceneId === 'SCENE_SILVERTHORN_GATES') {
        const gateMood = time.isNight
            ? 'The gate stands under doubled watch, with fewer departures, harsher questions, and the unspoken expectation that anyone leaving may not return.'
            : time.isDusk
                ? 'The last approved wagons are being hurried through before the watch seals the night.'
                : 'Traffic still moves, but every outbound cart is inspected twice and every face is studied as if the walls themselves have learned suspicion.';
        scene.text = `${baseScene.text} ${gateMood}`;
        scene.choices = [
            createChoice('Take counsel from the gate captain', 'SCENE_SILVERTHORN_GATE_CAPTAIN', { timeAdvance: 1, timeReason: 'You spend time getting the latest road intelligence.', inSilverthorn: true }),
            createChoice(time.isNight ? 'Pass beyond the walls despite the hour' : 'Take the eastern road into Shadowmire', 'SCENE_TRAVEL_SHADOWMIRE', { timeAdvance: 1, timeReason: 'You finalize your departure and pass beyond the walls.', inSilverthorn: true }),
            createChoice('Return to the city center', 'SCENE_HUB_SILVERTHORN')
        ];
        return scene;
    }

    if (sceneId === 'SCENE_SILVERTHORN_GATE_CAPTAIN') {
        const warnedAlready = !!getSceneMemory('silverthorn_gate_captain_seen');
        const hasRouteBriefing = !!gameState.flags.silverthorn_gate_route_briefed;
        setSceneMemory('silverthorn_gate_captain_seen', true);
        scene.text = warnedAlready
            ? hasRouteBriefing
                ? "The captain recognizes you at once and taps the same route marks you already copied into memory. 'Then keep them straight in your head,' he says. 'The council can argue over relics and borders after we stop losing patrols. Out there, one bad landmark costs more than pride.'"
                : "The captain recognizes you at once. 'Same road, same warning: keep your faces covered if the spores darken, trust your footing more than your sight, and if the forest goes too quiet, do not mistake that for mercy. And if anyone on the road starts asking what Durnhelm found, keep walking.'"
            : "The captain studies you for a beat longer than courtesy allows, then opens the route ledger with two scarred fingers. 'We lose scouts to the east and patience to the north,' he says. 'Whisperwood is gone, Durnhelm has half the realm whispering about relic-war, and every fool with a horse thinks fear can be outrun if he leaves before dusk. It cannot. So listen closely.'";
        scene.choices = [];

        if (!hasRouteBriefing) {
            scene.choices.push(createChoice('Study the route marks with him (Survival)', null, {
                type: 'skillCheck',
                skill: 'survival',
                dc: 12,
                timeAdvance: 1,
                timeReason: 'You spend time memorizing landmarks and danger signs beyond the eastern gate.',
                inSilverthorn: true,
                successText: "You force the landmarks into order: the split ash at the old mile-stone, the washout where carts drift south, the bend where the spores start riding the wind. When you step away from the map, the road feels less unknown.",
                failText: "The landmarks refuse to stay orderly in your head. The captain eventually rolls the map shut and tells you not to trust memory alone once the forest starts lying.",
                onSuccess: {
                    effects: [
                        {
                            type: 'customEffect',
                            id: 'roadwise_briefing',
                            name: 'Roadwise Briefing',
                            durationType: 'until_next_combat',
                            remaining: 1,
                            modifiers: [
                                { type: 'flat_bonus', target: 'skill_check', skill: 'perception', value: 2 },
                                { type: 'flat_bonus', target: 'initiative', value: 1 }
                            ]
                        },
                        { type: 'flag', flagId: 'silverthorn_gate_route_briefed', value: true }
                    ]
                },
                onFail: {
                    effects: [
                        { type: 'flag', flagId: 'silverthorn_gate_route_briefed', value: true }
                    ]
                },
                nextSceneSuccess: 'SCENE_SILVERTHORN_GATE_CAPTAIN',
                nextSceneFail: 'SCENE_SILVERTHORN_GATE_CAPTAIN'
            }));
        }

        scene.choices.push(
            createChoice('Leave Silverthorn now', 'SCENE_TRAVEL_SHADOWMIRE', { timeAdvance: 1, timeReason: 'You leave before the city can hold you any longer.', inSilverthorn: true }),
            createChoice('Return to the gate plaza', 'SCENE_SILVERTHORN_GATES')
        );
        return scene;
    }

    return scene;
}

function buildSporefallRuntimeScene(sceneId, baseScene) {
    const scene = cloneScene(sceneId);
    const state = getSporefallState();
    const clueNotes = [];
    if (state.cathedralLetterFound || state.cathedralVisionSeen) clueNotes.push('cathedral');
    if (state.homeUnlocked || state.journalFound || state.letterFound || state.compassFound) clueNotes.push('overseer_house');
    if (state.bridgeSeen || state.northRouteOpen) clueNotes.push('north_side');

    if (sceneId === 'SCENE_ARRIVAL_WHISPERWOOD') {
        if (state.eoinMet) {
            const eoinState = [
                state.eoinFed ? 'You can still picture the way Eoin tried not to devour the ration too quickly.' : null,
                state.eoinTreated ? 'The borrowed steadiness in his breath has taken some of the panic out of the street.' : null
            ].filter(Boolean).join(' ');
            scene.text = `You stand once more in Sporefall's central street, where the silence no longer feels abandoned so much as watched. Doors hang open to rooms no one had time to close. A butcher's awning has fused to its frame in black curls. The red light on the stones makes every threshold look blood-washed whether blood touched it or not. The borough still opens west toward the cathedral quarter, east toward the overseer's row, and north toward the bridge Eoin named.${eoinState ? ` ${eoinState}` : ''}`;
            scene.choices = [
                createChoice('Step back into the central street', 'SCENE_HUB_SPOREFALL'),
                createChoice("Return to Eoin's hiding place", 'SCENE_EOIN_TALK')
            ];
            return scene;
        }

        const torchlit = hasStatusEffect('torchlight');
        scene.text = "You wake into a borough that feels like it should still be asleep, yet nothing here carries the peace of sleep. The houses lean inward as though bracing against some pressure still building beneath the earth. Ash and spore-clotted rain have dried in dark seams between the stones. A door nearby stands open on a room whose walls are striped by dragged fingertips. Somewhere close, something wooden taps softly in the wind, and every sound after that feels like a mistake for existing.";
        scene.choices = [
            createChoice('Search the nearest street for survivors (Perception)', null, {
                type: 'skillCheck',
                skill: 'perception',
                dc: 10,
                successText: 'At first it looks like another ruin settling. Then you catch the truth of it: a pale hand, a face withdrawing, the small disciplined panic of someone trying very hard not to be found.',
                failText: 'Nothing moves at first. Then the stillness itself begins to feel arranged, as if whoever remains here has learned to hide inside silence rather than risk breathing against it.',
                onSuccess: {
                    effects: [
                        { type: 'flag', flagId: 'sporefall_eoin_glimpsed', value: true }
                    ]
                },
                onFail: {
                    effects: [
                        { type: 'flag', flagId: 'sporefall_eoin_delayed', value: true }
                    ]
                },
                nextSceneSuccess: 'SCENE_MEET_EOIN',
                nextSceneFail: 'SCENE_SPOREFALL_STREET_SEARCH'
            }),
            createChoice('Move between the ruined homes', 'SCENE_SPOREFALL_STREET_SEARCH'),
            createChoice('Stand still and listen for the living', 'SCENE_SPOREFALL_STREET_SEARCH')
        ];
        if (torchlit) {
            scene.choices.unshift(createChoice('Hold your torch high and read the soot-marked doorways (Perception)', null, {
                type: 'skillCheck',
                skill: 'perception',
                dc: 8,
                statusAid: {
                    statusId: 'torchlight',
                    bonus: 2,
                    logText: 'Torchlight shows where soot, footprints, and fresh disturbance part ways.'
                },
                successText: 'By torchlight the street gives itself away: scuffed ash by a cellar lip, a handprint where someone steadied themself, breath caught just once behind a shattered lintel.',
                failText: 'The flame gives shape to the wreckage, but not enough. Shadows slip behind shadows, and the borough keeps its living hidden a little longer.',
                onSuccess: {
                    effects: [
                        { type: 'flag', flagId: 'sporefall_eoin_glimpsed', value: true }
                    ]
                },
                onFail: {
                    effects: [
                        { type: 'flag', flagId: 'sporefall_eoin_delayed', value: true }
                    ]
                },
                nextSceneSuccess: 'SCENE_MEET_EOIN',
                nextSceneFail: 'SCENE_SPOREFALL_STREET_SEARCH'
            }));
        }
        return scene;
    }

    if (sceneId === 'SCENE_SPOREFALL_STREET_SEARCH') {
        const searchedBefore = !!getSceneMemory('sporefall_street_search_seen');
        setSceneMemory('sporefall_street_search_seen', true);
        scene.text = searchedBefore
            ? "The nearby houses remain empty of life and full of the small humiliations of catastrophe: a child's toy stamped into red mud, a cooking pot left black on cold iron, a shawl dried stiff where something wet once soaked through it. The same restrained cough still betrays a human presence behind the ruined home."
            : "The street is not empty so much as interrupted. Doors have been left wide in the middle of ordinary lives. Bedding trails across thresholds. One wall is marked shoulder-high with the brown smear of someone trying to stay upright after they should already have been down. The deeper you move between the houses, the more the borough feels paused at the exact instant everyone understood they were too late.";
        scene.choices = [
            createChoice('Follow the coughing behind the house', 'SCENE_MEET_EOIN'),
            createChoice('Circle wide and cut off whoever is hiding', 'SCENE_MEET_EOIN'),
            createChoice('Read the ruined thresholds with a healer’s eye (Medicine)', null, {
                type: 'skillCheck',
                skill: 'medicine',
                dc: 11,
                statusAid: {
                    statusId: 'torchlight',
                    bonus: 1,
                    logText: 'The light lets you separate blood, ash, and spore-stain before they blur together.'
                },
                successText: 'The signs resolve into a pattern: whoever is hiding here is frightened, feverish, and still trying not to lead anything back to their shelter.',
                failText: 'You find traces of panic, blood, and hurried movement, but not enough to read what kind of life is still hiding here.',
                nextSceneSuccess: 'SCENE_MEET_EOIN',
                nextSceneFail: 'SCENE_MEET_EOIN'
            })
        ];
        return scene;
    }

    if (sceneId === 'SCENE_MEET_EOIN') {
        scene.choices = [...(scene.choices || [])];
        if (state.eoinGlimpsed) {
            scene.text = "The pale figure you glimpsed behind the house finally shows himself. A young man steps into the moon-glow with a broken spear in shaking hands, shoulders tucked as if he expects the night itself to strike first. His clothes are too thin for the cold and too dirty for any recent shelter above ground. His face is hollow from hunger and fright in nearly equal measure. 'Stay back,' he says, though the threat lands weaker than the plea beneath it. 'Are you real, or another kindness this place will take back?'";
        } else {
            scene.text = "A young man rises from the lee of a ruined wall with a broken spear half-lifted, breathing as if each breath has to be bargained for. His sleeves are shredded at the cuffs, and the grime worked into them looks older than tonight. He watches you the way starving men watch food they suspect is poisoned: wanting to believe, unable to afford it.";
        }
        if (!state.eoinFed && actorHasItem('player', 'rations')) {
            scene.choices.unshift(createChoice('Offer him a ration before you ask anything', 'SCENE_EOIN_TALK', {
                effects: [
                    { type: 'consumeItem', itemId: 'rations', quantity: 1, logText: 'You hand over one day of rations.' },
                    { type: 'relationship', npcId: 'eoin', amount: 1 },
                    { type: 'flag', flagId: 'sporefall_eoin_fed', value: true }
                ]
            }));
        }
        return scene;
    }

    if (sceneId === 'SCENE_EOIN_TALK') {
        scene.choices = [...(scene.choices || [])];
        if (state.eoinTalked) {
            const reactions = [];
            if (clueNotes.includes('cathedral')) {
                reactions.push("When you mention the cathedral, Eoin's grip tightens on the broken spear. He keeps insisting that whatever happened there began before the moon turned wrong.");
            }
            if (clueNotes.includes('overseer_house')) {
                reactions.push("The overseer's house clearly means something to him now. He watches your face closely, as if afraid of what Aodhan's papers might prove.");
            }
            if (clueNotes.includes('north_side')) {
                reactions.push("Any mention of the north-side bridge makes him look relieved and guilty at once, like he still hopes the answer to his mother lies there.");
            }
            if (state.bridgeBodySeen) {
                reactions.push("When the bridge comes up now, he goes quiet enough to hear himself shake. He still cannot make himself ask the question plainly.");
            }
            const suffix = reactions.length > 0 ? ` ${reactions.join(' ')}` : '';
            const comfortBeat = [
                state.eoinFed ? 'The memory of the food you gave him lingers in the way he no longer apologizes for surviving.' : null,
                state.eoinTreated ? 'The rasp in his breath is lighter now, though the fear behind it remains untouched.' : null
            ].filter(Boolean).join(' ');
            scene.text = `Eoin is calmer now, though never fully steady. He keeps watching the empty streets between words, as if expecting the town itself to overhear him. The same three threads still matter most to him: the cathedral, the north-side bridge, and the impossible fact that he feels present and absent all at once.${suffix}${comfortBeat ? ` ${comfortBeat}` : ''}`;
        } else {
            scene.text = "Once the spear lowers a little, the story comes out in broken pieces: quarantine lines, prayers that became orders, a mother he lost sight of near the northern bridge where they used to sleep under the stonework, and a town that seemed to sicken all at once after the moon rose wrong. He still calls the place Whisperwood when he forgets himself. He speaks like someone afraid that saying the whole truth aloud might summon it back.";
        }

        if (!state.eoinTreated && actorHasItem('player', 'antitoxin')) {
            scene.choices.unshift(createChoice('Press antitoxin into his hands and tell him to drink', 'SCENE_EOIN_TALK', {
                effects: [
                    { type: 'consumeItem', itemId: 'antitoxin', quantity: 1, logText: 'You part with one vial of antitoxin.' },
                    { type: 'relationship', npcId: 'eoin', amount: 2 },
                    { type: 'flag', flagId: 'sporefall_eoin_treated', value: true }
                ]
            }));
        } else if (!state.eoinTreated && actorHasItem('player', 'healer_kit')) {
            scene.choices.unshift(createChoice('Use your healer kit to steady his shaking hands', 'SCENE_EOIN_TALK', {
                effects: [
                    { type: 'consumeItem', itemId: 'healer_kit', quantity: 1, logText: 'You use up a healer kit patching cracked skin and binding the worst of the raw places.' },
                    { type: 'relationship', npcId: 'eoin', amount: 1 },
                    { type: 'flag', flagId: 'sporefall_eoin_treated', value: true }
                ]
            }));
        }
        return scene;
    }

    if (sceneId === 'SCENE_EOIN_RITUAL_TALK') {
        if (state.cathedralVisionSeen || state.cathedralLetterFound) {
            scene.text = "Eoin listens hard when you tell him what the cathedral has already given up. 'Then it was real,' he whispers. 'The ritual. The overseer. The dark coming all at once.' He still points you back toward the Cathedral of Bone, but now with the dread of someone hearing his worst memory confirmed aloud.";
        }
        return scene;
    }

    if (sceneId === 'SCENE_EOIN_MOTHER_TALK') {
        if (state.bridgeBodySeen) {
            scene.text = "When you tell Eoin what lies beneath the north bridge, the words seem to take his balance before he understands them. He folds in on himself with one hand over his mouth, not weeping so much as failing all at once. 'She hated the damp there,' he whispers after a long time. 'She kept saying we would leave before winter and find a room with a door that shut.' Whatever hope carried him this far does not die cleanly. It tears.";
        } else if (state.bridgeSeen || state.northRouteOpen) {
            scene.text = "When you mention the north-side bridge, Eoin goes still. 'Then you saw where we stayed,' he says softly. 'Good. I kept thinking if someone else saw it too, maybe I didn't imagine her there.' The north still matters to him, but now it feels less like rumor and more like grief with a street name.";
        }
        return scene;
    }

    if (sceneId === 'SCENE_HUB_SPOREFALL') {
        const clueBeat = [];
        if (state.cathedralLetterFound) clueBeat.push('the courier letter has already tied the cathedral quarter to the overseer');
        if (state.journalFound || state.letterFound || state.compassFound) clueBeat.push("Aodhan's house has begun giving up its secrets");
        if (state.northRouteOpen) clueBeat.push('the north road is open if speed matters more than certainty');
        if (state.cathedralMasonryRead) clueBeat.push('the broken masonry has already told you the cathedral began failing before the panic');
        if (state.bridgeBodySeen) clueBeat.push("the north bridge now carries the shape of Eoin's loss");
        const survivorBeat = [
            state.eoinFed ? 'Eoin has at least one meal in him now.' : null,
            state.eoinTreated ? 'His breathing has steadied enough to trust him with a longer watch.' : null
        ].filter(Boolean).join(' ');
        const suffix = clueBeat.length > 0 ? ` Already, ${clueBeat.join(', and ')}.` : '';

        scene.text = `${baseScene.text}${suffix}${survivorBeat ? ` ${survivorBeat}` : ''}`;
        scene.choices = [
            createChoice(state.cathedralVisionSeen ? 'Return west to the Cathedral of Bone' : 'Head west through the cathedral quarter', 'SCENE_SPOREFALL_CATHEDRAL_APPROACH'),
            createChoice(state.homeUnlocked ? "Return east to Aodhan's house" : "Head east toward the overseer's row", 'SCENE_SPOREFALL_OVERSEER_APPROACH'),
            createChoice(state.northRouteOpen ? 'Take the northern skip route again' : 'Head north through the broken market road', 'SCENE_SPOREFALL_NORTH_APPROACH'),
            createChoice("Return to Eoin's hiding place", 'SCENE_EOIN_TALK')
        ];
        return scene;
    }

    if (sceneId === 'SCENE_SPOREFALL_CATHEDRAL_APPROACH') {
        scene.text = state.cathedralLetterFound
            ? `${baseScene.text} The courier's bag now hangs open and empty where you left it, but the cathedral still waits above it like a threat dressed as architecture.`
            : baseScene.text;
        scene.choices = [];
        if (!state.cathedralLetterFound) {
            scene.choices.push(createChoice("Search the courier's bag", 'SCENE_SPOREFALL_CATHEDRAL_APPROACH', {
                effects: [
                    { type: 'addItem', itemId: 'urgent_letter_overseer' },
                    { type: 'flag', flagId: 'sporefall_cathedral_letter_found', value: true }
                ]
            }));
        }
        if (!state.cathedralMasonryRead) {
            scene.choices.push(createChoice('Read the cracked cathedral stone before you climb (History)', null, {
                type: 'skillCheck',
                skill: 'history',
                dc: 12,
                traitAid: {
                    traitId: 'stonecunning',
                    bonus: 2,
                    logText: 'Stonecunning lets you read the breaks the way others read handwriting.'
                },
                toolAid: {
                    toolId: 'mason_tools',
                    bonus: 2,
                    logText: "A mason's sense of weight and settling makes the failure plain."
                },
                skillOptions: {
                    tags: ['stonework']
                },
                successText: 'The damage is wrong for a simple evacuation. Hairline fractures radiate from pressure points that were already under strain before panic emptied the square. Whatever overtook Sporefall did not begin tonight.',
                failText: 'You can tell the cathedral failed in stages, but not enough to say which wound came first.',
                onSuccess: {
                    effects: [
                        { type: 'flag', flagId: 'sporefall_cathedral_masonry_read', value: true }
                    ]
                },
                nextSceneSuccess: 'SCENE_SPOREFALL_CATHEDRAL_APPROACH',
                nextSceneFail: 'SCENE_SPOREFALL_CATHEDRAL_APPROACH'
            }));
        }
        scene.choices.push(
            createChoice(state.cathedralVisionSeen ? 'Enter the cathedral again' : 'Climb toward the cathedral doors', 'SCENE_SPOREFALL_CATHEDRAL_ENTRY'),
            createChoice('Return to the central street', 'SCENE_HUB_SPOREFALL')
        );
        return scene;
    }

    if (sceneId === 'SCENE_SPOREFALL_CATHEDRAL_ENTRY') {
        scene.text = state.cathedralVisionSeen
            ? "The Cathedral of Bone is no less oppressive on return. The dead still lie in ordered rows, and the corridor the chained specter indicated now feels less like a mystery than a deferred command."
            : baseScene.text;
        return scene;
    }

    if (sceneId === 'SCENE_SPOREFALL_CATHEDRAL_VISION') {
        if (!scene.onEnter) scene.onEnter = {};
        scene.onEnter.questUpdate = { id: 'investigate_whisperwood', stage: 4 };
        scene.text = state.cathedralVisionSeen
            ? "The memory of the broken ritual still clings to the cathedral like incense that never clears. You already know enough to carry the omen back into the streets."
            : scene.text;
        return scene;
    }

    if (sceneId === 'SCENE_SPOREFALL_OVERSEER_APPROACH') {
        scene.text = state.homeUnlocked
            ? "The marked house stands open now, its blue handprint broken where the trap failed to hold. Even with the door unsealed, the eastern row feels like it expects witnesses to apologize before entering."
            : baseScene.text;
        return scene;
    }

    if (sceneId === 'SCENE_SPOREFALL_OVERSEER_DOOR') {
        if (state.homeUnlocked) {
            scene.text = "The ruined door hangs ajar where the arcane circuit finally failed. Whatever answer the trap demanded, it cannot keep you out anymore.";
            scene.choices = [
                createChoice('Enter the overseer house', 'SCENE_SPOREFALL_OVERSEER_STUDY'),
                createChoice("Return to the overseer's row", 'SCENE_SPOREFALL_OVERSEER_APPROACH')
            ];
            return scene;
        }

        scene.text = state.homeTrapHint
            ? `${baseScene.text} Now that you understand the pattern, the false notes are obvious: Wolf and Serpent were never meant to stand with the sacred three.`
            : baseScene.text;
        scene.choices = [
            createChoice('Study the runes (Arcana)', 'SCENE_SPOREFALL_OVERSEER_DOOR', {
                type: 'skillCheck',
                skill: 'arcana',
                dc: 14,
                successText: "The trap is intricate, but not impossible. Crow, Stag, and Bear carry the divine weight here. Wolf and Serpent are the impostors.",
                failText: "You can feel the spell's edges, but not enough to trust yourself with them yet.",
                onSuccess: {
                    effects: [
                        { type: 'flag', flagId: 'sporefall_home_trap_hint', value: true }
                    ]
                },
                nextSceneSuccess: 'SCENE_SPOREFALL_OVERSEER_DOOR',
                nextSceneFail: 'SCENE_SPOREFALL_OVERSEER_DOOR'
            }),
            createChoice('Trace the carved grooves (Investigation)', 'SCENE_SPOREFALL_OVERSEER_DOOR', {
                type: 'skillCheck',
                skill: 'investigation',
                dc: 14,
                toolAid: {
                    toolId: 'thieves_tools',
                    bonus: 2,
                    logText: "Thieves' tools teach you where a trap wants impatient hands to reach."
                },
                successText: 'The cuts in the wood reveal how the circuit flows. Two of the runes are only there to punish the impatient.',
                failText: "You find the grooves, but not the logic that would let you break them safely.",
                onSuccess: {
                    effects: [
                        { type: 'flag', flagId: 'sporefall_home_trap_hint', value: true }
                    ]
                },
                nextSceneSuccess: 'SCENE_SPOREFALL_OVERSEER_DOOR',
                nextSceneFail: 'SCENE_SPOREFALL_OVERSEER_DOOR'
            })
        ];

        if (state.homeTrapHint) {
            scene.choices.push(
                createChoice('Scratch out the Wolf and Serpent runes', 'SCENE_SPOREFALL_OVERSEER_STUDY', {
                    effects: [
                        { type: 'flag', flagId: 'sporefall_home_unlocked', value: true }
                    ]
                }),
                createChoice('Mar the Crow and Bear runes instead', 'SCENE_SPOREFALL_OVERSEER_DOOR', {
                    effects: [
                        { type: 'damage', amount: '2d8' },
                        {
                            type: 'customEffect',
                            id: 'manor_trap_lag',
                            name: 'Trap-Lagged',
                            durationType: 'scenes',
                            duration: 2,
                            modifiers: [
                                { type: 'flat_bonus', target: 'speed', value: -10 },
                                { type: 'disadvantage', target: 'ability_check', ability: 'DEX' }
                            ]
                        }
                    ]
                })
            );
        }

        scene.choices.push(
            createChoice('Force the door and risk the trap', 'SCENE_SPOREFALL_OVERSEER_DOOR', {
                effects: [
                    { type: 'damage', amount: '2d8' },
                    {
                        type: 'customEffect',
                        id: 'manor_trap_lag',
                        name: 'Trap-Lagged',
                        durationType: 'scenes',
                        duration: 2,
                        modifiers: [
                            { type: 'flat_bonus', target: 'speed', value: -10 },
                            { type: 'disadvantage', target: 'ability_check', ability: 'DEX' }
                        ]
                    }
                ]
            }),
            createChoice("Return to the overseer's row", 'SCENE_SPOREFALL_OVERSEER_APPROACH')
        );
        return scene;
    }

    if (sceneId === 'SCENE_SPOREFALL_OVERSEER_STUDY') {
        const foundCount = [state.journalFound, state.letterFound, state.compassFound].filter(Boolean).length;
        scene.text = foundCount >= 3
            ? "The study is all but exhausted now. The surviving journal leaves, Liam's letter, and the false-north compass are gone from the room and safely in your keeping. What remains is the shape of Aodhan's desperation."
            : baseScene.text;
        scene.choices = [];
        if (!state.journalFound) {
            scene.choices.push(createChoice('Read the surviving journal leaves', 'SCENE_SPOREFALL_OVERSEER_JOURNAL'));
        }
        if (!state.letterFound) {
            scene.choices.push(createChoice('Search the scattered correspondence', 'SCENE_SPOREFALL_OVERSEER_CORRESPONDENCE'));
        }
        if (!state.compassFound) {
            scene.choices.push(createChoice('Open the desk drawer', 'SCENE_SPOREFALL_OVERSEER_DRAWER'));
        }
        scene.choices.push(createChoice('Leave the house for the central street', 'SCENE_HUB_SPOREFALL'));
        return scene;
    }

    if (sceneId === 'SCENE_SPOREFALL_NORTH_APPROACH') {
        scene.text = state.bridgeSeen
            ? "The northern streets remain barer than the rest of Sporefall, as though whole families were driven through here too quickly to carry anything but panic. The footbridge still sags over the black water where Eoin said they slept, and the outer road beyond it still offers the fastest way forward if you can bear ignorance better than delay."
            : "The northern streets feel flensed. Market stalls stand open with nothing worth taking left in them. A warped district marker still bears the older name, Whisperwood, half-buried under crimson mildew. Ahead, the road widens toward the footbridge Eoin mentioned, then thins again into a route that could carry you deeper into Sporefall without first learning what the cathedral quarter or the overseer's row would tell you.";
        scene.choices = [
            createChoice('Read the old marker and bridgework before the spores swallow them (History)', null, {
                type: 'skillCheck',
                skill: 'history',
                dc: 11,
                traitAid: {
                    traitId: 'stonecunning',
                    bonus: 2,
                    logText: 'Stonecunning lets you read old borough masonry like a record of who built it and who later defaced it.'
                },
                toolAid: {
                    toolId: 'mason_tools',
                    bonus: 2,
                    logText: "A mason's eye catches the older Whisperwood stone beneath the newer wound."
                },
                successText: "The bridge piers and marker were raised long before this became Sporefall. You can still read the careful municipal pride under the corruption: this was once the borough's poor northern edge, repaired often, neglected almost never. The neglect came later.",
                failText: 'The old stone still speaks of age and civic labor, but the corruption has obscured the finer reading.',
                onSuccess: {
                    effects: [
                        { type: 'flag', flagId: 'sporefall_bridge_marker_read', value: true }
                    ]
                },
                nextSceneSuccess: 'SCENE_SPOREFALL_NORTH_APPROACH',
                nextSceneFail: 'SCENE_SPOREFALL_NORTH_APPROACH'
            }),
            createChoice('Check the ruined footbridge first', 'SCENE_SPOREFALL_NORTH_BRIDGE'),
            createChoice('Cross the open street toward the north road (Perception)', null, {
                type: 'skillCheck',
                skill: 'perception',
                dc: 11,
                statusAid: {
                    statusId: 'torchlight',
                    bonus: 1,
                    logText: 'Torchlight catches movement in the stalls before it can close on you.'
                },
                successText: 'You catch the ambush before it closes and pick your way through the dead ground without giving it your throat.',
                failText: 'Something lunges from behind an overturned cart before you can choose your footing.',
                nextSceneSuccess: 'SCENE_SPOREFALL_NORTH_ROUTE_DISCOVERED',
                nextSceneFail: 'SCENE_SPOREFALL_NORTH_AMBUSH'
            }),
            createChoice('Return to the central street', 'SCENE_HUB_SPOREFALL')
        ];
        return scene;
    }

    if (sceneId === 'SCENE_SPOREFALL_NORTH_BRIDGE') {
        scene.text = state.bridgeBodySeen
            ? "The footbridge sags over the sluggish black stream like a jaw broken and left to heal crooked. Beneath it, the little shelter of bedding, bowls, and salvaged cloth no longer reads as absence alone. You have already seen the truth the spore left curled in its nest, and the whole place feels indecent to stand in."
            : "The footbridge sags over a sluggish black stream. Beneath it lie scraps of bedding, a cracked bowl, a child's carved trinket, and the outline of a life lived one bad season at a time. Mold has climbed the stone piers in dark red veins. Whatever warmth once sheltered here is gone, but the place still feels occupied by the shape of it.";
        scene.choices = [];

        if (!state.bridgeBodySeen) {
            scene.choices.push(createChoice('Climb down beneath the bridge and follow the smell (Athletics)', null, {
                type: 'skillCheck',
                skill: 'athletics',
                dc: 11,
                itemAid: {
                    itemId: 'rope',
                    bonus: 2,
                    logText: 'Rope keeps you from trusting rotten stone with your full weight.'
                },
                statusAid: {
                    statusId: 'torchlight',
                    bonus: 1,
                    logText: 'Torchlight cuts through the red dark under the bridge.'
                },
                successText: "You lower yourself into the dark beneath the bridge and find the last shelter intact enough to accuse the living. There, tucked behind mildewed blankets and a collapsed crate, lies a woman's body drawn in on itself. The skin has tightened to the bone. Red fungal growth threads through her ribs and throat like roots claiming timber. Whatever took her did not do it quickly.",
                failText: 'The descent slips under you. You scrape stone and foul water before forcing yourself back up, shaken and bloodied but alive.',
                onSuccess: {
                    effects: [
                        { type: 'flag', flagId: 'sporefall_bridge_body_seen', value: true },
                        { type: 'flag', flagId: 'sporefall_bridge_seen', value: true }
                    ]
                },
                onFail: {
                    effects: [
                        { type: 'damage', amount: '1d4' },
                        { type: 'flag', flagId: 'sporefall_bridge_seen', value: true }
                    ]
                },
                nextSceneSuccess: 'SCENE_SPOREFALL_NORTH_BRIDGE',
                nextSceneFail: 'SCENE_SPOREFALL_NORTH_BRIDGE'
            }));
        }

        scene.choices.push(
            createChoice('Read the shelter like a field camp (Investigation)', null, {
                type: 'skillCheck',
                skill: 'investigation',
                dc: 10,
                itemAid: {
                    itemId: 'healer_kit',
                    bonus: 1,
                    logText: 'A healer\'s kit makes the traces of sickness and desperate care easier to separate.'
                },
                successText: "The shelter tells its story in leftovers: one adult, one child, too little food, careful attempts at cleanliness, and the kind of stubborn order poor people build when they mean to endure. This was not a hiding place prepared for one night. It was home.",
                failText: 'You can tell people lived here. The finer shape of that life keeps slipping through the rot and filth.',
                onSuccess: {
                    effects: [
                        { type: 'flag', flagId: 'sporefall_bridge_seen', value: true }
                    ]
                },
                nextSceneSuccess: 'SCENE_SPOREFALL_NORTH_BRIDGE',
                nextSceneFail: 'SCENE_SPOREFALL_NORTH_BRIDGE'
            }),
            createChoice('Push on toward the north road', 'SCENE_SPOREFALL_NORTH_ROUTE_DISCOVERED'),
            createChoice('Return to the central street', 'SCENE_HUB_SPOREFALL')
        );
        return scene;
    }

    if (sceneId === 'SCENE_SPOREFALL_NORTH_ROUTE_DISCOVERED') {
        scene.text = state.northRouteOpen
            ? "The northern road still offers the same hard bargain: speed, momentum, and a way deeper into the borough without first earning the richer clues of the cathedral quarter or overseer's row."
            : scene.text;
        return scene;
    }

    return scene;
}

export function getRuntimeScene(sceneId) {
    const baseScene = scenes[sceneId];
    if (!baseScene) return null;
    if (isSceneInSilverthorn(sceneId)) {
        return buildSilverthornRuntimeScene(sceneId, baseScene);
    }
    if (isSceneInSporefall(sceneId)) {
        return buildSporefallRuntimeScene(sceneId, baseScene);
    }
    return cloneScene(sceneId);
}

function getStoryLabel(collection, id) {
    return collection[id] ? collection[id].title : id;
}

function logStoryProgress(changes) {
    changes.unlocked.forEach((eventId) => {
        logMessage(`Story Thread Unlocked: ${getStoryLabel(storyEvents, eventId)}`, 'system');
    });

    changes.completed.forEach((eventId) => {
        logMessage(`Story Thread Advanced: ${getStoryLabel(storyEvents, eventId)}`, 'gain');
    });

    if (changes.actChanged) {
        const currentAct = storyActs.find((act) => act.id === gameState.story.currentActId);
        if (currentAct) {
            logMessage(`Story Arc: ${currentAct.title}`, 'system');
        }
    }
}

function applySceneEffect(effect, source = 'scene') {
    if (!effect || !effect.type) return;
    const targetId = effect.targetActorId || effect.characterId || 'player';
    const targetActor = getCharacterById(targetId) || gameState.player;
    const logText = effect.logText || null;

    if (effect.type === 'relationship') {
        changeRelationship(effect.npcId, effect.amount);
        return;
    }

    if (effect.type === 'reputation') {
        changeReputation(effect.factionId, effect.amount);
        return;
    }

    if (effect.type === 'addItem') {
        addItem(effect.itemId, targetId, effect.quantity);
        const item = items[effect.itemId];
        if (item) {
            const qty = effect.quantity ? ` x${effect.quantity}` : '';
            logMessage(logText || `${source === 'choice' ? 'Received' : 'Found'} ${item.name}${qty}.`, 'gain');
        }
        return;
    }

    if (effect.type === 'removeItem') {
        if (removeItem(effect.itemId, targetId, effect.quantity || 1)) {
            const item = items[effect.itemId];
            logMessage(logText || `Lost ${item?.name || effect.itemId}.`, 'system');
        }
        return;
    }

    if (effect.type === 'consumeItem') {
        if (removeItem(effect.itemId, targetId, effect.quantity || 1)) {
            const item = items[effect.itemId];
            logMessage(logText || `${targetActor.name} uses up ${item?.name || effect.itemId}.`, 'system');
        }
        return;
    }

    if (effect.type === 'useItem' && effect.itemId) {
        const result = useConsumable(effect.itemId, targetId, effect.targetActorId || targetId);
        if (result.success) {
            logMessage(logText || result.msg || `${targetActor.name} uses ${items[effect.itemId]?.name || effect.itemId}.`, 'gain');
        } else if (effect.logOnFailure) {
            logMessage(effect.logOnFailure === true ? (result.msg || `Could not use ${items[effect.itemId]?.name || effect.itemId}.`) : effect.logOnFailure, 'check-fail');
        }
        return;
    }

    if (effect.type === 'addGold') {
        addGold(effect.amount || 0);
        logMessage(logText || `Gained ${effect.amount || 0} gold.`, 'gain');
        return;
    }

    if (effect.type === 'removeGold') {
        spendGold(effect.amount || 0);
        logMessage(logText || `Lost ${effect.amount || 0} gold.`, 'system');
        return;
    }

    if (effect.type === 'flag' && effect.flagId) {
        gameState.flags[effect.flagId] = effect.value !== undefined ? effect.value : true;
        return;
    }

    if (effect.type === 'status' && effect.id) {
        const applied = applyStatusEffect(effect.id, effect.duration, targetId);
        if (applied) {
            logMessage(logText || `${targetActor.name} gains ${effect.id}.`, 'system');
        } else {
            logMessage(logText || `${effect.id} has no effect on ${targetActor.name} right now.`, 'system');
        }
        return;
    }

    if (effect.type === 'removeStatus' && effect.id) {
        if (targetActor?.mechanics?.activeEffects) {
            removeEffectFromActor(targetActor, effect.id);
            logMessage(logText || `${targetActor.name} is no longer ${effect.id}.`, 'gain');
        }
        return;
    }

    if (effect.type === 'customEffect' && effect.id && effect.modifiers) {
        if (!targetActor) return;
        const applied = addEffectToActor(targetActor, effect.id, {
            name: effect.name || effect.id,
            source: effect.sourceId || source,
            remaining: effect.duration ?? effect.durationAmount ?? null,
            durationType: effect.durationType || 'scenes',
            modifiers: effect.modifiers,
            blockedSpellIds: effect.blockedSpellIds || [],
            applicationTags: effect.applicationTags || [],
            concentration: !!effect.concentration
        });
        if (applied) {
            logMessage(logText || `Effect applied: ${effect.name || effect.id}.`, 'system');
        } else {
            logMessage(logText || `${effect.name || effect.id} has no effect on ${targetActor.name} right now.`, 'system');
        }
        return;
    }

    if (effect.type === 'damage') {
        const amount = typeof effect.amount === 'string' ? rollDiceExpression(effect.amount).total : Math.max(0, effect.amount || 0);
        targetActor.hp = Math.max(0, targetActor.hp - amount);
        updateStatsUI();
        logMessage(logText || `${targetActor.name} takes ${amount} damage.`, 'combat');
        return;
    }

    if (effect.type === 'reputationBundle' && Array.isArray(effect.entries)) {
        effect.entries.forEach((entry) => changeReputation(entry.factionId, entry.amount || 0));
    }
}

function applyEffectList(effects, source = 'scene') {
    if (!Array.isArray(effects)) return;
    effects.forEach((effect) => applySceneEffect(effect, source));
}

function isLocationUnlocked(locationId) {
    const requirement = getLocationStoryRequirement(locationId);
    return !requirement || meetsStoryRequirement(gameState.story, requirement);
}

function getLocationLockMessage(locationId) {
    const hint = getLocationUnlockHint(locationId);
    if (!hint) {
        return 'That route is not available yet.';
    }
    return `That route is not available yet. ${hint}`;
}

export function showCharacterCreation() {
    document.getElementById('start-menu').classList.add('hidden');
    resetCharacterCreationState();
    const raceSelect = document.getElementById('cc-race');
    const classSelect = document.getElementById('cc-class');
    const backgroundSelect = document.getElementById('cc-background');
    raceSelect.innerHTML = "";
    classSelect.innerHTML = "";
    backgroundSelect.innerHTML = "";
    for (const [key, race] of Object.entries(races)) {
        const opt = document.createElement('option');
        opt.value = key;
        opt.innerText = race.name;
        raceSelect.appendChild(opt);
    }
    for (const [key, cls] of Object.entries(classes)) {
        const opt = document.createElement('option');
        opt.value = key;
        opt.innerText = cls.name;
        classSelect.appendChild(opt);
    }
    for (const [key, background] of Object.entries(backgrounds)) {
        const opt = document.createElement('option');
        opt.value = key;
        opt.innerText = background.name;
        backgroundSelect.appendChild(opt);
    }
    renderAbilityScoreUI();
    raceSelect.onchange = () => {
        ccState.chosenBonusSkills = [];
        ccState.chosenBonusTools = [];
        updateCCPreview();
    };
    classSelect.onchange = () => {
        ccState.chosenSkills = [];
        ccState.chosenCantrips = [];
        ccState.chosenPreparedSpells = [];
        ccState.chosenSpellbook = [];
        ccState.chosenExpertise = [];
        ccState.chosenFightingStyle = null;
        updateCCPreview();
    };
    backgroundSelect.onchange = updateCCPreview;
    updateCCPreview();
    document.getElementById('char-creation-modal').classList.remove('hidden');
}

function renderAbilityScoreUI() {
    const container = document.getElementById('cc-abilities-container');
    container.innerHTML = '';
    const standardArray = [15, 14, 13, 12, 10, 8];
    const stats = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
    ccState.baseStats = { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 };

    const syncAbilityScoreOptions = () => {
        const selectedValues = { ...ccState.baseStats };
        container.querySelectorAll('select[data-stat]').forEach((select) => {
            const stat = select.dataset.stat;
            Array.from(select.options).forEach((option) => {
                const value = parseInt(option.value, 10);
                const usedElsewhere = Object.entries(selectedValues).some(([otherStat, otherValue]) => otherStat !== stat && otherValue === value);
                option.disabled = usedElsewhere;
            });
            select.value = String(ccState.baseStats[stat]);
        });
    };

    stats.forEach((stat, index) => {
        const row = document.createElement('div');
        row.className = 'stat-row';
        const label = document.createElement('label');
        label.innerText = stat;
        const select = document.createElement('select');
        select.dataset.stat = stat;
        standardArray.forEach(val => {
            const opt = document.createElement('option');
            opt.value = val;
            opt.innerText = val;
            if (val === standardArray[index]) opt.selected = true;
            select.appendChild(opt);
        });
        select.onchange = (e) => {
            ccState.baseStats[stat] = parseInt(e.target.value);
            syncAbilityScoreOptions();
            updateCCPreview();
        };
        row.appendChild(label);
        row.appendChild(select);
        container.appendChild(row);
    });
    syncAbilityScoreOptions();
}

function formatChoiceLabel(value) {
    return String(value)
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function fillMissingSelections(current, available, count) {
    const next = [...current];
    available.forEach((entry) => {
        if (next.length >= count) return;
        if (!next.includes(entry)) next.push(entry);
    });
    return next.slice(0, count);
}

function getClassSpellSelectionState(classKey, finalStats) {
    const cls = classes[classKey];
    const spellcasting = cls?.spellcasting;
    if (!spellcasting) {
        return {
            cantrips: [],
            cantripCount: 0,
            spellChoices: [],
            spellCount: 0,
            spellLabel: 'Spells',
            mode: null
        };
    }

    const cantrips = getSpellIdsForClass(classKey, { level: 0 });
    const spellChoices = getSpellIdsForClass(classKey, { minLevel: 1 });
    const spellCount = spellcasting.mode === 'spellbook'
        ? Math.min(spellcasting.spellbookCount || spellChoices.length, spellChoices.length)
        : Math.min(getPreparedSpellLimit({ classId: classKey, abilities: finalStats, level: 1 }), spellChoices.length);

    return {
        cantrips,
        cantripCount: Math.min(spellcasting.cantripsKnown || 0, cantrips.length),
        spellChoices,
        spellCount,
        spellLabel: spellcasting.mode === 'spellbook' ? 'Spellbook' : 'Prepared Spells',
        mode: spellcasting.mode
    };
}

function updateCCPreview() {
    const raceKey = document.getElementById('cc-race').value;
    const classKey = document.getElementById('cc-class').value;
    const backgroundKey = document.getElementById('cc-background').value;
    const race = races[raceKey];
    const cls = classes[classKey];
    const background = backgrounds[backgroundKey];
    document.getElementById('cc-race-desc').innerText = race.description;
    document.getElementById('cc-class-desc').innerText = cls.description;
    document.getElementById('cc-background-desc').innerText = background.description;
    const finalStats = { ...ccState.baseStats };
    if (race.abilityBonuses) {
        for (const [stat, bonus] of Object.entries(race.abilityBonuses)) {
            if (finalStats[stat]) finalStats[stat] += bonus;
        }
    }
    renderSkillChoices(cls, background);
    renderBonusSkillChoices(raceKey, background);
    renderBonusToolChoices(raceKey, background);
    renderFightingStyleChoices(cls);
    renderExpertiseChoices(cls, background);
    renderCantripChoices(classKey, finalStats);
    renderSpellChoices(classKey, finalStats);
    const preview = document.getElementById('cc-preview-content');
    preview.innerHTML = '';
    Object.entries(finalStats).forEach(([stat, val]) => {
        const mod = getAbilityMod(val);
        const div = document.createElement('div');
        div.className = 'preview-stat';
        div.innerHTML = `<span>${stat}</span> <span>${val} (${mod >= 0 ? '+' : ''}${mod})</span>`;
        preview.appendChild(div);
    });
    const hp = cls.hitDie + getAbilityMod(finalStats.CON);
    let ac = 10 + getAbilityMod(finalStats.DEX);
    if (classKey === 'fighter') ac = 16;
    if (classKey === 'rogue') ac = 11 + getAbilityMod(finalStats.DEX);
    preview.innerHTML += `<div class="preview-stat highlight"><span>HP</span> <span>${hp}</span></div>`;
    preview.innerHTML += `<div class="preview-stat"><span>AC</span> <span>${ac}</span></div>`;
    preview.innerHTML += `<div class="preview-stat highlight"><span>Background</span> <span>${background.name}</span></div>`;
    if (ccState.chosenSkills.length > 0) {
        preview.innerHTML += `<div class="preview-stat highlight"><span>Class Skills</span></div>`;
        ccState.chosenSkills.forEach((s) => {
             preview.innerHTML += `<div class="preview-stat" style="padding-left:10px; font-size:0.8em;">${formatChoiceLabel(s)}</div>`;
        });
    }
    const allSkillProficiencies = [...new Set([...(background.skillProficiencies || []), ...ccState.chosenSkills, ...ccState.chosenBonusSkills])];
    if (allSkillProficiencies.length > 0) {
        preview.innerHTML += `<div class="preview-stat highlight"><span>Skill Proficiencies</span></div>`;
        allSkillProficiencies.forEach((skill) => {
            preview.innerHTML += `<div class="preview-stat" style="padding-left:10px; font-size:0.8em;">${formatChoiceLabel(skill)}</div>`;
        });
    }
    const allToolProficiencies = [...new Set([...(background.toolProficiencies || []), ...ccState.chosenBonusTools])];
    if (allToolProficiencies.length > 0) {
        preview.innerHTML += `<div class="preview-stat highlight"><span>Tools</span></div>`;
        allToolProficiencies.forEach((tool) => {
            preview.innerHTML += `<div class="preview-stat" style="padding-left:10px; font-size:0.8em;">${formatChoiceLabel(tool)}</div>`;
        });
    }
    if ((background.languages || []).length > 0) {
        preview.innerHTML += `<div class="preview-stat highlight"><span>Languages</span></div>`;
        background.languages.forEach((language) => {
            preview.innerHTML += `<div class="preview-stat" style="padding-left:10px; font-size:0.8em;">${formatChoiceLabel(language)}</div>`;
        });
    }
    const traitDefinitions = getRaceTraitDefinitions(raceKey);
    if (traitDefinitions.length > 0) {
        preview.innerHTML += `<div class="preview-stat highlight"><span>Traits</span></div>`;
        traitDefinitions.forEach((trait) => {
            preview.innerHTML += `<div class="preview-stat" style="padding-left:10px; font-size:0.8em;">${trait.name}</div>`;
        });
    }
    if (ccState.chosenFightingStyle) {
        preview.innerHTML += `<div class="preview-stat highlight"><span>Fighting Style</span> <span>${formatChoiceLabel(ccState.chosenFightingStyle)}</span></div>`;
    }
    if (ccState.chosenExpertise.length > 0) {
        preview.innerHTML += `<div class="preview-stat highlight"><span>Expertise</span></div>`;
        ccState.chosenExpertise.forEach((skill) => {
            preview.innerHTML += `<div class="preview-stat" style="padding-left:10px; font-size:0.8em;">${formatChoiceLabel(skill)}</div>`;
        });
    }
    if (ccState.chosenCantrips.length > 0) {
        preview.innerHTML += `<div class="preview-stat highlight"><span>Cantrips</span></div>`;
        ccState.chosenCantrips.forEach((spellId) => {
            preview.innerHTML += `<div class="preview-stat" style="padding-left:10px; font-size:0.8em;">${spells[spellId]?.name || spellId}</div>`;
        });
    }
    const selectedLevelledSpells = classKey === 'wizard' ? ccState.chosenSpellbook : ccState.chosenPreparedSpells;
    if (selectedLevelledSpells.length > 0) {
        const spellLabel = classKey === 'wizard' ? 'Spellbook' : 'Prepared Spells';
        preview.innerHTML += `<div class="preview-stat highlight"><span>${spellLabel}</span></div>`;
        selectedLevelledSpells.forEach((spellId) => {
            preview.innerHTML += `<div class="preview-stat" style="padding-left:10px; font-size:0.8em;">${spells[spellId]?.name || spellId}</div>`;
        });
    }
}

function renderSkillChoices(cls, background) {
    const container = document.getElementById('cc-skills-container');
    const backgroundSkills = new Set((background?.skillProficiencies || []).map((skill) => String(skill).toLowerCase()));
    const availableSkills = (cls.skillProficiencies || []).filter((skill) => !backgroundSkills.has(skill));
    const currentSkills = ccState.chosenSkills.filter((skill) => availableSkills.includes(skill));
    ccState.chosenSkills = [...currentSkills];
    container.innerHTML = '';
    const max = cls.skillChoices || 2;
    document.getElementById('cc-skill-count').innerText = max;
    availableSkills.forEach(skill => {
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.value = skill;
        if (currentSkills.includes(skill)) input.checked = true;
        input.onchange = (e) => {
            if (e.target.checked) {
                if (ccState.chosenSkills.length < max) {
                    ccState.chosenSkills.push(skill);
                } else {
                    e.target.checked = false;
                }
            } else {
                ccState.chosenSkills = ccState.chosenSkills.filter(s => s !== skill);
            }
            updateCCPreview();
        };
        label.appendChild(input);
        label.appendChild(document.createTextNode(` ${formatChoiceLabel(skill)}`));
        div.appendChild(label);
        container.appendChild(div);
    });
}

function renderBonusSkillChoices(raceId, background) {
    const section = document.getElementById('cc-bonus-skills-section');
    const container = document.getElementById('cc-bonus-skills-container');
    const max = getBonusSkillChoiceCount(raceId);
    const grantedSkills = new Set([...(background?.skillProficiencies || []), ...(ccState.chosenSkills || [])]);

    container.innerHTML = '';
    document.getElementById('cc-bonus-skill-count').innerText = max;

    if (max <= 0) {
        section.classList.add('hidden');
        ccState.chosenBonusSkills = [];
        return;
    }

    section.classList.remove('hidden');
    const availableSkills = [...new Set(Object.values(classes).flatMap(entry => entry.skillProficiencies || []))]
        .filter(skill => !grantedSkills.has(skill));

    ccState.chosenBonusSkills = ccState.chosenBonusSkills.filter((skill) => availableSkills.includes(skill)).slice(0, max);

    availableSkills.forEach((skill) => {
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.value = skill;
        input.checked = ccState.chosenBonusSkills.includes(skill);
        input.onchange = (e) => {
            if (e.target.checked) {
                if (ccState.chosenBonusSkills.length < max) {
                    ccState.chosenBonusSkills.push(skill);
                } else {
                    e.target.checked = false;
                }
            } else {
                ccState.chosenBonusSkills = ccState.chosenBonusSkills.filter((entry) => entry !== skill);
            }
            updateCCPreview();
        };
        label.appendChild(input);
        label.appendChild(document.createTextNode(` ${formatChoiceLabel(skill)}`));
        div.appendChild(label);
        container.appendChild(div);
    });
}

function renderBonusToolChoices(raceId, background) {
    const section = document.getElementById('cc-bonus-tools-section');
    const container = document.getElementById('cc-bonus-tools-container');
    const max = getBonusToolChoiceCount(raceId);
    const availableTools = getBonusToolChoiceOptions(raceId).filter((tool) => !(background?.toolProficiencies || []).includes(tool));

    container.innerHTML = '';
    document.getElementById('cc-bonus-tool-count').innerText = max;
    if (max <= 0 || availableTools.length === 0) {
        section.classList.add('hidden');
        ccState.chosenBonusTools = [];
        return;
    }

    section.classList.remove('hidden');
    ccState.chosenBonusTools = ccState.chosenBonusTools.filter((tool) => availableTools.includes(tool)).slice(0, max);

    availableTools.forEach((tool) => {
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.value = tool;
        input.checked = ccState.chosenBonusTools.includes(tool);
        input.onchange = (e) => {
            if (e.target.checked) {
                if (ccState.chosenBonusTools.length < max) {
                    ccState.chosenBonusTools.push(tool);
                } else {
                    e.target.checked = false;
                }
            } else {
                ccState.chosenBonusTools = ccState.chosenBonusTools.filter((entry) => entry !== tool);
            }
            updateCCPreview();
        };
        label.appendChild(input);
        label.appendChild(document.createTextNode(` ${formatChoiceLabel(tool)}`));
        div.appendChild(label);
        container.appendChild(div);
    });
}

function renderFightingStyleChoices(cls) {
    const section = document.getElementById('cc-fighting-style-section');
    const container = document.getElementById('cc-fighting-style-container');
    container.innerHTML = '';

    if (!cls?.fightingStyleChoices?.length) {
        section.classList.add('hidden');
        ccState.chosenFightingStyle = null;
        return;
    }

    section.classList.remove('hidden');
    const currentChoice = cls.fightingStyleChoices.includes(ccState.chosenFightingStyle)
        ? ccState.chosenFightingStyle
        : (ccState.chosenFightingStyle = cls.fightingStyleChoices[0]);

    cls.fightingStyleChoices.forEach((styleId) => {
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'cc-fighting-style';
        input.value = styleId;
        input.checked = currentChoice === styleId;
        input.onchange = () => {
            ccState.chosenFightingStyle = styleId;
            updateCCPreview();
        };
        label.appendChild(input);
        label.appendChild(document.createTextNode(` ${formatChoiceLabel(styleId)}`));
        div.appendChild(label);
        container.appendChild(div);
    });
}

function renderExpertiseChoices(cls, background) {
    const section = document.getElementById('cc-expertise-section');
    const container = document.getElementById('cc-expertise-container');
    container.innerHTML = '';

    if (!cls?.expertiseChoices) {
        section.classList.add('hidden');
        ccState.chosenExpertise = [];
        return;
    }

    const availableSkills = [...new Set([
        ...(background?.skillProficiencies || []),
        ...(ccState.chosenSkills || []),
        ...(ccState.chosenBonusSkills || [])
    ])];
    const max = cls.expertiseChoices;
    section.classList.remove('hidden');
    document.getElementById('cc-expertise-count').innerText = max;
    ccState.chosenExpertise = ccState.chosenExpertise.filter((skill) => availableSkills.includes(skill)).slice(0, max);

    availableSkills.forEach((skill) => {
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.value = skill;
        input.checked = ccState.chosenExpertise.includes(skill);
        input.onchange = (e) => {
            if (e.target.checked) {
                if (ccState.chosenExpertise.length < max) {
                    ccState.chosenExpertise.push(skill);
                } else {
                    e.target.checked = false;
                }
            } else {
                ccState.chosenExpertise = ccState.chosenExpertise.filter((entry) => entry !== skill);
            }
            updateCCPreview();
        };
        label.appendChild(input);
        label.appendChild(document.createTextNode(` ${formatChoiceLabel(skill)}`));
        div.appendChild(label);
        container.appendChild(div);
    });
}

function renderCantripChoices(classKey, finalStats) {
    const section = document.getElementById('cc-cantrips-section');
    const container = document.getElementById('cc-cantrips-container');
    const state = getClassSpellSelectionState(classKey, finalStats);
    container.innerHTML = '';

    if (!state.cantripCount || state.cantrips.length === 0) {
        section.classList.add('hidden');
        ccState.chosenCantrips = [];
        return;
    }

    section.classList.remove('hidden');
    document.getElementById('cc-cantrip-count').innerText = state.cantripCount;
    ccState.chosenCantrips = ccState.chosenCantrips.filter((spellId) => state.cantrips.includes(spellId)).slice(0, state.cantripCount);

    state.cantrips.forEach((spellId) => {
        const spell = spells[spellId];
        if (!spell) return;
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.value = spellId;
        input.checked = ccState.chosenCantrips.includes(spellId);
        input.onchange = (e) => {
            if (e.target.checked) {
                if (ccState.chosenCantrips.length < state.cantripCount) {
                    ccState.chosenCantrips.push(spellId);
                } else {
                    e.target.checked = false;
                }
            } else {
                ccState.chosenCantrips = ccState.chosenCantrips.filter((entry) => entry !== spellId);
            }
            updateCCPreview();
        };
        label.appendChild(input);
        label.appendChild(document.createTextNode(` ${spell.name}`));
        div.appendChild(label);
        container.appendChild(div);
    });
}

function renderSpellChoices(classKey, finalStats) {
    const section = document.getElementById('cc-spells-section');
    const container = document.getElementById('cc-spells-container');
    const title = document.getElementById('cc-spells-title');
    const count = document.getElementById('cc-spell-count');
    container.innerHTML = '';
    const state = getClassSpellSelectionState(classKey, finalStats);

    if (state.spellChoices.length === 0 || state.spellCount <= 0) {
        section.classList.add('hidden');
        ccState.chosenPreparedSpells = [];
        ccState.chosenSpellbook = [];
        return;
    }

    section.classList.remove('hidden');
    title.innerText = state.spellLabel;
    count.innerText = state.spellCount;

    const key = state.mode === 'spellbook' ? 'chosenSpellbook' : 'chosenPreparedSpells';
    ccState[key] = ccState[key].filter((spellId) => state.spellChoices.includes(spellId)).slice(0, state.spellCount);

    state.spellChoices.forEach((spellId) => {
        const spell = spells[spellId];
        if (!spell) return;
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.value = spellId;
        if (ccState[key].includes(spellId)) input.checked = true;
        input.onchange = (e) => {
            if (e.target.checked) {
                if (ccState[key].length < state.spellCount) {
                    ccState[key].push(spellId);
                } else {
                    e.target.checked = false;
                }
            } else {
                ccState[key] = ccState[key].filter((entry) => entry !== spellId);
            }
            updateCCPreview();
        };
        label.appendChild(input);
        label.appendChild(document.createTextNode(` ${spell.name}`));
        div.appendChild(label);
        container.appendChild(div);
    });
}

function finishCharacterCreation() {
    const name = document.getElementById('cc-name').value || "Traveler";
    const raceKey = document.getElementById('cc-race').value;
    const classKey = document.getElementById('cc-class').value;
    const backgroundKey = document.getElementById('cc-background').value;
    const cls = classes[classKey];
    const background = backgrounds[backgroundKey];
    const bonusSkillChoices = getBonusSkillChoiceCount(raceKey);

    // 1) Stat uniqueness check
    const stats = Object.values(ccState.baseStats);
    const uniqueStats = new Set(stats);
    if (uniqueStats.size !== stats.length) {
        alert("Please assign each Standard Array value (15, 14, 13, 12, 10, 8) exactly once.");
        return;
    }

    // 2) Auto-pick skills if none selected (helps Playwright + forgetful players)
    if (ccState.chosenSkills.length === 0 && cls.skillProficiencies?.length) {
        const max = cls.skillChoices || 2;
        const availableClassSkills = cls.skillProficiencies.filter((skill) => !(background?.skillProficiencies || []).includes(skill));
        ccState.chosenSkills = availableClassSkills.slice(0, max);
    }

    if (bonusSkillChoices > 0 && ccState.chosenBonusSkills.length === 0) {
        const backgroundSkills = background?.skillProficiencies || [];
        const unavailable = new Set([...(ccState.chosenSkills || []), ...backgroundSkills]);
        const fallbackSkills = [...new Set(Object.values(classes).flatMap(entry => entry.skillProficiencies || []))]
            .filter((skill) => !unavailable.has(skill))
            .slice(0, bonusSkillChoices);
        ccState.chosenBonusSkills = fallbackSkills;
    }

    const bonusToolChoices = getBonusToolChoiceCount(raceKey);
    if (bonusToolChoices > 0 && ccState.chosenBonusTools.length === 0) {
        ccState.chosenBonusTools = getBonusToolChoiceOptions(raceKey).slice(0, bonusToolChoices);
    }

    const finalStats = { ...ccState.baseStats };
    Object.entries(races[raceKey]?.abilityBonuses || {}).forEach(([stat, bonus]) => {
        finalStats[stat] += bonus;
    });
    const spellState = getClassSpellSelectionState(classKey, finalStats);
    ccState.chosenCantrips = fillMissingSelections(ccState.chosenCantrips, spellState.cantrips, spellState.cantripCount);
    if (spellState.mode === 'spellbook') {
        ccState.chosenSpellbook = fillMissingSelections(ccState.chosenSpellbook, spellState.spellChoices, spellState.spellCount);
    } else {
        ccState.chosenPreparedSpells = fillMissingSelections(ccState.chosenPreparedSpells, spellState.spellChoices, spellState.spellCount);
    }

    if (cls.fightingStyleChoices?.length && !ccState.chosenFightingStyle) {
        ccState.chosenFightingStyle = cls.fightingStyleChoices[0];
    }

    if (cls.expertiseChoices) {
        const expertisePool = [...new Set([...(background?.skillProficiencies || []), ...ccState.chosenSkills, ...ccState.chosenBonusSkills])];
        ccState.chosenExpertise = fillMissingSelections(ccState.chosenExpertise, expertisePool, cls.expertiseChoices);
    }

    // 4) Initialize state
    initializeNewGame(
        name,
        raceKey,
        classKey,
        backgroundKey,
        ccState.baseStats,
        [...ccState.chosenSkills, ...ccState.chosenBonusSkills],
        {
            fightingStyle: ccState.chosenFightingStyle,
            expertiseSkills: ccState.chosenExpertise,
            bonusTools: ccState.chosenBonusTools,
            subclassId: cls.subclassLevel === 1 ? (cls.defaultSubclass || null) : null,
            spellSelection: {
                cantrips: ccState.chosenCantrips,
                preparedSpells: ccState.chosenPreparedSpells,
                spellbook: ccState.chosenSpellbook
            }
        }
    );

    // 5) Hide CC and update HUD
    document.getElementById('char-creation-modal').classList.add('hidden');
    updateStatsUI();

    // 6) Save once, right here
    saveGame();

    // 7) Jump to explicit starting scene
    goToScene(CANONICAL_START_SCENE);

    logMessage(`Character ${name} created. Prince Alderic awaits in Silverthorn.`, "system");
}

function goToScene(sceneId) {
    const scene = getRuntimeScene(sceneId);
    if (!scene) { console.error("Scene not found:", sceneId); return; }
    const previousSceneId = gameState.currentSceneId;

    gameState.story = ensureStoryState(gameState.story);
    const storyChanges = syncStoryStateForScene(gameState.story, sceneId);

    const battleScreen = document.getElementById('battle-screen');
    if (battleScreen) battleScreen.classList.add('hidden');

    const sceneContainer = document.getElementById('scene-container');
    if (sceneContainer) sceneContainer.classList.remove('hidden');

    window.logMessage = logToMain;

    const isFirstVisit = !gameState.visitedScenes.includes(sceneId);
    if (isFirstVisit) {
        gameState.visitedScenes.push(sceneId);
    }

    gameState.currentSceneId = sceneId;
    if (scene.location) discoverLocation(scene.location);
    if (previousSceneId && previousSceneId !== sceneId) {
        const expired = processNarrativeTrigger('scene_change', { previousSceneId, sceneId });
        logExpiredNarrativeEffects(expired);
    }

    if (scene.type !== 'combat' && scene.location === 'silverthorn') {
        if (getReputation('silverthorn') <= -50) {
            logMessage("The guards recognize you as an enemy of the state!", "combat");
            startCombat(['fungal_beast'], 'SCENE_DEFEAT', 'SCENE_DEFEAT');
            return;
        }
    }

    document.getElementById('scene-background').style.backgroundImage = `url('${scene.background}')`;
    const portraitContainer = document.getElementById('portrait-container');
    if (scene.npcPortrait) {
        document.getElementById('npc-portrait').src = scene.npcPortrait;
        portraitContainer.classList.remove('hidden');
    } else {
        portraitContainer.classList.add('hidden');
    }
    document.getElementById('narrative-text').innerText = scene.text;

    if (scene.onEnter) {
        const runOnEnter = !scene.onEnter.once || isFirstVisit;
        if (runOnEnter) {
            if (scene.onEnter.questUpdate) {
                updateQuestStage(scene.onEnter.questUpdate.id, scene.onEnter.questUpdate.stage);
                const q = quests[scene.onEnter.questUpdate.id];
                logMessage(`Quest Updated: ${q.title}`, "gain");
            }
            if (scene.onEnter.addGold) {
                addGold(scene.onEnter.addGold);
                logMessage(`Gained ${scene.onEnter.addGold} gold.`, "gain");
            }
            if (scene.onEnter.addItem) {
                addItem(scene.onEnter.addItem);
                const item = items[scene.onEnter.addItem];
                if (item) {
                    logMessage(`Received ${item.name}.`, "gain");
                }
            }
            if (scene.onEnter.setFlag) {
                gameState.flags[scene.onEnter.setFlag] = true;
                if (scene.onEnter.setFlag === 'aodhan_dead') {
                    setNpcStatus('aodhan', 'dead');
                }
            }
            if (scene.onEnter.effects) {
                applyEffectList(scene.onEnter.effects);
            }
        }
    }

    logStoryProgress(storyChanges);

    triggerAmbientByThreat(scene.location);

    if (scene.type === 'combat') {
        document.getElementById('shop-panel').classList.add('hidden');
        const combatants = scene.enemies || (scene.enemyId ? [scene.enemyId] : []);
        startCombat(combatants, scene.winScene, scene.loseScene);
    } else if (scene.type === 'shop') {
        renderShop(scene.shopId);
        gameState.combat.active = false;
        renderChoices(scene.choices);
        saveGame();
    } else {
        document.getElementById('shop-panel').classList.add('hidden');
        gameState.combat.active = false;
        renderChoices(scene.choices);
        saveGame();
    }
}

// ... (renderChoices, handleChoice, travelTo, etc. - mostly standard) ...
function renderChoices(choices) {
    const choiceContainer = document.getElementById('choice-container');
    choiceContainer.innerHTML = '';
    let renderedCount = 0;
    if (choices) {
        choices.forEach((choice) => {
            if (!meetsChoiceRequirements(choice, gameState.player)) return;
            const btn = document.createElement('button');
            btn.innerText = choice.text + (choice.cost ? ` (${choice.cost}g)` : "");
            btn.onclick = () => handleChoice(choice);
            choiceContainer.appendChild(btn);
            renderedCount += 1;
        });
    }

    if (renderedCount === 0) {
        const fallback = document.createElement('button');
        const currentScene = scenes[gameState.currentSceneId];
        const fallbackScene = currentScene?.location === 'silverthorn'
            ? 'SCENE_HUB_SILVERTHORN'
            : CANONICAL_START_SCENE;
        fallback.innerText = currentScene?.location === 'silverthorn' ? 'Return to City Center' : 'Continue';
        fallback.onclick = () => goToScene(fallbackScene);
        choiceContainer.appendChild(fallback);
        logMessage(`No valid choices were available in ${gameState.currentSceneId}, so a fallback route was opened.`, 'system');
    }
}

function handleChoice(choice) {
    if (choice.cost) {
        if (!spendGold(choice.cost)) {
            logMessage('Not enough gold.', 'check-fail');
            return;
        }
        logMessage(`Spent ${choice.cost} gold.`, 'system');
    }

    if (choice.action === 'loadGame') {
        loadGame();
        return;
    } else if (choice.action === 'inventory') {
        toggleInventory();
        return;
    }
    if (choice.action === 'openMap') {
        toggleMap();
        return;
    }
    if (choice.action === 'shortRest' || choice.action === 'longRest') {
        showRestModal();
        return;
    }
    if (choice.effects) {
        applyEffectList(choice.effects, 'choice');
    }
    if (choice.timeAdvance) {
        advanceNarrativeTime(choice.timeAdvance, choice.timeReason, { inSilverthorn: !!choice.inSilverthorn });
    }
    if (!choice.type) { if (choice.nextScene) goToScene(choice.nextScene); return; }

    if (choice.type === 'skillCheck') {
        const { options: checkOptions, notes: aidNotes } = buildNarrativeCheckOptions(choice, gameState.player);
        const result = rollSkillCheck(gameState.player, choice.skill, checkOptions);
        const dc = choice.dc;
        const aidSuffix = aidNotes.length > 0 ? ` ${aidNotes.join(' ')}` : '';

        logMessage(`Skill Check (${choice.skill}): Rolled ${result.roll} + ${result.modifier} = ${result.total} (DC ${dc})${result.note || ''}${aidSuffix}`, result.total >= dc ? "check-success" : "check-fail");

        if (result.total >= dc) {
            if (choice.skill === 'stealth') {
                adjustThreat(-5, 'moving quietly');
                clearTransientThreat();
            }
            if (choice.onSuccess && choice.onSuccess.addGold) {
                addGold(choice.onSuccess.addGold);
                logMessage(`Gained ${choice.onSuccess.addGold} gold.`, "gain");
            }
            if (choice.onSuccess && choice.onSuccess.effects) {
                applyEffectList(choice.onSuccess.effects, 'choice');
            }
            document.getElementById('narrative-text').innerText = choice.successText;
            if (choice.nextSceneSuccess) renderContinueButton(choice.nextSceneSuccess);
        } else {
            if (choice.skill === 'stealth' || choice.skill === 'acrobatics') {
                adjustThreat(5, 'noise draws attention');
            }
            if (choice.onFail && choice.onFail.effects) {
                applyEffectList(choice.onFail.effects, 'choice');
            }
            document.getElementById('narrative-text').innerText = choice.failText;
            if (choice.nextSceneFail) renderContinueButton(choice.nextSceneFail);
        }
    } else if (choice.type === 'save') {
        const result = rollSavingThrow(gameState.player, choice.ability);
        const success = result.total >= choice.dc;
        logMessage(`Save (${choice.ability}): ${result.total} (DC ${choice.dc})`, success ? "check-success" : "check-fail");
        if (success) {
            document.getElementById('narrative-text').innerText = choice.successText;
        } else {
            document.getElementById('narrative-text').innerText = choice.failText;
            if (choice.failEffect?.type === 'damage') {
                const dmg = rollDiceExpression(choice.failEffect.amount).total;
                gameState.player.hp -= dmg;
                logMessage(`Took ${dmg} damage.`, "combat");
                updateStatsUI();
                if (gameState.player.hp <= 0) { goToScene('SCENE_DEFEAT'); return; }
            }
            if (choice.failEffect?.type === 'status') {
                applyStatusEffect(choice.failEffect.id);
            }
        }
        if (choice.nextScene) renderContinueButton(choice.nextScene);
    }
}

function renderContinueButton(nextSceneId) {
    const choiceContainer = document.getElementById('choice-container');
    choiceContainer.innerHTML = '';
    const btn = document.createElement('button');
    btn.innerText = "Continue";
    btn.onclick = () => goToScene(nextSceneId);
    choiceContainer.appendChild(btn);
}

function triggerAmbientByThreat(locationId) {
    const roll = rollDie(20);
    const threat = gameState.threat.level;
    if (roll + threat / 10 > 20) {
        const warning = locationId === 'whisperwood' ? 'Distant clicking echoes between the spores.' : 'You hear rustling—wildlife unsettled by your presence.';
        recordAmbientEvent(warning, threat > 40 ? 'combat' : 'system');
    } else if (roll === 1 && gameState.threat.recentStealth > 0) {
        recordAmbientEvent('Your quiet steps muffle the forest. Predators pass you by.', 'gain');
    }
}

// --- Shop System --- (Omitted similar to before, unchanged)
const ITEM_CATEGORY_LABELS = {
    weapon: 'Weapons',
    armor: 'Armor',
    shield: 'Shields',
    consumable: 'Consumables',
    scroll: 'Scrolls',
    tool: 'Tools',
    adventuring_gear: 'Gear',
    quest_item: 'Quest Items'
};

function getInventoryCategory(item) {
    return item?.type || 'adventuring_gear';
}

function getItemRulesText(item) {
    if (!item) return '';
    if (item.type === 'weapon') {
        const rangeText = item.rangeFeet ? `Range ${item.rangeFeet}/${item.longRangeFeet || item.rangeFeet}` : '';
        const thrownText = item.thrownRangeFeet ? `Thrown ${item.thrownRangeFeet}/${item.longRangeFeet || item.thrownRangeFeet}` : '';
        const propsText = item.properties?.length ? item.properties.join(', ') : '';
        return [item.weaponCategory, `${item.damage} ${item.damageType}`, rangeText || thrownText, propsText].filter(Boolean).join(' · ');
    }
    if (item.type === 'armor') {
        const dexText = item.dexCap === null || item.dexCap === undefined ? 'DEX to AC' : `DEX cap ${item.dexCap}`;
        const strText = item.reqStr ? `STR ${item.reqStr}` : '';
        return [item.armorType, `AC ${item.acBase}`, dexText, strText].filter(Boolean).join(' · ');
    }
    if (item.type === 'shield') {
        return `Shield · +${item.acBonus || 0} AC`;
    }
    if (item.type === 'scroll') {
        return `Scroll · ${spells[item.spellId]?.name || item.spellId}`;
    }
    return ITEM_CATEGORY_LABELS[item.type] || 'Gear';
}

function getShopInventory(shopDef) {
    if (!shopDef) return [];
    const itemIds = new Set([...(shopDef.featuredItems || []), ...(shopDef.items || [])]);
    if (Array.isArray(shopDef.categories)) {
        Object.values(items)
            .filter((item) => shopDef.categories.includes(item.type))
            .forEach((item) => itemIds.add(item.id));
    }
    return [...itemIds].filter((itemId) => !!items[itemId]);
}

function getShopPrice(item, shopId) {
    let price = item.price;
    if (shops[shopId] && shops[shopId].location === 'silverthorn') {
        if (getReputation('silverthorn') >= 30) {
            price = Math.floor(price * 0.9);
        }
    }
    return price;
}

function renderShop(shopId) {
    const shopDef = shops[shopId];
    if (!shopDef) return;

    const panel = document.getElementById('shop-panel');
    const container = document.getElementById('shop-items-container');
    const goldDisplay = document.getElementById('shop-gold-display');
    const title = document.getElementById('shop-title');

    container.innerHTML = '';
    goldDisplay.innerText = `Gold: ${gameState.player.gold}`;
    if (title) title.innerText = shopDef.name || 'Shop';

    getShopInventory(shopDef).forEach(itemId => {
        const item = items[itemId];
        if (!item) return;

        const price = getShopPrice(item, shopId);

        const row = document.createElement('div');
        row.className = 'shop-entry';

        const info = document.createElement('div');
        info.className = 'shop-entry-info';
        info.innerHTML = `<strong>${item.name}</strong><div class="inventory-meta">${getItemRulesText(item)}</div><small>${item.description}</small>`;

        const btn = document.createElement('button');
        btn.innerText = `Buy (${price}g)`;
        btn.onclick = () => {
            if (spendGold(price)) {
                addItem(itemId);
                logMessage(`Bought ${item.name} for ${price}g.`, "gain");
                goldDisplay.innerText = `Gold: ${gameState.player.gold}`;
            } else {
                logMessage("Not enough gold.", "check-fail");
            }
        };

        row.appendChild(info);
        row.appendChild(btn);
        container.appendChild(row);
    });

    panel.classList.remove('hidden');
}

// --- Map System --- (Omitted similar to before, unchanged)
function toggleMap() {
    // ... (Existing logic)
    const modal = document.getElementById('map-modal');
    const list = document.getElementById('map-locations');
    const pinList = document.getElementById('pin-list');
    const addBtn = document.getElementById('btn-add-pin');
    const pinNote = document.getElementById('pin-note');
    list.innerHTML = '';
    pinList.innerHTML = '';

    for (const [key, loc] of Object.entries(locations)) {
        if (isLocationDiscovered(key)) {
            const div = document.createElement('div');
            div.style.padding = "10px";
            div.style.borderBottom = "1px solid #444";
            div.style.display = "flex";
            div.style.justifyContent = "space-between";
            div.style.alignItems = "center";

            const info = document.createElement('div');
            info.innerHTML = `<strong>${loc.name}</strong><br><small>${loc.description}</small>`;

            const btn = document.createElement('button');
            btn.innerText = "Travel";
            btn.onclick = () => travelTo(key);

            if (!isLocationUnlocked(key)) {
                btn.disabled = true;
                btn.innerText = "Locked";
                info.innerHTML += `<br><small>${getLocationUnlockHint(key) || 'Unavailable right now.'}</small>`;
            }

            if (scenes[gameState.currentSceneId] && scenes[gameState.currentSceneId].location === key) {
                btn.disabled = true;
                btn.innerText = "You are here";
            }

            div.appendChild(info);
            div.appendChild(btn);
            list.appendChild(div);
        }
    }

    gameState.mapPins.forEach((pin, idx) => {
        const row = document.createElement('div');
        row.className = 'pin-row';
        row.innerHTML = `<strong>${locations[pin.locationId]?.name || pin.locationId}</strong>: ${pin.note || 'marked route'}`;
        const rm = document.createElement('button');
        rm.innerText = 'Remove';
        rm.onclick = () => {
            removeMapPin(idx);
            toggleMap();
        };
        row.appendChild(rm);
        pinList.appendChild(row);
    });

    const mapContainer = document.getElementById('map-container');
    mapContainer.onclick = (e) => {
        const note = prompt("Enter a note for this pin:", "Marked location");
        if (note) {
            const currentLocation = scenes[gameState.currentSceneId]?.location || 'travel';
            addMapPin(currentLocation, note);
            toggleMap();
        }
    };

    addBtn.onclick = () => {
        const currentLocation = scenes[gameState.currentSceneId]?.location || 'travel';
        addMapPin(currentLocation, pinNote.value);
        pinNote.value = '';
        toggleMap();
    };

    modal.classList.remove('hidden');
}

function travelTo(locationId) {
    document.getElementById('map-modal').classList.add('hidden');

    if (!isLocationUnlocked(locationId)) {
        logMessage(getLocationLockMessage(locationId), 'system');
        return;
    }

    logMessage(`Traveling to ${locations[locationId].name}...`, "system");
    advanceNarrativeTime(1, 'The road eats up time.', { inSilverthorn: false });

    if (rollDie(100) <= 20) {
        const event = travelEvents[Math.floor(Math.random() * travelEvents.length)];
        const eventSceneId = "SCENE_TRAVEL_EVENT_" + Date.now();
        const destSceneId = getHubSceneForLocation(locationId);

        if (event.type === 'combat') {
            scenes[eventSceneId] = {
                id: eventSceneId,
                location: "travel",
                background: "landscapes/forest_walk_alt.png",
                text: event.text,
                type: 'combat',
                enemyId: event.enemyId,
                winScene: destSceneId,
                loseScene: "SCENE_DEFEAT"
            };
            goToScene(eventSceneId);
            return;
        } else if (event.type === 'discovery' || event.effects) {
            scenes[eventSceneId] = {
                id: eventSceneId,
                location: 'travel',
                background: event.background || 'landscapes/forest_walk_alt.png',
                text: event.text,
                onEnter: event.effects ? { effects: event.effects } : undefined,
                choices: [
                    {
                        text: 'Continue on',
                        nextScene: destSceneId
                    }
                ]
            };
            goToScene(eventSceneId);
            return;
        } else if (event.type === 'skillCheck') {
            scenes[eventSceneId] = {
                id: eventSceneId,
                location: "travel",
                background: "landscapes/forest_walk_alt.png",
                text: event.text,
                choices: [
                    {
                        text: "Investigate",
                        type: "skillCheck",
                        skill: event.skill,
                        dc: event.dc,
                        successText: event.successText,
                        failText: event.failText,
                        onSuccess: event.onSuccess,
                        nextSceneSuccess: destSceneId,
                        nextSceneFail: destSceneId
                    },
                    {
                        text: "Ignore and move on",
                        nextScene: destSceneId
                    }
                ]
            };
            goToScene(eventSceneId);
            return;
        }
    }

    goToScene(getHubSceneForLocation(locationId));
}

function getHubSceneForLocation(locationId) {
    const phase = gameState.worldPhase || 0;
    if (locationId === 'silverthorn' && gameState.flags['aodhan_dead']) {
        return 'SCENE_SILVERTHORN_QUARANTINE';
    }
    if (locationId === 'hushbriar') {
        if (phase >= 2 || gameState.flags['aodhan_dead']) {
            return 'SCENE_HUSHBRIAR_CORRUPTED';
        }
        return 'SCENE_HUSHBRIAR_TOWN';
    }
    if (locationId === 'silverthorn') return 'SCENE_HUB_SILVERTHORN';
    if (locationId === 'whisperwood') return 'SCENE_ARRIVAL_WHISPERWOOD';
    if (locationId === 'shadowmire') return 'SCENE_TRAVEL_SHADOWMIRE';
    if (locationId === 'durnhelm') return 'SCENE_DURNHELM_GATES';
    if (locationId === 'lament_hill') return 'SCENE_LAMENT_HILL_APPROACH';
    if (locationId === 'solasmor') return 'SCENE_SOLASMOR_APPROACH';
    if (locationId === 'soul_mill') return 'SCENE_SOUL_MILL_APPROACH';
    if (locationId === 'thieves_hideout') return 'SCENE_THIEVES_HIDEOUT';
    return 'SCENE_BRIEFING';
}

function toggleCodex(tab = 'people') {
    const modal = document.getElementById('codex-modal');
    const list = document.getElementById('codex-list');
    const btnPeople = document.getElementById('btn-codex-people');
    const btnFactions = document.getElementById('btn-codex-factions');

    modal.classList.remove('hidden');
    list.innerHTML = '';

    if (tab === 'people') {
        btnPeople.classList.add('tab-active');
        btnFactions.classList.remove('tab-active');
        renderCodexPeople(list);
    } else {
        btnPeople.classList.remove('tab-active');
        btnFactions.classList.add('tab-active');
        renderCodexFactions(list);
    }
}

function renderCodexPeople(container) {
    const metNpcs = Object.keys(gameState.relationships);
    if (metNpcs.length === 0) {
        container.innerHTML = "<p style='padding:10px'>No known contacts.</p>";
        return;
    }

    metNpcs.forEach(npcId => {
        const npc = npcs[npcId];
        const score = getRelationship(npcId);
        if (!npc) return;

        const div = document.createElement('div');
        div.className = "codex-entry";

        let label = "Neutral";
        if (score >= 30) label = "Warm";
        if (score >= 70) label = "Ally";
        if (score <= -30) label = "Cold";
        if (score <= -70) label = "Hostile";

        const pct = ((score + 100) / 200) * 100;

        div.innerHTML = `
            <h4>${npc.name}</h4>
            <p>${npc.description}</p>
            <div class="codex-label">${label} (${score})</div>
            <div class="codex-bar-container">
                <div class="codex-bar-fill" style="width: ${pct}%"></div>
            </div>
        `;
        container.appendChild(div);
    });
}

function renderCodexFactions(container) {
    Object.keys(gameState.reputation).forEach(factId => {
        const fact = factions[factId];
        const score = getReputation(factId);
        if (!fact) return;

        const div = document.createElement('div');
        div.className = "codex-entry";

        let label = "Neutral";
        if (score >= 30) label = "Respected";
        if (score >= 70) label = "Hero";
        if (score <= -30) label = "Uneasy";
        if (score <= -70) label = "Enemy";

        const pct = ((score + 100) / 200) * 100;

        div.innerHTML = `
            <h4>${fact.name}</h4>
            <p>${fact.description}</p>
            <div class="codex-label">${label} (${score})</div>
            <div class="codex-bar-container">
                <div class="codex-bar-fill" style="width: ${pct}%"></div>
            </div>
        `;
        container.appendChild(div);
    });
}

// --- Combat System (Updated for Party) ---

function updateCombatUI(activeCharacterId = 'player') {
    if (!gameState.combat.active) return;

    const partyContainer = document.getElementById('party-container');
    partyContainer.innerHTML = '';

    // Render Player
    renderPartyCard(gameState.player, 'player', activeCharacterId);

    const enemiesContainer = document.getElementById('enemies-container');
    enemiesContainer.innerHTML = '';
    gameState.combat.enemies.forEach(enemy => {
        if (enemy.hp <= 0) return;
        const enemyCard = document.createElement('div');
        enemyCard.className = 'enemy-card';
        const enemyHpPct = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
        const enemyToken = gameState.combat.grid?.occupied?.[enemy.uniqueId];
        const positionLabel = enemyToken ? `Pos ${enemyToken.x},${enemyToken.y}` : '';

        enemyCard.innerHTML = `
            <div class="enemy-portrait" style='background-image: url("${enemy.portrait}");'></div>
            <div class="enemy-info">
                <p class="enemy-name">${enemy.name}</p>
                <div class="enemy-bar-background">
                    <div class="enemy-bar-fill" style="width: ${enemyHpPct}%;"></div>
                </div>
                <div class="enemy-status">${positionLabel}</div>
                <div class="enemy-status">${enemy.intent || ''}</div>
            </div>
        `;
        enemiesContainer.appendChild(enemyCard);
    });

    const turnIndicator = document.getElementById('turn-indicator');
    const actionsContainer = document.getElementById('battle-actions-container');
    actionsContainer.innerHTML = '';

    let activeName = "";
    if (activeCharacterId === 'player') activeName = gameState.player.name;
    else if (gameState.roster[activeCharacterId]) activeName = gameState.roster[activeCharacterId].name;

    if (activeCharacterId === 'player' || gameState.party.includes(activeCharacterId)) {
        const isTurn = gameState.combat.turnOrder[gameState.combat.turnIndex] === activeCharacterId;
        if (isTurn) {
            turnIndicator.textContent = `${activeName}'s Turn - ${gameState.combat.movementRemaining} ft move`;
            setBattleActionPreview();
            renderPlayerActions(actionsContainer, null, activeCharacterId);
        } else {
            turnIndicator.textContent = "Waiting...";
            setBattleActionPreview();
        }
    } else {
        const enemy = gameState.combat.enemies.find(e => e.uniqueId === gameState.combat.turnOrder[gameState.combat.turnIndex]);
        turnIndicator.textContent = enemy ? `${enemy.name}'s Turn` : "Enemy's Turn";
        setBattleActionPreview();
    }

    document.getElementById('battle-scene-image').style.backgroundImage = "url('landscapes/battle_placeholder.webp')";
}

function createActionButton(label, icon, onClick, extraClass = '', disabled = false) {
    const btn = document.createElement('button');
    btn.className = `action-btn ${extraClass}`;
    if (disabled) {
        btn.classList.add('disabled');
        btn.disabled = true;
    }
    btn.innerHTML = `
        <span class="material-icons">${icon}</span>
        <span>${label}</span>
    `;
    btn.onclick = onClick;
    return btn;
}

function setBattleActionPreview(text = null) {
    const battleText = document.getElementById('battle-scene-main-text');
    if (!battleText) return;
    battleText.innerText = text || gameState.combat.sceneText || "The air crackles with tension.";
}

function getSpellTargetingConfig(spell) {
    if (!spell) return { type: 'single', side: 'enemy', rangeFeet: 5 };
    if (typeof spell.targeting === 'string') {
        return { type: 'single', side: spell.targeting, rangeFeet: spell.rangeFeet || 5 };
    }
    return {
        type: spell.targeting?.type || 'single',
        side: spell.targeting?.side || 'enemy',
        rangeFeet: spell.targeting?.rangeFeet ?? spell.rangeFeet ?? 5,
        template: spell.targeting?.template || null,
        sizeFeet: spell.targeting?.sizeFeet || null,
        requiresFacing: !!spell.targeting?.requiresFacing
    };
}

function getPreviewButtonLabel(preview, fallbackLabel) {
    const affected = preview.affectedNames?.length ? preview.affectedNames.join(', ') : 'No targets';
    const firstTile = preview.tiles?.[0] ? `(${preview.tiles[0].x},${preview.tiles[0].y})` : 'off-grid';
    return `${fallbackLabel} - ${firstTile} - ${affected}`;
}

function renderPlayerActions(container, subMenu = null, actingId = 'player') {
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'battle-actions-grid';

    const actor = (actingId === 'player') ? gameState.player : gameState.roster[actingId];
    const hasAction = gameState.combat.actionsRemaining > 0;
    const hasBonus = gameState.combat.bonusActionsRemaining > 0;
    setBattleActionPreview();

    if (subMenu === 'attack') {
        setBattleActionPreview('Choose a creature to attack. Positions are shown by tile coordinates.');
        gameState.combat.enemies.forEach(enemy => {
            if (enemy.hp <= 0) return;
            grid.appendChild(createActionButton(enemy.name, 'swords', () => performAttack(enemy.uniqueId, actingId), 'primary'));
        });
        grid.appendChild(createActionButton('Back', 'arrow_back', () => renderPlayerActions(container, null, actingId), 'flee'));
    } else if (subMenu === 'spells') {
        setBattleActionPreview('Choose a spell. Area spells now preview legal tiles before you confirm them.');
        const spellList = getActorCastableSpells(actor, { combatOnly: true }).filter((spellId) => (spells[spellId]?.castingTime || 'action') !== 'reaction');
        spellList.forEach(spellId => {
            const spell = spells[spellId];
            if (!spell) return;
            const cost = spell.castingTime || 'action';
            const canCast = (cost === 'action' && hasAction) || (cost === 'bonus' && hasBonus);

            const hasSlots = spell.level === 0 || (actor.currentSlots[spell.level] && actor.currentSlots[spell.level] > 0);
            grid.appendChild(createActionButton(spell.name, 'auto_stories', () => {
                 renderPlayerActions(container, { type: 'spell_target', spellId: spellId }, actingId);
            }, '', !hasSlots || !canCast));
        });
        grid.appendChild(createActionButton('Back', 'arrow_back', () => renderPlayerActions(container, null, actingId), 'flee'));
    } else if (subMenu && subMenu.type === 'spell_preview') {
        const preview = getSpellTargetingPreview(actingId, subMenu.spellId, subMenu.selection);
        setBattleActionPreview(preview.summary);
        grid.appendChild(createActionButton(`Confirm ${spells[subMenu.spellId].name}`, 'check_circle', () => performCastSpell(subMenu.spellId, subMenu.selection, actingId), 'primary', !preview.valid || (preview.targeting.side === 'enemy' && preview.affectedNames.length === 0)));
        (preview.affectedNames || []).forEach((name) => {
            grid.appendChild(createActionButton(name, 'flare', () => {}, '', true));
        });
        grid.appendChild(createActionButton('Back', 'arrow_back', () => renderPlayerActions(container, { type: 'spell_target', spellId: subMenu.spellId }, actingId), 'flee'));
    } else if (subMenu && subMenu.type === 'spell_target') {
        const spell = spells[subMenu.spellId];
        const targeting = getSpellTargetingConfig(spell);
        if (targeting.type === 'template' && targeting.requiresFacing) {
            setBattleActionPreview(`Choose a facing for ${spell.name}. Each preview lists the tiles and creatures that would be caught in the effect.`);
            ['north', 'east', 'south', 'west'].forEach((facing) => {
                const preview = getSpellTargetingPreview(actingId, subMenu.spellId, { facing });
                grid.appendChild(createActionButton(
                    getPreviewButtonLabel(preview, facing[0].toUpperCase() + facing.slice(1)),
                    'explore',
                    () => renderPlayerActions(container, { type: 'spell_preview', spellId: subMenu.spellId, selection: { facing } }, actingId),
                    '',
                    !preview.valid
                ));
            });
        } else if (targeting.type === 'template') {
            setBattleActionPreview(`Choose the center point for ${spell.name}. The preview will show the affected tiles before you commit.`);
            gameState.combat.enemies.forEach(enemy => {
                if (enemy.hp <= 0) return;
                const preview = getSpellTargetingPreview(actingId, subMenu.spellId, { targetId: enemy.uniqueId });
                grid.appendChild(createActionButton(
                    getPreviewButtonLabel(preview, enemy.name),
                    'auto_stories',
                    () => renderPlayerActions(container, { type: 'spell_preview', spellId: subMenu.spellId, selection: { targetId: enemy.uniqueId } }, actingId),
                    'primary',
                    !preview.valid
                ));
            });
        } else if (targeting.side === 'self') {
            grid.appendChild(createActionButton('Self', 'shield', () => performCastSpell(subMenu.spellId, actingId, actingId), 'primary'));
        } else if (spell.type === 'heal' || targeting.side === 'ally') {
            grid.appendChild(createActionButton(`Self`, 'healing', () => performCastSpell(subMenu.spellId, actingId, actingId), 'primary'));
            if (actingId !== 'player') grid.appendChild(createActionButton(gameState.player.name, 'healing', () => performCastSpell(subMenu.spellId, 'player', actingId), 'primary'));
            gameState.party.forEach(pid => {
                if (pid !== actingId) grid.appendChild(createActionButton(gameState.roster[pid].name, 'healing', () => performCastSpell(subMenu.spellId, pid, actingId), 'primary'));
            });
        } else {
            setBattleActionPreview(`Choose a target for ${spell.name}.`);
            gameState.combat.enemies.forEach(enemy => {
                if (enemy.hp <= 0) return;
                grid.appendChild(createActionButton(enemy.name, 'auto_stories', () => performCastSpell(subMenu.spellId, enemy.uniqueId, actingId), 'primary'));
            });
        }
        grid.appendChild(createActionButton('Back', 'arrow_back', () => renderPlayerActions(container, 'spells', actingId), 'flee'));
    } else if (subMenu === 'abilities') {
        // Render Class Features
        if (actorHasStatus(actor, 'prone')) {
            grid.appendChild(createActionButton('Stand Up', 'vertical_align_top', () => performStand(actingId)));
        }
        if (actorHasStatus(actor, 'grappled') || actorHasStatus(actor, 'restrained')) {
            grid.appendChild(createActionButton('Break Free', 'fitness_center', () => performEscape(actingId), '', !hasAction));
        }

        // Cunning Action (Rogue)
        if (actor.level >= 2 && actor.classId === 'rogue') {
             grid.appendChild(createActionButton('Dash (Bonus)', 'directions_run', () => performCunningAction('dash', actingId), '', !hasBonus));
             grid.appendChild(createActionButton('Disengage (Bonus)', 'do_not_step', () => performCunningAction('disengage', actingId), '', !hasBonus));
             grid.appendChild(createActionButton('Hide (Bonus)', 'visibility_off', () => performCunningAction('hide', actingId), '', !hasBonus));
        }

        // Action Surge (Fighter)
        if (actor.level >= 2 && actor.classId === 'fighter') {
            const res = actor.resources['action_surge'];
            const available = res && res.current > 0;
            grid.appendChild(createActionButton('Action Surge', 'bolt', () => performActionSurge(actingId), '', !available));
        }

        // Second Wind (Fighter)
        if (actor.classId === 'fighter') {
            const res = actor.resources['second_wind'];
            const available = res && res.current > 0;
            grid.appendChild(createActionButton('Second Wind', 'healing', () => performAbility('second_wind', actingId), '', !available || !hasBonus));
        }

        if (actor.classId === 'cleric' && actor.level >= 2) {
            const res = actor.resources['channel_divinity'];
            const available = res && res.current > 0;
            grid.appendChild(createActionButton('Channel Divinity', 'flare', () => performAbility('channel_divinity', actingId), '', !available || !hasAction));
        }

        grid.appendChild(createActionButton('Back', 'arrow_back', () => renderPlayerActions(container, null, actingId), 'flee'));
    } else {
        // Main Menu
        const actionSpells = getActorCastableSpells(actor, { combatOnly: true }).filter((spellId) => (spells[spellId]?.castingTime || 'action') !== 'reaction');
        const hasSpells = actionSpells.some((spellId) => {
            const spell = spells[spellId];
            return spell.level === 0 || ((actor.currentSlots?.[spell.level] || 0) > 0);
        });
        const usableInventoryEntries = getInventoryEntries(actingId).filter((entry) => {
            const item = items[entry.itemId];
            return item && (item.type === 'consumable' || item.type === 'scroll');
        });
        const canUseInventory = usableInventoryEntries.some((entry) => {
            const preferredCost = getInventoryUseCost(entry.itemId, actingId);
            if (!gameState.combat.active) return true;
            if (preferredCost === 'bonus' && hasBonus) return true;
            return hasAction;
        });

        grid.appendChild(createActionButton('Attack', 'swords', () => renderPlayerActions(container, 'attack', actingId), 'primary', !hasAction));
        grid.appendChild(createActionButton('Spells', 'auto_stories', () => renderPlayerActions(container, 'spells', actingId), '', !hasSpells));
        grid.appendChild(createActionButton('Abilities', 'star', () => renderPlayerActions(container, 'abilities', actingId)));
        grid.appendChild(createActionButton('Defend', 'shield', () => performDefend(actingId), '', !hasAction));
        grid.appendChild(createActionButton('Items', 'local_drink', () => toggleInventory(true, actingId), '', !canUseInventory));
        grid.appendChild(createActionButton('End Turn', 'hourglass_bottom', performEndTurn, 'flee')); // Manual End Turn
        // Flee is special, uses Action
        // grid.appendChild(createActionButton('Flee', 'directions_run', performFlee, 'flee', !hasAction));
    }

    container.appendChild(grid);
}

// Helper to render party card (needed for updateCombatUI)
function renderPartyCard(p, id, activeId) {
    const isPlayerTurn = (gameState.combat.turnOrder[gameState.combat.turnIndex] === id);
    const token = gameState.combat.grid?.occupied?.[id];
    const positionLabel = token ? `Pos ${token.x},${token.y}` : 'Off-grid';
    const card = document.createElement('div');
    card.className = `party-card ${isPlayerTurn ? 'active-turn' : ''}`;
    
    // Calculate Percentages
    const hpPct = Math.max(0, (p.hp / p.maxHp) * 100);
    const totalSlots = p.spellSlots ? Object.values(p.spellSlots).reduce((a, b) => a + b, 0) : 0;
    const currentSlots = p.currentSlots ? Object.values(p.currentSlots).reduce((a, b) => a + b, 0) : 0;
    const manaPct = totalSlots > 0 ? Math.max(0, (currentSlots / totalSlots) * 100) : 0;

    card.innerHTML = `
        <div class="party-header">
            <div class="party-portrait" style='background-image: url("${p.portrait || DEFAULT_PORTRAIT_PATH}");'></div>
            <div>
                <p class="party-name">${p.name}</p>
                <p class="party-class">Lv. ${p.level} ${classes[p.classId].name}</p>
            </div>
        </div>
        <div>
            <div class="party-bar-label"><span>Health</span><span>${p.hp}/${p.maxHp}</span></div>
            <div class="party-bar-background"><div class="party-bar-fill hp-fill" style="width: ${hpPct}%;"></div></div>
        </div>
        ${totalSlots > 0 ? `
        <div>
            <div class="party-bar-label"><span>Spell Slots</span><span>${currentSlots}/${totalSlots}</span></div>
            <div class="party-bar-background"><div class="party-bar-fill mana-fill" style="width: ${manaPct}%;"></div></div>
        </div>` : ''}
        <div class="party-status">
              ${isPlayerTurn ? `<span class="turn-indicator-text">Your Turn</span>` : ''}
              ${p.hp <= 0 ? `<span class="status-down">Down</span>` : ''}
              <div style="font-size:0.8em; margin-top:4px;">
                  ${positionLabel} | Act: ${gameState.combat.actionsRemaining} | Bns: ${gameState.combat.bonusActionsRemaining} | Move: ${gameState.combat.movementRemaining}
              </div>
          </div>
      `;
    
    // Attach click listener for selection?
    // card.onclick = () => ...
    
    document.getElementById('party-container').appendChild(card);
}

// --- UI Updates ---
function updateStatsUI() {
    const p = gameState.player;
    document.getElementById('char-name').innerText = p.name;
    const classLabel = p.classId ? classes[p.classId].name : "Class";
    const backgroundLabel = p.backgroundId && backgrounds[p.backgroundId] ? backgrounds[p.backgroundId].name : '';
    document.getElementById('char-class').innerText = backgroundLabel ? `${classLabel} / ${backgroundLabel}` : classLabel;

    // Level Up Indicator
    const levelEl = document.getElementById('char-level');
    if (gameState.pendingLevelUp) {
        levelEl.innerText = `Lvl ${p.level} (UP!)`;
        levelEl.style.color = 'gold';
        levelEl.style.cursor = 'pointer';
        levelEl.classList.add('pulse-animation'); // Assuming CSS handles this or just color is enough
    } else {
        levelEl.innerText = `Lvl ${p.level}`;
        levelEl.style.color = '';
        levelEl.style.cursor = 'default';
        levelEl.classList.remove('pulse-animation');
    }

    document.getElementById('char-ac').innerText = `AC ${getPlayerAC(gameState.player)}`;
    document.getElementById('char-time').innerText = getTimelineLabel();

    const weapon = p.equipped.weapon ? items[p.equipped.weapon] : null;
    const armor = p.equipped.armor ? items[p.equipped.armor] : null;
    const shield = p.equipped.shield ? items[p.equipped.shield] : null;
    const weaponDetail = weapon ? `${weapon.damage} ${weapon.modifier ? `(${weapon.modifier})` : ''}`.trim() : '1d2 (STR)';
    const armorDetail = armor
        ? `${armor.armorType || 'armor'} AC ${armor.acBase}${shield ? ` + ${shield.name}` : ''}`
        : (shield ? `Unarmored + ${shield.name}` : 'base 10 + DEX');
    document.getElementById('char-weapon').innerText = `Weapon: ${weapon ? weapon.name : 'Unarmed'} · ${weaponDetail}`;
    document.getElementById('char-armor').innerText = `Armor: ${armor ? armor.name : 'None'} · ${armorDetail}`;

    const hpPct = Math.max(0, (p.hp / p.maxHp) * 100);
    document.getElementById('hp-bar-fill').style.width = `${hpPct}%`;
    document.getElementById('hp-text').innerText = `HP: ${p.hp}/${p.maxHp}`;

    const xpPct = Math.max(0, (p.xp / p.xpNext) * 100);
    document.getElementById('xp-bar-fill').style.width = `${xpPct}%`;
    document.getElementById('xp-text').innerText = `XP: ${p.xp}/${p.xpNext}`;
}


// ... (Rest of existing functions: performLongRest, toggleInventory, etc. UNCHANGED, but ensuring performLongRest resets new resources) ...

function performLongRest() {
    if (gameState.combat.active) {
        logMessage("Cannot rest during combat!", "check-fail");
        return;
    }
    return gsPerformLongRest();
}

function performShortRest() {
    if (gameState.combat.active) {
        logMessage("Cannot rest during combat!", "check-fail");
        return 0;
    }
    return gsPerformShortRest();
}

// ... (Standard helper functions remain) ...
export function loadGame() {
    if (loadGameData()) {
        gameState.story = ensureStoryState(gameState.story);
        logMessage("Game Loaded.", "system");
        updateStatsUI();
        goToScene(gameState.currentSceneId);
        // Ensure character creation is hidden
        document.getElementById('char-creation-modal').classList.add('hidden');
        document.getElementById('start-menu').classList.add('hidden');
        return true;
    } else {
        // No save file, go to character creation
        showStartMenu();
        return false;
    }
}

// --- Inventory System Update ---

function toggleInventory(forceOpen = null, characterId = 'player') {
    const modal = document.getElementById('inventory-modal');
    const list = document.getElementById('inventory-list');
    const charSelect = document.getElementById('inventory-character-select');
    const categoryTabs = document.getElementById('inventory-category-tabs');
    const equipmentPanel = document.getElementById('inventory-equipment-panel');
    const detailPanel = document.getElementById('inventory-detail');

    const isOpen = !modal.classList.contains('hidden');

    if (forceOpen === false || (forceOpen === null && isOpen)) {
        modal.classList.add('hidden');
        list.innerHTML = '';
        charSelect.innerHTML = '';
        categoryTabs.innerHTML = '';
        equipmentPanel.innerHTML = '';
        detailPanel.innerHTML = '<p>Select an item to inspect it.</p>';
        modal.dataset.activeCharacter = '';
        modal.dataset.activeCategory = 'all';
        modal.dataset.activeItemId = '';
        return;
    }

    const availableCharacters = [
        { id: 'player', name: gameState.player.name || 'You' },
        ...gameState.party
            .filter(pid => !!gameState.roster[pid])
            .map(pid => ({ id: pid, name: gameState.roster[pid].name || 'Companion' }))
    ];

    if (!availableCharacters.some(c => c.id === characterId)) {
        characterId = availableCharacters[0] ? availableCharacters[0].id : 'player';
    }

    const logInventoryMessage = (msg, type = 'system') => {
        if (gameState.combat.active) {
            logToBattle(msg, type);
        } else {
            logMessage(msg, type);
        }
    };

    const hasActionAvailable = () => {
        if (!gameState.combat.active) return true;
        if (gameState.combat.actionsRemaining <= 0) {
            logToBattle('No Action remaining!', 'check-fail');
            return false;
        }
        return true;
    };

    const spendAction = () => {
        if (!gameState.combat.active) return;
        gameState.combat.actionsRemaining = Math.max(0, gameState.combat.actionsRemaining - 1);
        updateCombatUI(characterId);
    };

    const getAvailableUseCost = (itemId, targetId) => {
        if (!gameState.combat.active) return 'free';
        const preferredCost = getInventoryUseCost(itemId, targetId);
        if (preferredCost === 'bonus' && gameState.combat.bonusActionsRemaining > 0) return 'bonus';
        if (gameState.combat.actionsRemaining > 0) return 'action';
        if (preferredCost === 'bonus' && gameState.combat.bonusActionsRemaining > 0) return 'bonus';
        return null;
    };

    const canUseInventoryItemNow = (itemId, targetId) => !!getAvailableUseCost(itemId, targetId);

    const spendInventoryUseCost = (itemId, targetId) => {
        const cost = getAvailableUseCost(itemId, targetId);
        if (cost === 'free') return 'free';
        if (cost === 'bonus') {
            gameState.combat.bonusActionsRemaining = Math.max(0, gameState.combat.bonusActionsRemaining - 1);
            updateCombatUI(targetId);
            return 'bonus';
        }
        if (cost === 'action') {
            spendAction();
            return 'action';
        }
        return null;
    };

    const renderInventory = (targetId) => {
        characterId = targetId;
        modal.dataset.activeCharacter = targetId;
        const activeCategory = modal.dataset.activeCategory || 'all';

        // Highlight active character tab
        charSelect.querySelectorAll('button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.charId === targetId);
        });

        const character = getCharacterById(targetId);
        list.innerHTML = '';
        equipmentPanel.innerHTML = '';

        if (!character) {
            list.innerHTML = '<p>No character selected.</p>';
            return;
        }

        const renderDetail = (itemId, quantity = null) => {
            if (!itemId || !items[itemId]) {
                detailPanel.innerHTML = '<p>Select an item to inspect it.</p>';
                return;
            }
            const item = items[itemId];
            const equipFailure = ['weapon', 'armor', 'shield'].includes(item.type) ? getItemEquipFailure(itemId, characterId) : null;
            const failureText = equipFailure === 'proficiency'
                ? 'Not proficient with this item.'
                : equipFailure === 'reqStr'
                    ? `Needs STR ${item.reqStr}.`
                    : '';
            detailPanel.innerHTML = `
                <h3>${item.name}${quantity && quantity > 1 ? ` x${quantity}` : ''}</h3>
                <div class="inventory-meta">${getItemRulesText(item)}</div>
                <p>${item.description || 'No description available.'}</p>
                ${failureText ? `<p class="inventory-warning">${failureText}</p>` : ''}
            `;
            modal.dataset.activeItemId = itemId;
        };

        const equippedSlots = [
            { slot: 'weapon', label: 'Weapon' },
            { slot: 'armor', label: 'Armor' },
            { slot: 'shield', label: 'Shield' }
        ];

        equippedSlots.forEach(({ slot, label }) => {
            const slotItemId = character.equipped?.[slot] || null;
            const slotItem = slotItemId ? items[slotItemId] : null;
            const row = document.createElement('div');
            row.className = 'equipment-slot';
            row.innerHTML = `<strong>${label}</strong><span>${slotItem ? slotItem.name : 'Empty'}</span>`;
            if (slotItemId) {
                const unequipBtn = document.createElement('button');
                unequipBtn.innerText = 'Unequip';
                unequipBtn.onclick = () => {
                    if (!hasActionAvailable()) return;
                    unequipItem(slot, targetId);
                    spendAction();
                    logInventoryMessage(`Unequipped ${slotItem.name}.`, 'system');
                    updateStatsUI();
                    renderInventory(targetId);
                    renderDetail(slotItemId);
                };
                row.appendChild(unequipBtn);
            }
            equipmentPanel.appendChild(row);
        });

        const entries = getInventoryEntries(targetId)
            .map((entry) => ({ ...entry, item: items[entry.itemId] }))
            .filter((entry) => !!entry.item)
            .sort((left, right) => left.item.name.localeCompare(right.item.name));

        const presentCategories = ['all', ...new Set(entries.map((entry) => getInventoryCategory(entry.item)))];
        categoryTabs.innerHTML = '';
        presentCategories.forEach((category) => {
            const btn = document.createElement('button');
            btn.innerText = category === 'all' ? 'All' : (ITEM_CATEGORY_LABELS[category] || category);
            btn.className = 'inventory-filter-btn';
            if (category === activeCategory) btn.classList.add('active');
            btn.onclick = () => {
                modal.dataset.activeCategory = category;
                renderInventory(targetId);
            };
            categoryTabs.appendChild(btn);
        });

        const filteredEntries = entries.filter((entry) => activeCategory === 'all' || getInventoryCategory(entry.item) === activeCategory);
        if (!filteredEntries.length) {
            list.innerHTML = '<p>No items in this category.</p>';
            renderDetail(modal.dataset.activeItemId);
            return;
        }

        filteredEntries.forEach(({ itemId, quantity, item }) => {
            const entry = document.createElement('div');
            entry.className = 'inventory-entry';
            const equippedSlot = item.equipmentSlot || null;
            const isEquipped = equippedSlot && character.equipped?.[equippedSlot] === itemId;
            const equipFailure = ['weapon', 'armor', 'shield'].includes(item.type) ? getItemEquipFailure(itemId, targetId) : null;
            const failureText = equipFailure === 'proficiency'
                ? 'Not proficient'
                : equipFailure === 'reqStr'
                    ? `Needs STR ${item.reqStr}`
                    : '';

            entry.onclick = () => renderDetail(itemId, quantity);

            const details = document.createElement('div');
            details.className = 'inventory-details';
            details.innerHTML = `
                <strong>${item.name}</strong>
                ${quantity > 1 ? `<span class="tag">x${quantity}</span>` : ''}
                ${isEquipped ? '<span class="tag">Equipped</span>' : ''}
                <div class="inventory-meta">${getItemRulesText(item)}</div>
                <div class="inventory-desc">${item.description || ''}</div>
                ${failureText ? `<div class="inventory-warning">${failureText}</div>` : ''}
            `;

            const actions = document.createElement('div');
            actions.className = 'inventory-actions';

            if (equippedSlot) {
                const equipBtn = document.createElement('button');
                equipBtn.innerText = isEquipped ? 'Unequip' : 'Equip';
                equipBtn.disabled = (!isEquipped && !!equipFailure) || (gameState.combat.active && gameState.combat.actionsRemaining <= 0);
                equipBtn.onclick = (event) => {
                    event.stopPropagation();
                    if (!hasActionAvailable()) return;
                    const result = isEquipped ? unequipItem(equippedSlot, targetId) : equipItem(itemId, targetId);
                    if (!result?.success) {
                        logInventoryMessage(result?.reason === 'reqStr' ? `Requires STR ${result.value}.` : 'Cannot equip right now.', 'check-fail');
                        return;
                    }
                    spendAction();
                    logInventoryMessage(`${isEquipped ? 'Unequipped' : 'Equipped'} ${item.name}.`, 'system');
                    updateStatsUI();
                    renderInventory(targetId);
                    renderDetail(itemId, quantity);
                };
                actions.appendChild(equipBtn);
            }

            if (item.type === 'consumable' || item.type === 'scroll') {
                const useBtn = document.createElement('button');
                const preferredCost = gameState.combat.active ? getInventoryUseCost(itemId, targetId) : 'free';
                const costLabel = preferredCost === 'bonus' ? 'Use (Bonus)' : (item.type === 'scroll' ? 'Invoke' : 'Use');
                useBtn.innerText = costLabel;
                useBtn.disabled = !canUseInventoryItemNow(itemId, targetId);
                useBtn.onclick = (event) => {
                    event.stopPropagation();
                    const availableCost = getAvailableUseCost(itemId, targetId);
                    if (!availableCost) {
                        logInventoryMessage('No action economy remaining to use that item.', 'check-fail');
                        return;
                    }
                    const result = useConsumable(itemId, targetId);
                    if (!result.success) {
                        logInventoryMessage(result.msg || `Cannot use ${item.name}.`, 'check-fail');
                        return;
                    }
                    const spentCost = spendInventoryUseCost(itemId, targetId);
                    if (!spentCost) {
                        logInventoryMessage('No action economy remaining to use that item.', 'check-fail');
                        return;
                    }
                    logInventoryMessage(result.msg || `Used ${item.name}.`, 'gain');
                    updateStatsUI();
                    renderInventory(targetId);
                    renderDetail(itemId, Math.max(0, quantity - 1));
                };
                actions.appendChild(useBtn);
            }

            const dropBtn = document.createElement('button');
            dropBtn.innerText = quantity > 1 ? 'Drop 1' : 'Drop';
            dropBtn.disabled = gameState.combat.active && gameState.combat.actionsRemaining <= 0;
            dropBtn.onclick = (event) => {
                event.stopPropagation();
                if (!hasActionAvailable()) return;
                if (equippedSlot && character.equipped?.[equippedSlot] === itemId) {
                    unequipItem(equippedSlot, targetId);
                }
                removeItem(itemId, targetId, 1);
                spendAction();
                logInventoryMessage(`Dropped ${item.name}.`, 'system');
                renderInventory(targetId);
                renderDetail(itemId, Math.max(0, quantity - 1));
            };
            actions.appendChild(dropBtn);

            entry.appendChild(details);
            entry.appendChild(actions);
            list.appendChild(entry);
        });

        const preferredItem = entries.find((entry) => entry.itemId === modal.dataset.activeItemId) || filteredEntries[0];
        renderDetail(preferredItem?.itemId, preferredItem?.quantity || null);
    };

    // Build character selection tabs
    charSelect.innerHTML = '';
    availableCharacters.forEach(char => {
        const btn = document.createElement('button');
        btn.dataset.charId = char.id;
        btn.className = 'inventory-char-btn';
        btn.innerText = char.name;
        btn.onclick = () => renderInventory(char.id);
        if (char.id === characterId) btn.classList.add('active');
        charSelect.appendChild(btn);
    });

    renderInventory(characterId);
    modal.classList.remove('hidden');
}

// ... Rest of file (imports, basic functions) ...
// Standard helpers (save, load, etc) are kept.

function toggleQuestLog() {
    const modal = document.getElementById('quest-modal');
    const list = document.getElementById('quest-list');

    if (!modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
        return;
    }

    modal.classList.remove('hidden');
    list.innerHTML = '';

    for (const [qid, qData] of Object.entries(gameState.quests)) {
        if (qData.currentStage > 0) {
            const div = document.createElement('div');
            div.className = 'quest-entry';
            div.innerHTML = `<h4>${qData.title}</h4><p>${qData.stages[qData.currentStage]}</p>`;
            if (qData.completed) div.innerHTML += ` <span style='color:gold'>(Completed)</span>`;
            list.appendChild(div);
        }
    }

    if (list.innerHTML === '') list.innerHTML = '<p>No active quests.</p>';
}

function toggleMenu() {
    const modal = document.getElementById('menu-modal');
    modal.classList.toggle('hidden');
}

function getLongRestAmbushChance() {
    const baseChance = Math.max(0, gameState.threat.level || 0);
    if (!actorHasTrait(gameState.player, 'trance')) {
        return baseChance;
    }
    return Math.max(0, baseChance - 20);
}

function showRestModal() {
    const modal = document.getElementById('rest-modal');
    const warning = document.getElementById('long-rest-warning');
    const shortRestBtn = document.getElementById('btn-short-rest');
    const longRestBtn = document.getElementById('btn-long-rest');
    const ambushChance = getLongRestAmbushChance();

    if (ambushChance > 50) {
        warning.innerText = actorHasTrait(gameState.player, 'trance')
            ? "Resting here is dangerous. Your trance keeps a thinner watch through the danger, but the risk of ambush remains high."
            : "Resting here is dangerous. There is a high chance of being ambushed.";
    } else if (ambushChance > 20) {
        warning.innerText = actorHasTrait(gameState.player, 'trance')
            ? "The area is unsafe. Your trance may catch movement others would sleep through, but something here could still close in."
            : "The area is unsafe. Resting might attract unwanted attention.";
    } else {
        warning.innerText = "";
    }

    shortRestBtn.onclick = () => {
        modal.classList.add('hidden');
        logMessage("You take a short rest.", "system");
        performShortRest();
        advanceNarrativeTime(1, 'You spend an hour catching your breath.', { inSilverthorn: gameState.currentSceneId.startsWith('SCENE_SILVERTHORN') || gameState.currentSceneId.startsWith('SCENE_RUSTY_BLADE') });
        updateStatsUI();
    };

    longRestBtn.onclick = () => {
        modal.classList.add('hidden');
        if (ambushChance > 20 && rollDie(100) <= ambushChance) {
            logMessage("You are ambushed while resting!", "combat");
            startCombat(['fungal_beast'], gameState.currentSceneId, 'SCENE_DEFEAT');
        } else {
            logMessage("You take a long rest.", "system");
            performLongRest();
            if (actorHasTrait(gameState.player, 'trance') && gameState.threat.level > ambushChance) {
                logMessage('Your trance keeps a narrow watch through the night, and the danger passes without closing in.', 'system');
            }
            advanceToNextMorning('The night passes.', { inSilverthorn: gameState.currentSceneId.startsWith('SCENE_SILVERTHORN') || gameState.currentSceneId.startsWith('SCENE_RUSTY_BLADE') });
            updateStatsUI();
        }
    };

    modal.classList.remove('hidden');
}

// --- Level Up UI ---

function showLevelUpModal() {
    const modal = document.getElementById('level-up-modal');
    const levelEl = document.getElementById('lu-level');
    const hpEl = document.getElementById('lu-hp-gain');
    const featuresList = document.getElementById('lu-features-list');
    const subclassSection = document.getElementById('lu-subclass-section');
    const featSection = document.getElementById('lu-feat-section');
    const confirmBtn = document.getElementById('btn-confirm-level-up');

    const nextLevel = gameState.player.level + 1;
    levelEl.innerText = nextLevel;

    // Calculate HP Gain (Fixed average for simplicity in UI, or roll?)
    // Let's do Average + CON
    const cls = classes[gameState.player.classId];
    const hpGain = Math.floor(cls.hitDie / 2) + 1 + gameState.player.modifiers.CON;
    hpEl.innerText = hpGain;

    // Get New Features
    const levelData = cls.progression[nextLevel];
    featuresList.innerHTML = '';
    if (levelData && levelData.features) {
        levelData.features.forEach(featKey => {
            const featDef = featureDefinitions[featKey] || { name: featKey, description: "" };
            const li = document.createElement('li');
            li.innerHTML = `<strong>${featDef.name}</strong>: ${featDef.description}`;
            featuresList.appendChild(li);
        });
    }

    // Subclass Choice
    subclassSection.classList.add('hidden');
    let selectedSubclass = null;
    if (nextLevel === cls.subclassLevel && cls.subclasses) {
        subclassSection.classList.remove('hidden');
        const optionsDiv = document.getElementById('lu-subclass-options');
        optionsDiv.innerHTML = '';

        Object.entries(cls.subclasses).forEach(([key, sub]) => {
            const div = document.createElement('div');
            div.className = 'subclass-option';
            div.style.padding = '5px';
            div.style.border = '1px solid #555';
            div.style.margin = '5px 0';
            div.style.cursor = 'pointer';

            div.innerHTML = `<strong>${sub.name}</strong><p><small>${sub.description}</small></p>`;
            div.onclick = () => {
                document.querySelectorAll('.subclass-option').forEach(d => d.style.borderColor = '#555');
                div.style.borderColor = 'gold';
                selectedSubclass = key;
            };
            optionsDiv.appendChild(div);
        });
    }

    // Ability Score Improvement Choice (Level 4)
    // Note: This is a placeholder for the UI logic.
    // We won't fully implement Feat selection logic here yet, just stat bump.
    featSection.classList.add('hidden');
    if (nextLevel % 4 === 0) { // Standard ASI levels
        featSection.classList.remove('hidden');
        // Populate Selects
        const stats = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
        ['asi-stat-1', 'asi-stat-2'].forEach(id => {
            const sel = document.getElementById(id);
            sel.innerHTML = '';
            stats.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s;
                opt.innerText = s;
                sel.appendChild(opt);
            });
        });
    }

    modal.classList.remove('hidden');

    confirmBtn.onclick = () => {
        if (nextLevel === cls.subclassLevel && cls.subclasses && !selectedSubclass) {
            alert("You must choose a subclass.");
            return;
        }

        // Apply Level Up
        gameState.player.level = nextLevel;
        gameState.player.xpNext = nextLevel * 300; // Simple scaling
        gameState.player.maxHp += hpGain;
        gameState.player.hp += hpGain;

        if (levelData.proficiencyBonus) gameState.player.proficiencyBonus = levelData.proficiencyBonus;

        // Apply Subclass
        if (selectedSubclass) {
            gameState.player.subclassId = selectedSubclass;
            logMessage(`You have chosen the path of the ${cls.subclasses[selectedSubclass].name}.`, "gain");
        }

        // Apply ASI
        if (nextLevel % 4 === 0) {
            const s1 = document.getElementById('asi-stat-1').value;
            const s2 = document.getElementById('asi-stat-2').value;
            gameState.player.mechanics.permanentAbilityBonuses[s1] = (gameState.player.mechanics.permanentAbilityBonuses[s1] || 0) + 1;
            gameState.player.mechanics.permanentAbilityBonuses[s2] = (gameState.player.mechanics.permanentAbilityBonuses[s2] || 0) + 1;
            logMessage(`Increased ${s1} and ${s2} by 1.`, "gain");
        }

        // Unlock Resources (e.g. Action Surge)
        if (levelData.features) {
            levelData.features.forEach(f => {
                if (f === 'action_surge') gameState.player.resources['action_surge'] = { current: 1, max: 1 };
                if (f === 'channel_divinity') gameState.player.resources['channel_divinity'] = { current: 1, max: 1 };
            });
        }

        // Update Spell Slots
        if (levelData.spellSlots) {
             gameState.player.spellSlots = { ...levelData.spellSlots };
             gameState.player.currentSlots = { ...levelData.spellSlots }; // Refresh on level up
        }

        syncCharacterState('player');
        gameState.pendingLevelUp = false;
        modal.classList.add('hidden');
        logMessage(`You are now Level ${nextLevel}!`, "gain");
        updateStatsUI();
    };
}

// ... (Logging functions same as before) ...

function logToMain(msg, type) {
    const logContent = document.getElementById('log-content');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerText = msg;
    logContent.appendChild(entry);
    logContent.scrollTop = logContent.scrollHeight;
    console.log(`[Main Log - ${type}] ${msg}`);
}

function logToBattle(msg, type) {
    const logContent = document.getElementById('battle-log-content');
    const entry = document.createElement('p');
    const typeToColor = {
        'combat': 'text-red-400',
        'gain': 'text-green-400',
        'system': 'text-primary',
        'default': 'text-[#cbc190]'
    };
    msg = msg.replace(/(\w+'s turn)/g, '<span class="font-bold text-primary">$1</span>');
    entry.innerHTML = `<span class="${typeToColor[type] || typeToColor['default']}">${msg}</span>`;

    logContent.appendChild(entry);
    logContent.scrollTop = logContent.scrollHeight;
     console.log(`[Battle Log - ${type}] ${msg}`);
}

function logMessage(msg, type = 'system') {
    if (typeof window !== 'undefined' && typeof window.logMessage === 'function') {
        window.logMessage(msg, type);
        return;
    }
    logToMain(msg, type);
}

if (typeof window !== 'undefined') {
    window.logMessage = logToMain;
}

function getSporefallState() {
    return {
        eoinMet: !!gameState.flags.sporefall_eoin_met,
        eoinTalked: !!gameState.flags.sporefall_eoin_talked,
        eoinGlimpsed: !!gameState.flags.sporefall_eoin_glimpsed,
        eoinFed: !!gameState.flags.sporefall_eoin_fed,
        eoinTreated: !!gameState.flags.sporefall_eoin_treated,
        cathedralLetterFound: !!gameState.flags.sporefall_cathedral_letter_found,
        cathedralVisionSeen: !!gameState.flags.sporefall_cathedral_vision_seen,
        cathedralMasonryRead: !!gameState.flags.sporefall_cathedral_masonry_read,
        homeTrapHint: !!gameState.flags.sporefall_home_trap_hint,
        homeUnlocked: !!gameState.flags.sporefall_home_unlocked,
        journalFound: !!gameState.flags.sporefall_journal_found,
        letterFound: !!gameState.flags.sporefall_letter_found,
        compassFound: !!gameState.flags.sporefall_compass_found,
        bridgeSeen: !!gameState.flags.sporefall_bridge_seen,
        bridgeBodySeen: !!gameState.flags.sporefall_bridge_body_seen,
        northRouteOpen: !!gameState.flags.sporefall_north_route_open
    };
}

let eventTextTimeoutRef;
function showBattleEventText(message, duration = 1500) {
    const eventTextElement = document.getElementById('battle-event-text');
    if (!eventTextElement) return;

    clearTrackedTimeout(eventTextTimeoutRef);

    eventTextElement.innerText = message;
    eventTextElement.classList.add('visible');

    eventTextTimeoutRef = scheduleTrackedTimeout(() => {
        eventTextElement.classList.remove('visible');
        eventTextTimeoutRef = null;
    }, duration);
}

export function bootstrapGame() {
    console.debug("[bootstrapGame] starting");
    const saveState = getStoredSaveState({ cleanupInvalid: true });
    console.debug("[bootstrapGame] saveState =", saveState.status);
    initUI();

    try {
        gameState.story = ensureStoryState(gameState.story);
        showStartMenu();
    } catch (e) {
        console.error("Error during bootstrap/load, starting new game:", e);
        localStorage.removeItem(SAVE_STORAGE_KEY);
        showStartMenu();
    }

    // Signal ready for Playwright tests
    window.gameReady = true;
    console.log("Game bootstrapped and ready.");
}

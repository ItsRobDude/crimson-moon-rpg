import { races } from './data/races.js';
import { classes, featureDefinitions } from './data/classes.js';
import { items } from './data/items.js';
import { quests } from './data/quests.js';
import { scenes } from './data/scenes.js';
import { enemies } from './data/enemies.js';
import { spells } from './data/spells.js';
import { locations } from './data/locations.js';
import { travelEvents } from './data/travelEvents.js';
import { shops } from './data/shops.js';
import { npcs } from './data/npcs.js';
import { companions } from './data/companions.js';
import { factions } from './data/factions.js';
import { gameState, initializeNewGame, updateQuestStage, addGold, spendGold, gainXp, equipItem, useConsumable, applyStatusEffect, hasStatusEffect, tickStatusEffects, discoverLocation, isLocationDiscovered, addItem, changeRelationship, changeReputation, getRelationship, getReputation, adjustThreat, clearTransientThreat, recordAmbientEvent, addMapPin, removeMapPin, getNpcStatus, unequipItem, syncPartyLevels, saveGame, loadGame as loadGameData, removeItem, advanceTime, getTimelineLabel, getTimeSlotLabel, getSceneMemory, setSceneMemory, performShortRest as gsPerformShortRest, performLongRest as gsPerformLongRest, syncCharacterState } from './data/gameState.js';
import { CANONICAL_START_SCENE, ensureStoryState, getLocationStoryRequirement, getLocationUnlockHint, meetsStoryRequirement, storyActs, storyEvents, syncStoryStateForScene } from './data/storyTimeline.js';
import { addEffectToActor, removeEffectFromActor } from './data/mechanics.js';
import { rollDiceExpression, rollSkillCheck, rollSavingThrow, rollDie, rollAttack, rollInitiative, getAbilityMod, generateScaledStats, getPlayerAC } from './rules.js';
import { initCombatSystem, startCombat, performAttack, performCastSpell, performAbility, performDefend, performFlee, performEndTurn, performActionSurge, performCunningAction, uiHooks } from './combat.js';

export function getCharacterById(characterId) {
    if (characterId === 'player') {
        return gameState.player;
    }
    return gameState.roster[characterId];
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
        if (!localStorage.getItem('crimson_moon_save')) {
            logMessage('No existing save found. Choose Start to begin a new campaign.', 'system');
            return;
        }
        loadGame();
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
    chosenSpells: []
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
    const hasSave = !!localStorage.getItem('crimson_moon_save');

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

    window.setTimeout(() => {
        setStartMenuStatus('If the window stays open, close this tab or app window to exit.');
    }, 250);
}

function resetCharacterCreationState() {
    ccState = {
        baseStats: { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 },
        chosenSkills: [],
        chosenSpells: []
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
    localStorage.removeItem('crimson_moon_save');
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

function advanceNarrativeTime(steps = 1, reason = '', context = {}) {
    if (!steps || steps < 1) return;
    const result = advanceTime(steps, context);
    logMessage(getTimeAdvanceText(result, reason), 'system');
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
            ? 'Lanterns are being lit and the watch has started calling the evening curfew.'
            : time.isNight
                ? 'Most respectable shutters are closed, and the city watch has taken over the streets.'
                : 'Silverthorn still feels ordered, but the mood under the surface is tight and watchful.';

        scene.text = `${baseScene.text} It is ${time.timelineLabel}. ${curfewBeat}`;
        scene.choices = [
            createChoice(time.isNight ? 'See if Alderic still receives visitors' : "Return to Alderic's chamber", 'SCENE_ALDERIC_CHAMBER_RETURN'),
            createChoice('Walk to the market district', 'SCENE_SILVERTHORN_MARKET', { timeAdvance: 1, timeReason: 'You make your way across the city.', inSilverthorn: true }),
            createChoice('Visit the General Store', 'SCENE_SILVERTHORN_GENERAL_STORE', { timeAdvance: 1, timeReason: 'You stop to resupply.', inSilverthorn: true }),
            createChoice('Enter The Rusty Blade', 'SCENE_RUSTY_BLADE_INN', { timeAdvance: 1, timeReason: 'You spend time in the inn.', inSilverthorn: true }),
            createChoice('Stop at the Temple of Dawn', 'SCENE_SILVERTHORN_TEMPLE', { timeAdvance: 1, timeReason: 'You make a detour to the temple.', inSilverthorn: true }),
            createChoice('Read the notice board', 'SCENE_SILVERTHORN_NOTICE_BOARD', { timeAdvance: 1, timeReason: 'You spend a while reading the latest postings.', inSilverthorn: true }),
            createChoice('Head for the city gates', 'SCENE_SILVERTHORN_GATES', { timeAdvance: 1, timeReason: 'You cross Silverthorn toward the eastern gate.', inSilverthorn: true })
        ];
        return scene;
    }

    if (sceneId === 'SCENE_ALDERIC_CHAMBER_RETURN') {
        if (time.isNight) {
            scene.text = "A chamberlain meets you outside Alderic's rooms and bows with practiced restraint. 'The prince has retired and will not receive visitors tonight. If the matter can wait, return in the morning. If it cannot, take it to the gate or to the watch.'";
            scene.choices = [
                createChoice('Return to the city center', 'SCENE_HUB_SILVERTHORN')
            ];
            return scene;
        }

        scene.text = `${baseScene.text} It is ${time.timelineLabel}, and he seems more interested in dispatches than conversation.`;
        scene.choices = [
            createChoice('Ask him to restate the mission.', 'SCENE_ALDERIC_MISSION_REMINDER'),
            createChoice('Leave the chamber again.', 'SCENE_HUB_SILVERTHORN')
        ];
        return scene;
    }

    if (sceneId === 'SCENE_ALDERIC_MISSION_REMINDER') {
        scene.text = `Alderic's tone is clipped, as though reciting a report he has already given twice. 'Whisperwood. Learn what caused the corruption. Destroy it if you can. Use the city while you have it, then take the eastern road through Shadowmire.' It is ${time.timelineLabel}.`;
        scene.choices = [
            createChoice("Leave Alderic's chamber.", 'SCENE_HUB_SILVERTHORN')
        ];
        return scene;
    }

    if (sceneId === 'SCENE_SILVERTHORN_MARKET') {
        if (time.isNight) {
            scene.text = "The market district is mostly shuttered for the night. A few guttering lanterns still burn, the smell of stale ale drifts from The Rusty Blade, and the last of the laborers are dragging carts under awnings before curfew tightens further.";
            scene.choices = [
                createChoice('Enter The Rusty Blade', 'SCENE_RUSTY_BLADE_INN', { timeAdvance: 1, timeReason: 'You spend a while in the inn.', inSilverthorn: true }),
                createChoice('Return to City Center', 'SCENE_HUB_SILVERTHORN')
            ];
            return scene;
        }

        const marketMood = time.isDusk
            ? 'Merchants are beginning to pack away their goods while buyers hurry through last-minute purchases.'
            : 'The district is still active, with wagon wheels, shouted prices, and runners weaving between stalls.';
        scene.text = `${baseScene.text} ${marketMood}`;
        scene.choices = [
            createChoice('Browse the General Store', 'SCENE_SILVERTHORN_GENERAL_STORE'),
            createChoice(time.isForgeOpen ? 'Visit the blacksmith' : 'Check whether the blacksmith is still open', 'SCENE_SILVERTHORN_BLACKSMITH'),
            createChoice('Step into The Rusty Blade', 'SCENE_RUSTY_BLADE_INN'),
            createChoice('Return to City Center', 'SCENE_HUB_SILVERTHORN')
        ];
        return scene;
    }

    if (sceneId === 'SCENE_SILVERTHORN_GENERAL_STORE') {
        if (time.isNight) {
            scene.text = "The shutters are down and the general store is closed for the night. A chalkboard sign promises it will reopen at first light, but for now only the inn across the district still welcomes customers.";
            scene.type = undefined;
            scene.shopId = undefined;
            scene.choices = [
                createChoice('Return to the market district', 'SCENE_SILVERTHORN_MARKET'),
                createChoice('Go to The Rusty Blade instead', 'SCENE_RUSTY_BLADE_INN'),
                createChoice('Return to City Center', 'SCENE_HUB_SILVERTHORN')
            ];
            return scene;
        }

        if (!getSceneMemory('silverthorn_general_store_seen')) {
            setSceneMemory('silverthorn_general_store_seen', true);
            scene.text = `${baseScene.text} The shopkeeper keeps one ear on the street and mutters that everyone suddenly wants bandages, lamp oil, and antitoxin.`;
        }
        scene.choices = [
            createChoice('Step back into the market district', 'SCENE_SILVERTHORN_MARKET'),
            createChoice('Return to City Center', 'SCENE_HUB_SILVERTHORN')
        ];
        return scene;
    }

    if (sceneId === 'SCENE_SILVERTHORN_BLACKSMITH') {
        if (!time.isForgeOpen) {
            scene.text = time.isDusk
                ? 'The forge has gone quiet for the evening. Apprentices are banking the coals and refusing new commissions until morning.'
                : 'The forge is dark. Only the smell of ash and quenched steel remains, and any serious work will have to wait for dawn.';
            scene.type = undefined;
            scene.shopId = undefined;
            scene.choices = [
                createChoice('Return to the market district', 'SCENE_SILVERTHORN_MARKET'),
                createChoice('Return to City Center', 'SCENE_HUB_SILVERTHORN')
            ];
            return scene;
        }

        if (!getSceneMemory('silverthorn_blacksmith_seen')) {
            setSceneMemory('silverthorn_blacksmith_seen', true);
            scene.text = `${baseScene.text} A smith warns that the eastern road has made buyers of everyone with coin and fear in equal measure.`;
        }
        scene.choices = [
            createChoice('Return to the market district', 'SCENE_SILVERTHORN_MARKET'),
            createChoice('Head back to City Center', 'SCENE_HUB_SILVERTHORN')
        ];
        return scene;
    }

    if (sceneId === 'SCENE_RUSTY_BLADE_INN') {
        const innMood = time.isNight
            ? 'The common room is louder now, with late-shift soldiers and nervous travelers drinking against the curfew.'
            : 'The inn feels like a pressure valve for the whole city, full of half-finished briefings and overheard rumors.';
        scene.text = `${baseScene.text} ${innMood}`;
        scene.choices = [
            createChoice('Take a room and rest', null, { action: 'longRest' }),
            createChoice('Listen for rumors about Whisperwood', 'SCENE_RUSTY_BLADE_RUMORS', { timeAdvance: 1, timeReason: 'You linger over rumors and stray conversations.', inSilverthorn: true }),
            createChoice('Return to the market district', 'SCENE_SILVERTHORN_MARKET')
        ];
        return scene;
    }

    if (sceneId === 'SCENE_RUSTY_BLADE_RUMORS') {
        const heardBefore = !!getSceneMemory('silverthorn_rumors_heard');
        setSceneMemory('silverthorn_rumors_heard', true);
        scene.text = heardBefore
            ? "The rumors are worse on repetition: more travelers missing, more talk of patrols refusing to say what they saw, and more merchants insisting the road changed after sunset. The details vary, but the fear does not."
            : baseScene.text;
        scene.choices = [
            createChoice('Return to the common room', 'SCENE_RUSTY_BLADE_INN'),
            createChoice('Head for the city gates', 'SCENE_SILVERTHORN_GATES')
        ];
        return scene;
    }

    if (sceneId === 'SCENE_SILVERTHORN_TEMPLE') {
        if (!time.isTempleOpen) {
            scene.text = "The main temple doors are barred for the night, though a side shrine remains open for private prayer. Candlelight leaks through the stonework, but the healers and priests are gone from the public hall.";
            scene.choices = [
                createChoice('Offer a quiet prayer at the side shrine', 'SCENE_SILVERTHORN_TEMPLE_PRAYER', { timeAdvance: 1, timeReason: 'You spend a quiet hour in reflection.', inSilverthorn: true }),
                createChoice('Return to City Center', 'SCENE_HUB_SILVERTHORN')
            ];
            return scene;
        }

        scene.text = `${baseScene.text} It is ${time.timelineLabel}, and the place feels like one of the last corners of the city not pretending everything is normal.`;
        scene.choices = [
            createChoice('Speak with the healers about the road ahead', 'SCENE_SILVERTHORN_TEMPLE_COUNSEL', { timeAdvance: 1, timeReason: 'You stay to hear the temple counsel.', inSilverthorn: true }),
            createChoice('Offer a quiet prayer before you depart', 'SCENE_SILVERTHORN_TEMPLE_PRAYER', { timeAdvance: 1, timeReason: 'You spend a quiet hour in reflection.', inSilverthorn: true }),
            createChoice('Return to City Center', 'SCENE_HUB_SILVERTHORN')
        ];
        return scene;
    }

    if (sceneId === 'SCENE_SILVERTHORN_TEMPLE_COUNSEL') {
        setSceneMemory('silverthorn_temple_counsel', true);
        return scene;
    }

    if (sceneId === 'SCENE_SILVERTHORN_TEMPLE_PRAYER') {
        return scene;
    }

    if (sceneId === 'SCENE_SILVERTHORN_NOTICE_BOARD') {
        const boardMood = time.isNight
            ? 'Most people have stopped lingering here, leaving the board to flap quietly in the night breeze.'
            : 'Fresh ink and hastily pinned notices suggest half the city has been trying to make sense of events before the crown can control the message.';
        scene.text = `${baseScene.text} ${boardMood}`;
        scene.choices = [
            createChoice('Read the Whisperwood notices', 'SCENE_SILVERTHORN_NOTICE_WHISPERWOOD'),
            createChoice('Read the city contracts and bounties', 'SCENE_SILVERTHORN_NOTICE_CONTRACTS'),
            createChoice('Return to City Center', 'SCENE_HUB_SILVERTHORN')
        ];
        return scene;
    }

    if (sceneId === 'SCENE_SILVERTHORN_NOTICE_WHISPERWOOD') {
        setSceneMemory('silverthorn_notice_whisperwood', true);
        return scene;
    }

    if (sceneId === 'SCENE_SILVERTHORN_NOTICE_CONTRACTS') {
        return scene;
    }

    if (sceneId === 'SCENE_SILVERTHORN_GATES') {
        const gateMood = time.isNight
            ? 'The gate stands under doubled watch, with fewer departures and harsher questions.'
            : time.isDusk
                ? 'The last approved wagons are being hustled through before the watch locks down the night.'
                : 'Traffic still moves, but every outbound cart is inspected twice.';
        scene.text = `${baseScene.text} ${gateMood}`;
        scene.choices = [
            createChoice('Ask the gate captain about the road', 'SCENE_SILVERTHORN_GATE_CAPTAIN', { timeAdvance: 1, timeReason: 'You spend time getting the latest road intelligence.', inSilverthorn: true }),
            createChoice(time.isNight ? 'Leave Silverthorn despite the hour' : 'Leave Silverthorn for Shadowmire', 'SCENE_TRAVEL_SHADOWMIRE', { timeAdvance: 1, timeReason: 'You finalize your departure and pass beyond the walls.', inSilverthorn: true }),
            createChoice('Return to City Center', 'SCENE_HUB_SILVERTHORN')
        ];
        return scene;
    }

    if (sceneId === 'SCENE_SILVERTHORN_GATE_CAPTAIN') {
        const warnedAlready = !!getSceneMemory('silverthorn_gate_captain_seen');
        setSceneMemory('silverthorn_gate_captain_seen', true);
        scene.text = warnedAlready
            ? "The captain recognizes you immediately. 'Same road, same warning: stay alert, cover your face if the spores turn red, and don't trust how long the forest thinks a mile should be.'"
            : baseScene.text;
        scene.choices = [
            createChoice('Leave Silverthorn now', 'SCENE_TRAVEL_SHADOWMIRE', { timeAdvance: 1, timeReason: 'You leave before the city can hold you any longer.', inSilverthorn: true }),
            createChoice('Return to the gate plaza', 'SCENE_SILVERTHORN_GATES')
        ];
        return scene;
    }

    return scene;
}

function getRuntimeScene(sceneId) {
    const baseScene = scenes[sceneId];
    if (!baseScene) return null;
    if (isSceneInSilverthorn(sceneId)) {
        return buildSilverthornRuntimeScene(sceneId, baseScene);
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

    if (effect.type === 'relationship') {
        changeRelationship(effect.npcId, effect.amount);
        return;
    }

    if (effect.type === 'reputation') {
        changeReputation(effect.factionId, effect.amount);
        return;
    }

    if (effect.type === 'addItem') {
        addItem(effect.itemId, effect.characterId || 'player');
        const item = items[effect.itemId];
        if (item) {
            logMessage(`${source === 'choice' ? 'Received' : 'Found'} ${item.name}.`, 'gain');
        }
        return;
    }

    if (effect.type === 'addGold') {
        addGold(effect.amount || 0);
        logMessage(`Gained ${effect.amount || 0} gold.`, 'gain');
        return;
    }

    if (effect.type === 'flag' && effect.flagId) {
        gameState.flags[effect.flagId] = effect.value !== undefined ? effect.value : true;
        return;
    }

    if (effect.type === 'status' && effect.id) {
        applyStatusEffect(effect.id, effect.duration, effect.characterId || 'player');
        logMessage(`${source === 'choice' ? 'Effect applied' : 'Condition gained'}: ${effect.id}.`, 'system');
        return;
    }

    if (effect.type === 'removeStatus' && effect.id) {
        const characterId = effect.characterId || 'player';
        const actor = characterId === 'player' ? gameState.player : gameState.roster[characterId];
        if (actor?.mechanics?.activeEffects) {
            removeEffectFromActor(actor, effect.id);
            logMessage(`Condition removed: ${effect.id}.`, 'gain');
        }
        return;
    }

    if (effect.type === 'customEffect' && effect.id && effect.modifiers) {
        const characterId = effect.characterId || 'player';
        const actor = characterId === 'player' ? gameState.player : gameState.roster[characterId];
        if (!actor) return;
        addEffectToActor(actor, effect.id, {
            name: effect.name || effect.id,
            source,
            remaining: effect.duration ?? null,
            durationType: effect.durationType || 'scenes',
            modifiers: effect.modifiers
        });
        logMessage(`Effect applied: ${effect.name || effect.id}.`, 'system');
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
    raceSelect.innerHTML = "";
    classSelect.innerHTML = "";
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
    renderAbilityScoreUI();
    raceSelect.onchange = updateCCPreview;
    classSelect.onchange = () => {
        ccState.chosenSkills = [];
        ccState.chosenSpells = [];
        updateCCPreview();
    };
    updateCCPreview();
    document.getElementById('char-creation-modal').classList.remove('hidden');
}

function renderAbilityScoreUI() {
    const container = document.getElementById('cc-abilities-container');
    container.innerHTML = '';
    const standardArray = [15, 14, 13, 12, 10, 8];
    const stats = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
    ccState.baseStats = { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 };
    stats.forEach((stat, index) => {
        const row = document.createElement('div');
        row.className = 'stat-row';
        const label = document.createElement('label');
        label.innerText = stat;
        const select = document.createElement('select');
        standardArray.forEach(val => {
            const opt = document.createElement('option');
            opt.value = val;
            opt.innerText = val;
            if (val === standardArray[index]) opt.selected = true;
            select.appendChild(opt);
        });
        select.onchange = (e) => {
            ccState.baseStats[stat] = parseInt(e.target.value);
            updateCCPreview();
        };
        row.appendChild(label);
        row.appendChild(select);
        container.appendChild(row);
    });
}

function updateCCPreview() {
    const raceKey = document.getElementById('cc-race').value;
    const classKey = document.getElementById('cc-class').value;
    const race = races[raceKey];
    const cls = classes[classKey];
    document.getElementById('cc-race-desc').innerText = race.description;
    document.getElementById('cc-class-desc').innerText = cls.description;
    const finalStats = { ...ccState.baseStats };
    if (race.abilityBonuses) {
        for (const [stat, bonus] of Object.entries(race.abilityBonuses)) {
            if (finalStats[stat]) finalStats[stat] += bonus;
        }
    }
    renderSkillChoices(cls);
    renderSpellChoices(cls);
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
    if (ccState.chosenSkills.length > 0) {
        preview.innerHTML += `<div class="preview-stat highlight"><span>Skills</span></div>`;
        ccState.chosenSkills.forEach(s => {
             preview.innerHTML += `<div class="preview-stat" style="padding-left:10px; font-size:0.8em;">${s}</div>`;
        });
    }
    if (ccState.chosenSpells.length > 0) {
        preview.innerHTML += `<div class="preview-stat highlight"><span>Spells</span></div>`;
        ccState.chosenSpells.forEach(s => {
             const spellName = spells[s] ? spells[s].name : s;
             preview.innerHTML += `<div class="preview-stat" style="padding-left:10px; font-size:0.8em;">${spellName}</div>`;
        });
    }
}

function renderSkillChoices(cls) {
    const container = document.getElementById('cc-skills-container');
    const currentSkills = ccState.chosenSkills;
    container.innerHTML = '';
    const max = 2;
    document.getElementById('cc-skill-count').innerText = max;
    cls.skillProficiencies.forEach(skill => {
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
        label.appendChild(document.createTextNode(" " + skill.charAt(0).toUpperCase() + skill.slice(1)));
        div.appendChild(label);
        container.appendChild(div);
    });
}

function renderSpellChoices(cls) {
    const section = document.getElementById('cc-spells-section');
    const container = document.getElementById('cc-spells-container');
    container.innerHTML = '';
    let availableSpells = [];
    if (document.getElementById('cc-class').value === 'wizard') {
        availableSpells = ['firebolt', 'magic_missile', 'burning_hands', 'cure_wounds'];
    } else if (document.getElementById('cc-class').value === 'cleric') {
        availableSpells = ['cure_wounds'];
    }
    if (availableSpells.length === 0) {
        section.classList.add('hidden');
        ccState.chosenSpells = [];
        return;
    }
    section.classList.remove('hidden');
    const max = 2;
    availableSpells.forEach(spellId => {
        const spell = spells[spellId];
        if (!spell) return;
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.value = spellId;
        if (ccState.chosenSpells.includes(spellId)) input.checked = true;
        input.onchange = (e) => {
            if (e.target.checked) {
                if (ccState.chosenSpells.length < max) {
                    ccState.chosenSpells.push(spellId);
                } else {
                    e.target.checked = false;
                }
            } else {
                ccState.chosenSpells = ccState.chosenSpells.filter(s => s !== spellId);
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
    const cls = classes[classKey];

    // 1) Stat uniqueness check
    const stats = Object.values(ccState.baseStats);
    const uniqueStats = new Set(stats);
    if (uniqueStats.size !== stats.length) {
        alert("Please assign each Standard Array value (15, 14, 13, 12, 10, 8) exactly once.");
        return;
    }

    // 2) Auto-pick skills if none selected (helps Playwright + forgetful players)
    if (ccState.chosenSkills.length === 0 && cls.skillProficiencies?.length) {
        const max = 2; // or derive from class data if you add that later
        ccState.chosenSkills = cls.skillProficiencies.slice(0, max);
    }

    // 3) Auto-pick spells for casters if none selected
    const isCaster = (classKey === 'wizard' || classKey === 'cleric');
    if (isCaster && ccState.chosenSpells.length === 0) {
        let availableSpells = [];
        if (classKey === 'wizard') {
            availableSpells = ['firebolt', 'magic_missile', 'burning_hands', 'cure_wounds'];
        } else if (classKey === 'cleric') {
            availableSpells = ['cure_wounds'];
        }
        const max = 2;
        ccState.chosenSpells = availableSpells.slice(0, max);
    }

    // 4) Initialize state
    initializeNewGame(
        name,
        raceKey,
        classKey,
        ccState.baseStats,
        ccState.chosenSkills,
        ccState.chosenSpells
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
    if (choices) {
        choices.forEach((choice) => {
            if (choice.requires) {
                if (choice.requires.relationship) {
                    const current = getRelationship(choice.requires.relationship.npcId);
                    if (current < (choice.requires.relationship.min || -999)) return;
                }
                if (choice.requires.reputation) {
                    const current = getReputation(choice.requires.reputation.factionId);
                    if (current < (choice.requires.reputation.min || -999)) return;
                }
                if (choice.requires.flag) {
                    if (!gameState.flags[choice.requires.flag]) return;
                }
                if (choice.requires.npcState) {
                    const { id, status } = choice.requires.npcState;
                    if (getNpcStatus(id) !== status) return;
                }
                if (choice.requires.storyEvent) {
                    if (!meetsStoryRequirement(gameState.story, choice.requires.storyEvent)) return;
                }
                if (choice.requires.storyAct) {
                    const currentActId = gameState.story && gameState.story.currentActId;
                    if (Array.isArray(choice.requires.storyAct)) {
                        if (!choice.requires.storyAct.includes(currentActId)) return;
                    } else if (currentActId !== choice.requires.storyAct) {
                        return;
                    }
                }
            }
            const btn = document.createElement('button');
            btn.innerText = choice.text + (choice.cost ? ` (${choice.cost}g)` : "");
            btn.onclick = () => handleChoice(choice);
            choiceContainer.appendChild(btn);
        });
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
        const result = rollSkillCheck(gameState.player, choice.skill);
        const dc = choice.dc;

        logMessage(`Skill Check (${choice.skill}): Rolled ${result.roll} + ${result.modifier} = ${result.total} (DC ${dc})${result.note || ''}`, result.total >= dc ? "check-success" : "check-fail");

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

    container.innerHTML = '';
    goldDisplay.innerText = `Gold: ${gameState.player.gold}`;

    shopDef.items.forEach(itemId => {
        const item = items[itemId];
        if (!item) return;

        const price = getShopPrice(item, shopId);

        const row = document.createElement('div');
        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.alignItems = "center";
        row.style.padding = "8px";
        row.style.borderBottom = "1px solid #444";

        const info = document.createElement('div');
        info.innerHTML = `<strong>${item.name}</strong> (${price}g)<br><small>${item.description}</small>`;

        const btn = document.createElement('button');
        btn.innerText = "Buy";
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
            renderPlayerActions(actionsContainer, null, activeCharacterId);
        } else {
            turnIndicator.textContent = "Waiting...";
        }
    } else {
        const enemy = gameState.combat.enemies.find(e => e.uniqueId === gameState.combat.turnOrder[gameState.combat.turnIndex]);
        turnIndicator.textContent = enemy ? `${enemy.name}'s Turn` : "Enemy's Turn";
    }

    document.getElementById('battle-scene-image').style.backgroundImage = "url('landscapes/battle_placeholder.webp')";
    document.getElementById('battle-scene-main-text').innerText = gameState.combat.sceneText || "The air crackles with tension.";
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

function renderPlayerActions(container, subMenu = null, actingId = 'player') {
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'battle-actions-grid';

    const actor = (actingId === 'player') ? gameState.player : gameState.roster[actingId];
    const hasAction = gameState.combat.actionsRemaining > 0;
    const hasBonus = gameState.combat.bonusActionsRemaining > 0;

    if (subMenu === 'attack') {
        gameState.combat.enemies.forEach(enemy => {
            if (enemy.hp <= 0) return;
            grid.appendChild(createActionButton(enemy.name, 'swords', () => performAttack(enemy.uniqueId, actingId), 'primary'));
        });
        grid.appendChild(createActionButton('Back', 'arrow_back', () => renderPlayerActions(container, null, actingId), 'flee'));
    } else if (subMenu === 'spells') {
        const spellList = actor.knownSpells || [];
        spellList.forEach(spellId => {
            const spell = spells[spellId];
            if (!spell) return;
            // Check casting time (simplified: most are actions, some bonus)
            // For now, assume all spells take an ACTION unless specified
            const cost = 'action';
            const canCast = (cost === 'action' && hasAction) || (cost === 'bonus' && hasBonus);

            const hasSlots = spell.level === 0 || (actor.currentSlots[spell.level] && actor.currentSlots[spell.level] > 0);
            grid.appendChild(createActionButton(spell.name, 'auto_stories', () => {
                 renderPlayerActions(container, { type: 'spell_target', spellId: spellId }, actingId);
            }, '', !hasSlots || !canCast));
        });
        grid.appendChild(createActionButton('Back', 'arrow_back', () => renderPlayerActions(container, null, actingId), 'flee'));
    } else if (subMenu && subMenu.type === 'spell_target') {
        // Targets: Player + Companions + Enemies?
        // For simplicity, "Party" vs "Enemies".
        const spell = spells[subMenu.spellId];
        if (spell.type === 'heal') {
            // Allow targeting self or allies
            grid.appendChild(createActionButton(`Self`, 'healing', () => performCastSpell(subMenu.spellId, actingId, actingId), 'primary'));
            // Add player if actor is companion, and vice versa
            if (actingId !== 'player') grid.appendChild(createActionButton(gameState.player.name, 'healing', () => performCastSpell(subMenu.spellId, 'player', actingId), 'primary'));
            gameState.party.forEach(pid => {
                if (pid !== actingId) grid.appendChild(createActionButton(gameState.roster[pid].name, 'healing', () => performCastSpell(subMenu.spellId, pid, actingId), 'primary'));
            });
        } else {
            gameState.combat.enemies.forEach(enemy => {
                if (enemy.hp <= 0) return;
                grid.appendChild(createActionButton(enemy.name, 'auto_stories', () => performCastSpell(subMenu.spellId, enemy.uniqueId, actingId), 'primary'));
            });
        }
        grid.appendChild(createActionButton('Back', 'arrow_back', () => renderPlayerActions(container, 'spells', actingId), 'flee'));
    } else if (subMenu === 'abilities') {
        // Render Class Features
        // Cunning Action (Rogue)
        if (actor.level >= 2 && actor.classId === 'rogue') {
             grid.appendChild(createActionButton('Dash (Bonus)', 'directions_run', () => performCunningAction('dash', actingId), '', !hasBonus));
             grid.appendChild(createActionButton('Disengage (Bonus)', 'do_not_step', () => performCunningAction('disengage', actingId), '', !hasBonus));
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

        grid.appendChild(createActionButton('Back', 'arrow_back', () => renderPlayerActions(container, null, actingId), 'flee'));
    } else {
        // Main Menu
        const hasSpells = actor.currentSlots && Object.values(actor.currentSlots).some(s => s > 0) || (actor.knownSpells.length > 0); // Include cantrips check

        grid.appendChild(createActionButton('Attack', 'swords', () => renderPlayerActions(container, 'attack', actingId), 'primary', !hasAction));
        grid.appendChild(createActionButton('Spells', 'auto_stories', () => renderPlayerActions(container, 'spells', actingId), '', !hasSpells || !hasAction)); // Assume spells need action
        grid.appendChild(createActionButton('Abilities', 'star', () => renderPlayerActions(container, 'abilities', actingId)));
        grid.appendChild(createActionButton('Defend', 'shield', () => performDefend(actingId), '', !hasAction));
        grid.appendChild(createActionButton('Items', 'local_drink', () => toggleInventory(true, actingId), '', !hasAction)); // Using Item is usually an Action (unless Thief)
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
            <div class="party-portrait" style='background-image: url("${p.portrait || 'portraits/placeholder.png'}");'></div>
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
    document.getElementById('char-class').innerText = p.classId ? classes[p.classId].name : "Class";

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
    const weaponDetail = weapon ? `${weapon.damage} ${weapon.modifier ? `(${weapon.modifier})` : ''}`.trim() : '1d2 (STR)';
    const armorDetail = armor ? `${armor.armorType || 'armor'} AC ${armor.acBase}` : 'base 10 + DEX';
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
    } else {
        // No save file, go to character creation
        showStartMenu();
    }
}

// --- Inventory System Update ---

function toggleInventory(forceOpen = null, characterId = 'player') {
    const modal = document.getElementById('inventory-modal');
    const list = document.getElementById('inventory-list');
    const charSelect = document.getElementById('inventory-character-select');

    const isOpen = !modal.classList.contains('hidden');

    if (forceOpen === false || (forceOpen === null && isOpen)) {
        modal.classList.add('hidden');
        list.innerHTML = '';
        charSelect.innerHTML = '';
        modal.dataset.activeCharacter = '';
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

    const renderInventory = (targetId) => {
        characterId = targetId;
        modal.dataset.activeCharacter = targetId;

        // Highlight active character tab
        charSelect.querySelectorAll('button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.charId === targetId);
        });

        const character = getCharacterById(targetId);
        list.innerHTML = '';

        if (!character) {
            list.innerHTML = '<p>No character selected.</p>';
            return;
        }

        if (!character.inventory || character.inventory.length === 0) {
            list.innerHTML = '<p>No items.</p>';
            return;
        }

        character.inventory.forEach(itemId => {
            const item = items[itemId];
            if (!item) return;

            const entry = document.createElement('div');
            entry.className = 'inventory-entry';

            const equippedSlot = item.type === 'weapon' ? 'weapon' : (item.type === 'armor' ? 'armor' : null);
            const isEquipped = equippedSlot && character.equipped && character.equipped[equippedSlot] === itemId;

            const details = document.createElement('div');
            details.className = 'inventory-details';
            details.innerHTML = `
                <strong>${item.name}</strong>
                ${isEquipped ? '<span class="tag">Equipped</span>' : ''}
                <div class="inventory-desc">${item.description || ''}</div>
            `;

            const actions = document.createElement('div');
            actions.className = 'inventory-actions';

            if (item.type === 'weapon' || item.type === 'armor') {
                const equipBtn = document.createElement('button');
                equipBtn.innerText = isEquipped ? 'Unequip' : 'Equip';
                equipBtn.disabled = gameState.combat.active && gameState.combat.actionsRemaining <= 0;
                equipBtn.onclick = () => {
                    const char = getCharacterById(characterId);
                    const slot = item.type === 'weapon' ? 'weapon' : 'armor';
                    const currentlyEquipped = char && char.equipped && char.equipped[slot] === itemId;

                    if (!hasActionAvailable()) return;

                    let result;
                    if (currentlyEquipped) {
                        result = unequipItem(slot, characterId);
                    } else {
                        result = equipItem(itemId, characterId);
                    }

                    if (!result || !result.success) {
                        const reason = result && result.reason === 'reqStr' ? `Requires STR ${result.value}.` : 'Cannot equip right now.';
                        logInventoryMessage(reason, 'check-fail');
                        return;
                    }

                    spendAction();
                    logInventoryMessage(`${currentlyEquipped ? 'Unequipped' : 'Equipped'} ${item.name}.`, 'system');
                    updateStatsUI();
                    renderInventory(characterId);
                };
                actions.appendChild(equipBtn);
            }

            if (item.type === 'consumable') {
                const useBtn = document.createElement('button');
                useBtn.innerText = 'Use';
                useBtn.disabled = gameState.combat.active && gameState.combat.actionsRemaining <= 0;
                useBtn.onclick = () => {
                    if (!hasActionAvailable()) return;
                    const result = useConsumable(itemId, characterId);
                    if (!result.success) {
                        logInventoryMessage(result.msg || `Cannot use ${item.name}.`, 'check-fail');
                        return;
                    }
                    spendAction();
                    logInventoryMessage(result.msg || `Used ${item.name}.`, 'gain');
                    updateStatsUI();
                    renderInventory(characterId);
                };
                actions.appendChild(useBtn);
            }

            const dropBtn = document.createElement('button');
            dropBtn.innerText = 'Drop';
            dropBtn.disabled = gameState.combat.active && gameState.combat.actionsRemaining <= 0;
            dropBtn.onclick = () => {
                if (!hasActionAvailable()) return;

                // If equipped, unequip first to avoid dangling references
                if (equippedSlot && character.equipped && character.equipped[equippedSlot] === itemId) {
                    unequipItem(equippedSlot, characterId);
                }

                removeItem(itemId, characterId);
                spendAction();
                logInventoryMessage(`Dropped ${item.name}.`, 'system');
                renderInventory(characterId);
            };
            actions.appendChild(dropBtn);

            entry.appendChild(details);
            entry.appendChild(actions);
            list.appendChild(entry);
        });
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

function showRestModal() {
    const modal = document.getElementById('rest-modal');
    const warning = document.getElementById('long-rest-warning');
    const shortRestBtn = document.getElementById('btn-short-rest');
    const longRestBtn = document.getElementById('btn-long-rest');

    if (gameState.threat.level > 50) {
        warning.innerText = "Resting here is dangerous. There is a high chance of being ambushed.";
    } else if (gameState.threat.level > 20) {
        warning.innerText = "The area is unsafe. Resting might attract unwanted attention.";
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
        if (gameState.threat.level > 20 && rollDie(100) <= gameState.threat.level) {
            logMessage("You are ambushed while resting!", "combat");
            startCombat(['fungal_beast'], gameState.currentSceneId, 'SCENE_DEFEAT');
        } else {
            logMessage("You take a long rest.", "system");
            performLongRest();
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
    if (nextLevel === 3 && cls.subclasses) {
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
        if (nextLevel === 3 && cls.subclasses && !selectedSubclass) {
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
                // Add others
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

window.logMessage = logToMain;

let eventTextTimeoutRef;
function showBattleEventText(message, duration = 1500) {
    const eventTextElement = document.getElementById('battle-event-text');
    if (!eventTextElement) return;

    clearTimeout(eventTextTimeoutRef);

    eventTextElement.innerText = message;
    eventTextElement.classList.add('visible');

    eventTextTimeoutRef = setTimeout(() => {
        eventTextElement.classList.remove('visible');
    }, duration);
}

export function bootstrapGame() {
    console.debug("[bootstrapGame] starting");
    console.debug("[bootstrapGame] hasSave =", !!localStorage.getItem('crimson_moon_save'));
    initUI();

    try {
        gameState.story = ensureStoryState(gameState.story);
        showStartMenu();
    } catch (e) {
        console.error("Error during bootstrap/load, starting new game:", e);
        localStorage.removeItem('crimson_moon_save');
        showStartMenu();
    }

    // Signal ready for Playwright tests
    window.gameReady = true;
    console.log("Game bootstrapped and ready.");
}

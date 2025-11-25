import { races } from './data/races.js';
import { classes, featureDefinitions } from './data/classes.js';
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
import { companions } from './data/companions.js';
import { factions } from './data/factions.js';
import { gameState, initializeNewGame, updateQuestStage, addGold, spendGold, gainXp, equipItem, useConsumable, applyStatusEffect, hasStatusEffect, tickStatusEffects, discoverLocation, isLocationDiscovered, addItem, changeRelationship, changeReputation, getRelationship, getReputation, adjustThreat, clearTransientThreat, recordAmbientEvent, addMapPin, removeMapPin, getNpcStatus, unequipItem, syncPartyLevels } from './data/gameState.js';
import { rollDiceExpression, rollSkillCheck, rollSavingThrow, rollDie, rollAttack, rollInitiative, getAbilityMod, generateScaledStats } from './rules.js';

// ... (Existing exports and initUI) ...
export function initUI() {
    window.goToScene = goToScene;
    window.showCharacterCreation = showCharacterCreation;
    document.getElementById('btn-inventory').onclick = () => toggleInventory();
    document.getElementById('btn-quests').onclick = toggleQuestLog;
    document.getElementById('btn-menu').onclick = toggleMenu;
    document.getElementById('btn-map').onclick = toggleMap;
    document.getElementById('btn-codex').onclick = () => toggleCodex('people');
    document.getElementById('btn-codex-people').onclick = () => toggleCodex('people');
    document.getElementById('btn-codex-factions').onclick = () => toggleCodex('factions');

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

    document.getElementById('btn-start-game').onclick = finishCharacterCreation;

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

export function showCharacterCreation() {
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

    const stats = Object.values(ccState.baseStats);
    const uniqueStats = new Set(stats);
    if (uniqueStats.size !== stats.length) {
        alert("Please assign each Standard Array value (15, 14, 13, 12, 10, 8) exactly once.");
        return;
    }

    if (ccState.chosenSkills.length === 0) {
        alert("Please choose your skills.");
        return;
    }
    const isCaster = (classKey === 'wizard' || classKey === 'cleric');
    if (isCaster && ccState.chosenSpells.length === 0) {
        alert("Please choose your starting spells.");
        return;
    }
    initializeNewGame(name, raceKey, classKey, ccState.baseStats, ccState.chosenSkills, ccState.chosenSpells);
    document.getElementById('char-creation-modal').classList.add('hidden');
    updateStatsUI();
    goToScene(gameState.currentSceneId);
    logMessage(`Character ${name} created. Welcome to Silverthorn.`, "system");
}

function goToScene(sceneId) {
    const scene = scenes[sceneId];
    if (!scene) { console.error("Scene not found:", sceneId); return; }

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
            if (scene.onEnter.setFlag) {
                gameState.flags[scene.onEnter.setFlag] = true;
                if (scene.onEnter.setFlag === 'aodhan_dead') {
                    setNpcStatus('aodhan', 'dead');
                }
            }
        }
    }

    triggerAmbientByThreat(scene.location);

    if (scene.type === 'combat') {
        document.getElementById('shop-panel').classList.add('hidden');
        startCombat(scene.enemies, scene.winScene, scene.loseScene);
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
            }
            const btn = document.createElement('button');
            btn.innerText = choice.text + (choice.cost ? ` (${choice.cost}g)` : "");
            btn.onclick = () => handleChoice(choice);
            choiceContainer.appendChild(btn);
        });
    }
}

function handleChoice(choice) {
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
        choice.effects.forEach(effect => {
            if (effect.type === 'relationship') changeRelationship(effect.npcId, effect.amount);
            if (effect.type === 'reputation') changeReputation(effect.factionId, effect.amount);
        });
    }
    if (!choice.type) { if (choice.nextScene) goToScene(choice.nextScene); return; }

    if (choice.type === 'skillCheck') {
        const result = rollSkillCheck(gameState, choice.skill);
        const dc = choice.dc;

        logMessage(`Skill Check (${choice.skill}): Rolled ${result.roll} + ${result.modifier} = ${result.total} (DC ${dc})${result.note || ''}`, result.total >= dc ? "check-success" : "check-fail");

        if (result.total >= dc) {
            if (choice.skill === 'stealth') {
                adjustThreat(-5, 'moving quietly');
                clearTransientThreat();
            }
            if (choice.onSuccess && choice.onSuccess.addGold) {
                addGold(choice.onSuccess.addGold);
            }
            document.getElementById('narrative-text').innerText = choice.successText;
            if (choice.nextSceneSuccess) renderContinueButton(choice.nextSceneSuccess);
        } else {
            if (choice.skill === 'stealth' || choice.skill === 'acrobatics') {
                adjustThreat(5, 'noise draws attention');
            }
            document.getElementById('narrative-text').innerText = choice.failText;
            if (choice.nextSceneFail) renderContinueButton(choice.nextSceneFail);
        }
    } else if (choice.type === 'save') {
        const result = rollSavingThrow(gameState, choice.ability);
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

export function startCombat(combatantIds, winScene, loseScene) {
    const sceneContainer = document.getElementById('scene-container');
    if (sceneContainer) sceneContainer.classList.add('hidden');

    const battleScreen = document.getElementById('battle-screen');
    if (battleScreen) battleScreen.classList.remove('hidden');

    window.logMessage = logToBattle;

    const currentScene = scenes[gameState.currentSceneId];

    const enemiesList = combatantIds.map((id, index) => {
        let combatantData;
        let isNpc = false;

        if (npcs[id] && npcs[id].combatStats) {
            combatantData = generateScaledStats(npcs[id].combatStats, gameState.player.level);
            combatantData.name = npcs[id].name;
            combatantData.portrait = npcs[id].portrait;
            isNpc = true;
        } else {
            combatantData = enemies[id];
        }

        if (!combatantData) {
            console.error(`Combatant data for ID "${id}" not found.`);
            return null;
        }

        const primaryAttack = combatantData.actions ? combatantData.actions.find(a => a.type === 'attack') : null;

        return {
            id: id,
            name: combatantData.name,
            hp: combatantData.hp,
            maxHp: combatantData.hp,
            ac: combatantData.ac,
            attackBonus: isNpc ? (primaryAttack ? primaryAttack.toHit : 0) : combatantData.attackBonus,
            damage: isNpc ? (primaryAttack ? primaryAttack.damage : "1d4") : combatantData.damage,
            portrait: combatantData.portrait || 'portraits/placeholder.png',
            initiative: 0,
            statusEffects: [],
            uniqueId: `${id}_${index}`,
            intent: "",
            fullStats: isNpc ? combatantData : null
        };
    }).filter(c => c !== null);

    gameState.combat = {
        active: true,
        enemies: enemiesList,
        turnOrder: [],
        turnIndex: 0,
        round: 1,
        winSceneId: winScene,
        loseSceneId: loseScene,
        playerDefending: false,
        sceneText: currentScene.text,
        actionsRemaining: 1,      // Init for player
        bonusActionsRemaining: 1
    };

    logMessage(`Combat started!`, "combat");

    const initiatives = [];
    // Player
    const playerInit = rollInitiative(gameState, 'player');
    initiatives.push({ type: 'player', id: 'player', initiative: playerInit.total });
    logMessage(`You rolled ${playerInit.total} for initiative.`, "system");

    // Companions
    gameState.party.forEach(compId => {
        // Simplify companion initiative (use player's roll or just flat d20 + dex)
        const char = gameState.roster[compId];
        const dexMod = char.modifiers.DEX;
        const roll = rollDie(20) + dexMod;
        initiatives.push({ type: 'companion', id: compId, initiative: roll });
        logMessage(`${char.name} rolled ${roll} for initiative.`, "system");
    });

    // Enemies
    gameState.combat.enemies.forEach(enemy => {
        const init = rollInitiative(gameState, 'enemy', enemy.attackBonus);
        enemy.initiative = init.total;
        initiatives.push({ type: 'enemy', id: enemy.uniqueId, initiative: init.total });
        logMessage(`${enemy.name} rolled ${init.total} for initiative.`, "system");
    });

    initiatives.sort((a, b) => b.initiative - a.initiative);
    gameState.combat.turnOrder = initiatives.map(i => i.id);

    combatTurnLoop();
}

function combatTurnLoop() {
    if (!gameState.combat.active) return;

    const currentTurnId = gameState.combat.turnOrder[gameState.combat.turnIndex];

    if (currentTurnId === 'player') {
        // Reset Player Action Economy at start of their turn
        gameState.combat.actionsRemaining = 1;
        gameState.combat.bonusActionsRemaining = 1;

        logMessage(`Round ${gameState.combat.round} - Your Turn`, "system");
        updateCombatUI();
    } else if (gameState.party.includes(currentTurnId)) {
        // Companion Turn
        const comp = gameState.roster[currentTurnId];
        logMessage(`Round ${gameState.combat.round} - ${comp.name}'s Turn`, "system");

        if (gameState.settings.companionAI) {
            // AI Control
            setTimeout(() => companionTurnAI(comp), 1000);
        } else {
            // Manual Control
            // We treat it like player turn but acting as companion
            gameState.combat.actionsRemaining = 1;
            gameState.combat.bonusActionsRemaining = 1;
            updateCombatUI(currentTurnId); // Pass active character ID
        }
    } else {
        // Enemy Turn
        const enemy = gameState.combat.enemies.find(e => e.uniqueId === currentTurnId);
        logMessage(`Round ${gameState.combat.round} - ${enemy.name}'s Turn`, "system");
        updateCombatUI();
        setTimeout(() => enemyTurn(enemy), 1000);
    }
}

function updateCombatUI(activeCharacterId = 'player') {
    if (!gameState.combat.active) return;

    const partyContainer = document.getElementById('party-container');
    partyContainer.innerHTML = '';

    // Render Player
    renderPartyCard(gameState.player, 'player', activeCharacterId);

    const hpPct = Math.max(0, (p.hp / p.maxHp) * 100);
    const totalSlots = p.spellSlots ? Object.values(p.spellSlots).reduce((a, b) => a + b, 0) : 0;
    const currentSlots = p.currentSlots ? Object.values(p.currentSlots).reduce((a, b) => a + b, 0) : 0;
    const manaPct = totalSlots > 0 ? Math.max(0, (currentSlots / totalSlots) * 100) : 0;

    playerCard.innerHTML = `
        <div class="party-header">
            <div class="party-portrait" style='background-image: url("portraits/player_placeholder.png");'></div>
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
                Act: ${gameState.combat.actionsRemaining} | Bns: ${gameState.combat.bonusActionsRemaining}
            </div>
        </div>
    `;
    partyContainer.appendChild(playerCard);

    const enemiesContainer = document.getElementById('enemies-container');
    enemiesContainer.innerHTML = '';
    gameState.combat.enemies.forEach(enemy => {
        if (enemy.hp <= 0) return;
        const enemyCard = document.createElement('div');
        enemyCard.className = 'enemy-card';
        const enemyHpPct = Math.max(0, (enemy.hp / enemy.maxHp) * 100);

        enemyCard.innerHTML = `
            <div class="enemy-portrait" style='background-image: url("${enemy.portrait}");'></div>
            <div class="enemy-info">
                <p class="enemy-name">${enemy.name}</p>
                <div class="enemy-bar-background">
                    <div class="enemy-bar-fill" style="width: ${enemyHpPct}%;"></div>
                </div>
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
            turnIndicator.textContent = `${activeName}'s Turn`;
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

function renderPlayerActions(container, subMenu = null) {
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'battle-actions-grid';

    const hasAction = gameState.combat.actionsRemaining > 0;
    const hasBonus = gameState.combat.bonusActionsRemaining > 0;

    if (subMenu === 'attack') {
        gameState.combat.enemies.forEach(enemy => {
            if (enemy.hp <= 0) return;
            grid.appendChild(createActionButton(enemy.name, 'swords', () => performAttack(enemy.uniqueId, actingId), 'primary'));
        });
        grid.appendChild(createActionButton('Back', 'arrow_back', () => renderPlayerActions(container, null), 'flee'));
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
                 renderPlayerActions(container, { type: 'spell_target', spellId: spellId });
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
        const cls = classes[gameState.player.classId];

        // Cunning Action (Rogue)
        if (gameState.player.level >= 2 && gameState.player.classId === 'rogue') {
             grid.appendChild(createActionButton('Dash (Bonus)', 'directions_run', () => performCunningAction('dash'), '', !hasBonus));
             grid.appendChild(createActionButton('Disengage (Bonus)', 'do_not_step', () => performCunningAction('disengage'), '', !hasBonus));
        }

        // Action Surge (Fighter)
        if (gameState.player.level >= 2 && gameState.player.classId === 'fighter') {
            const res = gameState.player.resources['action_surge'];
            const available = res && res.current > 0;
            grid.appendChild(createActionButton('Action Surge', 'bolt', () => performActionSurge(), '', !available));
        }

        // Second Wind (Fighter)
        if (gameState.player.classId === 'fighter') {
            const res = gameState.player.resources['second_wind'];
            const available = res && res.current > 0;
            grid.appendChild(createActionButton('Second Wind', 'healing', () => performAbility('second_wind'), '', !available || !hasBonus));
        }

        grid.appendChild(createActionButton('Back', 'arrow_back', () => renderPlayerActions(container, null), 'flee'));
    } else {
        // Main Menu
        const hasSpells = gameState.player.currentSlots && Object.values(gameState.player.currentSlots).some(s => s > 0) || (gameState.player.knownSpells.length > 0); // Include cantrips check

        grid.appendChild(createActionButton('Attack', 'swords', () => renderPlayerActions(container, 'attack'), 'primary', !hasAction));
        grid.appendChild(createActionButton('Spells', 'auto_stories', () => renderPlayerActions(container, 'spells'), '', !hasSpells || !hasAction)); // Assume spells need action
        grid.appendChild(createActionButton('Abilities', 'star', () => renderPlayerActions(container, 'abilities')));
        grid.appendChild(createActionButton('Defend', 'shield', performDefend, '', !hasAction));
        grid.appendChild(createActionButton('Items', 'local_drink', () => toggleInventory(true), '', !hasAction)); // Using Item is usually an Action (unless Thief)
        grid.appendChild(createActionButton('End Turn', 'hourglass_bottom', performEndTurn, 'flee')); // Manual End Turn
        // Flee is special, uses Action
        // grid.appendChild(createActionButton('Flee', 'directions_run', performFlee, 'flee', !hasAction));
    }

    container.appendChild(grid);
}

// --- New Action Logic ---

function performCunningAction(type) {
    if (gameState.combat.bonusActionsRemaining <= 0) {
        logMessage("No Bonus Action remaining!", "check-fail");
        return;
    }
    gameState.combat.bonusActionsRemaining--;
    logMessage(`Cunning Action: You used ${type}.`, "gain");
    // Dash isn't strictly implemented on a grid, but implies movement.
    // Disengage prevents opportunity attacks (if we had them).
    // For now, it's flavor or could unlock a 'Flee' without check?
    updateCombatUI();
}

function performActionSurge() {
    const res = gameState.player.resources['action_surge'];
    if (res.current <= 0) return;
    res.current--;
    gameState.combat.actionsRemaining++;
    logMessage("Action Surge! Gained 1 Action.", "gain");
    updateCombatUI();
}

function performEndTurn() {
    endPlayerTurn();
}

// ------------------------

function calculateDamage(baseDamage, damageType, target, isCritical = false) {
    const combatantStats = target.fullStats || enemies[target.id];
    if (!combatantStats) return baseDamage;

    let finalDamage = baseDamage;
    let message = "";

    const vulnerabilities = combatantStats.vulnerabilities || "";
    const resistances = combatantStats.resistances || "";

    if (vulnerabilities.includes(damageType)) {
        finalDamage *= 2;
        message = `${target.name} is vulnerable to ${damageType}! Damage doubled.`;
    } else if (resistances.includes(damageType)) {
        finalDamage = Math.floor(finalDamage / 2);
        message = `${target.name} resists ${damageType}. Damage halved.`;
    }

function performActionSurge(actorId) {
    const actor = (actorId === 'player') ? gameState.player : gameState.roster[actorId];
    const res = actor.resources['action_surge'];
    if (res.current <= 0) return;
    res.current--;
    gameState.combat.actionsRemaining++;
    logMessage(`${actor.name} used Action Surge!`, "gain");
    updateCombatUI(actorId);
}

function performEndTurn() {
    endPlayerTurn();
}

function createActionButton(text, icon, onClick, type = '', disabled = false) {
    const button = document.createElement('button');
    button.className = `battle-action-button ${type}`;
    button.innerHTML = `<span class="material-symbols-outlined">${icon}</span><span class="truncate">${text}</span>`;
    button.onclick = onClick;
    if (disabled) {
        button.disabled = true;
        button.style.opacity = '0.5';
        button.style.cursor = 'not-allowed';
    }
    return button;
}

function performAttack(targetId) {
    if (gameState.combat.actionsRemaining <= 0) {
        logMessage("No Action remaining!", "check-fail");
        return;
    }

    const target = gameState.combat.enemies.find(e => e.uniqueId === targetId);
    const actor = (actorId === 'player') ? gameState.player : gameState.roster[actorId];

    gameState.combat.actionsRemaining--;

    const weaponId = gameState.player.equippedWeaponId;
    const weapon = items[weaponId] || { name: "Unarmed", damage: "1d2", modifier: "STR", damageType: "bludgeoning", subtype: "simple" };
    const stat = weapon.modifier || "STR";

    // Need to access cls proficiencies.
    // cls structure is slightly different in memory? No, standard.
    // But wait, do we have `proficiencyBonus` on companion?
    // Yes, calculated implicitly or should be on object.
    // I didn't explicitly set it on roster init. Default to 2 + floor((level-1)/4).
    const profBonus = Math.ceil(1 + (actor.level / 4));

    // Stat mod
    const statMod = actor.modifiers[stat];

    // Proficiency check
    const cls = classes[actor.classId];
    const isProficient = weapon.subtype && cls.weaponProficiencies && cls.weaponProficiencies.includes(weapon.subtype);
    const prof = isProficient ? gameState.player.proficiencyBonus : 0;

    // Determine Advantage (Simplified: Hidden = Advantage)
    // const advantage = hasStatusEffect('hidden');
    // Implementing basic advantage check
    const advantage = false; // Placeholder

    const result = rollAttack(gameState, stat, prof, advantage);

    // Champion Fighter Crit Range
    let critThreshold = 20;
    if (gameState.player.subclassId === 'champion') critThreshold = 19;

    const isCritical = result.roll >= critThreshold;

    let msg = `You attack ${target.name} with ${weapon.name}: ${result.total} (vs AC ${target.ac}).`;
    if (isCritical) {
        msg += " CRITICAL HIT!";
        showBattleEventText("Critical Hit!");
    }
    logMessage(msg, "system");

    if (result.total >= target.ac || isCritical) {
        let dmg = rollDiceExpression(weapon.damage).total + gameState.player.modifiers[stat];
        if (isCritical) {
            const critBonus = rollDiceExpression(weapon.damage.split('+')[0]).total;
            dmg += critBonus;
        }

        // Sneak Attack Logic
        if (gameState.player.classId === 'rogue') {
            // Requirements: Finesse/Ranged + (Advantage OR Ally adjacent)
            // Simplified: Just check if we hit for now, assuming Rogue positions well.
            // 5e Rules: 1d6 at Lv1, increases by 1d6 every 2 levels.
            const sneakDice = Math.ceil(gameState.player.level / 2);
            const sneakDmg = rollDiceExpression(`${sneakDice}d6`).total;
            dmg += sneakDmg;
            logMessage(`Sneak Attack! +${sneakDmg} damage.`, "gain");
        }

        const finalDamage = calculateDamage(dmg, weapon.damageType, target);
        target.hp -= Math.max(1, finalDamage);
        logMessage(`Hit! Dealt ${finalDamage} damage.`, "combat");
        showBattleEventText(`${finalDamage}`);
    } else {
        logMessage("Miss!", "system");
        showBattleEventText("Miss!");
    }

    if (!checkWinCondition()) {
        updateCombatUI(); // Don't auto-end turn
    }
}

function performAbility(abilityId) {
    // Check Action Economy based on ability type
    let cost = 'action';
    if (abilityId === 'second_wind') cost = 'bonus';

    if (cost === 'action' && gameState.combat.actionsRemaining <= 0) {
        logMessage("No Action remaining!", "check-fail");
        return;
    }
    if (cost === 'bonus' && gameState.combat.bonusActionsRemaining <= 0) {
        logMessage("No Bonus Action remaining!", "check-fail");
        return;
    }

    const resource = gameState.player.resources[abilityId];
    if (!resource || resource.current <= 0) {
        logMessage("No uses left for that ability.", "check-fail");
        return;
    }

    if (cost === 'action') gameState.combat.actionsRemaining--;
    if (cost === 'bonus') gameState.combat.bonusActionsRemaining--;

    if (abilityId === 'second_wind') {
        resource.current--;
        const healed = rollDie(10) + gameState.player.level;
        gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + healed);
        logMessage(`Used Second Wind and recovered ${healed} HP.`, "gain");
    } else {
        logMessage(`Ability '${abilityId}' is not implemented yet.`, "system");
    }

    if (!checkWinCondition()) {
        updateCombatUI();
    }
}

function performCastSpell(spellId, targetId) {
    if (gameState.combat.actionsRemaining <= 0) {
        logMessage("No Action remaining!", "check-fail");
        return;
    }

    const spell = spells[spellId];

    if (spell.level > 0) {
        if (actor.currentSlots[spell.level] > 0) actor.currentSlots[spell.level]--;
        else { logMessage("No slots!", "check-fail"); return; }
    }

    gameState.combat.actionsRemaining--;

    // Disciple of Life (Cleric Life Domain) Bonus
    let healingBonus = 0;
    if (spell.type === 'heal' && gameState.player.subclassId === 'life' && spell.level > 0) {
        healingBonus = 2 + spell.level;
    }

    if (spell.type === 'heal') {
        const roll = rollDiceExpression(spell.amount).total + healingBonus;
        gameState.player.hp = Math.min(gameState.player.hp + roll, gameState.player.maxHp);
        logMessage(`Healed for ${roll} HP.${healingBonus > 0 ? ' (Disciple of Life)' : ''}`, "gain");
        updateCombatUI();
    } else {
        const target = gameState.combat.enemies.find(e => e.uniqueId === targetId);
        if (!target) return;

    // Target
    let target;
    if (targetId === 'player') target = gameState.player;
    else if (gameState.roster[targetId]) target = gameState.roster[targetId];
    else target = gameState.combat.enemies.find(e => e.uniqueId === targetId);

    if (!target) return;

    logMessage(`${actor.name} casts ${spell.name} on ${target.name}.`, "combat");

    if (!checkWinCondition()) {
        updateCombatUI();
    }

    if (!checkWinCondition()) updateCombatUI(actorId);
}

function performDefend() {
    if (gameState.combat.actionsRemaining <= 0) return;
    gameState.combat.actionsRemaining--;
    gameState.combat.playerDefending = true;
    logMessage("You brace yourself for the next attack.", "system");
    updateCombatUI();
}

function performFlee() {
    if (gameState.combat.actionsRemaining <= 0) return;
    gameState.combat.actionsRemaining--;

    const roll = rollDie(20) + gameState.player.modifiers.DEX;
    if (roll >= 12) {
        logMessage("You escaped!", "gain");
        gameState.combat.active = false;
        goToScene(gameState.combat.loseSceneId);
    } else {
        logMessage("Failed to escape!", "combat");
        updateCombatUI();
    }
}

function endPlayerTurn() {
    gameState.combat.playerDefending = false;
    gameState.combat.turnIndex = (gameState.combat.turnIndex + 1) % gameState.combat.turnOrder.length;
    if (gameState.combat.turnIndex === 0) {
        gameState.combat.round++;
    }
    combatTurnLoop();
}

// ... (Enemy Turn & Win Condition remain mostly the same) ...

function enemyTurn(enemy) {
    if (!gameState.combat.active || enemy.hp <= 0) {
        endEnemyTurn(enemy);
        return;
    }

    enemy.intent = "is preparing to attack!";
    updateCombatUI();

    setTimeout(() => {
        logMessage(`${enemy.name} attacks!`, "combat");
        const totalHit = rollDie(20) + enemy.attackBonus;
    const ac = getPlayerAC();

    if (totalHit >= ac) {
        let dmg = rollDiceExpression(enemy.damage).total;
        if (gameState.combat.playerDefending) {
            dmg = Math.floor(dmg / 2);
            logMessage("Defended! Damage halved.", "gain");
        }
        gameState.player.hp -= dmg;
        logMessage(`You took ${dmg} damage.`, "combat");
        showBattleEventText(`${dmg}`);

        if (enemy.id === 'fungal_beast' && rollDie(100) <= 25) {
            applyStatusEffect('poisoned');
            showBattleEventText("Poisoned!");
        }

        if (gameState.player.hp <= 0) {
            gameState.combat.active = false;
            goToScene(gameState.combat.loseSceneId);
            return;
        }
    } else {
        logMessage(`${enemy.name} missed!`, "system");
        showBattleEventText("Miss!");
    }

    endEnemyTurn(enemy);
    }, 1000);
}

function endEnemyTurn(enemy) {
    enemy.intent = "";

    const deadEnemies = gameState.combat.enemies.filter(e => e.hp <= 0).map(e => e.uniqueId);
    if (deadEnemies.length > 0) {
        gameState.combat.turnOrder = gameState.combat.turnOrder.filter(id => !deadEnemies.includes(id));
    }

    const currentIndex = gameState.combat.turnOrder.indexOf(enemy.uniqueId);
    gameState.combat.turnIndex = (currentIndex + 1) % gameState.combat.turnOrder.length;

    if (gameState.combat.turnIndex === 0 && gameState.combat.turnOrder.includes('player')) {
        gameState.combat.round++;
    } else if (!gameState.combat.turnOrder.includes('player')) {
        checkWinCondition();
        return;
    }
}

// --- AI Companion Logic ---
function companionTurnAI(actor) {
    // Very simple AI
    logMessage(`${actor.name} acts (AI).`, "system");

function checkWinCondition() {
    const allEnemiesDefeated = gameState.combat.enemies.every(e => e.hp <= 0);
    if (allEnemiesDefeated) {
        gameState.combat.active = false;
        logMessage(`Victory!`, "gain");

        const totalXp = gameState.combat.enemies.reduce((sum, e) => sum + (enemies[e.id].xp || 0), 0);
        // gainXp will return true if pending level up
        const levelUpAvailable = gainXp(totalXp);
        logMessage(`Gained ${totalXp} XP.`, "gain");
        if (levelUpAvailable) {
            logMessage(`Level Up Available!`, "gain");
        }

        updateStatsUI();
        saveGame();

        window.logMessage = logToMain;

        const actionsContainer = document.getElementById('battle-actions-container');
        actionsContainer.innerHTML = '';
        actionsContainer.appendChild(
            createActionButton('Victory!', 'celebration', () => goToScene(gameState.combat.winSceneId), 'col-span-2')
        );
        return true;
    }
    return false;
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

    document.getElementById('char-ac').innerText = `AC ${getPlayerAC()}`;

    const weapon = p.equippedWeaponId ? items[p.equippedWeaponId] : null;
    const armor = p.equippedArmorId ? items[p.equippedArmorId] : null;
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

function getPlayerAC() {
    const p = gameState.player;
    const armor = p.equippedArmorId ? items[p.equippedArmorId] : null;
    if (armor) return armor.acBase;
    if (p.classId === 'fighter') return 10 + p.modifiers.DEX;
    return 10 + p.modifiers.DEX;
}

// ... (Rest of existing functions: performLongRest, toggleInventory, etc. UNCHANGED, but ensuring performLongRest resets new resources) ...

function performLongRest() {
    gameState.player.hp = gameState.player.maxHp;
    // Reset slots
    if (gameState.player.spellSlots) {
        gameState.player.currentSlots = { ...gameState.player.spellSlots };
    }
    // Reset class resources
    if (gameState.player.resources['second_wind']) {
        gameState.player.resources['second_wind'].current = gameState.player.resources['second_wind'].max;
    }
    if (gameState.player.resources['action_surge']) {
        gameState.player.resources['action_surge'].current = gameState.player.resources['action_surge'].max;
    }
    // Add reset for other resources

    return true;
}

function performShortRest() {
    const cls = classes[gameState.player.classId];
    const roll = rollDie(cls.hitDie) + gameState.player.modifiers.CON;
    const healed = Math.max(1, roll);
    gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + healed);

    if (!checkWinCondition()) {
        endPlayerTurn(); // End companion turn
    }
    if (gameState.player.resources['action_surge']) {
        gameState.player.resources['action_surge'].current = gameState.player.resources['action_surge'].max;
    }

    return healed;
}

// ... (Standard helper functions remain) ...
function saveGame() {
    localStorage.setItem('crimson_moon_save', JSON.stringify(gameState));
    logMessage("Game Saved.", "system");
}

// --- Inventory System Update ---

function toggleInventory(forceOpen = null, characterId = 'player') {
    const modal = document.getElementById('inventory-modal');
    const list = document.getElementById('inventory-list');
    const charSelect = document.getElementById('inventory-character-select');

    if (forceOpen === false || (forceOpen === null && !modal.classList.contains('hidden'))) {
        modal.classList.add('hidden');
        return;
    }

    modal.classList.remove('hidden');
    list.innerHTML = '';
    charSelect.innerHTML = ''; // Clear tabs

    // Render Tabs
    const chars = ['player', ...gameState.party];
    chars.forEach(id => {
        const btn = document.createElement('button');
        const name = (id === 'player') ? gameState.player.name : gameState.roster[id].name;
        btn.innerText = name;
        btn.className = (id === characterId) ? 'tab-active' : '';
        btn.onclick = () => toggleInventory(true, id);
        charSelect.appendChild(btn);
    });

    const targetChar = (characterId === 'player') ? gameState.player : gameState.roster[characterId];
    if (!targetChar || targetChar.inventory.length === 0) {
        list.innerHTML = '<p>Empty.</p>';
        return;
    }

    targetChar.inventory.forEach(itemId => {
        const item = items[itemId];
        if (!item) return;

        const row = document.createElement('div');
        row.className = 'inventory-item';
        row.innerHTML = `<strong>${item.name}</strong> <small>${item.type}</small>`;

        const actions = document.createElement('div');

        if (item.type === 'weapon' || item.type === 'armor') {
            const equipBtn = document.createElement('button');
            let isEquipped = false;
            if (characterId === 'player') {
                isEquipped = (gameState.player.equippedWeaponId === itemId || gameState.player.equippedArmorId === itemId);
            } else {
                isEquipped = (targetChar.equipped.weapon === itemId || targetChar.equipped.armor === itemId);
            }

            equipBtn.innerText = isEquipped ? "Equipped" : "Equip";
            equipBtn.disabled = isEquipped;
            equipBtn.onclick = () => {
                const res = equipItem(itemId, characterId);
                if (res.success) {
                    logMessage(`Equipped ${item.name}.`, "system");
                    toggleInventory(true, characterId);
                    updateStatsUI(); // If player
                } else {
                    logMessage(`Cannot equip: ${res.reason}`, "check-fail");
                }
            };
            actions.appendChild(equipBtn);
        }

        // Transfer Button
        const transferBtn = document.createElement('button');
        transferBtn.innerText = "Give";
        transferBtn.onclick = () => {
            // Simple cycle: Give to next char
            // Ideally show dropdown. For now, give to Player if Comp, give to first Comp if Player.
            let targetId = 'player';
            if (characterId === 'player') {
                if (gameState.party.length > 0) targetId = gameState.party[0];
                else { logMessage("No one to give to.", "system"); return; }
            }

            removeItem(itemId, characterId);
            addItem(itemId, targetId);
            logMessage(`Transferred ${item.name}.`, "system");
            toggleInventory(true, characterId);
        };
        actions.appendChild(transferBtn);

        row.appendChild(actions);
        list.appendChild(row);
    });
}

// ... Rest of file (imports, basic functions) ...
// NOTE: I need to ensure calculateDamage and createActionButton are available or copied.
// I used them in performAttack. They are internal helper functions.
// I will keep them as they were in the previous file content.

function calculateDamage(baseDamage, damageType, target, isCritical = false) {
    const combatantStats = target.fullStats || enemies[target.id];
    if (!combatantStats) return baseDamage;

    let finalDamage = baseDamage;
    let message = "";

    const vulnerabilities = combatantStats.vulnerabilities || "";
    const resistances = combatantStats.resistances || "";

    if (vulnerabilities.includes(damageType)) {
        finalDamage *= 2;
        message = `${target.name} is vulnerable to ${damageType}! Damage doubled.`;
    } else if (resistances.includes(damageType)) {
        finalDamage = Math.floor(finalDamage / 2);
        message = `${target.name} resists ${damageType}. Damage halved.`;
    }

    if (message) {
        logMessage(message, "system");
    }

    return finalDamage;
}

function createActionButton(text, icon, onClick, type = '', disabled = false) {
    const button = document.createElement('button');
    button.className = `battle-action-button ${type}`;
    button.innerHTML = `<span class="material-symbols-outlined">${icon}</span><span class="truncate">${text}</span>`;
    button.onclick = onClick;
    if (disabled) {
        button.disabled = true;
        button.style.opacity = '0.5';
        button.style.cursor = 'not-allowed';
    }
    return button;
}

// Standard helpers (save, load, etc) are kept.
function saveGame() {
    localStorage.setItem('crimson_moon_save', JSON.stringify(gameState));
    logMessage("Game Saved.", "system");
}

function loadGame() {
    const data = localStorage.getItem('crimson_moon_save');
    if (data) {
        Object.assign(gameState, JSON.parse(data));
        logMessage("Game Loaded.", "system");
        updateStatsUI();
        goToScene(gameState.currentSceneId);
    } else {
        logMessage("No save found.", "check-fail");
    }
}

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
            gameState.player.abilities[s1]++;
            gameState.player.abilities[s2]++;
            // Recalculate mods
            gameState.player.modifiers[s1] = getAbilityMod(gameState.player.abilities[s1]);
            gameState.player.modifiers[s2] = getAbilityMod(gameState.player.abilities[s2]);
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

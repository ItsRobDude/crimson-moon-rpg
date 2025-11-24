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
import { gameState, initializeNewGame, updateQuestStage, addGold, spendGold, gainXp, equipItem, useConsumable, applyStatusEffect, hasStatusEffect, tickStatusEffects, discoverLocation, isLocationDiscovered, addItem, changeRelationship, changeReputation, getRelationship, getReputation, adjustThreat, clearTransientThreat, recordAmbientEvent, addMapPin, removeMapPin, getNpcStatus } from './data/gameState.js';
import { rollDiceExpression, rollSkillCheck, rollSavingThrow, rollDie, rollAttack, rollInitiative, getAbilityMod } from './rules.js';

export function initUI() {
    window.goToScene = goToScene;
    window.showCharacterCreation = showCharacterCreation;
    document.getElementById('btn-inventory').onclick = () => toggleInventory(false);
    document.getElementById('btn-quests').onclick = toggleQuestLog;
    document.getElementById('btn-menu').onclick = toggleMenu;
    document.getElementById('btn-map').onclick = toggleMap;
    document.getElementById('btn-codex').onclick = () => toggleCodex('people');
    document.getElementById('btn-codex-people').onclick = () => toggleCodex('people');
    document.getElementById('btn-codex-factions').onclick = () => toggleCodex('factions');

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

// ... (Character Creation Logic remains same as previous patch) ...
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
    cls.proficiencies.forEach(skill => {
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

    // Validate Stats
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

// ... (Standard Scene/Shop/Map Helpers - omitted for brevity but assumed present as before) ...
// Re-pasting core logic to ensure full file context in patch.

function goToScene(sceneId) {
    const scene = scenes[sceneId];
    if (!scene) { console.error("Scene not found:", sceneId); return; }

    // Hide combat, show main scene
    document.getElementById('battle-screen').classList.add('hidden');
    document.getElementById('scene-container').classList.remove('hidden');
    window.logMessage = logToMain; // Redirect logging to main panel

    // Determine if first visit
    const isFirstVisit = !gameState.visitedScenes.includes(sceneId);
    if (isFirstVisit) {
        gameState.visitedScenes.push(sceneId);
    }

    gameState.currentSceneId = sceneId;
    if (scene.location) discoverLocation(scene.location);

    // Faction Hostility Check
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
    if (choice.action === 'shortRest') {
        if (spendGold(choice.cost)) {
            const healed = performShortRest(); // Updated
            logMessage(`Short Rest: Healed ${healed} HP and restored resources.`, "gain");
            updateStatsUI();
        } else logMessage("Not enough gold.", "check-fail");
        return;
    }
    if (choice.action === 'longRest') {
        if (spendGold(choice.cost)) {
            performLongRest(); // Updated
            logMessage("Long Rest: Fully restored HP, Slots, and Resources.", "gain");
            updateStatsUI();
        } else logMessage("Not enough gold.", "check-fail");
        return;
    }
    if (choice.effects) {
        choice.effects.forEach(effect => {
            if (effect.type === 'relationship') changeRelationship(effect.npcId, effect.amount);
            if (effect.type === 'reputation') changeReputation(effect.factionId, effect.amount);
        });
    }
    if (!choice.type) { if (choice.nextScene) goToScene(choice.nextScene); return; }

    // Skill Checks etc...
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

// --- Shop System ---
function getShopPrice(item, shopId) {
    let price = item.price;

    // Silverthorn Discount
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

// --- Map System ---
function toggleMap() {
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
    // Dynamic Routing based on World Phase and State
    const phase = gameState.worldPhase || 0;

    if (locationId === 'hushbriar') {
        if (phase >= 2 || gameState.flags['aodhan_dead']) {
            return 'SCENE_HUSHBRIAR_CORRUPTED';
        }
        return 'SCENE_HUSHBRIAR_TOWN';
    }

    if (locationId === 'silverthorn') {
        // Could add sieged version later
        return 'SCENE_HUB_SILVERTHORN';
    }

    if (locationId === 'whisperwood') return 'SCENE_ARRIVAL_WHISPERWOOD';
    if (locationId === 'shadowmire') return 'SCENE_TRAVEL_SHADOWMIRE';
    if (locationId === 'durnhelm') return 'SCENE_DURNHELM_GATES';
    if (locationId === 'lament_hill') return 'SCENE_LAMENT_HILL_APPROACH';
    if (locationId === 'solasmor') return 'SCENE_SOLASMOR_APPROACH';
    if (locationId === 'soul_mill') return 'SCENE_SOUL_MILL_APPROACH';
    if (locationId === 'thieves_hideout') return 'SCENE_THIEVES_HIDEOUT';

    return 'SCENE_BRIEFING';
}

// --- Codex System ---
function toggleCodex(tab = 'people') {
    const modal = document.getElementById('codex-modal');
    const list = document.getElementById('codex-list');
    const btnPeople = document.getElementById('btn-codex-people');
    const btnFactions = document.getElementById('btn-codex-factions');

    modal.classList.remove('hidden');
    list.innerHTML = '';

    // Tab Styling
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

        // Normalize score for bar (-100 to 100 -> 0 to 100%)
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

// --- Combat System ---

function startCombat(enemyIds, winScene, loseScene) {
    // Show combat screen, hide main scene
    document.getElementById('scene-container').classList.add('hidden');
    document.getElementById('battle-screen').classList.remove('hidden');
    window.logMessage = logToBattle; // Redirect logging to battle log

    const currentScene = scenes[gameState.currentSceneId];

    const combatEnemies = enemyIds.map((id, index) => {
        const enemyData = enemies[id];
        return {
            id: id,
            name: enemyData.name,
            hp: enemyData.hp,
            maxHp: enemyData.hp,
            ac: enemyData.ac,
            attackBonus: enemyData.attackBonus,
            damage: enemyData.damage,
            portrait: enemyData.portrait || 'portraits/placeholder.png',
            initiative: 0,
            statusEffects: [],
            uniqueId: `${id}_${index}` // To target specific enemies
        };
    });

    gameState.combat = {
        active: true,
        enemies: combatEnemies,
        turnOrder: [],
        turnIndex: 0,
        round: 1,
        winSceneId: winScene,
        loseSceneId: loseScene,
        playerDefending: false,
        sceneText: currentScene.text
    };

    logMessage(`Combat started!`, "combat");

    // Roll initiative for everyone
    const initiatives = [];
    const playerInit = rollInitiative(gameState, 'player');
    initiatives.push({ type: 'player', id: 'player', initiative: playerInit.total });
    logMessage(`You rolled ${playerInit.total} for initiative.`, "system");

    gameState.combat.enemies.forEach(enemy => {
        const init = rollInitiative(gameState, 'enemy', enemy.attackBonus);
        enemy.initiative = init.total;
        initiatives.push({ type: 'enemy', id: enemy.uniqueId, initiative: init.total });
        logMessage(`${enemy.name} rolled ${init.total} for initiative.`, "system");
    });

    // Sort by initiative descending
    initiatives.sort((a, b) => b.initiative - a.initiative);
    gameState.combat.turnOrder = initiatives.map(i => i.id);

    combatTurnLoop();
}

function combatTurnLoop() {
    if (!gameState.combat.active) return;

    const currentTurnId = gameState.combat.turnOrder[gameState.combat.turnIndex];

    if (currentTurnId === 'player') {
        logMessage(`Round ${gameState.combat.round} - Your Turn`, "system");
        updateCombatUI();
    } else {
        const enemy = gameState.combat.enemies.find(e => e.uniqueId === currentTurnId);
        logMessage(`Round ${gameState.combat.round} - ${enemy.name}'s Turn`, "system");
        updateCombatUI();
        setTimeout(() => enemyTurn(enemy), 1000);
    }
}

function updateCombatUI() {
    if (!gameState.combat.active) return;

    // -- Render Party --
    const partyContainer = document.getElementById('party-container');
    partyContainer.innerHTML = '';

    const p = gameState.player;
    const playerCard = document.createElement('div');
    const isPlayerTurn = gameState.combat.turnOrder[gameState.combat.turnIndex] === 'player';
    playerCard.className = `party-card ${isPlayerTurn ? 'active-turn' : ''} ${p.hp <= 0 ? 'down' : ''}`;

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
        </div>
    `;
    partyContainer.appendChild(playerCard);

    // -- Render Enemies --
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
                <div class="enemy-status"></div>
            </div>
        `;
        enemiesContainer.appendChild(enemyCard);
    });

    // -- Render Actions --
    const turnIndicator = document.getElementById('turn-indicator');
    const actionsContainer = document.getElementById('battle-actions-container');
    actionsContainer.innerHTML = '';
    if (isPlayerTurn) {
        turnIndicator.textContent = `${p.name}'s Turn`;
        renderPlayerActions(actionsContainer);
    } else {
        const enemy = gameState.combat.enemies.find(e => e.uniqueId === gameState.combat.turnOrder[gameState.combat.turnIndex]);
        turnIndicator.textContent = enemy ? `${enemy.name}'s Turn` : "Enemy's Turn";
    }

    // -- Set Battle Scene Background and Text --
    document.getElementById('battle-scene-image').style.backgroundImage = "url('landscapes/battle_placeholder.webp')";
    document.getElementById('battle-scene-main-text').innerText = gameState.combat.sceneText || "The air crackles with tension.";
}

function renderPlayerActions(container, subMenu = null) {
    container.innerHTML = ''; // Clear previous state
    const grid = document.createElement('div');
    grid.className = 'battle-actions-grid';

    if (subMenu === 'attack') {
        gameState.combat.enemies.forEach(enemy => {
            if (enemy.hp <= 0) return;
            grid.appendChild(createActionButton(enemy.name, 'swords', () => performAttack(enemy.uniqueId), 'primary'));
        });
        grid.appendChild(createActionButton('Back', 'arrow_back', () => renderPlayerActions(container, null), 'flee')); // Using flee style for back
    } else if (subMenu === 'spells') {
        const spellList = gameState.player.knownSpells || [];
        spellList.forEach(spellId => {
            const spell = spells[spellId];
            if (!spell) return;

            const hasSlots = spell.level === 0 || (gameState.player.currentSlots[spell.level] && gameState.player.currentSlots[spell.level] > 0);
            grid.appendChild(createActionButton(spell.name, 'auto_stories', () => {
                 renderPlayerActions(container, { type: 'spell_target', spellId: spellId });
            }, '', !hasSlots));
        });
        grid.appendChild(createActionButton('Back', 'arrow_back', () => renderPlayerActions(container, null), 'flee'));
    } else if (subMenu && subMenu.type === 'spell_target') {
        const spell = spells[subMenu.spellId];
        if (spell.type === 'heal') {
            grid.appendChild(createActionButton(`Cast on ${gameState.player.name}`, 'auto_stories', () => performCastSpell(subMenu.spellId, 'player'), 'primary'));
        } else {
            gameState.combat.enemies.forEach(enemy => {
                if (enemy.hp <= 0) return;
                grid.appendChild(createActionButton(`Cast on ${enemy.name}`, 'auto_stories', () => performCastSpell(subMenu.spellId, enemy.uniqueId), 'primary'));
            });
        }
        grid.appendChild(createActionButton('Back', 'arrow_back', () => renderPlayerActions(container, 'spells'), 'flee'));
    } else if (subMenu === 'abilities') {
        Object.entries(gameState.player.resources).forEach(([key, res]) => {
            if (res.current > 0) {
                const abilityName = key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                grid.appendChild(createActionButton(abilityName, 'star', () => performAbility(key)));
            }
        });
        grid.appendChild(createActionButton('Back', 'arrow_back', () => renderPlayerActions(container, null), 'flee'));
    } else { // Main menu
        const hasAbilities = Object.values(gameState.player.resources).some(r => r.current > 0);
        const hasSpells = gameState.player.currentSlots && Object.values(gameState.player.currentSlots).some(s => s > 0);
        grid.appendChild(createActionButton('Attack', 'swords', () => renderPlayerActions(container, 'attack'), 'primary'));
        grid.appendChild(createActionButton('Spells', 'auto_stories', () => renderPlayerActions(container, 'spells'), '', !hasSpells));
        grid.appendChild(createActionButton('Abilities', 'star', () => renderPlayerActions(container, 'abilities'), '', !hasAbilities));
        grid.appendChild(createActionButton('Defend', 'shield', performDefend));
        grid.appendChild(createActionButton('Items', 'local_drink', () => toggleInventory(true)));
        grid.appendChild(createActionButton('Flee', 'directions_run', performFlee, 'flee'));
    }

    container.appendChild(grid);
}

function calculateDamage(baseDamage, damageType, target) {
    const enemyData = enemies[target.id];
    if (!enemyData) return baseDamage;

    let finalDamage = baseDamage;
    let message = "";

    if (enemyData.vulnerabilities && enemyData.vulnerabilities.includes(damageType)) {
        finalDamage *= 2;
        message = `${target.name} is vulnerable to ${damageType}! Damage doubled.`;
    } else if (enemyData.resistances && enemyData.resistances.includes(damageType)) {
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
    }
    return button;
}

function performAttack(targetId) {
    const target = gameState.combat.enemies.find(e => e.uniqueId === targetId);
    if (!target) return;

    const weaponId = gameState.player.equippedWeaponId;
    const weapon = items[weaponId] || { name: "Unarmed", damage: "1d2", modifier: "STR", damageType: "bludgeoning", subtype: "simple" };
    const stat = weapon.modifier || "STR";

    const cls = classes[gameState.player.classId];
    const isProficient = weapon.subtype && cls.weaponProficiencies && cls.weaponProficiencies.includes(weapon.subtype);
    const prof = isProficient ? gameState.player.proficiencyBonus : 0;
    const result = rollAttack(gameState, stat, prof);

    let msg = `You attack ${target.name} with ${weapon.name}: ${result.total} (vs AC ${target.ac}).`;
    if (result.isCritical) msg += " CRITICAL HIT!";
    logMessage(msg, "system");

    if (result.total >= target.ac || result.isCritical) {
        let dmg = rollDiceExpression(weapon.damage).total + gameState.player.modifiers[stat];
        if (result.isCritical) {
            // On a critical hit, roll the weapon's damage dice an additional time
            const critBonus = rollDiceExpression(weapon.damage.split('+')[0]).total; // Assumes format like '1d8' or '1d6+2'
            dmg += critBonus;
        }

        const finalDamage = calculateDamage(dmg, weapon.damageType, target);
        target.hp -= Math.max(1, finalDamage);
        logMessage(`Hit! Dealt ${finalDamage} ${weapon.damageType} damage to ${target.name}.`, "combat");
    } else {
        logMessage("Miss!", "system");
    }

    if (!checkWinCondition()) {
        endPlayerTurn();
    }
}

function performAbility(abilityId) {
    const resource = gameState.player.resources[abilityId];
    if (!resource || resource.current <= 0) {
        logMessage("No uses left for that ability.", "check-fail");
        return;
    }

    if (abilityId === 'second_wind') {
        resource.current--;
        const healed = rollDie(10) + gameState.player.level; // 1d10 + Fighter level
        gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + healed);
        logMessage(`Used Second Wind and recovered ${healed} HP.`, "gain");
    } else {
        logMessage(`Ability '${abilityId}' is not implemented yet.`, "system");
    }

    if (!checkWinCondition()) {
        endPlayerTurn();
    }
}

function performCastSpell(spellId, targetId) {
    const spell = spells[spellId];
    if (!spell) return;

    if (spell.level > 0) {
        if (gameState.player.currentSlots[spell.level] > 0) {
            gameState.player.currentSlots[spell.level]--;
        } else {
            logMessage("Not enough spell slots!", "check-fail");
            return;
        }
    }

    if (spell.type === 'heal') {
        const roll = rollDiceExpression(spell.amount).total;
        gameState.player.hp = Math.min(gameState.player.hp + roll, gameState.player.maxHp);
        logMessage(`Healed for ${roll} HP.`, "gain");
        updateCombatUI(); // Refresh UI to show new health
    } else {
        const target = gameState.combat.enemies.find(e => e.uniqueId === targetId);
        if (!target) return;

        logMessage(`Casting ${spell.name} on ${target.name}...`, "combat");

        if (spell.type === 'attack') {
            const stat = (gameState.player.classId === 'wizard') ? 'INT' : 'WIS';
            const prof = gameState.player.proficiencyBonus;
            const result = rollAttack(gameState, stat, prof);

            if (result.total >= target.ac || result.isCritical) {
                let dmg = rollDiceExpression(spell.damage).total;
                const finalDamage = calculateDamage(dmg, spell.damageType, target);
                target.hp -= Math.max(1, finalDamage);
                logMessage(`Hit! ${target.name} takes ${finalDamage} ${spell.damageType} damage.`, "combat");
            } else {
                logMessage("The spell misses!", "system");
            }
        } else if (spell.type === 'save') {
            const saveDC = 8 + gameState.player.proficiencyBonus + gameState.player.modifiers[(gameState.player.classId === 'wizard') ? 'INT' : 'WIS'];
            const enemySaveRoll = rollDie(20);

            let dmg = rollDiceExpression(spell.damage).total;
            if (enemySaveRoll >= saveDC) {
                dmg = Math.floor(dmg / 2);
                logMessage(`${target.name} saved! Takes half damage.`, "combat");
            } else {
                logMessage(`${target.name} failed save!`, "combat");
            }
            const finalDamage = calculateDamage(dmg, spell.damageType, target);
            target.hp -= Math.max(1, finalDamage);
            logMessage(`Dealt ${finalDamage} ${spell.damageType} damage.`, "combat");
        }
    }

    if (!checkWinCondition()) {
        endPlayerTurn();
    }
}

function performDefend() {
    gameState.combat.playerDefending = true;
    logMessage("You brace yourself for the next attack.", "system");
    endPlayerTurn();
}

function performFlee() {
    const roll = rollDie(20) + gameState.player.modifiers.DEX;
    if (roll >= 12) {
        logMessage("You escaped!", "gain");
        gameState.combat.active = false;
        goToScene(gameState.combat.loseSceneId); // 'lose' scene is often the retreat point
    } else {
        logMessage("Failed to escape!", "combat");
        endPlayerTurn();
    }
}

function endPlayerTurn() {
    gameState.combat.playerDefending = false; // Reset defend status
    gameState.combat.turnIndex = (gameState.combat.turnIndex + 1) % gameState.combat.turnOrder.length;
    if (gameState.combat.turnIndex === 0) {
        gameState.combat.round++;
    }
    combatTurnLoop();
}

function enemyTurn(enemy) {
    if (!gameState.combat.active || enemy.hp <= 0) {
        endEnemyTurn(enemy);
        return;
    }
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

        // Special Effects: Fungal Beast Poison
        if (enemy.id === 'fungal_beast' && rollDie(100) <= 25) { // 25% chance
            applyStatusEffect('poisoned');
        }

        if (gameState.player.hp <= 0) {
            gameState.combat.active = false;
            goToScene(gameState.combat.loseSceneId);
            return;
        }
    } else {
        logMessage(`${enemy.name} missed!`, "system");
    }

    endEnemyTurn(enemy);
}

function endEnemyTurn(enemy) {
    // Before ending turn, remove any dead enemies from turn order
    const deadEnemies = gameState.combat.enemies.filter(e => e.hp <= 0).map(e => e.uniqueId);
    if (deadEnemies.length > 0) {
        gameState.combat.turnOrder = gameState.combat.turnOrder.filter(id => !deadEnemies.includes(id));
    }

    // Find the current index again in case the array was modified
    const currentIndex = gameState.combat.turnOrder.indexOf(enemy.uniqueId);
    gameState.combat.turnIndex = (currentIndex + 1) % gameState.combat.turnOrder.length;

    if (gameState.combat.turnIndex === 0 && gameState.combat.turnOrder.includes('player')) {
        gameState.combat.round++;
    } else if (!gameState.combat.turnOrder.includes('player')) {
        // This case shouldn't happen if player death is handled, but as a fallback.
        checkWinCondition();
        return;
    }

    combatTurnLoop();
}


function checkWinCondition() {
    const allEnemiesDefeated = gameState.combat.enemies.every(e => e.hp <= 0);
    if (allEnemiesDefeated) {
        gameState.combat.active = false;
        logMessage(`Victory!`, "gain");

        // Grant XP from all enemies
        const totalXp = gameState.combat.enemies.reduce((sum, e) => sum + (enemies[e.id].xp || 0), 0);
        if (gainXp(totalXp)) {
            logMessage(`Leveled up to ${gameState.player.level}!`, "gain");
        } else {
             logMessage(`Gained ${totalXp} XP.`, "gain");
        }

        updateStatsUI();
        saveGame();

        // Need to switch back to main log before going to next scene
        window.logMessage = logToMain;

        // Show a "Continue" button
        const actionsContainer = document.getElementById('battle-actions-container');
        actionsContainer.innerHTML = '';
        actionsContainer.appendChild(
            createActionButton('Victory!', 'celebration', () => goToScene(gameState.combat.winSceneId), 'col-span-2')
        );
        return true; // Combat ended
    }
    return false; // Combat continues
}

// --- UI Updates ---
function updateStatsUI() {
    const p = gameState.player;
    document.getElementById('char-name').innerText = p.name;
    document.getElementById('char-class').innerText = p.classId ? classes[p.classId].name : "Class";
    document.getElementById('char-level').innerText = `Lvl ${p.level}`;
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
    if (p.classId === 'fighter') return 10 + p.modifiers.DEX; // Fallback or Unarmored Defense logic?
    // Simple default: 10 + DEX
    return 10 + p.modifiers.DEX;
}

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
    return true;
}

function performShortRest() {
    // Simplified: Heal 1 HD
    const cls = classes[gameState.player.classId];
    const roll = rollDie(cls.hitDie) + gameState.player.modifiers.CON;
    const healed = Math.max(1, roll);
    gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + healed);

    if (gameState.player.resources['second_wind']) {
        gameState.player.resources['second_wind'].current = gameState.player.resources['second_wind'].max;
    }

    return healed;
}

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

function toggleInventory(forceOpen = null) {
    const modal = document.getElementById('inventory-modal');
    const list = document.getElementById('inventory-list');

    if (forceOpen === false || (forceOpen === null && !modal.classList.contains('hidden'))) {
        modal.classList.add('hidden');
        return;
    }

    modal.classList.remove('hidden');
    list.innerHTML = '';

    if (gameState.player.inventory.length === 0) {
        list.innerHTML = '<p>Empty.</p>';
        return;
    }

    gameState.player.inventory.forEach(itemId => {
        const item = items[itemId];
        if (!item) return;

        const row = document.createElement('div');
        row.className = 'inventory-item';
        row.innerHTML = `<strong>${item.name}</strong> <small>${item.type}</small>`;

        const actions = document.createElement('div');

        if (item.type === 'weapon' || item.type === 'armor') {
            const equipBtn = document.createElement('button');
            const isEquipped = (gameState.player.equippedWeaponId === itemId || gameState.player.equippedArmorId === itemId);
            equipBtn.innerText = isEquipped ? "Equipped" : "Equip";
            equipBtn.disabled = isEquipped;
            equipBtn.onclick = () => {
                const res = equipItem(itemId);
                if (res.success) {
                    logMessage(`Equipped ${item.name}.`, "system");
                    toggleInventory(true); // Refresh
                    updateStatsUI();
                } else {
                    logMessage(`Cannot equip: ${res.reason}`, "check-fail");
                }
            };
            actions.appendChild(equipBtn);
        } else if (item.type === 'consumable') {
            const useBtn = document.createElement('button');
            useBtn.innerText = "Use";
            useBtn.onclick = () => {
                const res = useConsumable(itemId);
                if (res.success) {
                    logMessage(res.msg, "gain");
                    toggleInventory(true);
                    updateStatsUI();
                } else {
                    logMessage(res.msg, "check-fail");
                }
            };
            actions.appendChild(useBtn);
        }

        row.appendChild(actions);
        list.appendChild(row);
    });
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

// --- Global Logging ---
// We'll have two separate log functions and swap them based on game state.

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
    // Simplified markup for battle log
    const entry = document.createElement('p');
    const typeToColor = {
        'combat': 'text-red-400',
        'gain': 'text-green-400',
        'system': 'text-primary',
        'default': 'text-[#cbc190]'
    };
    // Basic span replacement for bolding
    msg = msg.replace(/(\w+'s turn)/g, '<span class="font-bold text-primary">$1</span>');
    entry.innerHTML = `<span class="${typeToColor[type] || typeToColor['default']}">${msg}</span>`;

    logContent.appendChild(entry);
    logContent.scrollTop = logContent.scrollHeight;
     console.log(`[Battle Log - ${type}] ${msg}`);
}

// Default log is main
window.logMessage = logToMain;

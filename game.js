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

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initUI();
    showCharacterCreation();
});

function initUI() {
    window.logMessage = logMessage;

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

function showCharacterCreation() {
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

    // Determine if first visit
    const firstVisit = !gameState.visitedScenes.includes(sceneId);
    if (firstVisit) {
        gameState.visitedScenes.push(sceneId);
    }

    gameState.currentSceneId = sceneId;
    if (scene.location) discoverLocation(scene.location);

    // Faction Hostility Check
    if (scene.type !== 'combat' && scene.location === 'silverthorn') {
        if (getReputation('silverthorn') <= -50) {
            logMessage("The guards recognize you as an enemy of the state!", "combat");
            // Override scene to combat
            startCombat('fungal_beast', 'SCENE_DEFEAT', 'SCENE_DEFEAT'); // Placeholder enemy/scenes
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
        const runOnEnter = !scene.onEnter.once || firstVisit;
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
                // Specialized handling for NPC flags if needed
                if (scene.onEnter.setFlag === 'aodhan_dead') {
                    setNpcStatus('aodhan', 'dead');
                }
            }
        }
    }

    triggerAmbientByThreat(scene.location);

    if (scene.type === 'combat') {
        document.getElementById('shop-panel').classList.add('hidden');
        startCombat(scene.enemyId, scene.winScene, scene.loseScene);
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

function startCombat(enemyId, winScene, loseScene) {
    const enemyDef = enemies[enemyId];
    if (!enemyDef) return;

    gameState.combat = {
        active: true,
        enemyId: enemyId,
        enemyCurrentHp: enemyDef.hp,
        enemyMaxHp: enemyDef.hp,
        enemyAc: enemyDef.ac,
        enemyName: enemyDef.name,
        round: 1,
        winSceneId: winScene,
        loseSceneId: loseScene,
        defending: false
    };

    logMessage(`Combat started against ${enemyDef.name}!`, "combat");

    const playerInit = rollInitiative(gameState, 'player');
    const enemyInit = rollInitiative(gameState, 'enemy', enemyDef.attackBonus);
    gameState.combat.playerInitiative = playerInit.total;
    gameState.combat.enemyInitiative = enemyInit.total;

    logMessage(`Initiative: You ${playerInit.total} vs Enemy ${enemyInit.total}`, "system");
    gameState.combat.turn = (playerInit.total >= enemyInit.total) ? 'player' : 'enemy';
    combatTurnLoop();
}

function combatTurnLoop() {
    if (!gameState.combat.active) return;
    updateCombatUI();
    if (gameState.combat.turn === 'player') {
        logMessage(`Round ${gameState.combat.round} - Your Turn`, "system");
    } else {
        logMessage(`Round ${gameState.combat.round} - Enemy Turn`, "system");
        setTimeout(enemyTurn, 1000);
    }
}

function updateCombatUI() {
    const c = gameState.combat;
    const txt = `Combat Mode - Round ${c.round}\n\nEnemy: ${c.enemyName} (HP: ${c.enemyCurrentHp})\nPlayer HP: ${gameState.player.hp}/${gameState.player.maxHp}`;
    document.getElementById('narrative-text').innerText = txt;
    const choiceContainer = document.getElementById('choice-container');
    choiceContainer.innerHTML = '';

    if (c.turn === 'player') {
        renderPlayerActions(choiceContainer);
    } else {
        const btn = document.createElement('button');
        btn.innerText = "Enemy Acting...";
        btn.disabled = true;
        choiceContainer.appendChild(btn);
    }
}

function renderPlayerActions(container) {
    const actions = [
        { text: "Attack", action: "attack" },
        { text: "Cast Spell", action: "spell_menu" },
        { text: "Use Item", action: "item_menu" },
        { text: "Feature", action: "feature_menu" }, // New
        { text: "Defend", action: "defend" },
        { text: "Flee", action: "flee" }
    ];

    actions.forEach(act => {
        const btn = document.createElement('button');
        btn.innerText = act.text;
        btn.onclick = () => handleCombatAction(act.action);

        if (act.action === 'spell_menu') {
            const hasSpells = gameState.player.knownSpells && gameState.player.knownSpells.length > 0;
            if (!hasSpells) btn.disabled = true;
        }
        // Disable features if none
        if (act.action === 'feature_menu') {
            const hasFeats = Object.keys(gameState.player.resources || {}).length > 0;
            if (!hasFeats) btn.disabled = true;
        }

        container.appendChild(btn);
    });
}

function handleCombatAction(action) {
    if (action === 'attack') performAttack();
    else if (action === 'spell_menu') renderSpellMenu();
    else if (action === 'item_menu') toggleInventory(true);
    else if (action === 'feature_menu') renderFeatureMenu();
    else if (action === 'defend') performDefend();
    else if (action === 'flee') performFlee();
}

function performAttack() {
    const weaponId = gameState.player.equippedWeaponId;
    const weapon = items[weaponId] || { name: "Unarmed", damage: "1d2", modifier: "STR", damageType: "bludgeoning", subtype: "simple" };
    const stat = weapon.modifier || "STR";

    // Check Proficiency
    const cls = classes[gameState.player.classId];
    let isProficient = false;
    if (weapon.subtype && cls.weaponProficiencies && cls.weaponProficiencies.includes(weapon.subtype)) {
        isProficient = true;
    }
    // Specific weapon check (if we had specific proficiencies) could go here.
    // Default to simple/martial logic.

    const prof = isProficient ? gameState.player.proficiencyBonus : 0;

    const result = rollAttack(gameState, stat, prof);
    const c = gameState.combat;
    const enemyDef = enemies[c.enemyId];

    let msg = `You attack with ${weapon.name}: ${result.roll} + ${result.modifier} = ${result.total} (vs AC ${c.enemyAc})${result.note}`;
    if (result.isCritical) msg += " CRITICAL HIT!";
    logMessage(msg, "system");

    if (result.total >= c.enemyAc || result.isCritical) {
        let dmgExpr = weapon.damage;
        if (result.isCritical) {
            // Assuming getCritDamageExpression logic here or simplified
            // Re-implementing simple crit logic for this patch
            const regex = /(\d+)d(\d+)([+-]\d+)?/;
            const match = dmgExpr.match(regex);
            if (match) dmgExpr = `${parseInt(match[1])*2}d${match[2]}${match[3]||''}`;
        }

        let dmg = rollDiceExpression(dmgExpr).total + gameState.player.modifiers[stat];

        // Resistance/Vulnerability
        if (enemyDef.resistances && enemyDef.resistances.includes(weapon.damageType)) {
            dmg = Math.floor(dmg / 2);
            logMessage("Resisted!", "combat");
        }
        if (enemyDef.vulnerabilities && enemyDef.vulnerabilities.includes(weapon.damageType)) {
            dmg = dmg * 2;
            logMessage("Vulnerable!", "combat");
        }

        c.enemyCurrentHp -= Math.max(1, dmg);
        logMessage(`Hit! Dealt ${dmg} ${weapon.damageType} damage.`, "combat");
    } else {
        logMessage("Miss!", "system");
    }

    checkWinCondition();
    if (gameState.combat.active) endPlayerTurn();
}

// Spellcasting Logic Updated
function renderSpellMenu() {
    const container = document.getElementById('choice-container');
    container.innerHTML = '';

    // Show Slots
    if (gameState.player.currentSlots && gameState.player.currentSlots[1] !== undefined) {
        const div = document.createElement('div');
        div.style.width = "100%"; div.style.textAlign = "center";
        div.innerText = `Level 1 Slots: ${gameState.player.currentSlots[1]}/${gameState.player.spellSlots[1]}`;
        container.appendChild(div);
    }

    const spellList = gameState.player.knownSpells || [];
    spellList.forEach(spellId => {
        if (spells[spellId]) {
            const spell = spells[spellId];
            const btn = document.createElement('button');
            btn.innerText = spell.name;

            // Check slot
            if (spell.level > 0) {
                if (!gameState.player.currentSlots || !gameState.player.currentSlots[spell.level] || gameState.player.currentSlots[spell.level] <= 0) {
                    btn.disabled = true;
                    btn.innerText += " (No Slots)";
                }
            }

            btn.onclick = () => performCastSpell(spellId);
            container.appendChild(btn);
        }
    });

    const backBtn = document.createElement('button');
    backBtn.innerText = "Back";
    backBtn.onclick = () => updateCombatUI();
    container.appendChild(backBtn);
}

function performCastSpell(spellId) {
    const spell = spells[spellId];
    const c = gameState.combat;
    const enemyDef = enemies[c.enemyId];

    // Deduct Slot
    if (spell.level > 0) {
        if (gameState.player.currentSlots[spell.level] > 0) {
            gameState.player.currentSlots[spell.level]--;
            logMessage(`Consumed Level ${spell.level} Spell Slot.`, "system");
        } else {
            logMessage("Not enough spell slots!", "check-fail");
            return;
        }
    }

    logMessage(`Casting ${spell.name}...`, "combat");

    if (spell.id === 'magic_missile') {
        // Auto Hit
        let dmg = rollDiceExpression(spell.damage).total;
        c.enemyCurrentHp -= Math.max(1, dmg);
        logMessage(`Magic Missile hits! Dealt ${dmg} force damage.`, "combat");
        checkWinCondition();
        if (gameState.combat.active) endPlayerTurn();
        return;
    }

    if (spell.type === 'attack') {
        const stat = (gameState.player.classId === 'wizard') ? 'INT' : 'WIS';
        const prof = gameState.player.proficiencyBonus;
        const result = rollAttack(gameState, stat, prof);

        let msg = `Spell Attack: ${result.roll} + ${result.modifier} = ${result.total} (vs AC ${c.enemyAc})${result.note}`;
        if (result.isCritical) msg += " CRITICAL HIT!";
        logMessage(msg, "system");

        if (result.total >= c.enemyAc || result.isCritical) {
            let dmgExpr = spell.damage;
            if (result.isCritical) {
               const regex = /(\d+)d(\d+)([+-]\d+)?/;
               const match = dmgExpr.match(regex);
               if (match) dmgExpr = `${parseInt(match[1])*2}d${match[2]}${match[3]||''}`;
            }

            let dmg = rollDiceExpression(dmgExpr).total;

            if (enemyDef.resistances?.includes(spell.damageType)) { dmg = Math.floor(dmg / 2); logMessage("Resisted!", "combat"); }
            if (enemyDef.vulnerabilities?.includes(spell.damageType)) { dmg *= 2; logMessage("Vulnerable!", "combat"); }

            c.enemyCurrentHp -= Math.max(1, dmg);
            logMessage(`Hit! Dealt ${dmg} ${spell.damageType} damage.`, "combat");
        } else {
            logMessage("Miss!", "system");
        }
    } else if (spell.type === 'save') {
        // Simple Save Logic
        // Enemy Save: d20 + (assume +0 or basic stat?) - Enemy doesn't have stats in this patch
        // Using 10 + 0 for now
        const enemySaveRoll = rollDie(20);
        const saveDC = 8 + gameState.player.proficiencyBonus + gameState.player.modifiers[(gameState.player.classId === 'wizard') ? 'INT' : 'WIS'];

        logMessage(`Enemy ${spell.saveAbility} Save: ${enemySaveRoll} vs DC ${saveDC}`, "system");

        let dmg = rollDiceExpression(spell.damage).total;
        if (enemySaveRoll >= saveDC) {
            dmg = Math.floor(dmg / 2);
            logMessage("Enemy saved! Half damage.", "combat");
        } else {
            logMessage("Enemy failed save!", "combat");
        }

        if (enemyDef.resistances?.includes(spell.damageType)) { dmg = Math.floor(dmg / 2); logMessage("Resisted!", "combat"); }
        if (enemyDef.vulnerabilities?.includes(spell.damageType)) { dmg *= 2; logMessage("Vulnerable!", "combat"); }

        c.enemyCurrentHp -= Math.max(1, dmg);
        logMessage(`Dealt ${dmg} ${spell.damageType} damage.`, "combat");

    } else if (spell.type === 'heal') {
        const roll = rollDiceExpression(spell.amount);
        gameState.player.hp = Math.min(gameState.player.hp + roll.total, gameState.player.maxHp);
        logMessage(`Healed for ${roll.total} HP.`, "gain");
        updateStatsUI();
    }

    checkWinCondition();
    if (gameState.combat.active) endPlayerTurn();
}

// Feature Logic
function renderFeatureMenu() {
    const container = document.getElementById('choice-container');
    container.innerHTML = '';

    for (const [feat, data] of Object.entries(gameState.player.resources)) {
        const btn = document.createElement('button');
        // Assuming friendly names mapping or raw
        const name = feat.replace('_', ' ').toUpperCase();
        btn.innerText = `${name} (${data.current}/${data.max})`;
        if (data.current <= 0) btn.disabled = true;

        btn.onclick = () => performClassFeature(feat);
        container.appendChild(btn);
    }

    const backBtn = document.createElement('button');
    backBtn.innerText = "Back";
    backBtn.onclick = () => updateCombatUI();
    container.appendChild(backBtn);
}

function performClassFeature(featId) {
    if (featId === 'second_wind') {
        gameState.player.resources[featId].current--;
        const heal = rollDie(10) + gameState.player.level;
        gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + heal);
        logMessage(`Second Wind: Healed ${heal} HP.`, "gain");
        updateStatsUI();
        // Second Wind is a Bonus Action technically, but treating as Action for simplicity or Free?
        // Let's treat as free for now or action? "Lite" usually means action.
        // But 5e it's bonus. I'll keep player turn active!
        logMessage("Second Wind used (Bonus Action).", "system");
        renderFeatureMenu(); // Refresh UI
    }
}

function performDefend() {
    gameState.combat.defending = true;
    logMessage("You brace yourself for the next attack.", "system");
    endPlayerTurn();
}

function performFlee() {
    const roll = rollDie(20);
    const dexMod = gameState.player.modifiers.DEX;
    const total = roll + dexMod;
    const dc = 12;
    logMessage(`Attempting to flee: Rolled ${total} (DC ${dc})`, "system");
    if (total >= dc) {
        logMessage("You escaped!", "gain");
        gameState.combat.active = false;
        goToScene(gameState.combat.loseSceneId);
    } else {
        logMessage("Failed to escape!", "combat");
        endPlayerTurn();
    }
}

function endPlayerTurn() {
    gameState.combat.turn = 'enemy';
    combatTurnLoop();
}

function enemyTurn() {
    if (!gameState.combat.active) return;
    const c = gameState.combat;
    const enemyDef = enemies[c.enemyId];
    logMessage(`${c.enemyName} attacks!`, "combat");

    const roll = rollDie(20);
    const totalHit = roll + enemyDef.attackBonus;

    const ac = getPlayerAC();

    logMessage(`Enemy rolls ${totalHit} vs AC ${ac}`, "system");

    if (totalHit >= ac) {
        let dmg = rollDiceExpression(enemyDef.damage).total;
        if (c.defending) {
            dmg = Math.floor(dmg / 2);
            logMessage("Defended! Damage halved.", "gain");
            c.defending = false;
        }
        gameState.player.hp -= dmg;
        logMessage(`You took ${dmg} damage.`, "combat");
        if (c.enemyId === 'fungal_beast' && rollDie(100) <= 25) {
            applyStatusEffect('poisoned', 3);
        }
        updateStatsUI();
        if (gameState.player.hp <= 0) {
            gameState.combat.active = false;
            goToScene(c.loseSceneId);
            return;
        }
    } else {
        logMessage("Enemy missed!", "system");
        c.defending = false;
    }
    endEnemyTurn();
}

function endEnemyTurn() {
    gameState.combat.turn = 'player';
    gameState.combat.round++;
    tickStatusEffects();
    combatTurnLoop();
}

function checkWinCondition() {
    const c = gameState.combat;
    if (c.enemyCurrentHp <= 0) {
        c.active = false;
        const enemyDef = enemies[c.enemyId];
        logMessage(`Victory! Gained ${enemyDef.xp} XP.`, "gain");
        if (gainXp(enemyDef.xp)) {
            logMessage("Level Up! Stats increased.", "gain");
        }
        updateStatsUI();
        saveGame();
        goToScene(c.winSceneId);
    }
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

// Global Logging
function logMessage(msg, type) {
    const logContent = document.getElementById('log-content');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerText = msg;
    logContent.appendChild(entry);
    logContent.scrollTop = logContent.scrollHeight;
    console.log(`[${type}] ${msg}`);
}

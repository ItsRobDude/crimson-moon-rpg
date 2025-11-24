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
import { gameState, initializeNewGame, updateQuestStage, addGold, spendGold, gainXp, equipItem, useConsumable, applyStatusEffect, hasStatusEffect, tickStatusEffects, discoverLocation, isLocationDiscovered, addItem, changeRelationship, changeReputation, getRelationship, getReputation } from './data/gameState.js';
import { rollDiceExpression, rollSkillCheck, rollSavingThrow, rollDie, rollAttack, rollInitiative, getAbilityMod } from './rules.js';

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initUI();
    showCharacterCreation();
});

function initUI() {
    // Attach Global Log for GameState access
    window.logMessage = logMessage;

    // Buttons
    document.getElementById('btn-inventory').onclick = () => toggleInventory(false);
    document.getElementById('btn-quests').onclick = toggleQuestLog;
    document.getElementById('btn-menu').onclick = toggleMenu;
    document.getElementById('btn-map').onclick = toggleMap;
    document.getElementById('btn-codex').onclick = () => toggleCodex('people');

    // Codex Tabs
    document.getElementById('btn-codex-people').onclick = () => toggleCodex('people');
    document.getElementById('btn-codex-factions').onclick = () => toggleCodex('factions');

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.onclick = (e) => {
            e.target.closest('.modal').classList.add('hidden');
        };
    });

    document.getElementById('btn-start-game').onclick = finishCharacterCreation;

    // Debug
    document.getElementById('btn-debug-toggle').onclick = () => {
        logMessage("Debug mode toggled.", "system");
    };

    document.getElementById('btn-save').onclick = saveGame;
    document.getElementById('btn-load').onclick = loadGame;
    document.getElementById('btn-tutorial').onclick = () => {
        document.getElementById('tutorial-overlay').classList.remove('hidden');
    };
}

// --- Character Creation State ---
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

    // Ability Score UI
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

    // Default assignment
    ccState.baseStats = {
        STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8
    };

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
            if (val === standardArray[index]) opt.selected = true; // Default distribution
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
        availableSpells = ['firebolt', 'magic_missile', 'cure_wounds'];
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


// --- Scene Engine ---
function goToScene(sceneId) {
    const scene = scenes[sceneId];
    if (!scene) {
        console.error("Scene not found:", sceneId);
        return;
    }

    gameState.currentSceneId = sceneId;

    if (scene.location) {
        discoverLocation(scene.location);
    }

    const bgEl = document.getElementById('scene-background');
    if (scene.background) {
        bgEl.style.backgroundImage = `url('${scene.background}')`;
    }

    const portraitContainer = document.getElementById('portrait-container');
    const portraitImg = document.getElementById('npc-portrait');
    if (scene.npcPortrait) {
        portraitImg.src = scene.npcPortrait;
        portraitContainer.classList.remove('hidden');
    } else {
        portraitContainer.classList.add('hidden');
    }

    const textBox = document.getElementById('narrative-text');
    textBox.innerText = scene.text;

    if (scene.onEnter) {
        if (scene.onEnter.questUpdate) {
            updateQuestStage(scene.onEnter.questUpdate.id, scene.onEnter.questUpdate.stage);
            const q = quests[scene.onEnter.questUpdate.id];
            logMessage(`Quest Updated: ${q.title}`, "gain");
        }
        if (scene.onEnter.addGold) {
            addGold(scene.onEnter.addGold);
            logMessage(`Gained ${scene.onEnter.addGold} gold.`, "gain");
        }
    }

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
            // Check Requirements (Gates)
            if (choice.requires) {
                if (choice.requires.relationship) {
                    const req = choice.requires.relationship;
                    const current = getRelationship(req.npcId);
                    if (current < (req.min || -999) || current > (req.max || 999)) return;
                }
                if (choice.requires.reputation) {
                    const req = choice.requires.reputation;
                    const current = getReputation(req.factionId);
                    if (current < (req.min || -999) || current > (req.max || 999)) return;
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
    }
    if (choice.action === 'openMap') {
        toggleMap();
        return;
    }
    if (choice.action === 'shortRest') {
        if (spendGold(choice.cost)) {
            const heal = Math.ceil(gameState.player.maxHp / 2);
            gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + heal);
            logMessage(`Short Rest: Healed ${heal} HP.`, "gain");
            updateStatsUI();
        } else {
            logMessage("Not enough gold for a short rest.", "check-fail");
        }
        return;
    }
    if (choice.action === 'longRest') {
        if (spendGold(choice.cost)) {
            gameState.player.hp = gameState.player.maxHp;
            gameState.player.statusEffects = [];
            logMessage("Long Rest: Fully restored HP and status cleared.", "gain");
            updateStatsUI();
        } else {
            logMessage("Not enough gold for a long rest.", "check-fail");
        }
        return;
    }

    // Apply Effects
    if (choice.effects) {
        choice.effects.forEach(effect => {
            if (effect.type === 'relationship') {
                changeRelationship(effect.npcId, effect.amount);
            }
            if (effect.type === 'reputation') {
                changeReputation(effect.factionId, effect.amount);
            }
        });
    }

    if (!choice.type) {
        if (choice.nextScene) {
            goToScene(choice.nextScene);
        }
        return;
    }

    if (choice.type === 'skillCheck') {
        const result = rollSkillCheck(gameState, choice.skill);
        const dc = choice.dc;

        logMessage(`Skill Check (${choice.skill}): Rolled ${result.roll} + ${result.modifier} = ${result.total} (DC ${dc})${result.note || ''}`, result.total >= dc ? "check-success" : "check-fail");

        if (result.total >= dc) {
            if (choice.onSuccess && choice.onSuccess.addGold) {
                addGold(choice.onSuccess.addGold);
            }
            document.getElementById('narrative-text').innerText = choice.successText;
            if (choice.nextSceneSuccess) renderContinueButton(choice.nextSceneSuccess);
        } else {
            document.getElementById('narrative-text').innerText = choice.failText;
            if (choice.nextSceneFail) renderContinueButton(choice.nextSceneFail);
        }
    } else if (choice.type === 'save') {
        const result = rollSavingThrow(gameState, choice.ability);
        const dc = choice.dc;

        logMessage(`${choice.ability} Save: Rolled ${result.roll} + ${result.modifier} = ${result.total} (DC ${dc})${result.note || ''}`, result.total >= dc ? "check-success" : "check-fail");

        if (result.total >= dc) {
            document.getElementById('narrative-text').innerText = choice.successText;
        } else {
            document.getElementById('narrative-text').innerText = choice.failText;
            if (choice.failEffect && choice.failEffect.type === 'damage') {
                const dmg = rollDiceExpression(choice.failEffect.amount);
                gameState.player.hp -= dmg.total;
                logMessage(`Took ${dmg.total} damage.`, "combat");
                updateStatsUI();
                if (gameState.player.hp <= 0) {
                    goToScene('SCENE_DEFEAT');
                    return;
                }
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
    list.innerHTML = '';

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
    if (locationId === 'silverthorn') return 'SCENE_HUB_SILVERTHORN';
    if (locationId === 'shadowmire') return 'SCENE_TRAVEL_SHADOWMIRE';
    if (locationId === 'whisperwood') return 'SCENE_ARRIVAL_WHISPERWOOD';
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
    if (!enemyDef) {
        console.error("Enemy not found:", enemyId);
        return;
    }

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

    if (playerInit.total >= enemyInit.total) {
        gameState.combat.turn = 'player';
    } else {
        gameState.combat.turn = 'enemy';
    }

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

        container.appendChild(btn);
    });
}

function handleCombatAction(action) {
    if (action === 'attack') performAttack();
    else if (action === 'spell_menu') renderSpellMenu();
    else if (action === 'item_menu') toggleInventory(true);
    else if (action === 'defend') performDefend();
    else if (action === 'flee') performFlee();
}

function performAttack() {
    const weaponId = gameState.player.equippedWeaponId;
    const weapon = items[weaponId] || { name: "Unarmed", damage: "1d2", modifier: "STR" };
    const stat = weapon.modifier || "STR";
    const prof = gameState.player.proficiencyBonus;

    const result = rollAttack(gameState, stat, prof);
    const c = gameState.combat;

    logMessage(`You attack with ${weapon.name}: ${result.roll} + ${result.modifier} = ${result.total} (vs AC ${c.enemyAc})${result.note}`, "system");

    if (result.total >= c.enemyAc) {
        const dmgRoll = rollDiceExpression(weapon.damage);
        const mod = gameState.player.modifiers[stat];
        const totalDmg = Math.max(1, dmgRoll.total + mod);
        c.enemyCurrentHp -= totalDmg;
        logMessage(`Hit! Dealt ${totalDmg} damage.`, "combat");
    } else {
        logMessage("Miss!", "system");
    }

    checkWinCondition();
    if (gameState.combat.active) endPlayerTurn();
}

function renderSpellMenu() {
    const container = document.getElementById('choice-container');
    container.innerHTML = '';

    const spellList = gameState.player.knownSpells || [];

    if (spellList.length === 0) {
        const msg = document.createElement('button');
        msg.innerText = "No spells memorized.";
        msg.disabled = true;
        container.appendChild(msg);
    }

    spellList.forEach(spellId => {
        if (spells[spellId]) {
            const btn = document.createElement('button');
            btn.innerText = spells[spellId].name;
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

    logMessage(`Casting ${spell.name}...`, "combat");

    if (spell.type === 'attack') {
        const stat = (gameState.player.classId === 'wizard') ? 'INT' : 'WIS';
        const prof = gameState.player.proficiencyBonus;
        const result = rollAttack(gameState, stat, prof);

        logMessage(`Spell Attack: ${result.roll} + ${result.modifier} = ${result.total} (vs AC ${c.enemyAc})${result.note}`, "system");

        if (result.total >= c.enemyAc) {
            const dmgRoll = rollDiceExpression(spell.damage);
            c.enemyCurrentHp -= dmgRoll.total;
            logMessage(`Hit! Dealt ${dmgRoll.total} damage.`, "combat");
        } else {
            logMessage("Miss!", "system");
        }
    } else if (spell.type === 'heal') {
        const roll = rollDiceExpression(spell.amount);
        gameState.player.hp = Math.min(gameState.player.hp + roll.total, gameState.player.maxHp);
        logMessage(`Healed for ${roll.total} HP.`, "gain");
        updateStatsUI();
    }

    checkWinCondition();
    if (gameState.combat.active) endPlayerTurn();
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

    let ac = 10 + gameState.player.modifiers.DEX;
    if (gameState.player.equippedArmorId) {
        const armor = items[gameState.player.equippedArmorId];
        if (armor) ac = armor.acBase;
    }

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

    const hpPct = Math.max(0, (p.hp / p.maxHp) * 100);
    document.getElementById('hp-bar-fill').style.width = `${hpPct}%`;
    document.getElementById('hp-text').innerText = `HP: ${p.hp}/${p.maxHp}`;

    const xpPct = Math.max(0, (p.xp / p.xpNext) * 100);
    document.getElementById('xp-bar-fill').style.width = `${xpPct}%`;
    document.getElementById('xp-text').innerText = `XP: ${p.xp}/${p.xpNext}`;
}

function logMessage(msg, type = "system") {
    const log = document.getElementById('log-content');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerText = msg;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

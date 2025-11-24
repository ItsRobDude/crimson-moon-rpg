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
import { gameState, initializeNewGame, updateQuestStage, addGold, spendGold, gainXp, equipItem, useConsumable, applyStatusEffect, hasStatusEffect, tickStatusEffects, discoverLocation, isLocationDiscovered, addItem } from './data/gameState.js';
import { rollDiceExpression, rollSkillCheck, rollSavingThrow, rollDie, rollAttack, rollInitiative, getAbilityMod } from './rules.js';

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initUI();
    showCharacterCreation();
});

function initUI() {
    // Buttons
    document.getElementById('btn-inventory').onclick = () => toggleInventory(false);
    document.getElementById('btn-quests').onclick = toggleQuestLog;
    document.getElementById('btn-menu').onclick = toggleMenu;
    document.getElementById('btn-map').onclick = toggleMap;

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

    // Update Descriptions
    document.getElementById('cc-race-desc').innerText = race.description;
    document.getElementById('cc-class-desc').innerText = cls.description;

    // Calculate Final Stats
    const finalStats = { ...ccState.baseStats };
    if (race.abilityBonuses) {
        for (const [stat, bonus] of Object.entries(race.abilityBonuses)) {
            if (finalStats[stat]) finalStats[stat] += bonus;
        }
    }

    // Render Skills
    renderSkillChoices(cls);

    // Render Spells
    renderSpellChoices(cls);

    // Update Preview Panel
    const preview = document.getElementById('cc-preview-content');
    preview.innerHTML = '';

    // Stats
    Object.entries(finalStats).forEach(([stat, val]) => {
        const mod = getAbilityMod(val);
        const div = document.createElement('div');
        div.className = 'preview-stat';
        div.innerHTML = `<span>${stat}</span> <span>${val} (${mod >= 0 ? '+' : ''}${mod})</span>`;
        preview.appendChild(div);
    });

    // Derived
    const hp = cls.hitDie + getAbilityMod(finalStats.CON);
    // AC Estimate (Fighter -> Chain(16), Rogue -> Leather(11)+Dex, Wizard -> 10+Dex)
    let ac = 10 + getAbilityMod(finalStats.DEX);
    if (classKey === 'fighter') ac = 16; // Chainmail
    if (classKey === 'rogue') ac = 11 + getAbilityMod(finalStats.DEX); // Leather

    preview.innerHTML += `<div class="preview-stat highlight"><span>HP</span> <span>${hp}</span></div>`;
    preview.innerHTML += `<div class="preview-stat"><span>AC</span> <span>${ac}</span></div>`;

    // Selected Skills
    if (ccState.chosenSkills.length > 0) {
        preview.innerHTML += `<div class="preview-stat highlight"><span>Skills</span></div>`;
        ccState.chosenSkills.forEach(s => {
             preview.innerHTML += `<div class="preview-stat" style="padding-left:10px; font-size:0.8em;">${s}</div>`;
        });
    }

    // Selected Spells
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

    const max = 2; // Standard 2 skills
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
                    e.target.checked = false; // Limit reached
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
        availableSpells = ['firebolt', 'magic_missile', 'cure_wounds']; // As per prompt
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
        label.appendChild(document.createTextNode(` ${spell.name}`)); // Could add tooltip?
        div.appendChild(label);
        container.appendChild(div);
    });
}

function finishCharacterCreation() {
    const name = document.getElementById('cc-name').value || "Traveler";
    const raceKey = document.getElementById('cc-race').value;
    const classKey = document.getElementById('cc-class').value;

    // Validation
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

    // Auto-discover location
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

    // Handle Scene Type
    if (scene.type === 'combat') {
        document.getElementById('shop-panel').classList.add('hidden'); // Ensure shop closed
        startCombat(scene.enemyId, scene.winScene, scene.loseScene);
    } else if (scene.type === 'shop') {
        renderShop(scene.shopId);
        gameState.combat.active = false;
        renderChoices(scene.choices);
        saveGame();
    } else {
        document.getElementById('shop-panel').classList.add('hidden'); // Ensure shop closed
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
            gameState.player.statusEffects = []; // Clear status
            logMessage("Long Rest: Fully restored HP and status cleared.", "gain");
            updateStatsUI();
        } else {
            logMessage("Not enough gold for a long rest.", "check-fail");
        }
        return;
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
            if (choice.onSuccess) {
                if (choice.onSuccess.addGold) addGold(choice.onSuccess.addGold);
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

        const row = document.createElement('div');
        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.alignItems = "center";
        row.style.padding = "8px";
        row.style.borderBottom = "1px solid #444";

        const info = document.createElement('div');
        info.innerHTML = `<strong>${item.name}</strong> (${item.price}g)<br><small>${item.description}</small>`;

        const btn = document.createElement('button');
        btn.innerText = "Buy";
        btn.onclick = () => {
            if (spendGold(item.price)) {
                addItem(itemId);
                logMessage(`Bought ${item.name}.`, "gain");
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

    // Render Discovered Locations
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

            // Disable if already there
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
    // Close Map
    document.getElementById('map-modal').classList.add('hidden');

    logMessage(`Traveling to ${locations[locationId].name}...`, "system");

    // Random Event Check (20%)
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

    // No event, go to hub
    goToScene(getHubSceneForLocation(locationId));
}

function getHubSceneForLocation(locationId) {
    // Mapping
    if (locationId === 'silverthorn') return 'SCENE_HUB_SILVERTHORN'; // New hub
    if (locationId === 'shadowmire') return 'SCENE_TRAVEL_SHADOWMIRE'; // Use entrance as hub
    if (locationId === 'whisperwood') return 'SCENE_ARRIVAL_WHISPERWOOD';

    return 'SCENE_BRIEFING'; // Fallback
}

// --- Combat System ---

function startCombat(enemyId, winScene, loseScene) {
    const enemyDef = enemies[enemyId];
    if (!enemyDef) {
        console.error("Enemy not found:", enemyId);
        return;
    }

    // 1. Initialize Combat State
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

    // 2. Roll Initiative
    const playerInit = rollInitiative(gameState, 'player');
    const enemyInit = rollInitiative(gameState, 'enemy', enemyDef.attackBonus); // Using attack bonus as proxy for DEX/Init bonus

    gameState.combat.playerInitiative = playerInit.total;
    gameState.combat.enemyInitiative = enemyInit.total;

    logMessage(`Initiative: You ${playerInit.total} vs Enemy ${enemyInit.total}`, "system");

    // 3. Determine Start Turn
    if (playerInit.total >= enemyInit.total) {
        gameState.combat.turn = 'player';
    } else {
        gameState.combat.turn = 'enemy';
    }

    // 4. Start Loop
    combatTurnLoop();
}

function combatTurnLoop() {
    if (!gameState.combat.active) return;

    updateCombatUI();

    if (gameState.combat.turn === 'player') {
        logMessage(`Round ${gameState.combat.round} - Your Turn`, "system");
        // Player waits for input, buttons already rendered by updateCombatUI
    } else {
        logMessage(`Round ${gameState.combat.round} - Enemy Turn`, "system");
        setTimeout(enemyTurn, 1000);
    }
}

function updateCombatUI() {
    // Update Text
    const c = gameState.combat;
    const txt = `Combat Mode - Round ${c.round}\n\nEnemy: ${c.enemyName} (HP: ${c.enemyCurrentHp})\nPlayer HP: ${gameState.player.hp}/${gameState.player.maxHp}`;
    document.getElementById('narrative-text').innerText = txt;

    // Update Buttons
    const choiceContainer = document.getElementById('choice-container');
    choiceContainer.innerHTML = '';

    if (c.turn === 'player') {
        renderPlayerActions(choiceContainer);
    } else {
        // Enemy turn, no buttons or disabled
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

        // Disable spell if no spells
        if (act.action === 'spell_menu') {
            const hasSpells = gameState.player.knownSpells && gameState.player.knownSpells.length > 0;
            if (!hasSpells) btn.disabled = true;
        }

        container.appendChild(btn);
    });
}

function handleCombatAction(action) {
    // Dispatcher
    if (action === 'attack') performAttack();
    else if (action === 'spell_menu') renderSpellMenu();
    else if (action === 'item_menu') toggleInventory(true); // Use inventory modal
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

    // Use Known Spells
    const spellList = gameState.player.knownSpells || [];

    if (spellList.length === 0) {
        // Fallback or should be disabled by now
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
    const dc = 12; // Fixed DC for now

    logMessage(`Attempting to flee: Rolled ${total} (DC ${dc})`, "system");

    if (total >= dc) {
        logMessage("You escaped!", "gain");
        gameState.combat.active = false;
        goToScene(gameState.combat.loseSceneId); // Treat flee as "lose" for flow, or custom scene
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

    // Enemy Action
    // Simple AI: Attack
    logMessage(`${c.enemyName} attacks!`, "combat");

    const roll = rollDie(20);
    const totalHit = roll + enemyDef.attackBonus;

    // Calc Player AC
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
            c.defending = false; // Reset
        }

        gameState.player.hp -= dmg;
        logMessage(`You took ${dmg} damage.`, "combat");

        // Status Effect Chance (Hardcoded for fungal beast as per req)
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
        c.defending = false; // Reset even on miss
    }

    // End of Round Logic
    endEnemyTurn();
}

function endEnemyTurn() {
    gameState.combat.turn = 'player';
    gameState.combat.round++;

    // Tick Effects
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

// --- Modified Inventory for Combat ---
function toggleInventory(isCombat = false) {
    const modal = document.getElementById('inventory-modal');
    const list = document.getElementById('inventory-list');
    list.innerHTML = '';

    // Filter for combat?
    const inventory = gameState.player.inventory;

    if (inventory.length === 0) {
        list.innerText = "Inventory is empty.";
    }

    inventory.forEach((itemId) => {
        const item = items[itemId];
        if (isCombat && item.type !== 'consumable') return; // Skip non-consumables in combat

        const row = document.createElement('div');
        row.className = "flex justify-between p-2 border-b border-gray-700 items-center";
        row.innerHTML = `<span>${item.name}</span>`;

        const btn = document.createElement('button');
        btn.style.marginLeft = "10px";

        if (item.type === 'consumable') {
            btn.innerText = "Use";
            btn.onclick = () => {
                const res = useConsumable(itemId);
                logMessage(res.msg, res.success ? "gain" : "system");
                updateStatsUI();

                if (res.success && isCombat) {
                    modal.classList.add('hidden');
                    endPlayerTurn(); // Consumes turn
                } else if (!isCombat) {
                    toggleInventory(false); // Refresh list
                }
            };
        } else {
            // Equip logic (only out of combat)
            if (!isCombat && (item.type === 'weapon' || item.type === 'armor')) {
                const isEquipped = (gameState.player.equippedWeaponId === itemId || gameState.player.equippedArmorId === itemId);
                btn.innerText = isEquipped ? "Equipped" : "Equip";
                btn.disabled = isEquipped;
                if (!isEquipped) {
                    btn.onclick = () => {
                        equipItem(itemId);
                        updateStatsUI();
                        toggleInventory(false);
                        logMessage(`Equipped ${item.name}.`, "system");
                    };
                }
            }
        }

        row.appendChild(btn);
        list.appendChild(row);
    });

    modal.classList.remove('hidden');
}

function toggleQuestLog() {
    const modal = document.getElementById('quest-modal');
    const list = document.getElementById('quest-list');
    list.innerHTML = '';

    for (const [id, qState] of Object.entries(gameState.quests)) {
        if (!qState) continue;
        const div = document.createElement('div');
        div.style.marginBottom = "10px";
        div.innerHTML = `<strong>${qState.title}</strong><br><small>${quests[id].stages[qState.currentStage]}</small>`;
        list.appendChild(div);
    }

    modal.classList.remove('hidden');
}

function toggleMenu() {
    document.getElementById('menu-modal').classList.remove('hidden');
}

// --- Persistence ---
function saveGame() {
    // We only save the serializable parts
    const data = {
        player: gameState.player,
        currentSceneId: gameState.currentSceneId,
        quests: gameState.quests,
        flags: gameState.flags,
        reputation: gameState.reputation,
        discoveredLocations: gameState.discoveredLocations
    };
    localStorage.setItem('crimsonMoonSave', JSON.stringify(data));
    logMessage("Game Saved.", "system");
}

function loadGame() {
    const dataStr = localStorage.getItem('crimsonMoonSave');
    if (dataStr) {
        const data = JSON.parse(dataStr);

        // Restore state
        gameState.player = data.player;
        gameState.currentSceneId = data.currentSceneId;
        gameState.quests = data.quests;
        gameState.flags = data.flags;
        gameState.reputation = data.reputation;
        if (data.discoveredLocations) gameState.discoveredLocations = data.discoveredLocations;

        // Reset transient state
        gameState.combat = { active: false }; // Force reset

        logMessage("Game Loaded.", "system");
        updateStatsUI();
        goToScene(gameState.currentSceneId);

        document.getElementById('menu-modal').classList.add('hidden');
        document.getElementById('scene-content').classList.remove('hidden');
    } else {
        logMessage("No save found.", "check-fail");
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

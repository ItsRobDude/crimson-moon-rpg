import { races } from './data/races.js';
import { classes } from './data/classes.js';
import { items } from './data/items.js';
import { quests } from './data/quests.js';
import { scenes } from './data/scenes.js';
import { enemies } from './data/enemies.js';
import { spells } from './data/spells.js';
import { statusEffects } from './data/statusEffects.js';
import { gameState, initializeNewGame, updateQuestStage, addGold, spendGold, gainXp, equipItem, useConsumable, applyStatusEffect, hasStatusEffect, tickStatusEffects } from './data/gameState.js';
import { rollDiceExpression, rollSkillCheck, rollSavingThrow, rollDie, rollAttack } from './rules.js';

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initUI();
    showCharacterCreation();
});

function initUI() {
    // Buttons
    document.getElementById('btn-inventory').onclick = toggleInventory;
    document.getElementById('btn-quests').onclick = toggleQuestLog;
    document.getElementById('btn-menu').onclick = toggleMenu;

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

// --- Character Creation ---
function showCharacterCreation() {
    const raceSelect = document.getElementById('cc-race');
    const classSelect = document.getElementById('cc-class');

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

    raceSelect.onchange = updateCCPreview;
    classSelect.onchange = updateCCPreview;

    updateCCPreview();

    document.getElementById('char-creation-modal').classList.remove('hidden');
}

function updateCCPreview() {
    const raceKey = document.getElementById('cc-race').value;
    const classKey = document.getElementById('cc-class').value;

    const race = races[raceKey];
    const cls = classes[classKey];

    document.getElementById('cc-race-desc').innerText = race.description;
    document.getElementById('cc-class-desc').innerText = cls.description;
}

function finishCharacterCreation() {
    const name = document.getElementById('cc-name').value || "Traveler";
    const raceKey = document.getElementById('cc-race').value;
    const classKey = document.getElementById('cc-class').value;

    initializeNewGame(name, raceKey, classKey);

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

    const firstVisit = !gameState.visitedScenes[sceneId];
    gameState.visitedScenes[sceneId] = true;

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
            }
        }
    }

    const choiceContainer = document.getElementById('choice-container');
    choiceContainer.innerHTML = '';

    if (scene.choices) {
        scene.choices.forEach((choice) => {
            const btn = document.createElement('button');
            btn.innerText = choice.text;
            btn.onclick = () => handleChoice(choice);
            choiceContainer.appendChild(btn);
        });
    }

    if (scene.type === 'combat') {
        startCombat(scene.enemyId, scene.winScene, scene.loseScene);
    } else {
        // Auto-save on non-combat scene transition
        saveGame();
    }
}

function handleChoice(choice) {
    if (choice.action === 'loadGame') {
        loadGame();
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

    } else if (choice.type === 'combat') {
        if (choice.nextScene) goToScene(choice.nextScene);
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

// --- Combat System ---
function startCombat(enemyId, winScene, loseScene) {
    // 1. Setup Combat State
    gameState.inCombat = true;
    gameState.combat = {
        enemyId: enemyId,
        enemy: JSON.parse(JSON.stringify(enemies[enemyId])), // Clone
        winScene: winScene,
        loseScene: loseScene,
        specialsUsed: {}
    };

    logMessage(`Combat started against ${gameState.combat.enemy.name}!`, "combat");

    // 2. Switch UI to Combat Mode
    // We can update the central text to show status
    updateCombatStatusText();

    // 3. Render Actions
    renderCombatUI();
}

function updateCombatStatusText() {
    const enemy = gameState.combat.enemy;
    const txt = `Combat Mode\n\nEnemy: ${enemy.name} (HP: ${enemy.hp})\nPlayer HP: ${gameState.player.hp}/${gameState.player.maxHp}`;
    document.getElementById('narrative-text').innerText = txt;
}

function renderCombatUI(showSpells = false) {
    const choiceContainer = document.getElementById('choice-container');
    choiceContainer.innerHTML = '';

    if (showSpells) {
        // Show available spells
        let spellList = [];
        // Simple Class Filtering as requested
        if (gameState.player.classId === 'wizard') {
            spellList = ['firebolt', 'magic_missile', 'cure_wounds'];
        } else if (gameState.player.classId === 'cleric') {
             spellList = ['cure_wounds'];
        }

        if (spellList.length === 0) {
             const btn = document.createElement('button');
             btn.innerText = "No Spells Available (Back)";
             btn.onclick = () => renderCombatUI(false);
             choiceContainer.appendChild(btn);
        } else {
            spellList.forEach(spellId => {
                if (spells[spellId]) {
                    const btn = document.createElement('button');
                    btn.innerText = spells[spellId].name;
                    btn.onclick = () => castSpell(spellId);
                    choiceContainer.appendChild(btn);
                }
            });
            const backBtn = document.createElement('button');
            backBtn.innerText = "Back";
            backBtn.onclick = () => renderCombatUI(false);
            choiceContainer.appendChild(backBtn);
        }
        return;
    }

    const actions = [
        { text: "Attack", action: "attack" },
        { text: "Cast Spell", action: "spell" },
        { text: "Use Item", action: "item" },
        { text: "Flee", action: "flee" }
    ];

    actions.forEach(act => {
        const btn = document.createElement('button');
        btn.innerText = act.text;
        btn.onclick = () => handleCombatAction(act.action);
        choiceContainer.appendChild(btn);
    });
}

function handleCombatAction(action) {
    if (action === 'attack') {
        renderAttackOptions();
        return;

    } else if (action === 'spell') {
        renderCombatUI(true);
    } else if (action === 'item') {
        toggleInventory(true);

    } else if (action === 'flee') {
        const roll = rollDie(20);
        // Simple flee DC 12
        // Should check for poisoned here too? Rules says "ability checks". Fleeing is usually Athletics or Acrobatics.
        // Let's use rollSkillCheck for fleeing? Or stick to simple D20 + DEX
        if (roll + gameState.player.modifiers.DEX > 12) {
            logMessage("You escaped!", "system");
            gameState.inCombat = false;
            goToScene(gameState.combat.loseScene);
        } else {
            logMessage("Failed to escape!", "combat");
            enemyTurn();
        }
    }
}

function renderAttackOptions() {
    const choiceContainer = document.getElementById('choice-container');
    choiceContainer.innerHTML = '';

    const attacks = getAvailableAttacks();

    attacks.forEach(attack => {
        const btn = document.createElement('button');
        btn.innerHTML = `<strong>${attack.name}</strong><br><small>${attack.detail}</small>`;
        btn.onclick = () => performAttack(attack);
        choiceContainer.appendChild(btn);
    });

    const backBtn = document.createElement('button');
    backBtn.innerText = "Back";
    backBtn.onclick = () => renderCombatUI(false);
    choiceContainer.appendChild(backBtn);
}

function getAvailableAttacks() {
    const attacks = [];
    const weaponId = gameState.player.equippedWeaponId;
    const weapon = items[weaponId] || { name: "Unarmed", damage: "1d2", modifier: "STR" };

    attacks.push({
        id: 'basic',
        name: `Strike with ${weapon.name}`,
        damage: weapon.damage,
        stat: weapon.modifier || 'STR',
        detail: `${weapon.damage} using ${weapon.modifier || 'STR'} modifier`,
        proficiency: gameState.player.proficiencyBonus
    });

    const cls = gameState.player.classId;

    if (cls === 'fighter') {
        attacks.push({
            id: 'power_strike',
            name: 'Power Strike',
            damage: weapon.damage,
            stat: weapon.modifier || 'STR',
            bonusDamage: '1d4',
            detail: 'Once per combat, add 1d4 extra damage.',
            once: true
        });
    }

    if (cls === 'rogue' && !gameState.combat.specialsUsed['sneak_attack']) {
        attacks.push({
            id: 'sneak_attack',
            name: 'Sneak Attack',
            damage: weapon.damage,
            stat: 'DEX',
            bonusDamage: '1d6',
            detail: 'Cunning strike with an extra 1d6 damage (once per combat).',
            once: true
        });
    }

    if (cls === 'wizard') {
        attacks.push({
            id: 'arcane_pulse',
            name: 'Arcane Pulse',
            damage: '1d8',
            stat: 'INT',
            detail: 'Hurl raw force using your INT modifier.',
            proficiency: gameState.player.proficiencyBonus
        });
    }

    if (cls === 'cleric' && !gameState.combat.specialsUsed['guided_strike']) {
        attacks.push({
            id: 'guided_strike',
            name: 'Guided Strike',
            damage: weapon.damage,
            stat: weapon.modifier || 'STR',
            hitBonus: 2,
            detail: 'Call for guidance for +2 to hit (once per combat).',
            once: true
        });
    }

    return attacks;
}

function performAttack(attack) {
    const stat = attack.stat || 'STR';
    const prof = attack.proficiency !== undefined ? attack.proficiency : gameState.player.proficiencyBonus;
    const enemy = gameState.combat.enemy;

    const rollResult = rollAttack(gameState, stat, prof);
    const totalToHit = rollResult.total + (attack.hitBonus || 0);
    const hitBonusText = attack.hitBonus ? ` + ${attack.hitBonus}` : '';

    logMessage(`${attack.name}: ${rollResult.roll} + ${rollResult.modifier}${hitBonusText} = ${totalToHit} (vs AC ${enemy.ac})${rollResult.note}`, "system");

    if (totalToHit >= enemy.ac) {
        const dmgRoll = rollDiceExpression(attack.damage);
        let totalDmg = dmgRoll.total + gameState.player.modifiers[stat];

        if (attack.bonusDamage) {
            const extra = rollDiceExpression(attack.bonusDamage);
            totalDmg += extra.total;
            logMessage(`Extra damage roll: ${extra.total}`, "combat");
        }

        enemy.hp -= totalDmg;
        logMessage(`Hit! Dealt ${totalDmg} damage.`, "combat");
    } else {
        logMessage(`Miss!`, "system");
    }

    if (attack.once) {
        gameState.combat.specialsUsed[attack.id] = true;
    }

    updateCombatStatusText();
    checkCombatState();

    if (gameState.inCombat) {
        renderCombatUI(false);
        setTimeout(enemyTurn, 600);
    }
}

function castSpell(spellId) {
    const spell = spells[spellId];
    if (!spell) return;

    logMessage(`Casting ${spell.name}...`, "system");

    if (spell.type === 'attack') {
        // Roll Attack: d20 + INT mod + prof
        // Simplified: Wizard uses INT. Cleric uses WIS.
        // Hardcoded assumption based on class or just use INT for now as requested by prompt ("use INT modifier").

        const stat = "INT";
        const prof = gameState.player.proficiencyBonus;
        const result = rollAttack(gameState, stat, prof);
        const enemy = gameState.combat.enemy;

        logMessage(`Spell Attack: ${result.roll} + ${result.modifier} = ${result.total} (vs AC ${enemy.ac})${result.note}`, "system");

        if (result.total >= enemy.ac) {
            const dmgRoll = rollDiceExpression(spell.damage);
            enemy.hp -= dmgRoll.total;
            logMessage(`Hit! Dealt ${dmgRoll.total} damage.`, "combat");
        } else {
            logMessage(`Miss!`, "system");
        }

    } else if (spell.type === 'heal') {
        const roll = rollDiceExpression(spell.amount);
        gameState.player.hp = Math.min(gameState.player.hp + roll.total, gameState.player.maxHp);
        logMessage(`Healed for ${roll.total} HP.`, "gain");
        updateStatsUI();
    }

    updateCombatStatusText();
    checkCombatState();

    if (gameState.inCombat) {
        // Go back to main combat menu
        renderCombatUI(false);
        setTimeout(enemyTurn, 600);
    }
}

function enemyTurn() {
    if (!gameState.inCombat) return;

    const enemy = gameState.combat.enemy;
    logMessage(`${enemy.name} attacks!`, "combat");

    const attackRoll = rollDie(20);
    const totalHit = attackRoll + enemy.attackBonus;

    let ac = 10 + gameState.player.modifiers.DEX;
    if (gameState.player.equippedArmorId) {
        const armor = items[gameState.player.equippedArmorId];
        if (armor) ac = armor.acBase;
    }

    logMessage(`Enemy rolls ${attackRoll} + ${enemy.attackBonus} = ${totalHit} vs AC ${ac}`, "system");

    if (totalHit >= ac) {
        const dmgRoll = rollDiceExpression(enemy.damage);
        gameState.player.hp -= dmgRoll.total;
        logMessage(`You took ${dmgRoll.total} damage!`, "combat");

        // Fungal Beast Poison Chance
        if (gameState.combat.enemyId === 'fungal_beast') {
             if (rollDie(100) <= 25) {
                 applyStatusEffect('poisoned', 3);
             }
        }

        updateStatsUI();
        updateCombatStatusText();

        if (gameState.player.hp <= 0) {
            gameState.inCombat = false;
            goToScene(gameState.combat.loseScene);
        }
    } else {
        logMessage("Enemy missed!", "system");
    }

    tickStatusEffects();
}

function checkCombatState() {
    if (gameState.combat.enemy.hp <= 0) {
        gameState.inCombat = false;
        const xp = gameState.combat.enemy.xp;
        logMessage(`Victory! Gained ${xp} XP.`, "gain");

        if (gainXp(xp)) {
            logMessage("Level Up! Stats increased.", "gain");
        }
        updateStatsUI();

        saveGame(); // Save after victory

        goToScene(gameState.combat.winScene);
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

// --- Menus ---
function toggleInventory(isCombat = false) {
    const modal = document.getElementById('inventory-modal');
    const list = document.getElementById('inventory-list');
    list.innerHTML = '';

    if (gameState.player.inventory.length === 0) {
        list.innerText = "Inventory is empty.";
    }

    gameState.player.inventory.forEach((itemId, index) => {
        const item = items[itemId];
        const row = document.createElement('div');
        row.className = "flex justify-between p-2 border-b border-gray-700 items-center";

        const nameSpan = document.createElement('span');
        const isEquipped = (gameState.player.equippedWeaponId === itemId || gameState.player.equippedArmorId === itemId);
        nameSpan.innerText = item.name + (isEquipped ? " (E)" : "");
        row.appendChild(nameSpan);

        const btn = document.createElement('button');
        btn.style.marginLeft = "10px";
        btn.style.fontSize = "0.8rem";

        if (item.type === 'weapon' || item.type === 'armor') {
            btn.innerText = "Equip";
            if (isEquipped) {
                 btn.disabled = true;
                 btn.innerText = "Equipped";
                 btn.style.color = "#888";
            } else {
                btn.onclick = () => {
                    equipItem(itemId);
                    updateStatsUI();
                    toggleInventory(isCombat); // Refresh
                    logMessage(`Equipped ${item.name}.`, "system");
                };
            }
        } else if (item.type === 'consumable') {
            btn.innerText = "Use";
            btn.onclick = () => {
                const res = useConsumable(itemId);
                logMessage(res.msg, res.success ? "gain" : "system");
                updateStatsUI();
                toggleInventory(isCombat); // Refresh list

                if (isCombat && res.success) {
                    modal.classList.add('hidden');
                    // End player turn
                    updateCombatStatusText();
                    setTimeout(enemyTurn, 600);
                }
            };
        } else {
            btn.innerText = "-";
            btn.disabled = true;
        }

        // In combat, we might restrict equipping? For now allow all.
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
        visitedScenes: gameState.visitedScenes
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
        gameState.visitedScenes = data.visitedScenes || {};

        // Reset transient state
        gameState.inCombat = false;
        gameState.combat = null;

        logMessage("Game Loaded.", "system");
        updateStatsUI();
        goToScene(gameState.currentSceneId);

        document.getElementById('menu-modal').classList.add('hidden');
        document.getElementById('scene-content').classList.remove('hidden'); // Ensure visible if we loaded from death screen
    } else {
        logMessage("No save found.", "check-fail");
    }
}

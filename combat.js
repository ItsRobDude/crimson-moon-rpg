import { gameState, updateQuestStage, addGold, spendGold, gainXp, equipItem, useConsumable, applyStatusEffect, hasStatusEffect, tickStatusEffects, discoverLocation, isLocationDiscovered, addItem, changeRelationship, changeReputation, getRelationship, getReputation, adjustThreat, clearTransientThreat, recordAmbientEvent, addMapPin, removeMapPin, getNpcStatus, unequipItem, syncPartyLevels } from './data/gameState.js';
import { rollDiceExpression, rollSkillCheck, rollSavingThrow, rollDie, rollAttack, rollInitiative, getAbilityMod, generateScaledStats, calculateDerivedStats } from './rules.js';
import { classes } from './data/classes.js';
import { items } from './data/items.js';
import { enemies } from './data/enemies.js';
import { spells } from './data/spells.js';
import { npcs } from './data/npcs.js';
import { scenes } from './data/scenes.js'; // Needed for scene text update? Or maybe just context.
import { logMessage, showBattleEventText } from './logger.js';
import { companionTurnAI } from './ai.js';
import { goToScene } from './exploration.js';

export function startCombat(combatantIds, winScene, loseScene) {
    const sceneContainer = document.getElementById('scene-container');
    if (sceneContainer) sceneContainer.classList.add('hidden');

    const battleScreen = document.getElementById('battle-screen');
    if (battleScreen) battleScreen.classList.remove('hidden');

    // Note: We don't need to set window.logMessage here anymore as we use logger.js

    const currentSceneId = gameState.currentSceneId;
    const currentScene = scenes[currentSceneId] || { text: "Battle started." };

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

        if (!combatantData) return null;

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
            fullStats: isNpc ? combatantData : null,
            type: 'enemy'
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
        actionsRemaining: 1,
        bonusActionsRemaining: 1
    };

    logMessage(`Combat started!`, "combat");

    const initiatives = [];
    const combatants = [
        { id: 'player', ...gameState.player },
        ...gameState.party.map(id => ({ id, ...gameState.roster[id] })),
        ...gameState.combat.enemies.map(e => ({ id: e.uniqueId, ...e }))
    ];

    combatants.forEach(c => {
        const init = rollInitiative(c);
        initiatives.push({ id: c.id, initiative: init.total });
        logMessage(`${c.name} rolled ${init.total} for initiative.`, "system");
    });

    initiatives.sort((a, b) => b.initiative - a.initiative);
    gameState.combat.turnOrder = initiatives.map(i => i.id);

    combatTurnLoop();
}

export function combatTurnLoop() {
    if (!gameState.combat.active) return;

    const currentTurnId = gameState.combat.turnOrder[gameState.combat.turnIndex];

    if (currentTurnId === 'player') {
        gameState.combat.actionsRemaining = 1;
        gameState.combat.bonusActionsRemaining = 1;
        logMessage(`Round ${gameState.combat.round} - Your Turn`, "system");
        updateCombatUI();
    } else if (gameState.party.includes(currentTurnId)) {
        const comp = gameState.roster[currentTurnId];
        logMessage(`Round ${gameState.combat.round} - ${comp.name}'s Turn`, "system");

        if (gameState.settings.companionAI) {
            setTimeout(() => companionTurnAI(comp), 1000);
        } else {
            gameState.combat.actionsRemaining = 1;
            gameState.combat.bonusActionsRemaining = 1;
            updateCombatUI(currentTurnId);
        }
    } else {
        const enemy = gameState.combat.enemies.find(e => e.uniqueId === currentTurnId);
        logMessage(`Round ${gameState.combat.round} - ${enemy.name}'s Turn`, "system");
        updateCombatUI();
        setTimeout(() => enemyTurn(enemy), 1000);
    }
}

// Exported so AI or others can call it
export function endPlayerTurn() {
    gameState.combat.playerDefending = false;
    gameState.combat.turnIndex = (gameState.combat.turnIndex + 1) % gameState.combat.turnOrder.length;
    if (gameState.combat.turnIndex === 0) {
        gameState.combat.round++;
    }
    combatTurnLoop();
}

// --- Internal Combat Functions ---

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

    // Determine target (Randomly pick between player and companions)
    // Simplify: 50% player, 50% random companion
    let targets = ['player', ...gameState.party];
    // Filter out down characters?
    // If everyone down, game over.
    // Ideally check HP > 0.

    // For now, assume attack player for simplicity or refactor later.
    const targetId = 'player'; // TODO: Improve targeting
    const targetChar = gameState.player;

    const ac = getAC(targetChar);

    if (totalHit >= ac) {
        let dmg = rollDiceExpression(enemy.damage).total;
        // Check defend status? Only player has 'playerDefending'.
        // We need 'defending' status on all chars?
        // Currently only gameState.combat.playerDefending exists.

        if (targetId === 'player' && gameState.combat.playerDefending) {
            dmg = Math.floor(dmg / 2);
            logMessage("Defended! Damage halved.", "gain");
        }

        targetChar.hp -= dmg;
        logMessage(`${targetChar.name} took ${dmg} damage.`, "combat");
        showBattleEventText(`${dmg}`);

        if (enemy.id === 'fungal_beast' && rollDie(100) <= 25) {
            applyStatusEffect('poisoned', null, targetId);
            showBattleEventText("Poisoned!");
        }

        if (gameState.player.hp <= 0) {
             // Check if party wiped?
             // For now, if Player dies, Game Over.
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
    // Remove dead enemies
    const deadEnemies = gameState.combat.enemies.filter(e => e.hp <= 0).map(e => e.uniqueId);
    if (deadEnemies.length > 0) {
        gameState.combat.turnOrder = gameState.combat.turnOrder.filter(id => !deadEnemies.includes(id));
    }

    const currentIndex = gameState.combat.turnOrder.indexOf(enemy.uniqueId);
    gameState.combat.turnIndex = (currentIndex + 1) % gameState.combat.turnOrder.length;

    if (gameState.combat.turnIndex === 0) { // Check if cycle complete
        // Simple check.
    }

    // Proceed
    // We need to handle the case where next is player/companion/enemy.
    // combatTurnLoop handles logic.
    // But we need to increment index properly if we removed items?
    // If we removed items BEFORE current index, we need to adjust.
    // But dead enemies stay in 'enemies' array, just removed from 'turnOrder'.

    // Re-find index is safer.
    // But we already did.

    if (gameState.combat.turnIndex === 0 && gameState.combat.turnOrder.includes('player')) {
        gameState.combat.round++;
    }

    combatTurnLoop();
}

export function checkWinCondition() {
    const allEnemiesDefeated = gameState.combat.enemies.every(e => e.hp <= 0);
    if (allEnemiesDefeated) {
        gameState.combat.active = false;
        logMessage(`Victory!`, "gain");

        const totalXp = gameState.combat.enemies.reduce((sum, e) => sum + (enemies[e.id].xp || 0), 0);
        const levelUpAvailable = gainXp(totalXp);
        logMessage(`Gained ${totalXp} XP.`, "gain");
        if (levelUpAvailable) {
            logMessage(`Level Up Available!`, "gain");
        }

        // Sync party XP/Level
        syncPartyLevels();

        if (window.saveGame) window.saveGame();

        const actionsContainer = document.getElementById('battle-actions-container');
        actionsContainer.innerHTML = '';
        actionsContainer.appendChild(
            createActionButton('Victory!', 'celebration', () => goToScene(gameState.combat.winSceneId), 'col-span-2')
        );
        return true;
    }
    return false;
}

// --- UI Rendering (Combat specific) ---

export function updateCombatUI(activeCharacterId = 'player') {
    if (!gameState.combat.active) return;

    const partyContainer = document.getElementById('party-container');
    partyContainer.innerHTML = '';

    renderPartyCard(gameState.player, 'player', activeCharacterId);
    gameState.party.forEach(compId => {
        renderPartyCard(gameState.roster[compId], compId, activeCharacterId);
    });

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

function renderPartyCard(char, id, activeId) {
    const card = document.createElement('div');
    const isTurn = gameState.combat.turnOrder[gameState.combat.turnIndex] === id;
    card.className = `party-card ${isTurn ? 'active-turn' : ''} ${char.hp <= 0 ? 'down' : ''}`;

    const hpPct = Math.max(0, (char.hp / char.maxHp) * 100);
    let resourceBar = '';
    if (char.spellSlots) {
        const total = Object.values(char.spellSlots).reduce((a,b)=>a+b,0);
        const current = Object.values(char.currentSlots).reduce((a,b)=>a+b,0);
        if (total > 0) {
            const pct = (current/total)*100;
            resourceBar = `<div><div class="party-bar-label"><span>Slots</span><span>${current}/${total}</span></div><div class="party-bar-background"><div class="party-bar-fill mana-fill" style="width: ${pct}%;"></div></div></div>`;
        }
    }

    card.innerHTML = `
        <div class="party-header">
            <div class="party-portrait" style='background-image: url("${id === 'player' ? 'portraits/player_placeholder.png' : char.portrait}");'></div>
            <div>
                <p class="party-name">${char.name}</p>
                <p class="party-class">Lv. ${char.level} ${classes[char.classId].name}</p>
            </div>
        </div>
        <div>
            <div class="party-bar-label"><span>Health</span><span>${char.hp}/${char.maxHp}</span></div>
            <div class="party-bar-background"><div class="party-bar-fill hp-fill" style="width: ${hpPct}%;"></div></div>
        </div>
        ${resourceBar}
        <div class="party-status">
            ${isTurn ? `<span class="turn-indicator-text">Active</span>` : ''}
            ${char.hp <= 0 ? `<span class="status-down">Down</span>` : ''}
            ${isTurn ? `<div style="font-size:0.8em; margin-top:4px;">Act: ${gameState.combat.actionsRemaining} | Bns: ${gameState.combat.bonusActionsRemaining}</div>` : ''}
        </div>
    `;
    document.getElementById('party-container').appendChild(card);
}

// Action Rendering & Execution (Same logic as before, just modularized)
function renderPlayerActions(container, subMenu = null, actingId = 'player') {
    // ... (Full logic from previous game.js)
    // For brevity in this prompt, I assume I will paste the full content.
    // I will include the helper functions performAttack, etc.
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'battle-actions-grid';

    const hasAction = gameState.combat.actionsRemaining > 0;
    const hasBonus = gameState.combat.bonusActionsRemaining > 0;

    const actor = (actingId === 'player') ? gameState.player : gameState.roster[actingId];

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
            const cost = 'action';
            const canCast = (cost === 'action' && hasAction) || (cost === 'bonus' && hasBonus);
            const hasSlots = spell.level === 0 || (actor.currentSlots[spell.level] && actor.currentSlots[spell.level] > 0);
            grid.appendChild(createActionButton(spell.name, 'auto_stories', () => {
                 renderPlayerActions(container, { type: 'spell_target', spellId: spellId }, actingId);
            }, '', !hasSlots || !canCast));
        });
        grid.appendChild(createActionButton('Back', 'arrow_back', () => renderPlayerActions(container, null, actingId), 'flee'));
    } else if (subMenu && subMenu.type === 'spell_target') {
        const spell = spells[subMenu.spellId];
        if (spell.type === 'heal') {
            grid.appendChild(createActionButton(`Self`, 'healing', () => performCastSpell(subMenu.spellId, actingId, actingId), 'primary'));
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
        // ... Abilities logic ...
        const cls = classes[actor.classId];
        if (actor.level >= 2 && actor.classId === 'rogue') {
             grid.appendChild(createActionButton('Dash (Bonus)', 'directions_run', () => performCunningAction('dash'), '', !hasBonus));
             grid.appendChild(createActionButton('Disengage (Bonus)', 'do_not_step', () => performCunningAction('disengage'), '', !hasBonus));
        }
        if (actor.level >= 2 && actor.classId === 'fighter') {
            const res = actor.resources['action_surge'];
            const available = res && res.current > 0;
            grid.appendChild(createActionButton('Action Surge', 'bolt', () => performActionSurge(actingId), '', !available));
        }
        if (actor.classId === 'fighter') {
            const res = actor.resources['second_wind'];
            const available = res && res.current > 0;
            grid.appendChild(createActionButton('Second Wind', 'healing', () => performAbility('second_wind', actingId), '', !available || !hasBonus));
        }
        grid.appendChild(createActionButton('Back', 'arrow_back', () => renderPlayerActions(container, null, actingId), 'flee'));
    } else {
        const hasSpells = (actor.currentSlots && Object.values(actor.currentSlots).some(s => s > 0)) || (actor.knownSpells.length > 0);
        grid.appendChild(createActionButton('Attack', 'swords', () => renderPlayerActions(container, 'attack', actingId), 'primary', !hasAction));
        grid.appendChild(createActionButton('Spells', 'auto_stories', () => renderPlayerActions(container, 'spells', actingId), '', !hasSpells || !hasAction));
        grid.appendChild(createActionButton('Abilities', 'star', () => renderPlayerActions(container, 'abilities', actingId)));
        grid.appendChild(createActionButton('Defend', 'shield', performDefend, '', !hasAction));
        grid.appendChild(createActionButton('Items', 'local_drink', () => {
            if (window.toggleInventory) window.toggleInventory(true, actingId);
        }, '', !hasAction));
        grid.appendChild(createActionButton('Flee', 'run_circle', performFlee, 'flee', !hasAction));
        grid.appendChild(createActionButton('End Turn', 'hourglass_bottom', endPlayerTurn, 'flee'));
    }
    container.appendChild(grid);
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

// Actions
function performCunningAction(type) {
    if (gameState.combat.bonusActionsRemaining <= 0) return;
    gameState.combat.bonusActionsRemaining--;
    logMessage(`Cunning Action: Used ${type}.`, "gain");
    updateCombatUI(getCurrentActorId());
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

function performDefend() {
    if (gameState.combat.actionsRemaining <= 0) return;
    gameState.combat.actionsRemaining--;
    gameState.combat.playerDefending = true;
    logMessage("You brace yourself for the next attack.", "system");
    updateCombatUI(getCurrentActorId());
}

export function performAttack(targetId, actorId) {
    // ... (Same logic as before) ...
    if (gameState.combat.actionsRemaining <= 0) return;

    const target = gameState.combat.enemies.find(e => e.uniqueId === targetId);
    const actor = (actorId === 'player') ? gameState.player : gameState.roster[actorId];
    if (!target || !actor) return;

    gameState.combat.actionsRemaining--;

    const weaponId = actor.equipped.weapon;
    const weapon = items[weaponId] || { name: "Unarmed", damage: "1d2", modifier: "STR", damageType: "bludgeoning", subtype: "simple" };
    const stat = weapon.modifier || "STR";

    const profBonus = Math.ceil(1 + (actor.level / 4));
    const statMod = actor.modifiers[stat] || 0;
    const cls = classes[actor.classId];
    const isProficient = weapon.subtype && cls.weaponProficiencies && cls.weaponProficiencies.includes(weapon.subtype);
    const prof = isProficient ? profBonus : 0;
    const derivedStats = calculateDerivedStats(actor);
    const totalBonus = statMod + prof + derivedStats.toHit;

    const roll = rollDie(20);
    const total = roll + totalBonus;

    let critThreshold = 20;
    if (actor.subclassId === 'champion') critThreshold = 19;
    const isCritical = roll >= critThreshold;

    let msg = `${actor.name} attacks ${target.name} with ${weapon.name}: ${total} (vs AC ${target.ac}).`;
    if (isCritical) msg += " CRITICAL HIT!";
    logMessage(msg, "system");
    if (isCritical) showBattleEventText("Critical Hit!");

    if (total >= target.ac || isCritical) {
        let dmg = rollDiceExpression(weapon.damage).total + statMod;
        if (isCritical) {
            const critBonus = rollDiceExpression(weapon.damage.split('+')[0]).total;
            dmg += critBonus;
        }
        if (actor.classId === 'rogue') {
             const sneakDice = Math.ceil(actor.level / 2);
             dmg += rollDiceExpression(`${sneakDice}d6`).total;
             logMessage(`Sneak Attack!`, "gain");
        }

        const finalDamage = calculateDamage(dmg, weapon.damageType, target);
        target.hp -= Math.max(1, finalDamage);
        logMessage(`Hit! Dealt ${finalDamage} damage.`, "combat");
        showBattleEventText(`${finalDamage}`);
    } else {
        logMessage("Miss!", "system");
        showBattleEventText("Miss!");
    }

    if (!checkWinCondition()) updateCombatUI(actorId);
}

export function performFlee() {
    if (gameState.combat.actionsRemaining <= 0) return;
    gameState.combat.actionsRemaining--;

    const dc = 12;
    const roll = rollDie(20) + (gameState.player.modifiers.DEX || 0);
    logMessage(`Flee Attempt: ${roll} (DC ${dc})`, roll >= dc ? "check-success" : "check-fail");

    if (roll >= dc) {
         logMessage("You escaped!", "gain");
         gameState.combat.active = false;
         goToScene(gameState.combat.loseSceneId);
    } else {
         logMessage("Failed to escape!", "check-fail");
         updateCombatUI('player');
    }
}

export function performAbility(abilityId, actorId) {
    // ... (Same logic) ...
    let cost = 'action';
    if (abilityId === 'second_wind') cost = 'bonus';

    if (cost === 'action' && gameState.combat.actionsRemaining <= 0) return;
    if (cost === 'bonus' && gameState.combat.bonusActionsRemaining <= 0) return;

    const actor = (actorId === 'player') ? gameState.player : gameState.roster[actorId];
    const res = actor.resources[abilityId];

    if (!res || res.current <= 0) return;

    if (cost === 'action') gameState.combat.actionsRemaining--;
    if (cost === 'bonus') gameState.combat.bonusActionsRemaining--;

    if (abilityId === 'second_wind') {
        res.current--;
        const healed = rollDie(10) + actor.level;
        actor.hp = Math.min(actor.maxHp, actor.hp + healed);
        logMessage(`${actor.name} used Second Wind (+${healed} HP).`, "gain");
    }

    if (!checkWinCondition()) updateCombatUI(actorId);
}

export function performCastSpell(spellId, targetId, actorId = 'player') {
    if (gameState.combat.actionsRemaining <= 0) {
        logMessage("No Action remaining!", "check-fail");
        return;
    }

    const actor = (actorId === 'player') ? gameState.player : gameState.roster[actorId];
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

    // Choose target (player, companion, or enemy)
    let spellTarget;
    if (targetId === 'player') spellTarget = gameState.player;
    else if (gameState.roster[targetId]) spellTarget = gameState.roster[targetId];
    else spellTarget = gameState.combat.enemies.find(e => e.uniqueId === targetId);

    if (!spellTarget) return;

    if (spell.type === 'heal') {
        const roll = rollDiceExpression(spell.amount).total + healingBonus;
        target.hp = Math.min(target.hp + roll, target.maxHp);
        logMessage(`Healed ${target.name} for ${roll} HP.${healingBonus > 0 ? ' (Disciple of Life)' : ''}`, "gain");
        updateCombatUI(actorId);
    } else {
        // damage spell
        const toHit = rollAttack(actor, 'INT', actor.proficiencyBonus, false);
        if (toHit.total >= target.ac) {
            let dmg = rollDiceExpression(spell.amount).total;
            const finalDamage = calculateDamage(dmg, spell.damageType || 'force', target);
            target.hp -= Math.max(1, finalDamage);
            logMessage(`${actor.name} hits ${target.name} with ${spell.name} for ${finalDamage} damage.`, "combat");
        } else {
            logMessage(`${actor.name}'s ${spell.name} misses ${target.name}.`, "system");
        }
        updateCombatUI(actorId);
    }

    if (!checkWinCondition()) {
        updateCombatUI(actorId);
    }
}

function getCurrentActorId() {
    return gameState.combat.turnOrder[gameState.combat.turnIndex];
}

function getAC(character) {
    return calculateDerivedStats(character).ac;
}

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

    if (message) logMessage(message, "system");
    return finalDamage;
}



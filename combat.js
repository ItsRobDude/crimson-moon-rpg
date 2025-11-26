// combat.js - All combat-related logic and actions

import { gameState, gainXp, applyStatusEffect, performShortRest as gsPerformShortRest, performLongRest as gsPerformLongRest } from './data/gameState.js';
import { scenes } from './data/scenes.js';
import { npcs } from './data/npcs.js';
import { enemies } from './data/enemies.js';
import { items } from './data/items.js';
import { classes } from './data/classes.js';
import { spells } from './data/spells.js';
import { rollInitiative, rollDie, rollAttack, rollDiceExpression } from './rules.js';
import { generateScaledStats } from './rules.js';

export const uiHooks = {
    updateCombatUI: () => {},
    logToBattle: () => {},
    showBattleEventText: () => {},
    createActionButton: () => {},
    goToScene: () => {},
    updateStatsUI: () => {},
    saveGame: () => {},
};

export function startCombat(combatantIds, winScene, loseScene) {
    console.log("Combat: Starting combat...");
    const sceneContainer = document.getElementById('scene-container');
    if (sceneContainer) sceneContainer.classList.add('hidden');

    const battleScreen = document.getElementById('battle-screen');
    if (battleScreen) battleScreen.classList.remove('hidden');

    window.logMessage = uiHooks.logToBattle;

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

    uiHooks.logToBattle(`Combat started!`, "combat");

    const initiatives = [];
    // Player
    const playerInit = rollInitiative(gameState, 'player');
    initiatives.push({ type: 'player', id: 'player', initiative: playerInit.total });
    uiHooks.logToBattle(`You rolled ${playerInit.total} for initiative.`, "system");

    // Companions
    gameState.party.forEach(compId => {
        // Simplify companion initiative (use player's roll or just flat d20 + dex)
        const char = gameState.roster[compId];
        const dexMod = char.modifiers.DEX;
        const roll = rollDie(20) + dexMod;
        initiatives.push({ type: 'companion', id: compId, initiative: roll });
        uiHooks.logToBattle(`${char.name} rolled ${roll} for initiative.`, "system");
    });

    // Enemies
    gameState.combat.enemies.forEach(enemy => {
        const init = rollInitiative(gameState, 'enemy', enemy.attackBonus);
        enemy.initiative = init.total;
        initiatives.push({ type: 'enemy', id: enemy.uniqueId, initiative: init.total });
        uiHooks.logToBattle(`${enemy.name} rolled ${init.total} for initiative.`, "system");
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

        uiHooks.logToBattle(`Round ${gameState.combat.round} - Your Turn`, "system");
        uiHooks.updateCombatUI();
    } else if (gameState.party.includes(currentTurnId)) {
        // Companion Turn
        const comp = gameState.roster[currentTurnId];
        uiHooks.logToBattle(`Round ${gameState.combat.round} - ${comp.name}'s Turn`, "system");

        if (gameState.settings.companionAI) {
            // AI Control
            setTimeout(() => companionTurnAI(comp), 1000);
        } else {
            // Manual Control
            // We treat it like player turn but acting as companion
            gameState.combat.actionsRemaining = 1;
            gameState.combat.bonusActionsRemaining = 1;
            uiHooks.updateCombatUI(currentTurnId); // Pass active character ID
        }
    } else {
        // Enemy Turn
        const enemy = gameState.combat.enemies.find(e => e.uniqueId === currentTurnId);
        uiHooks.logToBattle(`Round ${gameState.combat.round} - ${enemy.name}'s Turn`, "system");
        uiHooks.updateCombatUI();
        setTimeout(() => enemyTurn(enemy), 1000);
    }
}

export function performCunningAction(type) {
    if (gameState.combat.bonusActionsRemaining <= 0) {
        uiHooks.logToBattle("No Bonus Action remaining!", "check-fail");
        return;
    }
    gameState.combat.bonusActionsRemaining--;
    uiHooks.logToBattle(`Cunning Action: You used ${type}.`, "gain");
    uiHooks.updateCombatUI();
}

export function calculateDamage(baseDamage, damageType, target, isCritical = false) {
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

    if (message) uiHooks.logToBattle(message, "system");
    return finalDamage;
}

export function performActionSurge(actorId = 'player') {
    const actor = (actorId === 'player') ? gameState.player : gameState.roster[actorId];
    const res = actor.resources['action_surge'];
    if (!res || res.current <= 0) return;

    res.current--;
    gameState.combat.actionsRemaining++;
    uiHooks.logToBattle(`${actor.name} used Action Surge!`, "gain");
    uiHooks.updateCombatUI(actorId);
}

export function performEndTurn() {
    endCurrentTurn();
}

export function performAttack(targetId, actorId = 'player') {
    if (gameState.combat.actionsRemaining <= 0) {
        uiHooks.logToBattle("No Action remaining!", "check-fail");
        return;
    }

    const target = gameState.combat.enemies.find(e => e.uniqueId === targetId);
    const actor = (actorId === 'player') ? gameState.player : gameState.roster[actorId];

    gameState.combat.actionsRemaining--;

    const weaponId = actor.equipped.weapon;
    const weapon = items[weaponId] || { name: "Unarmed", damage: "1d2", modifier: "STR", damageType: "bludgeoning", subtype: "simple" };
    const stat = weapon.modifier || "STR";

    const profBonus = Math.ceil(1 + (actor.level / 4));
    const statMod = actor.modifiers[stat];

    const cls = classes[actor.classId];
    const isProficient = weapon.subtype && cls.weaponProficiencies && cls.weaponProficiencies.includes(weapon.subtype);
    const prof = isProficient ? actor.proficiencyBonus : 0;

    const advantage = false;

    const result = rollAttack(actor, stat, prof, advantage);

    let critThreshold = 20;
    if (actor.subclassId === 'champion') critThreshold = 19;

    const isCritical = result.roll >= critThreshold;

    let msg = `${actor.name} attacks ${target.name} with ${weapon.name}: ${result.total} (vs AC ${target.ac}).`;
    if (isCritical) {
        msg += " CRITICAL HIT!";
        uiHooks.showBattleEventText("Critical Hit!");
    }
    uiHooks.logToBattle(msg, "system");

    if (result.total >= target.ac || isCritical) {
        let dmg = rollDiceExpression(weapon.damage).total + actor.modifiers[stat];
        if (isCritical) {
            const critBonus = rollDiceExpression(weapon.damage.split('+')[0]).total;
            dmg += critBonus;
        }

        if (actor.classId === 'rogue') {
            const sneakDice = Math.ceil(actor.level / 2);
            const sneakDmg = rollDiceExpression(`${sneakDice}d6`).total;
            dmg += sneakDmg;
            uiHooks.logToBattle(`Sneak Attack! +${sneakDmg} damage.`, "gain");
        }

        const finalDamage = calculateDamage(dmg, weapon.damageType, target);
        target.hp -= Math.max(1, finalDamage);
        uiHooks.logToBattle(`Hit! Dealt ${finalDamage} damage.`, "combat");
        uiHooks.showBattleEventText(`${finalDamage}`);
    } else {
        uiHooks.logToBattle("Miss!", "system");
        uiHooks.showBattleEventText("Miss!");
    }

    if (!checkWinCondition()) {
        uiHooks.updateCombatUI();
    }
}

export function performCastSpell(spellId, targetId, actorId = 'player') {
    // Implementation needed
}

export function performAbility(abilityId, actorId = 'player') {
    let cost = 'action';
    if (abilityId === 'second_wind') cost = 'bonus';

    if (cost === 'action' && gameState.combat.actionsRemaining <= 0) {
        uiHooks.logToBattle("No Action remaining!", "check-fail");
        return;
    }
    if (cost === 'bonus' && gameState.combat.bonusActionsRemaining <= 0) {
        uiHooks.logToBattle("No Bonus Action remaining!", "check-fail");
        return;
    }

    const actor = (actorId === 'player') ? gameState.player : gameState.roster[actorId];
    const resource = actor.resources[abilityId];
    if (!resource || resource.current <= 0) {
        uiHooks.logToBattle("No uses left for that ability.", "check-fail");
        return;
    }

    if (cost === 'action') gameState.combat.actionsRemaining--;
    if (cost === 'bonus') gameState.combat.bonusActionsRemaining--;

    if (abilityId === 'second_wind') {
        resource.current--;
        const healed = rollDie(10) + actor.level;
        actor.hp = Math.min(actor.maxHp, actor.hp + healed);
        uiHooks.logToBattle(`Used Second Wind and recovered ${healed} HP.`, "gain");
    } else {
        uiHooks.logToBattle(`Ability '${abilityId}' is not implemented yet.`, "system");
    }

    if (!checkWinCondition()) {
        uiHooks.updateCombatUI();
    }
}


export function performDefend() {
    if (gameState.combat.actionsRemaining <= 0) return;
    gameState.combat.actionsRemaining--;
    gameState.combat.playerDefending = true;
    uiHooks.logToBattle("You brace yourself for the next attack.", "system");
    uiHooks.updateCombatUI();
}

export function performShortRest() {
    const healed = gsPerformShortRest();
    uiHooks.logToBattle(`You take a short rest and recover ${healed} HP.`, "gain");
    uiHooks.updateStatsUI();
}

export function performLongRest() {
    gsPerformLongRest();
    uiHooks.logToBattle("You take a long rest. You feel completely refreshed.", "gain");
    uiHooks.updateStatsUI();
}

export function performFlee() {
    if (gameState.combat.actionsRemaining <= 0) return;
    gameState.combat.actionsRemaining--;

    const roll = rollDie(20) + gameState.player.modifiers.DEX;
    if (roll >= 12) {
        uiHooks.logToBattle("You escaped!", "gain");
        gameState.combat.active = false;
        uiHooks.goToScene(gameState.combat.loseSceneId);
    } else {
        uiHooks.logToBattle("Failed to escape!", "combat");
        uiHooks.updateCombatUI();
    }
}

export function endCurrentTurn() {
    gameState.combat.playerDefending = false;
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

    enemy.intent = "is preparing to attack!";
    uiHooks.updateCombatUI();

    setTimeout(() => {
        uiHooks.logToBattle(`${enemy.name} attacks!`, "combat");
        const totalHit = rollDie(20) + enemy.attackBonus;
    const ac = gameState.player.ac;

    if (totalHit >= ac) {
        let dmg = rollDiceExpression(enemy.damage).total;
        if (gameState.combat.playerDefending) {
            dmg = Math.floor(dmg / 2);
            uiHooks.logToBattle("Defended! Damage halved.", "gain");
        }
        gameState.player.hp -= dmg;
        uiHooks.logToBattle(`You took ${dmg} damage.`, "combat");
        uiHooks.showBattleEventText(`${dmg}`);

        if (enemy.id === 'fungal_beast' && rollDie(100) <= 25) {
            applyStatusEffect('poisoned');
            uiHooks.showBattleEventText("Poisoned!");
        }

        if (gameState.player.hp <= 0) {
            gameState.combat.active = false;
            uiHooks.goToScene(gameState.combat.loseSceneId);
            return;
        }
    } else {
        uiHooks.logToBattle(`${enemy.name} missed!`, "system");
        uiHooks.showBattleEventText("Miss!");
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

function companionTurnAI(actor) {
    uiHooks.logToBattle(`${actor.name} acts (AI).`, "system");
    endCurrentTurn();
}

function checkWinCondition() {
    const allEnemiesDefeated = gameState.combat.enemies.every(e => e.hp <= 0);
    if (allEnemiesDefeated) {
        gameState.combat.active = false;
        uiHooks.logToBattle(`Victory!`, "gain");

        const totalXp = gameState.combat.enemies.reduce((sum, e) => sum + (enemies[e.id].xp || 0), 0);
        const levelUpAvailable = gainXp(totalXp);
        uiHooks.logToBattle(`Gained ${totalXp} XP.`, "gain");
        if (levelUpAvailable) {
            uiHooks.logToBattle(`Level Up Available!`, "gain");
        }

        uiHooks.updateStatsUI();
        uiHooks.saveGame();

        const actionsContainer = document.getElementById('battle-actions-container');
        actionsContainer.innerHTML = '';
        actionsContainer.appendChild(
            uiHooks.createActionButton('Victory!', 'celebration', () => uiHooks.goToScene(gameState.combat.winSceneId), 'col-span-2')
        );
        return true;
    }
    return false;
}

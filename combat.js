// combat.js - All combat-related logic and actions

import { gameState, gainXp, applyStatusEffect, performShortRest as gsPerformShortRest, performLongRest as gsPerformLongRest, syncActorState } from './data/gameState.js';
import { scenes } from './data/scenes.js';
import { npcs } from './data/npcs.js';
import { enemies } from './data/enemies.js';
import { items } from './data/items.js';
import { spells } from './data/spells.js';
import { addEffectToActor, createDefaultMechanicsState, getDerivedActorState, getSpellcastingAbility, removeEffectsFromActorBySource, tickActorEffects } from './data/mechanics.js';
import { rollInitiative, rollDie, rollAttack, rollDiceExpression, rollSavingThrow, calculateDamageRoll, calculateDamageReduction, getProficiencyBonus } from './rules.js';
import { generateScaledStats } from './rules.js';
import { canTargetToken, createBattlefieldLayout, feetToTiles, getGridDistance, getMovementCost, getOpportunityAttackTriggers, getTileEffects, getTileKey, getToken, isAdjacent, moveToken, setTerrain, setTileEffect } from './battlegrid.js';

const ABILITY_MAP = {
    strength: 'STR',
    dexterity: 'DEX',
    constitution: 'CON',
    intelligence: 'INT',
    wisdom: 'WIS',
    charisma: 'CHA'
};

export const uiHooks = {
    updateCombatUI: () => {},
    logToBattle: () => {},
    showBattleEventText: () => {},
    createActionButton: () => {},
    goToScene: () => {},
    updateStatsUI: () => {},
    saveGame: () => {},
};

export function initCombatSystem(hooks) {
    Object.assign(uiHooks, hooks);
}

export function setCombatTileEffect(x, y, effect) {
    if (!gameState.combat?.grid) return null;
    return setTileEffect(gameState.combat.grid, x, y, effect);
}

function isEnemyId(actorId) {
    return actorId !== 'player' && !gameState.party.includes(actorId);
}

function getCombatActor(actorId) {
    if (actorId === 'player') return gameState.player;
    if (gameState.roster[actorId]) return gameState.roster[actorId];
    return gameState.combat.enemies.find(enemy => enemy.uniqueId === actorId) || null;
}

function normalizeAbilityBlock(attributes = {}, fallback = {}) {
    const base = {
        STR: fallback.STR || 10,
        DEX: fallback.DEX || 10,
        CON: fallback.CON || 10,
        INT: fallback.INT || 10,
        WIS: fallback.WIS || 10,
        CHA: fallback.CHA || 10
    };

    Object.entries(attributes || {}).forEach(([key, value]) => {
        const normalized = ABILITY_MAP[key] || key;
        if (base[normalized] !== undefined) {
            base[normalized] = value;
        }
    });

    return base;
}

function normalizeSaveProficiencies(saves = []) {
    return saves
        .map(save => ABILITY_MAP[save] || save)
        .filter(Boolean)
        .map(save => save.toUpperCase());
}

function getPrimaryEnemyAttack(template) {
    if (template.actions && Array.isArray(template.actions)) {
        return template.actions.find(action => action.type === 'attack') || null;
    }
    return null;
}

function buildEnemyCombatant(id, index) {
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

    const primaryAttack = isNpc
        ? getPrimaryEnemyAttack(combatantData)
        : {
            name: 'Attack',
            type: 'attack',
            toHit: combatantData.attackBonus || 2,
            damage: combatantData.damage || '1d4',
            damageType: combatantData.damageType || 'bludgeoning'
        };

    const fallbackAbilities = {
        STR: 12 + Math.max(0, (primaryAttack?.toHit || combatantData.attackBonus || 2) - 3),
        DEX: 12,
        CON: 12,
        INT: 8,
        WIS: 10,
        CHA: 8
    };

    const abilities = normalizeAbilityBlock(combatantData.attributes, fallbackAbilities);
    const dexMod = Math.floor((abilities.DEX - 10) / 2);
    const acTarget = combatantData.ac || (10 + dexMod);
    const level = combatantData.level || gameState.player.level || 1;

    const combatant = {
        id,
        uniqueId: `${id}_${index}`,
        type: 'enemy',
        name: combatantData.name,
        portrait: combatantData.portrait || 'portraits/placeholder.png',
        level,
        hp: combatantData.hp,
        maxHp: combatantData.hp,
        ac: acTarget,
        abilities: { ...abilities },
        modifiers: {},
        proficiencyBonus: getProficiencyBonus(level),
        statusEffects: [],
        mechanics: createDefaultMechanicsState(abilities, {
            baseSpeed: combatantData.speed || 30,
            saveProficiencies: normalizeSaveProficiencies(combatantData.proficiencies?.savingThrows || [])
        }),
        equipped: {},
        inventory: [],
        resources: {},
        spellSlots: {},
        currentSlots: {},
        knownSpells: [],
        intent: '',
        fullStats: combatantData,
        attackProfile: {
            name: primaryAttack?.name || 'Attack',
            toHit: primaryAttack?.toHit || combatantData.attackBonus || 2,
            damage: primaryAttack?.damage || combatantData.damage || '1d4',
            damageType: primaryAttack?.damageType || combatantData.damageType || 'bludgeoning',
            rangeFeet: primaryAttack?.range ? parseInt(String(primaryAttack.range).split('/')[0], 10) : null,
            reachFeet: primaryAttack?.reachFeet || 5
        },
        combatFlags: {}
    };

    combatant.mechanics.permanentStatBonuses.ac = acTarget - (10 + dexMod);
    syncActorState(combatant);
    combatant.ac = getDerivedActorState(combatant).ac;
    return combatant;
}

function getAttackProfile(actorId) {
    const actor = getCombatActor(actorId);
    if (!actor) return null;

    if (isEnemyId(actorId)) {
        const profile = actor.attackProfile || {};
        return {
            name: profile.name || 'Attack',
            damage: profile.damage || '1d4',
            damageType: profile.damageType || 'bludgeoning',
            stat: profile.stat || 'STR',
            attackBonus: profile.toHit || 2,
            rangeFeet: profile.rangeFeet || null,
            reachFeet: profile.reachFeet || 5,
            isRanged: !!profile.rangeFeet
        };
    }

    const weaponId = actor.equipped?.weapon;
    const weapon = weaponId && items[weaponId] ? items[weaponId] : null;

    if (!weapon) {
        return {
            name: 'Unarmed Strike',
            damage: '1d2',
            damageType: 'bludgeoning',
            stat: 'STR',
            proficiency: 0,
            rangeFeet: null,
            reachFeet: 5,
            isRanged: false,
            qualifiesForSneakAttack: false
        };
    }

    const proficiencyBonus = actor.proficiencyBonus || getProficiencyBonus(actor.level);
    const weaponProficiencies = actor.proficiencies?.weapons || [];
    const proficient = weapon.subtype && weaponProficiencies.includes(weapon.subtype);
    const stat = weapon.modifier || 'STR';

    return {
        name: weapon.name,
        weapon,
        damage: weapon.damage || '1d4',
        damageType: weapon.damageType || 'bludgeoning',
        stat,
        proficiency: proficient ? proficiencyBonus : 0,
        attackBonus: (actor.modifiers?.[stat] || 0) + (proficient ? proficiencyBonus : 0) + (weapon.modifiers?.toHit || 0),
        rangeFeet: weapon.rangeFeet || weapon.thrownRangeFeet || null,
        reachFeet: weapon.reachFeet || 5,
        isRanged: !!weapon.rangeFeet || !!weapon.thrownRangeFeet,
        qualifiesForSneakAttack: stat === 'DEX' || !!weapon.rangeFeet
    };
}

function syncGridToken(actorId) {
    const token = getToken(gameState.combat.grid, actorId);
    const actor = getCombatActor(actorId);
    if (!token || !actor) return;

    const snapshot = getDerivedActorState(actor);
    token.hp = actor.hp;
    token.speed = snapshot.speed;
    token.reach = feetToTiles(gameState.combat.grid, getAttackProfile(actorId)?.reachFeet || 5);
}

function syncAllGridTokens() {
    if (!gameState.combat.grid) return;
    ['player', ...gameState.party, ...gameState.combat.enemies.map(enemy => enemy.uniqueId)].forEach(syncGridToken);
}

function getTokenTileKey(actorId) {
    const token = getToken(gameState.combat.grid, actorId);
    if (!token) return null;
    return getTileKey(token.x, token.y);
}

function getTileEffectSource(tileKey, effectId) {
    return `tile:${tileKey}:${effectId}`;
}

function applyTileDamage(actor, tileEffect) {
    const roll = typeof tileEffect.damage === 'string'
        ? rollDiceExpression(tileEffect.damage).total
        : Math.max(0, tileEffect.damage || 0);
    if (roll <= 0) return 0;

    const finalDamage = resolveDamage(actor, roll, tileEffect.damageType || 'fire');
    uiHooks.logToBattle(`${actor.name} takes ${finalDamage} ${tileEffect.damageType || 'fire'} damage from ${tileEffect.name || tileEffect.id}.`, 'combat');
    uiHooks.showBattleEventText(`${finalDamage}`);
    return finalDamage;
}

function applyPersistentTileEffect(actor, tileKey, tileEffect) {
    const source = getTileEffectSource(tileKey, tileEffect.id);

    if (tileEffect.statusEffectId) {
        addEffectToActor(actor, tileEffect.statusEffectId, {
            source,
            remaining: tileEffect.effectDuration ?? null,
            durationType: tileEffect.effectDurationType || 'turns'
        });
    }

    if (tileEffect.effectModifiers) {
        addEffectToActor(actor, tileEffect.effectId || tileEffect.id, {
            id: tileEffect.effectId || tileEffect.id,
            name: tileEffect.effectName || tileEffect.name || tileEffect.id,
            source,
            remaining: tileEffect.effectDuration ?? null,
            durationType: tileEffect.effectDurationType || 'scenes',
            modifiers: tileEffect.effectModifiers
        });
    }
}

function removeInactiveTileEffects(actor, currentTileKey) {
    const activeTileEffects = actor.mechanics?.activeEffects || [];
    const validPrefix = currentTileKey ? `tile:${currentTileKey}:` : null;

    activeTileEffects
        .filter(effect => effect.source && String(effect.source).startsWith('tile:'))
        .forEach(effect => {
            if (!validPrefix || !String(effect.source).startsWith(validPrefix)) {
                removeEffectsFromActorBySource(actor, effect.source, true);
            }
        });
}

function reconcileTileEffects(actorId, trigger, previousTileKey = null) {
    const actor = getCombatActor(actorId);
    if (!actor || !gameState.combat.grid) return;

    const currentToken = getToken(gameState.combat.grid, actorId);
    if (!currentToken) return;

    const currentTileKey = getTileKey(currentToken.x, currentToken.y);
    if (previousTileKey && previousTileKey !== currentTileKey) {
        (gameState.combat.grid.tileEffects[previousTileKey] || []).forEach(tileEffect => {
            removeEffectsFromActorBySource(actor, getTileEffectSource(previousTileKey, tileEffect.id), true);
        });
    }

    removeInactiveTileEffects(actor, currentTileKey);

    const tileEffects = getTileEffects(gameState.combat.grid, currentToken.x, currentToken.y);
    tileEffects.forEach(tileEffect => {
        if (tileEffect.statusEffectId || tileEffect.effectModifiers) {
            applyPersistentTileEffect(actor, currentTileKey, tileEffect);
        }

        const triggers = tileEffect.triggers || [];
        if (triggers.includes(trigger)) {
            applyTileDamage(actor, tileEffect);
        }
    });

    syncActorState(actor);
    syncGridToken(actorId);
}

function getAvailableAdjacentTiles(targetId) {
    const grid = gameState.combat.grid;
    const target = getToken(grid, targetId);
    if (!target) return [];

    const candidates = [
        { x: target.x - 1, y: target.y },
        { x: target.x + 1, y: target.y },
        { x: target.x, y: target.y - 1 },
        { x: target.x, y: target.y + 1 }
    ];

    return candidates.filter(tile => {
        if (tile.x < 0 || tile.x >= grid.width || tile.y < 0 || tile.y >= grid.height) return false;
        return !Object.values(grid.occupied).some(occupant => occupant.id !== targetId && occupant.x === tile.x && occupant.y === tile.y && occupant.hp > 0);
    });
}

function buildPath(from, to) {
    const path = [{ x: from.x, y: from.y }];
    let x = from.x;
    let y = from.y;

    while (x !== to.x) {
        x += Math.sign(to.x - x);
        path.push({ x, y });
    }
    while (y !== to.y) {
        y += Math.sign(to.y - y);
        path.push({ x, y });
    }

    return path;
}

function applyOpportunityAttacks(moverId, path) {
    const mover = getCombatActor(moverId);
    if (!mover || mover.combatFlags?.disengage) return;

    const triggers = getOpportunityAttackTriggers(gameState.combat.grid, moverId, path);
    triggers.forEach(trigger => {
        resolveWeaponHit(trigger.hostileId, moverId, {
            opportunityAttack: true,
            consumeAction: false
        });
    });
}

function moveActorAlongPath(actorId, path) {
    if (!path || path.length < 2) return true;
    const actor = getCombatActor(actorId);
    if (!actor) return false;
    const previousTileKey = getTokenTileKey(actorId);

    let totalCost = 0;
    for (let i = 1; i < path.length; i++) {
        totalCost += getMovementCost(gameState.combat.grid, path[i].x, path[i].y);
    }

    if (totalCost > gameState.combat.movementRemaining) {
        return false;
    }

    applyOpportunityAttacks(actorId, path);
    const destination = path[path.length - 1];
    moveToken(gameState.combat.grid, actorId, destination.x, destination.y);
    gameState.combat.movementRemaining -= totalCost;
    syncGridToken(actorId);
    reconcileTileEffects(actorId, 'enter', previousTileKey);
    uiHooks.logToBattle(`${actor.name} moves ${totalCost} feet.`, 'system');
    return true;
}

function closeDistanceToTarget(actorId, targetId, reachFeet = 5) {
    const grid = gameState.combat.grid;
    const actorToken = getToken(grid, actorId);
    const targetToken = getToken(grid, targetId);
    if (!actorToken || !targetToken) return false;

    const reachTiles = feetToTiles(grid, reachFeet);
    if (getGridDistance(actorToken, targetToken) <= reachTiles) {
        return true;
    }

    const options = getAvailableAdjacentTiles(targetId)
        .map(tile => ({ tile, distance: getGridDistance(actorToken, tile) }))
        .sort((a, b) => a.distance - b.distance);
    const best = options[0];
    if (!best) return false;

    return moveActorAlongPath(actorId, buildPath(actorToken, best.tile));
}

function ensureTargetInRange(actorId, targetId, profile, options = {}) {
    const grid = gameState.combat.grid;
    const rangeFeet = options.rangeFeet ?? profile.rangeFeet ?? null;
    const reachFeet = options.reachFeet ?? profile.reachFeet ?? 5;

    if (rangeFeet && rangeFeet > grid.tileSize) {
        return canTargetToken(grid, actorId, targetId, rangeFeet);
    }

    if (isAdjacent(grid, actorId, targetId, feetToTiles(grid, reachFeet))) {
        return true;
    }

    return closeDistanceToTarget(actorId, targetId, reachFeet);
}

function getHostileIds(actorId) {
    if (isEnemyId(actorId)) {
        return ['player', ...gameState.party].filter(id => {
            const actor = getCombatActor(id);
            return actor && actor.hp > 0;
        });
    }

    return gameState.combat.enemies.filter(enemy => enemy.hp > 0).map(enemy => enemy.uniqueId);
}

function hasHostileAdjacent(actorId) {
    return getHostileIds(actorId).some(hostileId => isAdjacent(gameState.combat.grid, actorId, hostileId));
}

function hasAdjacentAllyNearTarget(attackerId, targetId) {
    if (isEnemyId(attackerId)) return false;
    const allyIds = ['player', ...gameState.party].filter(id => id !== attackerId);
    return allyIds.some(allyId => {
        const ally = getCombatActor(allyId);
        return ally && ally.hp > 0 && isAdjacent(gameState.combat.grid, allyId, targetId);
    });
}

function beginTurn(actorId) {
    const actor = getCombatActor(actorId);
    if (!actor || actor.hp <= 0) return false;

    tickActorEffects(actor, 'turn_start');
    syncActorState(actor);
    syncGridToken(actorId);

    gameState.combat.activeActorId = actorId;
    gameState.combat.actionsRemaining = 1;
    gameState.combat.bonusActionsRemaining = 1;
    gameState.combat.reactionsRemaining = 1;
    gameState.combat.movementRemaining = getDerivedActorState(actor).speed;
    gameState.combat.sneakAttackUsedThisTurn = false;
    actor.combatFlags = {};
    reconcileTileEffects(actorId, 'turn_start');
    return true;
}

function endActorTurn(actorId) {
    const actor = getCombatActor(actorId);
    if (!actor) return;

    reconcileTileEffects(actorId, 'turn_end');
    tickActorEffects(actor, 'turn_end');
    syncActorState(actor);
    syncGridToken(actorId);
}

function getNextTurnIndex(startIndex) {
    if (!gameState.combat.turnOrder.length) return 0;

    for (let offset = 1; offset <= gameState.combat.turnOrder.length; offset++) {
        const index = (startIndex + offset) % gameState.combat.turnOrder.length;
        const actor = getCombatActor(gameState.combat.turnOrder[index]);
        if (actor && actor.hp > 0) return index;
    }

    return 0;
}

function cleanupTurnOrder() {
    const livingIds = new Set([
        ...(gameState.player.hp > 0 ? ['player'] : []),
        ...gameState.party.filter(id => getCombatActor(id)?.hp > 0),
        ...gameState.combat.enemies.filter(enemy => enemy.hp > 0).map(enemy => enemy.uniqueId)
    ]);
    gameState.combat.turnOrder = gameState.combat.turnOrder.filter(id => livingIds.has(id));
}

function resolveDamage(target, amount, damageType = 'bludgeoning') {
    const targetStats = target.fullStats || enemies[target.id] || target;
    const { finalDamage, message } = calculateDamageReduction(amount, damageType, targetStats);
    if (message) uiHooks.logToBattle(message, 'system');

    target.hp -= Math.max(1, finalDamage);
    if (target.hp < 0) target.hp = 0;
    syncActorState(target);
    syncGridToken(target.uniqueId || target.id || 'player');
    return finalDamage;
}

function resolveWeaponHit(attackerId, targetId, options = {}) {
    const attacker = getCombatActor(attackerId);
    const target = getCombatActor(targetId);
    if (!attacker || !target) return false;

    const profile = getAttackProfile(attackerId);
    if (!profile || !ensureTargetInRange(attackerId, targetId, profile)) {
        return false;
    }

    if (options.consumeAction !== false) {
        if (gameState.combat.actionsRemaining <= 0) {
            uiHooks.logToBattle('No Action remaining!', 'check-fail');
            return false;
        }
        gameState.combat.actionsRemaining--;
    }

    const rangedInMelee = profile.isRanged && hasHostileAdjacent(attackerId);
    const attackResult = isEnemyId(attackerId)
        ? (() => {
            const enemyResult = rollAttack(attacker, profile.stat, 0, {
                disadvantage: rangedInMelee,
                tags: [profile.isRanged ? 'ranged' : 'melee']
            });
            const delta = profile.attackBonus - (attacker.modifiers?.[profile.stat] || 0);
            enemyResult.total += delta;
            enemyResult.modifier += delta;
            return enemyResult;
        })()
        : rollAttack(attacker, profile.stat, profile.proficiency, {
            disadvantage: rangedInMelee,
            tags: [profile.isRanged ? 'ranged' : 'melee']
        });

    const critThreshold = attacker.subclassId === 'champion' ? 19 : 20;
    const isCritical = attackResult.roll >= critThreshold || attackResult.isCritical;
    const hit = attackResult.total >= target.ac || attackResult.roll === 20;

    uiHooks.logToBattle(`${attacker.name} attacks ${target.name} with ${profile.name}: ${attackResult.total} (vs AC ${target.ac}).`, 'system');

    if (!hit) {
        uiHooks.logToBattle('Miss!', 'system');
        uiHooks.showBattleEventText('Miss!');
        return false;
    }

    let damageModifier = isEnemyId(attackerId) ? 0 : (attacker.modifiers?.[profile.stat] || 0);
    let damage = calculateDamageRoll(profile.damage, damageModifier, isCritical).total;

    if (!isEnemyId(attackerId) && attacker.classId === 'rogue' && profile.qualifiesForSneakAttack && !gameState.combat.sneakAttackUsedThisTurn) {
        const attackHadDisadvantage = !!attackResult.advantageState?.disadvantage;
        const attackHadAdvantage = !!attackResult.advantageState?.advantage && !attackHadDisadvantage;
        if (!attackHadDisadvantage && (attackHadAdvantage || hasAdjacentAllyNearTarget(attackerId, targetId))) {
            const sneakDice = Math.ceil((attacker.level || 1) / 2);
            const sneakDamage = rollDiceExpression(`${sneakDice}d6`).total;
            damage += sneakDamage;
            gameState.combat.sneakAttackUsedThisTurn = true;
            uiHooks.logToBattle(`Sneak Attack! +${sneakDamage} damage.`, 'gain');
        }
    }

    if (target.combatFlags?.defending) {
        damage = Math.floor(damage / 2);
        uiHooks.logToBattle(`${target.name} braces and halves the blow.`, 'gain');
    }

    const finalDamage = resolveDamage(target, damage, profile.damageType);
    uiHooks.logToBattle(`Hit! Dealt ${finalDamage} damage.`, 'combat');
    uiHooks.showBattleEventText(`${finalDamage}`);

    if (attackerId !== 'player' && attacker.id === 'fungal_beast' && rollDie(100) <= 25) {
        applyStatusEffect('poisoned');
        uiHooks.showBattleEventText('Poisoned!');
    }

    return true;
}

function getPreferredEnemyTarget(enemyId) {
    const hostileIds = getHostileIds(enemyId);
    const source = getToken(gameState.combat.grid, enemyId);
    return hostileIds
        .map(id => ({ id, actor: getCombatActor(id), distance: getGridDistance(source, getToken(gameState.combat.grid, id)) }))
        .filter(entry => entry.actor && entry.actor.hp > 0)
        .sort((a, b) => a.distance - b.distance)[0]?.id || 'player';
}

export function startCombat(combatantIds, winScene, loseScene) {
    const sceneContainer = document.getElementById('scene-container');
    if (sceneContainer) sceneContainer.classList.add('hidden');

    const battleScreen = document.getElementById('battle-screen');
    if (battleScreen) battleScreen.classList.remove('hidden');

    window.logMessage = uiHooks.logToBattle;

    const currentScene = scenes[gameState.currentSceneId];
    const battlefield = currentScene?.battlefield || {};

    const enemiesList = combatantIds
        .map((id, index) => buildEnemyCombatant(id, index))
        .filter(Boolean);

    const grid = createBattlefieldLayout('player', gameState.party, enemiesList.map(enemy => enemy.uniqueId), {
        width: battlefield.width,
        height: battlefield.height,
        tileSize: battlefield.tileSize
    });

    (battlefield.terrain || []).forEach(tile => {
        setTerrain(grid, tile.x, tile.y, tile);
    });
    (battlefield.effects || []).forEach(tileEffect => {
        setTileEffect(grid, tileEffect.x, tileEffect.y, tileEffect);
    });

    gameState.combat = {
        active: true,
        enemies: enemiesList,
        grid,
        turnOrder: [],
        turnIndex: 0,
        round: 1,
        winSceneId: winScene,
        loseSceneId: loseScene,
        playerDefending: false,
        sceneText: currentScene?.text || 'Battle begins.',
        actionsRemaining: 1,
        bonusActionsRemaining: 1,
        reactionsRemaining: 1,
        movementRemaining: 30,
        activeActorId: 'player',
        sneakAttackUsedThisTurn: false
    };

    syncAllGridTokens();
    ['player', ...gameState.party, ...gameState.combat.enemies.map(enemy => enemy.uniqueId)].forEach(actorId => {
        reconcileTileEffects(actorId, 'enter');
    });

    uiHooks.logToBattle(`Combat started!`, "combat");

    const initiatives = [];

    const playerInit = rollInitiative(gameState.player);
    initiatives.push({ type: 'player', id: 'player', initiative: playerInit.total });
    uiHooks.logToBattle(`You rolled ${playerInit.total} for initiative.`, "system");

    gameState.party.forEach(compId => {
        const char = gameState.roster[compId];
        if (!char) return;
        const init = rollInitiative(char);
        initiatives.push({ type: 'companion', id: compId, initiative: init.total });
        uiHooks.logToBattle(`${char.name} rolled ${init.total} for initiative.`, "system");
    });

    gameState.combat.enemies.forEach(enemy => {
        const init = rollInitiative(enemy);
        initiatives.push({ type: 'enemy', id: enemy.uniqueId, initiative: init.total });
        uiHooks.logToBattle(`${enemy.name} rolled ${init.total} for initiative.`, "system");
    });

    initiatives.sort((a, b) => b.initiative - a.initiative);
    gameState.combat.turnOrder = initiatives.map(i => i.id);

    combatTurnLoop();
}

export function combatTurnLoop() {
    if (!gameState.combat.active) return;

    cleanupTurnOrder();
    if (!gameState.combat.turnOrder.length) {
        checkWinCondition();
        return;
    }

    const currentTurnId = gameState.combat.turnOrder[gameState.combat.turnIndex];
    const currentActor = getCombatActor(currentTurnId);

    if (!currentActor || currentActor.hp <= 0) {
        gameState.combat.turnIndex = getNextTurnIndex(gameState.combat.turnIndex);
        combatTurnLoop();
        return;
    }

    beginTurn(currentTurnId);

    if (currentTurnId === 'player') {
        uiHooks.logToBattle(`Round ${gameState.combat.round} - Your Turn`, "system");
        uiHooks.updateCombatUI();
    } else if (gameState.party.includes(currentTurnId)) {
        uiHooks.logToBattle(`Round ${gameState.combat.round} - ${currentActor.name}'s Turn`, "system");

        if (gameState.settings?.companionAI !== false) {
            setTimeout(() => companionTurnAI(currentActor), 600);
        } else {
            uiHooks.updateCombatUI(currentTurnId); // Pass active character ID
        }
    } else {
        uiHooks.logToBattle(`Round ${gameState.combat.round} - ${currentActor.name}'s Turn`, "system");
        uiHooks.updateCombatUI();
        setTimeout(() => enemyTurn(currentActor), 700);
    }
}

export function performCunningAction(type, actorId = 'player') {
    if (gameState.combat.bonusActionsRemaining <= 0) {
        uiHooks.logToBattle("No Bonus Action remaining!", "check-fail");
        return;
    }
    const actor = getCombatActor(actorId);
    if (!actor) return;

    gameState.combat.bonusActionsRemaining--;

    if (type === 'dash') {
        gameState.combat.movementRemaining += getDerivedActorState(actor).speed;
        uiHooks.logToBattle(`${actor.name} uses Cunning Action to Dash.`, "gain");
    } else if (type === 'disengage') {
        actor.combatFlags = { ...(actor.combatFlags || {}), disengage: true };
        uiHooks.logToBattle(`${actor.name} disengages and avoids opportunity attacks this turn.`, "gain");
    } else {
        uiHooks.logToBattle(`${actor.name} uses Cunning Action: ${type}.`, "gain");
    }

    uiHooks.updateCombatUI(actorId);
}

export function performActionSurge(actorId = 'player') {
    const actor = getCombatActor(actorId);
    const res = actor?.resources?.['action_surge'];
    if (!actor || !res || res.current <= 0) return;

    res.current--;
    gameState.combat.actionsRemaining++;
    uiHooks.logToBattle(`${actor.name} used Action Surge!`, "gain");
    uiHooks.updateCombatUI(actorId);
}

export function performEndTurn() {
    endCurrentTurn();
}

export function performAttack(targetId, actorId = 'player') {
    const target = getCombatActor(targetId);
    const actor = getCombatActor(actorId);
    if (!target || !actor) return;

    const resolved = resolveWeaponHit(actorId, targetId, { consumeAction: true });
    if (!resolved) {
        uiHooks.logToBattle(`${actor.name} cannot reach ${target.name}.`, "check-fail");
    }

    if (!checkWinCondition()) {
        uiHooks.updateCombatUI(actorId);
    }
}

export function performCastSpell(spellId, targetId, actorId = 'player') {
    const spell = spells[spellId];
    const actor = getCombatActor(actorId);
    if (!spell || !actor) {
        console.error("Spell not found:", spellId);
        return;
    }
    if (gameState.combat.actionsRemaining <= 0) {
        uiHooks.logToBattle("No Action remaining!", "check-fail");
        return;
    }

    const target = getCombatActor(targetId);
    if (!target) return;

    const rangeFeet = spell.rangeFeet || 5;
    const targetInRange = ensureTargetInRange(actorId, targetId, { rangeFeet, reachFeet: rangeFeet }, { rangeFeet });
    if (!targetInRange) {
        uiHooks.logToBattle(`${target.name} is out of range for ${spell.name}.`, "check-fail");
        return;
    }

    const level = spell.level || 0;
    if (level > 0) {
        if (!actor.currentSlots || !actor.currentSlots[level] || actor.currentSlots[level] <= 0) {
            uiHooks.logToBattle("Not enough spell slots!", "check-fail");
            return;
        }
        actor.currentSlots[level]--;
    }

    gameState.combat.actionsRemaining--;
    uiHooks.logToBattle(`${actor.name} casts ${spell.name}.`, "system");

    const snapshot = getDerivedActorState(actor);
    const spellcastingAbility = getSpellcastingAbility(actor.classId);

    if (spell.type === 'heal') {
        let healAmount = rollDiceExpression(spell.amount).total;
        if (actor.classId === 'cleric' && actor.subclassId === 'life' && level > 0) {
            healAmount += 2 + level;
        }
        target.hp = Math.min(target.maxHp, target.hp + healAmount);
        syncActorState(target);
        syncGridToken(targetId);
        uiHooks.logToBattle(`${target.name} recovers ${healAmount} HP.`, "gain");
        uiHooks.showBattleEventText(`+${healAmount} HP`);
    } else if (spell.type === 'auto') {
        const damage = calculateDamageRoll(spell.damage, 0, false).total;
        const finalDamage = resolveDamage(target, damage, spell.damageType);
        uiHooks.logToBattle(`${spell.name} hits unerringly for ${finalDamage} ${spell.damageType} damage.`, "combat");
        uiHooks.showBattleEventText(`${finalDamage}`);
    } else if (spell.type === 'attack') {
        const result = rollAttack(actor, spellcastingAbility, snapshot.proficiencyBonus, {
            tags: ['spell', 'ranged']
        });
        uiHooks.logToBattle(`Spell Attack: ${result.total} (vs AC ${target.ac})`, "system");

        if (result.total >= target.ac || result.roll === 20) {
            const damage = calculateDamageRoll(spell.damage, snapshot.modifiers[spellcastingAbility] || 0, result.roll === 20).total;
            const finalDamage = resolveDamage(target, damage, spell.damageType);
            uiHooks.logToBattle(`Hit! Dealt ${finalDamage} ${spell.damageType} damage.`, "combat");
            uiHooks.showBattleEventText(`${finalDamage}`);
        } else {
            uiHooks.logToBattle("Miss!", "system");
            uiHooks.showBattleEventText("Miss!");
        }
    } else if (spell.type === 'save') {
        const save = rollSavingThrow(target, spell.saveAbility);
        uiHooks.logToBattle(`${target.name} Save (${spell.saveAbility}): ${save.total} (DC ${snapshot.spellSaveDC})`, "system");

        let damage = rollDiceExpression(spell.damage).total;
        if (save.total >= snapshot.spellSaveDC) {
            damage = Math.floor(damage / 2);
            uiHooks.logToBattle("Save successful! Damage halved.", "gain");
        } else {
            uiHooks.logToBattle("Save failed!", "combat");
        }

        const finalDamage = resolveDamage(target, damage, spell.damageType);
        uiHooks.logToBattle(`Dealt ${finalDamage} ${spell.damageType} damage.`, "combat");
        uiHooks.showBattleEventText(`${finalDamage}`);
    }

    if (!checkWinCondition()) {
        uiHooks.updateCombatUI(actorId);
    }
}

export function performAbility(abilityId, actorId = 'player') {
    const actor = getCombatActor(actorId);
    if (!actor) return;

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
        syncActorState(actor);
        syncGridToken(actorId);
        uiHooks.logToBattle(`Used Second Wind and recovered ${healed} HP.`, "gain");
    } else {
        uiHooks.logToBattle(`Ability '${abilityId}' is not implemented yet.`, "system");
    }

    if (!checkWinCondition()) {
        uiHooks.updateCombatUI(actorId);
    }
}


export function performDefend(actorId = 'player') {
    const actor = getCombatActor(actorId);
    if (!actor || gameState.combat.actionsRemaining <= 0) return;

    gameState.combat.actionsRemaining--;
    actor.combatFlags = { ...(actor.combatFlags || {}), defending: true };
    if (actorId === 'player') {
        gameState.combat.playerDefending = true;
    }
    uiHooks.logToBattle(`${actor.name} braces for the next attack.`, "system");
    uiHooks.updateCombatUI(actorId);
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

    const roll = rollDie(20) + (gameState.player.modifiers?.DEX || 0);
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
    if (!gameState.combat.active) return;

    const currentTurnId = gameState.combat.turnOrder[gameState.combat.turnIndex];
    if (currentTurnId) {
        endActorTurn(currentTurnId);
    }

    cleanupTurnOrder();
    if (!gameState.combat.turnOrder.length) {
        checkWinCondition();
        return;
    }

    const nextIndex = getNextTurnIndex(gameState.combat.turnIndex);
    if (nextIndex <= gameState.combat.turnIndex) {
        gameState.combat.round++;
    }
    gameState.combat.turnIndex = nextIndex;
    gameState.combat.playerDefending = false;
    combatTurnLoop();
}

export function enemyTurn(enemy) {
    if (!gameState.combat.active || !enemy || enemy.hp <= 0) {
        endCurrentTurn();
        return;
    }

    const targetId = getPreferredEnemyTarget(enemy.uniqueId);
    const target = getCombatActor(targetId);
    if (!target) {
        endCurrentTurn();
        return;
    }

    enemy.intent = `is pressing ${target.name}!`;
    uiHooks.updateCombatUI();

    enemy.intent = "";
    const attackResolved = resolveWeaponHit(enemy.uniqueId, targetId, { consumeAction: false });
    if (!attackResolved) {
        uiHooks.logToBattle(`${enemy.name} closes for a better angle.`, "system");
    }

    if (gameState.player.hp <= 0) {
        gameState.combat.active = false;
        uiHooks.goToScene(gameState.combat.loseSceneId);
        return;
    }

    endCurrentTurn();
}

export function companionTurnAI(actor) {
    if (!actor || actor.hp <= 0) {
        endCurrentTurn();
        return;
    }

    uiHooks.logToBattle(`${actor.name} acts.`, "system");
    const targetId = getPreferredEnemyTarget(actor.id);
    if (targetId) {
        resolveWeaponHit(actor.id, targetId, { consumeAction: true });
    }

    if (!checkWinCondition()) {
        endCurrentTurn();
    }
}

export function checkWinCondition() {
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

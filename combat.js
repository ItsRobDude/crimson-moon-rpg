// combat.js - All combat-related logic and actions

import { gameState, gainXp, applyStatusEffect, getActorCastableSpells, handleCombatNarrativeTransition, performShortRest as gsPerformShortRest, performLongRest as gsPerformLongRest, syncActorState } from './data/gameState.js';
import { scenes } from './data/scenes.js';
import { npcs } from './data/npcs.js';
import { enemies } from './data/enemies.js';
import { items } from './data/items.js';
import { spells } from './data/spells.js';
import { addEffectToActor, canActorTargetActor, canApplyEffectToActor, consumeIncomingHitEffects, createDefaultMechanicsState, dropConcentration, effectBlocksSpell, effectHasDataFlag, getApproachBlockedSourceIds, getDerivedActorState, getEffectModifiers, getSourceMaintainedEffects, getSpellcastingAbility, removeEffectFromActor, removeEffectsFromActorBySource, tickActorEffects } from './data/mechanics.js';
import { rollInitiative, rollDie, rollAttack, rollDiceExpression, rollSavingThrow, calculateDamageRoll, calculateDamageReduction, getProficiencyBonus, getSkillBonus, rollSkillCheck } from './rules.js';
import { generateScaledStats } from './rules.js';
import { canTargetToken, collectTemplateTargets, createBattlefieldLayout, feetToTiles, getCoverBetween, getCoverBetweenPoints, getFacingDirections, getMovementCost, getOpportunityAttackTriggers, getRangeDistance, getReachableTiles, getTemplateTiles, getTileEffects, getTileKey, getToken, inferFacing, isAdjacent, isWithinGrid, moveToken, setTerrain, setTileEffect } from './battlegrid.js';
import { scheduleTrackedTimeout } from './timers.js';

const DEFAULT_PORTRAIT_PATH = 'portraits/npc_male_placeholder_portrait.png';

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

function getAllCombatActors() {
    return [
        gameState.player,
        ...gameState.party.map((id) => gameState.roster[id]).filter(Boolean),
        ...(gameState.combat.enemies || [])
    ];
}

function actorHasCombatEffect(actor, effectId) {
    return !!actor?.mechanics?.activeEffects?.some((effect) => effect.id === effectId);
}

function getEscapeableEffects(actor) {
    if (!actor?.mechanics?.activeEffects) return [];
    return actor.mechanics.activeEffects.filter((effect) => effect.id === 'grappled' || effect.id === 'restrained');
}

function getEscapeDc(effect) {
    if (Number.isFinite(effect?.escapeDc)) {
        return effect.escapeDc;
    }
    if (effect?.sourceActorId) {
        const sourceActor = getCombatActor(effect.sourceActorId);
        if (sourceActor) {
            const sourceSnapshot = getDerivedActorState(sourceActor);
            const sourceMod = Math.max(sourceSnapshot.modifiers.STR || 0, sourceSnapshot.modifiers.DEX || 0);
            return 8 + (sourceActor.proficiencyBonus || 2) + sourceMod;
        }
    }
    return effect?.id === 'restrained' ? 13 : 12;
}

function getActorSpellList(actor, { combatOnly = false } = {}) {
    if (!actor) return [];
    const ids = getActorCastableSpells(actor, { combatOnly });
    return ids.filter((spellId) => !!spells[spellId]);
}

function breakConcentration(actor, reason = '') {
    if (!actor?.mechanics?.concentrationEffectId) return false;
    const source = actor.mechanics.concentrationEffectId.split(':').slice(1).join(':') || null;
    if (source) {
        getAllCombatActors().forEach((target) => {
            removeEffectsFromActorBySource(target, source, true);
        });
    }
    dropConcentration(actor);
    if (reason) {
        uiHooks.logToBattle(`${actor.name} loses concentration${reason}.`, 'system');
    }
    return true;
}

export function hasReactionAvailable(actorId) {
    const actor = getCombatActor(actorId);
    if (!actor) return false;
    actor.combatFlags = actor.combatFlags || {};
    if (effectHasDataFlag(actor, 'reactionLocked')) return false;
    return actor.combatFlags.reactionAvailable !== false;
}

function refreshReaction(actorId) {
    const actor = getCombatActor(actorId);
    if (!actor) return false;
    const available = !effectHasDataFlag(actor, 'reactionLocked');
    actor.combatFlags = { ...(actor.combatFlags || {}), reactionAvailable: available };
    if (gameState.combat.activeActorId === actorId) {
        gameState.combat.reactionsRemaining = available ? 1 : 0;
    }
    return true;
}

export function consumeReaction(actorId) {
    if (!hasReactionAvailable(actorId)) return false;
    const actor = getCombatActor(actorId);
    actor.combatFlags.reactionAvailable = false;
    if (gameState.combat.activeActorId === actorId) {
        gameState.combat.reactionsRemaining = 0;
    }
    return true;
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
        portrait: combatantData.portrait || DEFAULT_PORTRAIT_PATH,
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
            isRanged: !!profile.rangeFeet,
            tags: [profile.rangeFeet ? 'ranged_weapon' : 'melee_weapon']
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
            qualifiesForSneakAttack: false,
            tags: ['melee_weapon', 'one_handed']
        };
    }

    const proficiencyBonus = actor.proficiencyBonus || getProficiencyBonus(actor.level);
    const weaponProficiencies = actor.proficiencies?.weapons || [];
    const proficient = (weapon.subtype && weaponProficiencies.includes(weapon.subtype))
        || (weapon.weaponCategory && weaponProficiencies.includes(weapon.weaponCategory));
    const stat = weapon.modifier || 'STR';
    const isRanged = !!weapon.rangeFeet || !!weapon.thrownRangeFeet || weapon.properties?.includes('ranged');
    const tags = [
        isRanged ? 'ranged_weapon' : 'melee_weapon'
    ];
    if (!weapon.properties || !weapon.properties.includes('two_handed')) {
        tags.push('one_handed');
    }

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
        isRanged,
        qualifiesForSneakAttack: stat === 'DEX' || !!weapon.rangeFeet,
        tags
    };
}

function syncGridToken(actorId) {
    if (!gameState.combat?.grid) return;
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
        { x: target.x, y: target.y + 1 },
        { x: target.x - 1, y: target.y - 1 },
        { x: target.x + 1, y: target.y - 1 },
        { x: target.x - 1, y: target.y + 1 },
        { x: target.x + 1, y: target.y + 1 }
    ];

    return candidates.filter(tile => {
        if (!isWithinGrid(grid, tile.x, tile.y)) return false;
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

export function applyOpportunityAttacks(moverId, path) {
    const mover = getCombatActor(moverId);
    if (!mover || mover.combatFlags?.disengage) return;

    const triggers = getOpportunityAttackTriggers(gameState.combat.grid, moverId, path);
    triggers.forEach(trigger => {
        if (!consumeReaction(trigger.hostileId)) {
            return;
        }
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
    if (pathMovesCloserToBlockedSource(actorId, path)) {
        uiHooks.logToBattle(`${actor.name} flinches and cannot bring themself closer to what they fear.`, 'check-fail');
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

function getMovementCoverSummary(actorId, point) {
    const grid = gameState.combat.grid;
    const hostileIds = getHostileIds(actorId);
    const ranking = { none: 0, half: 1, three_quarters: 2, full: 3 };
    let best = 'none';

    hostileIds.forEach((hostileId) => {
        const hostileToken = getToken(grid, hostileId);
        if (!hostileToken || hostileToken.hp <= 0) return;
        const cover = getCoverBetweenPoints(grid, hostileToken, point);
        if ((ranking[cover] || 0) > (ranking[best] || 0)) {
            best = cover;
        }
    });

    return best;
}

function getThreateningHostileIds(actorId, point) {
    const grid = gameState.combat.grid;
    return getHostileIds(actorId).filter((hostileId) => {
        const hostile = getCombatActor(hostileId);
        const hostileToken = getToken(grid, hostileId);
        if (!hostile || !hostileToken || hostile.hp <= 0) return false;
        const reachFeet = hostile.attackProfile?.reachFeet || 5;
        return getRangeDistance(point, hostileToken) <= feetToTiles(grid, reachFeet);
    });
}

function getMeleeTargetIdsFromPoint(actorId, point) {
    const grid = gameState.combat.grid;
    const profile = getAttackProfile(actorId);
    const reachFeet = profile?.reachFeet || 5;
    return getHostileIds(actorId).filter((hostileId) => {
        const hostile = getCombatActor(hostileId);
        const hostileToken = getToken(grid, hostileId);
        if (!hostile || !hostileToken || hostile.hp <= 0) return false;
        return getRangeDistance(point, hostileToken) <= feetToTiles(grid, reachFeet);
    });
}

export function getMovementPreview(actorId = 'player') {
    const actor = getCombatActor(actorId);
    const grid = gameState.combat.grid;
    const actorToken = getToken(grid, actorId);
    if (!gameState.combat?.active || !actor || !grid || !actorToken) {
        return {
            valid: false,
            actorId,
            entries: [],
            current: null,
            movementRemaining: 0
        };
    }

    const movementRemaining = Math.max(0, gameState.combat.movementRemaining || 0);
    const entries = getReachableTiles(grid, actorId, movementRemaining)
        .filter((entry) => !pathMovesCloserToBlockedSource(actorId, entry.path))
        .map((entry) => {
        const triggers = getOpportunityAttackTriggers(grid, actorId, entry.path);
        const threatenedIds = getThreateningHostileIds(actorId, entry);
        const meleeTargets = getMeleeTargetIdsFromPoint(actorId, entry);
        const cover = getMovementCoverSummary(actorId, entry);
        const threatNames = threatenedIds.map((id) => getCombatActor(id)?.name || id);
        const meleeTargetNames = meleeTargets.map((id) => getCombatActor(id)?.name || id);

        return {
            ...entry,
            remainingAfter: Math.max(0, movementRemaining - entry.cost),
            threatenedIds,
            threatNames,
            triggers,
            opportunityAttackRisk: triggers.length > 0,
            meleeTargets,
            meleeTargetNames,
            cover
        };
    });

    return {
        valid: true,
        actorId,
        entries,
        current: { x: actorToken.x, y: actorToken.y },
        movementRemaining
    };
}

export function performMove(destination, actorId = 'player') {
    const actor = getCombatActor(actorId);
    if (!actor || !gameState.combat?.active) return false;
    if (gameState.combat.activeActorId !== actorId) {
        uiHooks.logToBattle(`${actor.name} cannot move outside their turn.`, 'check-fail');
        return false;
    }
    if (!canActorTakeActions(actor)) {
        uiHooks.logToBattle(`${actor.name} cannot move right now.`, 'check-fail');
        return false;
    }

    const preview = getMovementPreview(actorId);
    const targetX = destination?.x;
    const targetY = destination?.y;
    const entry = preview.entries.find((option) => option.x === targetX && option.y === targetY);
    if (!entry) {
        uiHooks.logToBattle(`${actor.name} has no safe path to that tile.`, 'check-fail');
        return false;
    }

    const moved = moveActorAlongPath(actorId, entry.path);
    if (moved) {
        resetCombatUiState(actorId);
        uiHooks.updateCombatUI(actorId);
    }
    return moved;
}

function closeDistanceToTarget(actorId, targetId, reachFeet = 5) {
    const grid = gameState.combat.grid;
    const actorToken = getToken(grid, actorId);
    const targetToken = getToken(grid, targetId);
    if (!actorToken || !targetToken) return false;

    const reachTiles = feetToTiles(grid, reachFeet);
    if (getRangeDistance(actorToken, targetToken) <= reachTiles) {
        return true;
    }

    const options = getAvailableAdjacentTiles(targetId)
        .map(tile => ({ tile, distance: getRangeDistance(actorToken, tile) }))
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

function resetCombatUiState(actorId = gameState.combat?.activeActorId || null) {
    if (!gameState.combat) return;
    gameState.combat.uiState = {
        actorId,
        subMenu: null
    };
    gameState.combat.transientPreview = null;
}

function getFriendlyIds(actorId) {
    if (isEnemyId(actorId)) {
        return gameState.combat.enemies.filter(enemy => enemy.hp > 0).map(enemy => enemy.uniqueId);
    }

    return ['player', ...gameState.party].filter((id) => {
        const actor = getCombatActor(id);
        return actor && actor.hp > 0;
    });
}

function getActorTeam(actorId) {
    const token = getToken(gameState.combat.grid, actorId);
    if (token?.team) return token.team;
    return isEnemyId(actorId) ? 'enemies' : 'allies';
}

function isFriendlyTarget(sourceActorId, targetActorId) {
    return getActorTeam(sourceActorId) === getActorTeam(targetActorId);
}

function canSculptSpellTarget(actor, targetId, spell) {
    return actor?.classId === 'wizard'
        && actor?.subclassId === 'evocation'
        && spell?.school === 'Evocation'
        && isFriendlyTarget(actor.id || actor.uniqueId || 'player', targetId);
}

function getSpellTargeting(spell) {
    const targeting = typeof spell?.targeting === 'string'
        ? { type: 'single', side: spell.targeting, rangeFeet: spell.rangeFeet || 5 }
        : { ...(spell?.targeting || {}) };

    return {
        type: targeting.type || 'single',
        side: targeting.side || 'enemy',
        rangeFeet: targeting.rangeFeet ?? spell?.rangeFeet ?? 5,
        template: targeting.template || null,
        sizeFeet: targeting.sizeFeet || null,
        requiresFacing: !!targeting.requiresFacing,
        origin: targeting.origin || (targeting.side === 'self' ? 'self' : 'target'),
        maxTargets: targeting.maxTargets || spell?.maxTargets || 1
    };
}

function getSelectionTargetId(selection, actorId) {
    if (!selection) return actorId;
    if (typeof selection === 'string') return selection;
    return selection.targetId || selection.actorId || actorId;
}

function getSelectionCenter(selection, grid) {
    if (!selection || typeof selection === 'string') return null;
    if (selection.center && Number.isInteger(selection.center.x) && Number.isInteger(selection.center.y)) {
        return selection.center;
    }
    if (Number.isInteger(selection.x) && Number.isInteger(selection.y)) {
        return { x: selection.x, y: selection.y };
    }
    if (selection.targetId) {
        const token = getToken(grid, selection.targetId);
        if (token) return { x: token.x, y: token.y };
    }
    return null;
}

function getHostileActionSide(spell) {
    return ['attack', 'save', 'auto', 'auto_status'].includes(spell.type);
}

function getTargetTeamFilters(actorId, spell) {
    const actorTeam = getActorTeam(actorId);
    const targeting = getSpellTargeting(spell);

    if (targeting.side === 'self') {
        return {
            filter: (token) => token.id === actorId
        };
    }
    if (targeting.side === 'ally') {
        return {
            team: actorTeam
        };
    }
    if (targeting.side === 'enemy') {
        if (targeting.type === 'template') {
            return {
                filter: (token) => token.id !== actorId
            };
        }
        return {
            excludeTeam: actorTeam
        };
    }
    return {};
}

function getCoverBonusValue(cover) {
    if (cover === 'three_quarters') return 5;
    if (cover === 'half') return 2;
    return 0;
}

function getTargetingReferencePoint(actorId, spell, selection) {
    const grid = gameState.combat.grid;
    const actorToken = getToken(grid, actorId);
    if (!actorToken) return null;

    const targeting = getSpellTargeting(spell);
    if (targeting.origin === 'self') {
        return { x: actorToken.x, y: actorToken.y };
    }

    return getSelectionCenter(selection, grid) || (() => {
        const targetToken = getToken(grid, getSelectionTargetId(selection, actorId));
        return targetToken ? { x: targetToken.x, y: targetToken.y } : null;
    })();
}

function resolveSpellTargetEntries(actorId, spell, selection) {
    const grid = gameState.combat.grid;
    const actorToken = getToken(grid, actorId);
    if (!grid || !actorToken) return { valid: false, targets: [], tiles: [], cover: 'none', targeting: getSpellTargeting(spell) };

    const targeting = getSpellTargeting(spell);
    const selectionTargetId = getSelectionTargetId(selection, actorId);

    if (targeting.type === 'single') {
        const targetId = targeting.side === 'self' ? actorId : selectionTargetId;
        const targetToken = getToken(grid, targetId);
        if (!targetToken) {
            return { valid: false, targets: [], tiles: [], cover: 'none', targeting };
        }
        const inRange = targetId === actorId || canTargetToken(grid, actorId, targetId, targeting.rangeFeet);
        return {
            valid: inRange,
            targets: inRange ? [{
                id: targetId,
                token: targetToken,
                tile: { x: targetToken.x, y: targetToken.y },
                cover: getCoverBetween(grid, actorId, targetId)
            }] : [],
            tiles: inRange ? [{ x: targetToken.x, y: targetToken.y }] : [],
            cover: getCoverBetween(grid, actorId, targetId),
            targeting
        };
    }

    const center = getTargetingReferencePoint(actorId, spell, selection);
    if (!center) {
        return { valid: false, targets: [], tiles: [], cover: 'none', targeting };
    }

    const rangeFromActor = getRangeDistance(actorToken, center) * grid.tileSize;
    if (rangeFromActor > targeting.rangeFeet) {
        return { valid: false, targets: [], tiles: [], cover: 'none', targeting };
    }

    const facing = targeting.requiresFacing
        ? (typeof selection === 'object' && selection?.facing ? selection.facing : inferFacing(actorToken, center).id)
        : null;
    const origin = targeting.origin === 'self'
        ? { x: actorToken.x, y: actorToken.y }
        : center;
    const tiles = getTemplateTiles(grid, {
        template: targeting.template,
        origin,
        center,
        sizeFeet: targeting.sizeFeet || targeting.rangeFeet,
        facing
    });
    const teamFilters = getTargetTeamFilters(actorId, spell);
    const targets = collectTemplateTargets(grid, {
        template: targeting.template,
        origin,
        center,
        sizeFeet: targeting.sizeFeet || targeting.rangeFeet,
        facing
    }, teamFilters).filter((entry) => entry.cover !== 'full');

    return {
        valid: tiles.length > 0,
        targets,
        tiles,
        facing,
        center,
        cover: 'none',
        targeting
    };
}

export function getSpellTargetingPreview(actorId, spellId, selection = null) {
    const spell = spells[spellId];
    const actor = getCombatActor(actorId);
    if (!spell || !actor || !gameState.combat?.grid) {
        return { valid: false, summary: '', affectedNames: [], tiles: [], targeting: getSpellTargeting(spell || {}) };
    }

    const resolution = resolveSpellTargetEntries(actorId, spell, selection);
    const targetTiles = resolution.tiles.map((tile) => `(${tile.x},${tile.y})`);
    const affectedNames = resolution.targets
        .map((entry) => getCombatActor(entry.id)?.name || entry.id)
        .filter(Boolean);
    const facingLabel = resolution.facing
        ? ` Facing ${getFacingDirections().find((direction) => direction.id === resolution.facing)?.label || resolution.facing}.`
        : '';
    const summary = resolution.valid
        ? `${spell.name}${facingLabel} Tiles: ${targetTiles.join(', ') || 'none'}. Affected: ${affectedNames.join(', ') || 'none'}.`
        : `${spell.name} has no legal targets from that selection.`;

    return {
        ...resolution,
        summary,
        affectedNames
    };
}

function canActorUseHostileEffectOnTarget(actorId, targetId, spell = null) {
    const actor = getCombatActor(actorId);
    if (!actor || !targetId) return false;
    return canActorTargetActor(actor, targetId, { harmful: spell ? getHostileActionSide(spell) : true });
}

function pathMovesCloserToBlockedSource(actorId, path = []) {
    const actor = getCombatActor(actorId);
    const blockedSourceIds = getApproachBlockedSourceIds(actor);
    if (!actor || blockedSourceIds.length === 0 || path.length < 2) return false;

    return blockedSourceIds.some((sourceId) => {
        const sourceToken = getToken(gameState.combat.grid, sourceId);
        if (!sourceToken || sourceToken.hp <= 0) return false;
        const startDistance = getRangeDistance(path[0], sourceToken);
        return path.slice(1).some((step) => getRangeDistance(step, sourceToken) < startDistance);
    });
}

function cleanupSourceMaintainedEffects(actorId) {
    const actor = getCombatActor(actorId);
    if (!actor || !gameState.combat?.grid) return;

    getSourceMaintainedEffects(actor).forEach((effect) => {
        const sourceToken = getToken(gameState.combat.grid, effect.sourceActorId);
        const actorToken = getToken(gameState.combat.grid, actorId);
        if (!sourceToken || sourceToken.hp <= 0 || !actorToken || !isAdjacent(gameState.combat.grid, actorId, effect.sourceActorId)) {
            removeEffectFromActor(actor, effect.id);
        }
    });
}

function canActorTakeActions(actor) {
    return !!actor && !effectHasDataFlag(actor, 'actionLocked');
}

function spendAction(actorId) {
    if (gameState.combat.actionsRemaining <= 0) {
        uiHooks.logToBattle('No Action remaining!', 'check-fail');
        return false;
    }
    gameState.combat.actionsRemaining -= 1;
    return true;
}

function getAttackTags(profile) {
    const base = profile?.isRanged ? ['ranged_attack'] : ['melee_attack'];
    return [...new Set([...base, ...(profile?.tags || [])])];
}

function getIncomingAttackContext(target, profile) {
    return getEffectModifiers(target, {
        target: 'incoming_attack_roll',
        tags: getAttackTags(profile)
    });
}

function targetForcesMeleeCrit(target, attackerId, targetId, profile) {
    if (profile?.isRanged || !effectHasDataFlag(target, 'incomingMeleeAttacksCritical')) return false;
    return isAdjacent(gameState.combat.grid, attackerId, targetId, feetToTiles(gameState.combat.grid, profile?.reachFeet || 5));
}

function getBlessTargets(casterId, primaryTargetId, maxTargets = 3) {
    const friendlyIds = getFriendlyIds(casterId);
    const ordered = [primaryTargetId, casterId, ...friendlyIds.filter((id) => id !== primaryTargetId && id !== casterId)].filter(Boolean);
    return [...new Set(ordered)].slice(0, maxTargets);
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

    cleanupSourceMaintainedEffects(actorId);
    tickActorEffects(actor, 'turn_start');
    syncActorState(actor);
    syncGridToken(actorId);

    gameState.combat.activeActorId = actorId;
    gameState.combat.actionsRemaining = canActorTakeActions(actor) ? 1 : 0;
    gameState.combat.bonusActionsRemaining = canActorTakeActions(actor) ? 1 : 0;
    refreshReaction(actorId);
    gameState.combat.movementRemaining = getDerivedActorState(actor).speed;
    gameState.combat.sneakAttackUsedThisTurn = false;
    actor.combatFlags = {
        ...(actor.combatFlags || {}),
        reactionAvailable: !effectHasDataFlag(actor, 'reactionLocked'),
        sneakAttackUsedThisTurn: false,
        turnStartedSpeedZero: getDerivedActorState(actor).speed <= 0
    };
    gameState.combat.uiState = {
        actorId,
        subMenu: null
    };
    gameState.combat.transientPreview = null;
    reconcileTileEffects(actorId, 'turn_start');
    return true;
}

function endActorTurn(actorId) {
    const actor = getCombatActor(actorId);
    if (!actor) return;

    reconcileTileEffects(actorId, 'turn_end');
    tickActorEffects(actor, 'turn_end');
    cleanupSourceMaintainedEffects(actorId);
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

function getSpellEffectSource(actorId, spellId) {
    return `concentration:${actorId}:${spellId}`;
}

function canUseShieldReaction(actor) {
    if (!actor || !hasReactionAvailable(actor.uniqueId || actor.id || 'player')) return false;
    if (!getActorSpellList(actor).includes('shield')) return false;
    return (actor.currentSlots?.[1] || 0) > 0;
}

function tryUseShieldReaction(actorId, incomingAttackTotal) {
    const actor = getCombatActor(actorId);
    if (!canUseShieldReaction(actor)) return false;

    const incoming = typeof incomingAttackTotal === 'object' && incomingAttackTotal !== null
        ? incomingAttackTotal
        : { attackTotal: incomingAttackTotal, spellId: null, autoHit: false };
    const currentAc = getDerivedActorState(actor).ac;
    if (!incoming.autoHit && (incoming.attackTotal < currentAc || incoming.attackTotal >= currentAc + 5)) {
        return false;
    }
    if (incoming.autoHit && !spells.shield.effect.blockedSpellIds?.includes(incoming.spellId)) {
        return false;
    }

    actor.currentSlots[1] -= 1;
    consumeReaction(actorId);
    addEffectToActor(actor, 'shield_spell', {
        id: 'shield_spell',
        source: `reaction:${actorId}:shield`,
        name: 'Shield',
        remaining: spells.shield.effect.remaining,
        durationType: spells.shield.effect.durationType,
        modifiers: spells.shield.effect.modifiers,
        blockedSpellIds: spells.shield.effect.blockedSpellIds || []
    });
    uiHooks.logToBattle(`${actor.name} throws up a Shield reaction.`, 'gain');
    return true;
}

function applySpellBuff(casterId, targetId, spell, options = {}) {
    const caster = getCombatActor(casterId);
    const target = getCombatActor(targetId);
    if (!caster || !target || !spell.effect) return false;
    const concentrationSource = options.sourceOverride || getSpellEffectSource(casterId, spell.id);

    const effectId = spell.effect.id || spell.id;
    const baseOverrides = {
        id: effectId,
        source: spell.concentration ? concentrationSource : `${spell.id}:${casterId}`,
        sourceActorId: casterId,
        name: spell.effect.name || spell.name,
        remaining: spell.effect.remaining ?? 5,
        durationType: spell.effect.durationType || 'turns',
        modifiers: spell.effect.modifiers || [],
        blockedSpellIds: spell.effect.blockedSpellIds || [],
        applicationTags: spell.effect.applicationTags || [],
        data: spell.effect.data || {}
    };

    if (spell.concentration && options.manageConcentration !== false) {
        breakConcentration(caster);
        const appliedEffect = addEffectToActor(target, effectId, {
            ...baseOverrides,
            source: concentrationSource
        });
        if (!appliedEffect) {
            return false;
        }
        addEffectToActor(caster, `${spell.id}_concentration`, {
            id: `${spell.id}_concentration`,
            source: concentrationSource,
            name: `${spell.name} (Concentration)`,
            remaining: spell.effect.remaining ?? 5,
            durationType: spell.effect.durationType || 'turns',
            concentration: true,
            modifiers: []
        });
        return !!appliedEffect;
    }

    return !!addEffectToActor(target, effectId, baseOverrides);
}

function getDamageRollBonus(actor, profile) {
    const modifiers = getEffectModifiers(actor, {
        target: 'damage_roll',
        ability: profile.stat,
        tags: profile.tags || []
    });
    return modifiers.flat;
}

function applySpellOnHitEffect(casterId, targetId, spell) {
    const target = getCombatActor(targetId);
    if (!target || !spell?.onHitEffect) return false;

    return !!addEffectToActor(target, spell.onHitEffect.id, {
        ...spell.onHitEffect,
        source: `${spell.id}:${casterId}`,
        sourceActorId: casterId,
        data: spell.onHitEffect.data || {}
    });
}

function handleConcentrationFromDamage(target, damage) {
    if (!target?.mechanics?.concentrationEffectId || damage <= 0) return;
    if (target.hp <= 0 || target.mechanics.activeEffects.some((effect) => effect.id === 'unconscious' || effect.id === 'incapacitated')) {
        breakConcentration(target, ' as the spell slips away');
        return;
    }

    const dc = Math.max(10, Math.floor(damage / 2));
    const save = rollSavingThrow(target, 'CON');
    uiHooks.logToBattle(`${target.name} makes a concentration check: ${save.total} vs DC ${dc}.`, 'system');
    if (save.total < dc) {
        breakConcentration(target, ' after taking damage');
    }
}

function resolveDamage(target, amount, damageType = 'bludgeoning') {
    const targetStats = target.fullStats || enemies[target.id] || target;
    const { finalDamage, message } = calculateDamageReduction(amount, damageType, targetStats);
    if (message) uiHooks.logToBattle(message, 'system');

    target.hp -= Math.max(1, finalDamage);
    if (target.hp < 0) target.hp = 0;
    if (target.hp === 0) {
        addEffectToActor(target, 'unconscious');
    }
    syncActorState(target);
    syncGridToken(target.uniqueId || target.id || 'player');
    handleConcentrationFromDamage(target, Math.max(1, finalDamage));
    return finalDamage;
}

function resolveWeaponHit(attackerId, targetId, options = {}) {
    const attacker = getCombatActor(attackerId);
    const target = getCombatActor(targetId);
    if (!attacker || !target) return false;
    if (!canActorUseHostileEffectOnTarget(attackerId, targetId)) {
        uiHooks.logToBattle(`${attacker.name} cannot bring themself to strike ${target.name}.`, 'check-fail');
        return false;
    }

    const profile = getAttackProfile(attackerId);
    if (!profile || !ensureTargetInRange(attackerId, targetId, profile)) {
        return false;
    }
    if (!canActorTakeActions(attacker) && !options.opportunityAttack) {
        uiHooks.logToBattle(`${attacker.name} cannot act right now.`, 'check-fail');
        return false;
    }

    if (options.consumeAction !== false) {
        if (gameState.combat.actionsRemaining <= 0) {
            uiHooks.logToBattle('No Action remaining!', 'check-fail');
            return false;
        }
        gameState.combat.actionsRemaining--;
    }

    const targetAttackModifiers = getIncomingAttackContext(target, profile);
    const hiddenAdvantage = !!attacker.combatFlags?.hidden;
    const rangedInMelee = profile.isRanged && hasHostileAdjacent(attackerId);
    const attackResult = isEnemyId(attackerId)
        ? (() => {
            const enemyResult = rollAttack(attacker, profile.stat, 0, {
                advantage: targetAttackModifiers.advantage || hiddenAdvantage,
                disadvantage: rangedInMelee || targetAttackModifiers.disadvantage,
                tags: getAttackTags(profile)
            });
            const delta = profile.attackBonus - (attacker.modifiers?.[profile.stat] || 0);
            enemyResult.total += delta;
            enemyResult.modifier += delta;
            return enemyResult;
        })()
        : rollAttack(attacker, profile.stat, profile.proficiency, {
            advantage: targetAttackModifiers.advantage || hiddenAdvantage,
            disadvantage: rangedInMelee || targetAttackModifiers.disadvantage,
            tags: getAttackTags(profile)
        });
    attacker.combatFlags.hidden = false;

    tryUseShieldReaction(targetId, attackResult.total);
    syncActorState(target);

    const targetSnapshot = getDerivedActorState(target);
    const coverBonus = profile.isRanged ? getCoverBonusValue(getCoverBetween(gameState.combat.grid, attackerId, targetId)) : 0;
    const critThreshold = attacker.subclassId === 'champion' ? 19 : 20;
    const isCritical = targetForcesMeleeCrit(target, attackerId, targetId, profile)
        || attackResult.roll >= critThreshold
        || attackResult.isCritical;
    const hit = attackResult.total >= (targetSnapshot.ac + coverBonus) || attackResult.roll === 20;

    uiHooks.logToBattle(`${attacker.name} attacks ${target.name} with ${profile.name}: ${attackResult.total} (vs AC ${targetSnapshot.ac + coverBonus}).`, 'system');

    if (!hit) {
        uiHooks.logToBattle('Miss!', 'system');
        uiHooks.showBattleEventText('Miss!');
        return false;
    }

    let damageModifier = isEnemyId(attackerId) ? 0 : (attacker.modifiers?.[profile.stat] || 0);
    damageModifier += getDamageRollBonus(attacker, profile);
    let damage = calculateDamageRoll(profile.damage, damageModifier, isCritical).total;

    if (!isEnemyId(attackerId) && attacker.classId === 'rogue' && profile.qualifiesForSneakAttack && !attacker.combatFlags?.sneakAttackUsedThisTurn) {
        const attackHadDisadvantage = !!attackResult.advantageState?.disadvantage;
        const attackHadAdvantage = !!attackResult.advantageState?.advantage && !attackHadDisadvantage;
        if (!attackHadDisadvantage && (attackHadAdvantage || hasAdjacentAllyNearTarget(attackerId, targetId))) {
            const sneakDice = Math.ceil((attacker.level || 1) / 2);
            const sneakDamage = rollDiceExpression(`${sneakDice}d6`).total;
            damage += sneakDamage;
            gameState.combat.sneakAttackUsedThisTurn = true;
            attacker.combatFlags.sneakAttackUsedThisTurn = true;
            uiHooks.logToBattle(`Sneak Attack! +${sneakDamage} damage.`, 'gain');
        }
    }

    if (target.combatFlags?.defending) {
        damage = Math.floor(damage / 2);
        uiHooks.logToBattle(`${target.name} braces and halves the blow.`, 'gain');
    }

    const finalDamage = resolveDamage(target, damage, profile.damageType);
    consumeIncomingHitEffects(target, { tags: getAttackTags(profile) });
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
        .map(id => ({ id, actor: getCombatActor(id), distance: getRangeDistance(source, getToken(gameState.combat.grid, id)) }))
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
        sneakAttackUsedThisTurn: false,
        encounterFlags: {},
        uiState: {
            actorId: 'player',
            subMenu: null
        },
        transientPreview: null
    };

    syncAllGridTokens();
    handleCombatNarrativeTransition('combat_start');
    ['player', ...gameState.party, ...gameState.combat.enemies.map(enemy => enemy.uniqueId)].forEach(actorId => {
        refreshReaction(actorId);
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
            scheduleTrackedTimeout(() => companionTurnAI(currentActor), 600);
        } else {
            uiHooks.updateCombatUI(currentTurnId); // Pass active character ID
        }
    } else {
        uiHooks.logToBattle(`Round ${gameState.combat.round} - ${currentActor.name}'s Turn`, "system");
        uiHooks.updateCombatUI();
        scheduleTrackedTimeout(() => enemyTurn(currentActor), 700);
    }
}

export function performCunningAction(type, actorId = 'player') {
    if (gameState.combat.bonusActionsRemaining <= 0) {
        uiHooks.logToBattle("No Bonus Action remaining!", "check-fail");
        return;
    }
    const actor = getCombatActor(actorId);
    if (!actor || !canActorTakeActions(actor)) return;

    gameState.combat.bonusActionsRemaining--;

    if (type === 'dash') {
        gameState.combat.movementRemaining += getDerivedActorState(actor).speed;
        uiHooks.logToBattle(`${actor.name} uses Cunning Action to Dash.`, "gain");
    } else if (type === 'disengage') {
        actor.combatFlags = { ...(actor.combatFlags || {}), disengage: true };
        uiHooks.logToBattle(`${actor.name} disengages and avoids opportunity attacks this turn.`, "gain");
    } else if (type === 'hide') {
        const hostileIds = getHostileIds(actorId);
        const bestPassivePerception = hostileIds.reduce((highest, hostileId) => {
            const hostile = getCombatActor(hostileId);
            if (!hostile || hostile.hp <= 0) return highest;
            return Math.max(highest, 10 + getSkillBonus(hostile, 'perception').bonus);
        }, 10);
        const availableCover = hostileIds.some((hostileId) => getCoverBetween(gameState.combat.grid, hostileId, actorId) !== 'none');
        const adjacentThreat = hostileIds.some((hostileId) => isAdjacent(gameState.combat.grid, actorId, hostileId));
        const stealth = rollSkillCheck(actor, 'stealth');
        const targetNumber = availableCover ? Math.max(5, bestPassivePerception - 2) : bestPassivePerception;
        const success = hostileIds.length === 0 || (!adjacentThreat && stealth.total >= targetNumber);
        actor.combatFlags = { ...(actor.combatFlags || {}), hidden: success };
        if (success) {
            uiHooks.logToBattle(`${actor.name} slips from sight and lines up a better strike. (${stealth.total} vs passive ${targetNumber})`, "gain");
        } else {
            uiHooks.logToBattle(`${actor.name} tries to vanish, but every hostile eye still has them. (${stealth.total} vs passive ${targetNumber})`, "check-fail");
        }
    } else {
        uiHooks.logToBattle(`${actor.name} uses Cunning Action: ${type}.`, "gain");
    }

    resetCombatUiState(actorId);
    uiHooks.updateCombatUI(actorId);
}

export function performCombatManeuver(type, targetId, actorId = 'player') {
    const actor = getCombatActor(actorId);
    const target = getCombatActor(targetId);
    if (!actor || !target) return false;
    if (type !== 'shove' && type !== 'grapple') {
        uiHooks.logToBattle(`${actor.name} has no surfaced ${type} maneuver to use from this menu.`, 'system');
        return false;
    }
    if (!canActorTakeActions(actor)) {
        uiHooks.logToBattle(`${actor.name} cannot force the issue right now.`, 'check-fail');
        return false;
    }
    if (!canActorUseHostileEffectOnTarget(actorId, targetId)) {
        uiHooks.logToBattle(`${actor.name} cannot bring themself to press ${target.name}.`, 'check-fail');
        return false;
    }
    if (!ensureTargetInRange(actorId, targetId, { rangeFeet: null, reachFeet: 5 })) {
        uiHooks.logToBattle(`${target.name} is too far away for that maneuver.`, 'check-fail');
        return false;
    }
    if (!spendAction(actorId)) return false;

    const attackRoll = rollSkillCheck(actor, 'athletics');
    const athleticsBonus = getSkillBonus(target, 'athletics').bonus;
    const acrobaticsBonus = getSkillBonus(target, 'acrobatics').bonus;
    const defenseSkill = athleticsBonus >= acrobaticsBonus ? 'athletics' : 'acrobatics';
    const defenseRoll = rollSkillCheck(target, defenseSkill);

    uiHooks.logToBattle(`${actor.name} contests ${target.name}: ${attackRoll.total} Athletics vs ${defenseRoll.total} ${defenseSkill.replace('_', ' ')}.`, 'system');

    if (attackRoll.total < defenseRoll.total) {
        uiHooks.logToBattle(`${target.name} keeps their footing and breaks the attempt.`, 'check-fail');
        uiHooks.updateCombatUI(actorId);
        return false;
    }

    if (type === 'shove') {
        addEffectToActor(target, 'prone', {
            source: `maneuver:${actorId}:shove`,
            sourceActorId: actorId,
            remaining: 1,
            durationType: 'turns'
        });
        uiHooks.logToBattle(`${actor.name} slams ${target.name} to the ground.`, 'gain');
    } else if (type === 'grapple') {
        addEffectToActor(target, 'grappled', {
            source: `maneuver:${actorId}:grapple`,
            sourceActorId: actorId,
            remaining: 10,
            durationType: 'turns'
        });
        uiHooks.logToBattle(`${actor.name} locks ${target.name} in a brutal hold.`, 'gain');
    }

    syncActorState(target);
    syncGridToken(targetId);
    resetCombatUiState(actorId);
    uiHooks.updateCombatUI(actorId);
    return true;
}

export function performActionSurge(actorId = 'player') {
    const actor = getCombatActor(actorId);
    const res = actor?.resources?.['action_surge'];
    if (!actor || !res || res.current <= 0 || !canActorTakeActions(actor)) return;

    res.current--;
    gameState.combat.actionsRemaining++;
    uiHooks.logToBattle(`${actor.name} used Action Surge!`, "gain");
    resetCombatUiState(actorId);
    uiHooks.updateCombatUI(actorId);
}

export function performEndTurn() {
    endCurrentTurn();
}

export function performAttack(targetId, actorId = 'player') {
    const target = getCombatActor(targetId);
    const actor = getCombatActor(actorId);
    if (!target || !actor) return;
    if (!canActorTakeActions(actor)) {
        uiHooks.logToBattle(`${actor.name} cannot attack right now.`, 'check-fail');
        return;
    }

    const resolved = resolveWeaponHit(actorId, targetId, { consumeAction: true });

    if (resolved) {
        resetCombatUiState(actorId);
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
    if (!getActorSpellList(actor).includes(spellId)) {
        uiHooks.logToBattle(`${actor.name} does not have ${spell.name} ready to cast.`, 'check-fail');
        return;
    }

    const castingTime = spell.castingTime || 'action';
    if (castingTime === 'reaction') {
        uiHooks.logToBattle(`${spell.name} is a reaction spell and cannot be cast from the action menu.`, 'check-fail');
        return;
    }
    if (!canActorTakeActions(actor)) {
        uiHooks.logToBattle(`${actor.name} cannot cast while unable to act.`, 'check-fail');
        return;
    }
    if (castingTime === 'action' && gameState.combat.actionsRemaining <= 0) {
        uiHooks.logToBattle("No Action remaining!", "check-fail");
        return;
    }
    if (castingTime === 'bonus' && gameState.combat.bonusActionsRemaining <= 0) {
        uiHooks.logToBattle("No Bonus Action remaining!", "check-fail");
        return;
    }

    const targeting = getSpellTargeting(spell);
    const resolution = resolveSpellTargetEntries(actorId, spell, targetId);
    const primaryTargetId = targeting.side === 'self' ? actorId : getSelectionTargetId(targetId, actorId);
    const target = getCombatActor(primaryTargetId || actorId);

    if (!resolution.valid || (!target && targeting.type === 'single')) {
        uiHooks.logToBattle(`${spell.name} has no legal target from that position.`, "check-fail");
        return;
    }
    if (targeting.type === 'single' && getHostileActionSide(spell) && !canActorUseHostileEffectOnTarget(actorId, primaryTargetId, spell)) {
        uiHooks.logToBattle(`${actor.name} cannot direct ${spell.name} at ${target?.name || primaryTargetId}.`, 'check-fail');
        return;
    }
    if (spell.type === 'buff' && spell.effect && target && !canApplyEffectToActor(target, spell.effect.id, {
        id: spell.effect.id,
        name: spell.effect.name || spell.name,
        durationType: spell.effect.durationType || spell.durationType || 'turns',
        remaining: spell.effect.remaining ?? 1,
        modifiers: spell.effect.modifiers || [],
        blockedSpellIds: spell.effect.blockedSpellIds || [],
        applicationTags: spell.effect.applicationTags || []
    })) {
        uiHooks.logToBattle(`${spell.name} cannot affect ${target.name} right now.`, 'check-fail');
        return;
    }
    if (targeting.type === 'template' && getHostileActionSide(spell) && resolution.targets.length === 0) {
        uiHooks.logToBattle(`${spell.name} would catch no valid targets there.`, 'check-fail');
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

    if (castingTime === 'action') gameState.combat.actionsRemaining--;
    if (castingTime === 'bonus') gameState.combat.bonusActionsRemaining--;
    uiHooks.logToBattle(`${actor.name} casts ${spell.name}.`, "system");

    const snapshot = getDerivedActorState(actor);
    const spellcastingAbility = getSpellcastingAbility(actor.classId);
    const spellAttackProfile = {
        isRanged: (spell.rangeFeet || 5) > 5,
        rangeFeet: spell.rangeFeet || 5,
        reachFeet: spell.rangeFeet || 5,
        tags: [(spell.rangeFeet || 5) > 5 ? 'ranged_attack' : 'melee_attack', 'spell']
    };

    if (spell.type === 'heal') {
        let healAmount = rollDiceExpression(spell.amount).total;
        if (spell.addCastingAbilityModifierToHealing) {
            healAmount += snapshot.modifiers[spellcastingAbility] || 0;
        }
        if (actor.classId === 'cleric' && actor.subclassId === 'life' && level > 0) {
            healAmount += 2 + level;
        }
        target.hp = Math.min(target.maxHp, target.hp + healAmount);
        if (target.hp > 0) {
            removeEffectFromActor(target, 'unconscious');
        }
        syncActorState(target);
        syncGridToken(primaryTargetId || actorId);
        uiHooks.logToBattle(`${target.name} recovers ${healAmount} HP.`, "gain");
        uiHooks.showBattleEventText(`+${healAmount} HP`);
    } else if (spell.type === 'auto') {
        tryUseShieldReaction(primaryTargetId, { spellId, autoHit: true });
        syncActorState(target);
        if (effectBlocksSpell(target, spellId)) {
            uiHooks.logToBattle(`${target.name} turns aside ${spell.name} with Shield.`, 'gain');
            uiHooks.showBattleEventText('Blocked!');
        } else {
            const damage = calculateDamageRoll(spell.damage, 0, false).total;
            const finalDamage = resolveDamage(target, damage, spell.damageType);
            uiHooks.logToBattle(`${spell.name} hits unerringly for ${finalDamage} ${spell.damageType} damage.`, "combat");
            uiHooks.showBattleEventText(`${finalDamage}`);
        }
    } else if (spell.type === 'attack') {
        const targetAttackModifiers = getIncomingAttackContext(target, spellAttackProfile);
        const result = rollAttack(actor, spellcastingAbility, snapshot.proficiencyBonus, {
            advantage: targetAttackModifiers.advantage || !!actor.combatFlags?.hidden,
            disadvantage: targetAttackModifiers.disadvantage,
            tags: spellAttackProfile.tags
        });
        actor.combatFlags.hidden = false;
        tryUseShieldReaction(primaryTargetId, { attackTotal: result.total, spellId, autoHit: false });
        syncActorState(target);
        const targetSnapshot = getDerivedActorState(target);
        const coverBonus = spellAttackProfile.isRanged ? getCoverBonusValue(resolution.targets[0]?.cover) : 0;
        uiHooks.logToBattle(`Spell Attack: ${result.total} (vs AC ${targetSnapshot.ac + coverBonus})`, "system");

        if (result.total >= (targetSnapshot.ac + coverBonus) || result.roll === 20) {
            const damage = calculateDamageRoll(
                spell.damage,
                0,
                targetForcesMeleeCrit(target, actorId, primaryTargetId, spellAttackProfile) || result.roll === 20
            ).total;
            const finalDamage = resolveDamage(target, damage, spell.damageType);
            consumeIncomingHitEffects(target, { tags: spellAttackProfile.tags });
            if (applySpellOnHitEffect(actorId, primaryTargetId, spell)) {
                syncActorState(target);
                syncGridToken(primaryTargetId);
            }
            uiHooks.logToBattle(`Hit! Dealt ${finalDamage} ${spell.damageType} damage.`, "combat");
            uiHooks.showBattleEventText(`${finalDamage}`);
        } else {
            uiHooks.logToBattle("Miss!", "system");
            uiHooks.showBattleEventText("Miss!");
        }
    } else if (spell.type === 'save') {
        const targetEntries = targeting.type === 'template'
            ? resolution.targets
            : resolution.targets.slice(0, 1);
        targetEntries.forEach((entry) => {
            const resolvedTarget = getCombatActor(entry.id);
            if (!resolvedTarget) return;
            if (canSculptSpellTarget(actor, entry.id, spell)) {
                uiHooks.logToBattle(`${resolvedTarget.name} is untouched by ${spell.name} as ${actor.name} shapes the spell around an ally.`, 'gain');
                return;
            }
            const save = rollSavingThrow(resolvedTarget, spell.saveAbility);
            const coverBonus = spell.saveAbility === 'DEX' ? getCoverBonusValue(entry.cover) : 0;
            uiHooks.logToBattle(`${resolvedTarget.name} Save (${spell.saveAbility}): ${save.total + coverBonus} (DC ${snapshot.spellSaveDC})`, "system");

            let damage = rollDiceExpression(spell.damage).total;
            if ((save.total + coverBonus) >= snapshot.spellSaveDC) {
                damage = spell.halfOnSave === false ? 0 : Math.floor(damage / 2);
                uiHooks.logToBattle(damage > 0 ? "Save successful! Damage reduced." : "Save successful! No damage.", "gain");
            } else {
                uiHooks.logToBattle("Save failed!", "combat");
            }

            if (damage > 0) {
                const finalDamage = resolveDamage(resolvedTarget, damage, spell.damageType);
                uiHooks.logToBattle(`Dealt ${finalDamage} ${spell.damageType} damage.`, "combat");
                uiHooks.showBattleEventText(`${finalDamage}`);
            }
        });
    } else if (spell.type === 'buff') {
        let applied = false;
        if (spell.id === 'bless') {
            const concentrationSource = getSpellEffectSource(actorId, spell.id);
            breakConcentration(actor);
            addEffectToActor(actor, `${spell.id}_concentration`, {
                id: `${spell.id}_concentration`,
                source: concentrationSource,
                name: `${spell.name} (Concentration)`,
                remaining: spell.effect.remaining ?? 5,
                durationType: spell.effect.durationType || 'turns',
                concentration: true,
                modifiers: []
            });
            getBlessTargets(actorId, primaryTargetId || actorId, targeting.maxTargets || 3).forEach((allyId) => {
                applied = applySpellBuff(actorId, allyId, spell, {
                    sourceOverride: concentrationSource,
                    manageConcentration: false
                }) || applied;
            });
        } else {
            applied = applySpellBuff(actorId, primaryTargetId || actorId, spell);
        }
        syncActorState(actor);
        syncActorState(target);
        syncGridToken(primaryTargetId || actorId);
        if (applied) {
            uiHooks.logToBattle(`${target.name} is bolstered by ${spell.name}.`, 'gain');
        } else {
            uiHooks.logToBattle(`${spell.name} has no effect on ${target.name}.`, 'system');
        }
    } else if (spell.type === 'auto_status') {
        let affectedHp = rollDiceExpression(spell.amount).total;
        let anyAffected = false;
        resolution.targets
            .map((entry) => ({
                id: entry.id,
                actor: getCombatActor(entry.id),
                distance: resolution.center ? getRangeDistance(resolution.center, entry.tile) : 0
            }))
            .filter((entry) => entry.actor && entry.actor.hp > 0)
            .sort((a, b) => (a.actor.hp - b.actor.hp) || (a.distance - b.distance))
            .forEach((entry) => {
            const resolvedTarget = entry.actor;
            if (!resolvedTarget || resolvedTarget.hp > affectedHp) return;
            const previousConcentrationEffectId = resolvedTarget.mechanics?.concentrationEffectId || null;
            const appliedEffect = addEffectToActor(resolvedTarget, spell.appliedEffectId, {
                remaining: spell.effectDuration || 2,
                durationType: spell.durationType || 'turns',
                source: `${spell.id}:${actorId}`,
                sourceActorId: actorId,
                applicationTags: spell.applicationTags || []
            });
            if (appliedEffect) {
                const concentrationSource = previousConcentrationEffectId
                    ? previousConcentrationEffectId.split(':').slice(1).join(':')
                    : null;
                if (concentrationSource) {
                    getAllCombatActors().forEach((combatant) => {
                        removeEffectsFromActorBySource(combatant, concentrationSource, true);
                    });
                    syncAllGridTokens();
                    uiHooks.logToBattle(`${resolvedTarget.name} loses concentration as ${spell.name} takes hold.`, 'system');
                }
                affectedHp -= resolvedTarget.hp;
                anyAffected = true;
                uiHooks.logToBattle(`${resolvedTarget.name} falls under ${spell.name}.`, 'gain');
                uiHooks.showBattleEventText('Asleep!');
            }
        });
        if (!anyAffected) {
            uiHooks.logToBattle(`${spell.name} fails to overcome anyone in the affected area.`, 'system');
        }
    }

    if (!checkWinCondition()) {
        uiHooks.updateCombatUI(actorId);
    }
}

export function performAbility(abilityId, actorId = 'player') {
    const actor = getCombatActor(actorId);
    if (!actor) return;
    const supportedAbilityCosts = {
        second_wind: 'bonus',
        channel_divinity: 'action'
    };
    const cost = supportedAbilityCosts[abilityId];
    if (!cost) {
        uiHooks.logToBattle(`${actor.name} has no surfaced combat feature for ${abilityId}.`, 'system');
        return;
    }
    if (!canActorTakeActions(actor)) {
        uiHooks.logToBattle(`${actor.name} cannot use abilities right now.`, 'check-fail');
        return;
    }

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
    } else if (abilityId === 'channel_divinity') {
        resource.current--;
        let remainingPool = 5 * (actor.level || 1);
        const healerToken = getToken(gameState.combat.grid, actorId);
        const healedTargets = [];
        const allies = [actorId, ...getFriendlyIds(actorId)]
            .filter((id, index, ids) => ids.indexOf(id) === index)
            .map((id) => ({ id, actor: getCombatActor(id), token: getToken(gameState.combat.grid, id) }))
            .filter(({ id, actor, token }) => {
                if (!actor || actor.hp <= 0) return false;
                if (id === actorId) return true;
                return !!token && !!healerToken && (getRangeDistance(healerToken, token) * gameState.combat.grid.tileSize) <= 30;
            })
            .map(({ actor }) => actor)
            .filter((candidate) => candidate.hp < candidate.maxHp);

        allies.sort((a, b) => ((a.hp / a.maxHp) - (b.hp / b.maxHp)) || ((a.hp - b.hp)));

        allies.forEach((candidate) => {
            if (remainingPool <= 0) return;
            const preserveLifeCap = Math.max(0, Math.floor(candidate.maxHp / 2) - candidate.hp);
            if (preserveLifeCap <= 0) return;
            const healed = Math.min(remainingPool, preserveLifeCap);
            candidate.hp = Math.min(candidate.maxHp, candidate.hp + healed);
            remainingPool -= healed;
            healedTargets.push(`${candidate.name} (+${healed})`);
            syncActorState(candidate);
            syncGridToken(candidate.uniqueId || candidate.id || actorId);
        });

        if (healedTargets.length === 0) {
            uiHooks.logToBattle(`Channel Divinity finds no wounded ally it can lawfully lift.`, 'system');
        } else {
            uiHooks.logToBattle(`Channel Divinity restores ${healedTargets.join(', ')} without lifting anyone past half health.`, 'gain');
        }
    }

    resetCombatUiState(actorId);
    if (!checkWinCondition()) {
        uiHooks.updateCombatUI(actorId);
    }
}

export function performStand(actorId = 'player') {
    const actor = getCombatActor(actorId);
    if (!actor || !actorHasCombatEffect(actor, 'prone')) return false;
    if (!canActorTakeActions(actor)) {
        uiHooks.logToBattle(`${actor.name} cannot rise right now.`, 'check-fail');
        return false;
    }
    const preStandSpeed = Math.max(0, getDerivedActorState(actor).speed || 0);
    const currentRemaining = Math.max(0, gameState.combat.movementRemaining ?? preStandSpeed);
    const standingSnapshot = JSON.parse(JSON.stringify(actor));
    removeEffectFromActor(standingSnapshot, 'prone');
    syncActorState(standingSnapshot);
    const normalSpeed = Math.max(0, getDerivedActorState(standingSnapshot).speed || actor?.mechanics?.baseSpeed || 0);
    const standingCost = Math.max(1, Math.floor(normalSpeed / 2));
    const equivalentRemaining = preStandSpeed > 0
        ? Math.floor(currentRemaining * (normalSpeed / preStandSpeed))
        : currentRemaining;
    if (normalSpeed <= 0 || equivalentRemaining < standingCost) {
        uiHooks.logToBattle(`${actor.name} lacks the movement to stand right now.`, 'check-fail');
        return false;
    }
    removeEffectFromActor(actor, 'prone');
    syncActorState(actor);
    gameState.combat.movementRemaining = Math.max(0, equivalentRemaining - standingCost);
    syncGridToken(actorId);
    uiHooks.logToBattle(`${actor.name} regains their feet, spending half their movement.`, 'system');
    resetCombatUiState(actorId);
    uiHooks.updateCombatUI(actorId);
    return true;
}

export function performEscape(actorId = 'player') {
    const actor = getCombatActor(actorId);
    if (!actor) return false;
    if (!canActorTakeActions(actor)) {
        uiHooks.logToBattle(`${actor.name} cannot struggle free right now.`, 'check-fail');
        return false;
    }

    const effects = getEscapeableEffects(actor);
    if (effects.length === 0) {
        uiHooks.logToBattle(`${actor.name} is not pinned in place.`, 'system');
        return false;
    }
    if (!spendAction(actorId)) return false;

    const snapshot = getDerivedActorState(actor);
    const bestEscapeMod = Math.max(snapshot.modifiers.STR || 0, snapshot.modifiers.DEX || 0);
    const roll = rollDie(20) + bestEscapeMod;
    const dc = Math.max(...effects.map((effect) => getEscapeDc(effect)));

    if (roll < dc) {
        uiHooks.logToBattle(`${actor.name} strains against the hold but cannot break free.`, 'check-fail');
        uiHooks.updateCombatUI(actorId);
        return false;
    }

    effects.forEach((effect) => removeEffectFromActor(actor, effect.id));
    syncActorState(actor);
    const freedSpeed = getDerivedActorState(actor).speed;
    const hadMovementBeforeEscape = (gameState.combat.movementRemaining || 0) > 0;
    const startedTurnPinned = actor.combatFlags?.turnStartedSpeedZero !== false;
    gameState.combat.movementRemaining = hadMovementBeforeEscape
        ? gameState.combat.movementRemaining
        : (startedTurnPinned ? freedSpeed : 0);
    syncGridToken(actorId);
    uiHooks.logToBattle(`${actor.name} tears free of the hold.`, 'gain');
    resetCombatUiState(actorId);
    uiHooks.updateCombatUI(actorId);
    return true;
}


export function performDefend(actorId = 'player') {
    const actor = getCombatActor(actorId);
    if (!actor || gameState.combat.actionsRemaining <= 0 || !canActorTakeActions(actor)) return;

    gameState.combat.actionsRemaining--;
    actor.combatFlags = { ...(actor.combatFlags || {}), defending: true };
    if (actorId === 'player') {
        gameState.combat.playerDefending = true;
    }
    uiHooks.logToBattle(`${actor.name} braces for the next attack.`, "system");
    resetCombatUiState(actorId);
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
    if (gameState.combat.actionsRemaining <= 0 || !canActorTakeActions(gameState.player)) return;
    gameState.combat.actionsRemaining--;

    const roll = rollDie(20) + (gameState.player.modifiers?.DEX || 0);
    if (roll >= 12) {
        uiHooks.logToBattle("You escaped!", "gain");
        gameState.combat.active = false;
        handleCombatNarrativeTransition('combat_end');
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
    if (!canActorTakeActions(enemy)) {
        uiHooks.logToBattle(`${enemy.name} is unable to act.`, "system");
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
        handleCombatNarrativeTransition('combat_end');
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
    if (!canActorTakeActions(actor)) {
        uiHooks.logToBattle(`${actor.name} cannot act this turn.`, "system");
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
        handleCombatNarrativeTransition('combat_end');
        uiHooks.logToBattle(`Victory!`, "gain");

        const totalXp = gameState.combat.enemies.reduce((sum, e) => sum + (enemies[e.id]?.xp || 0), 0);
        const levelUpAvailable = gainXp(totalXp);
        uiHooks.logToBattle(`Gained ${totalXp} XP.`, "gain");
        if (levelUpAvailable) {
            uiHooks.logToBattle(`Level Up Available!`, "gain");
        }

        uiHooks.updateStatsUI();
        uiHooks.saveGame();

        if (typeof document !== 'undefined') {
            const actionsContainer = document.getElementById('battle-actions-container');
            if (actionsContainer) {
                actionsContainer.innerHTML = '';
                actionsContainer.appendChild(
                    uiHooks.createActionButton('Victory!', 'celebration', () => uiHooks.goToScene(gameState.combat.winSceneId), 'col-span-2')
                );
            }
        }
        return true;
    }
    return false;
}

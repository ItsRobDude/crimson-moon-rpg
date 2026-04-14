import { jest } from '@jest/globals';
import { createBattleGrid, placeToken } from '../battlegrid.js';
import { applyOpportunityAttacks, hasReactionAvailable, performActionSurge, performAttack, performCastSpell, performCunningAction, performAbility } from '../combat.js';
import { gameState, resetGameState, syncActorState } from '../data/gameState.js';
import { createDefaultMechanicsState } from '../data/mechanics.js';

function createActor(overrides = {}) {
  const abilities = overrides.abilities || { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 };
  return {
    name: 'Actor',
    level: 1,
    hp: 10,
    maxHp: 10,
    abilities,
    modifiers: { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 },
    proficiencyBonus: 2,
    statusEffects: [],
    proficiencies: { skills: [], saves: [], weapons: [], armor: [], tools: [], languages: [] },
    mechanics: createDefaultMechanicsState(abilities, { baseSpeed: 30 }),
    equipped: {},
    resources: {},
    knownSpells: [],
    preparedSpells: [],
    spellbook: [],
    spellcastingMode: null,
    spellSlots: {},
    currentSlots: {},
    inventory: [],
    combatFlags: {},
    ...overrides
  };
}

beforeEach(() => {
  resetGameState();
});

test('opportunity attacks consume the hostile reaction after the first trigger', () => {
  gameState.player = createActor({ name: 'Hero', classId: 'fighter' });
  syncActorState(gameState.player);

  const enemy = createActor({
    id: 'enemy',
    uniqueId: 'enemy_0',
    type: 'enemy',
    name: 'Guard',
    attackProfile: {
      name: 'Spear',
      damage: '1d1',
      damageType: 'piercing',
      toHit: 100,
      reachFeet: 5
    }
  });
  syncActorState(enemy);

  gameState.combat = {
    ...gameState.combat,
    active: true,
    activeActorId: 'player',
    grid: createBattleGrid(8, 6, 5),
    enemies: [enemy],
    turnOrder: ['player', enemy.uniqueId]
  };

  placeToken(gameState.combat.grid, { id: 'player', x: 1, y: 2, team: 'allies', hp: gameState.player.hp, reach: 1 });
  placeToken(gameState.combat.grid, { id: enemy.uniqueId, x: 2, y: 2, team: 'enemies', hp: enemy.hp, reach: 1 });

  enemy.combatFlags.reactionAvailable = true;

  const path = [
    { x: 1, y: 2 },
    { x: 1, y: 1 },
    { x: 0, y: 1 }
  ];

  expect(hasReactionAvailable(enemy.uniqueId)).toBe(true);

  applyOpportunityAttacks('player', path);

  expect(hasReactionAvailable(enemy.uniqueId)).toBe(false);

  applyOpportunityAttacks('player', path);

  expect(hasReactionAvailable(enemy.uniqueId)).toBe(false);
});

test('shield reaction spends a slot and prevents a borderline hit', () => {
  const randomSpy = jest.spyOn(Math, 'random')
    .mockReturnValueOnce(0.55)
    .mockReturnValueOnce(0.10);

  gameState.player = createActor({
    name: 'Mage',
    classId: 'wizard',
    abilities: { STR: 8, DEX: 16, CON: 12, INT: 16, WIS: 12, CHA: 10 },
    knownSpells: ['firebolt', 'ray_of_frost'],
    preparedSpells: ['shield'],
    spellcastingMode: 'spellbook',
    spellSlots: { 1: 1 },
    currentSlots: { 1: 1 },
    combatFlags: { reactionAvailable: true }
  });
  syncActorState(gameState.player);

  const enemy = createActor({
    id: 'enemy',
    uniqueId: 'enemy_0',
    type: 'enemy',
    name: 'Bandit',
    attackProfile: {
      name: 'Scimitar',
      damage: '1d6',
      damageType: 'slashing',
      toHit: 4,
      reachFeet: 5
    }
  });
  syncActorState(enemy);

  gameState.combat = {
    ...gameState.combat,
    active: true,
    activeActorId: enemy.uniqueId,
    actionsRemaining: 1,
    reactionsRemaining: 1,
    grid: createBattleGrid(8, 6, 5),
    enemies: [enemy],
    turnOrder: [enemy.uniqueId, 'player']
  };

  placeToken(gameState.combat.grid, { id: 'player', x: 1, y: 2, team: 'allies', hp: gameState.player.hp, reach: 1 });
  placeToken(gameState.combat.grid, { id: enemy.uniqueId, x: 2, y: 2, team: 'enemies', hp: enemy.hp, reach: 1 });

  enemy.combatFlags.reactionAvailable = true;
  gameState.player.combatFlags.reactionAvailable = true;

  performAttack('player', enemy.uniqueId);

  expect(gameState.player.currentSlots[1]).toBe(0);
  expect(hasReactionAvailable('player')).toBe(false);
  expect(gameState.player.hp).toBe(gameState.player.maxHp);

  randomSpy.mockRestore();
});

test('spell attacks do not add the caster ability modifier to damage', () => {
  const randomSpy = jest.spyOn(Math, 'random')
    .mockReturnValueOnce(0.70)
    .mockReturnValueOnce(0.10)
    .mockReturnValueOnce(0.00);

  gameState.player = createActor({
    name: 'Evoker',
    classId: 'wizard',
    abilities: { STR: 8, DEX: 14, CON: 12, INT: 18, WIS: 12, CHA: 10 },
    knownSpells: ['firebolt'],
    preparedSpells: [],
    spellbook: [],
    spellcastingMode: 'spellbook',
    combatFlags: { reactionAvailable: true }
  });
  syncActorState(gameState.player);

  const enemy = createActor({
    id: 'enemy',
    uniqueId: 'enemy_0',
    type: 'enemy',
    name: 'Target Dummy',
    hp: 10,
    maxHp: 10,
    ac: 10,
    attackProfile: {
      name: 'Punch',
      damage: '1d1',
      damageType: 'bludgeoning',
      toHit: 0,
      reachFeet: 5
    }
  });
  syncActorState(enemy);

  gameState.combat = {
    ...gameState.combat,
    active: true,
    activeActorId: 'player',
    actionsRemaining: 1,
    bonusActionsRemaining: 1,
    grid: createBattleGrid(8, 6, 5),
    enemies: [enemy],
    turnOrder: ['player', enemy.uniqueId]
  };

  placeToken(gameState.combat.grid, { id: 'player', x: 1, y: 2, team: 'allies', hp: gameState.player.hp, reach: 1 });
  placeToken(gameState.combat.grid, { id: enemy.uniqueId, x: 2, y: 2, team: 'enemies', hp: enemy.hp, reach: 1 });

  performCastSpell('firebolt', enemy.uniqueId, 'player');

  expect(gameState.combat.enemies[0].hp).toBe(9);

  randomSpy.mockRestore();
});

test('shield reaction also turns aside borderline spell attacks', () => {
  const randomSpy = jest.spyOn(Math, 'random')
    .mockReturnValueOnce(0.55)
    .mockReturnValueOnce(0.10);

  gameState.player = createActor({
    name: 'Mage',
    classId: 'wizard',
    abilities: { STR: 8, DEX: 16, CON: 12, INT: 16, WIS: 12, CHA: 10 },
    knownSpells: ['firebolt'],
    preparedSpells: ['shield'],
    spellbook: ['shield'],
    spellcastingMode: 'spellbook',
    spellSlots: { 1: 1 },
    currentSlots: { 1: 1 },
    combatFlags: { reactionAvailable: true }
  });
  syncActorState(gameState.player);

  const enemy = createActor({
    id: 'enemy',
    uniqueId: 'enemy_0',
    type: 'enemy',
    name: 'Rival Mage',
    classId: 'wizard',
    abilities: { STR: 8, DEX: 14, CON: 12, INT: 16, WIS: 12, CHA: 10 },
    knownSpells: ['firebolt'],
    preparedSpells: [],
    spellbook: [],
    spellcastingMode: 'spellbook'
  });
  syncActorState(enemy);

  gameState.combat = {
    ...gameState.combat,
    active: true,
    activeActorId: enemy.uniqueId,
    actionsRemaining: 1,
    reactionsRemaining: 1,
    grid: createBattleGrid(8, 6, 5),
    enemies: [enemy],
    turnOrder: [enemy.uniqueId, 'player']
  };

  placeToken(gameState.combat.grid, { id: 'player', x: 1, y: 2, team: 'allies', hp: gameState.player.hp, reach: 1 });
  placeToken(gameState.combat.grid, { id: enemy.uniqueId, x: 2, y: 2, team: 'enemies', hp: enemy.hp, reach: 1 });

  performCastSpell('firebolt', 'player', enemy.uniqueId);

  expect(gameState.player.currentSlots[1]).toBe(0);
  expect(hasReactionAvailable('player')).toBe(false);
  expect(gameState.player.hp).toBe(gameState.player.maxHp);

  randomSpy.mockRestore();
});

test('shield negates magic missile explicitly', () => {
  gameState.player = createActor({
    name: 'Mage',
    classId: 'wizard',
    abilities: { STR: 8, DEX: 16, CON: 12, INT: 16, WIS: 12, CHA: 10 },
    knownSpells: ['firebolt'],
    preparedSpells: ['shield'],
    spellbook: ['shield'],
    spellcastingMode: 'spellbook',
    spellSlots: { 1: 1 },
    currentSlots: { 1: 1 },
    combatFlags: { reactionAvailable: true }
  });
  syncActorState(gameState.player);

  const enemy = createActor({
    id: 'enemy',
    uniqueId: 'enemy_0',
    type: 'enemy',
    name: 'Rival Mage',
    classId: 'wizard',
    abilities: { STR: 8, DEX: 14, CON: 12, INT: 16, WIS: 12, CHA: 10 },
    knownSpells: [],
    preparedSpells: ['magic_missile'],
    spellbook: ['magic_missile'],
    spellcastingMode: 'spellbook',
    spellSlots: { 1: 1 },
    currentSlots: { 1: 1 }
  });
  syncActorState(enemy);

  gameState.combat = {
    ...gameState.combat,
    active: true,
    activeActorId: enemy.uniqueId,
    actionsRemaining: 1,
    reactionsRemaining: 1,
    grid: createBattleGrid(8, 6, 5),
    enemies: [enemy],
    turnOrder: [enemy.uniqueId, 'player']
  };

  placeToken(gameState.combat.grid, { id: 'player', x: 1, y: 2, team: 'allies', hp: gameState.player.hp, reach: 1 });
  placeToken(gameState.combat.grid, { id: enemy.uniqueId, x: 2, y: 2, team: 'enemies', hp: enemy.hp, reach: 1 });

  performCastSpell('magic_missile', 'player', enemy.uniqueId);

  expect(gameState.player.currentSlots[1]).toBe(0);
  expect(hasReactionAvailable('player')).toBe(false);
  expect(gameState.player.hp).toBe(gameState.player.maxHp);
});

test('action surge grants one additional action and spends its resource', () => {
  gameState.player = createActor({
    name: 'Fighter',
    classId: 'fighter',
    resources: {
      action_surge: { current: 1, max: 1 }
    }
  });
  syncActorState(gameState.player);

  gameState.combat = {
    ...gameState.combat,
    active: true,
    activeActorId: 'player',
    actionsRemaining: 0,
    bonusActionsRemaining: 1,
    grid: createBattleGrid(8, 6, 5),
    enemies: [],
    turnOrder: ['player']
  };

  performActionSurge('player');

  expect(gameState.player.resources.action_surge.current).toBe(0);
  expect(gameState.combat.actionsRemaining).toBe(1);
});

test('cunning action dash and disengage consume bonus action and set combat state', () => {
  gameState.player = createActor({
    name: 'Rogue',
    classId: 'rogue',
    mechanics: createDefaultMechanicsState(
      { STR: 10, DEX: 16, CON: 10, INT: 12, WIS: 10, CHA: 10 },
      { baseSpeed: 30 }
    )
  });
  syncActorState(gameState.player);

  gameState.combat = {
    ...gameState.combat,
    active: true,
    activeActorId: 'player',
    actionsRemaining: 1,
    bonusActionsRemaining: 1,
    movementRemaining: 30,
    grid: createBattleGrid(8, 6, 5),
    enemies: [],
    turnOrder: ['player']
  };

  performCunningAction('dash', 'player');

  expect(gameState.combat.bonusActionsRemaining).toBe(0);
  expect(gameState.combat.movementRemaining).toBe(60);

  gameState.combat.bonusActionsRemaining = 1;
  performCunningAction('disengage', 'player');

  expect(gameState.combat.bonusActionsRemaining).toBe(0);
  expect(gameState.player.combatFlags.disengage).toBe(true);
});

test('channel divinity heals without exceeding half health', () => {
  gameState.player = createActor({
    name: 'Cleric',
    classId: 'cleric',
    level: 2,
    hp: 4,
    maxHp: 20,
    resources: {
      channel_divinity: { current: 1, max: 1 }
    }
  });
  syncActorState(gameState.player);

  gameState.combat = {
    ...gameState.combat,
    active: true,
    activeActorId: 'player',
    actionsRemaining: 1,
    bonusActionsRemaining: 1,
    grid: createBattleGrid(8, 6, 5),
    enemies: [],
    turnOrder: ['player']
  };

  performAbility('channel_divinity', 'player');

  expect(gameState.player.resources.channel_divinity.current).toBe(0);
  expect(gameState.player.hp).toBe(10);
});

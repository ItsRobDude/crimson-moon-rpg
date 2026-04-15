import { jest } from '@jest/globals';
import { createBattleGrid, placeToken } from '../battlegrid.js';
import { applyOpportunityAttacks, hasReactionAvailable, performActionSurge, performAttack, performCastSpell, performCunningAction, performAbility, performEscape, performStand } from '../combat.js';
import { gameState, resetGameState, syncActorState } from '../data/gameState.js';
import { addEffectToActor, createDefaultMechanicsState } from '../data/mechanics.js';

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

test('standing from prone clears the effect and spends half normal movement', () => {
  gameState.player = createActor({ name: 'Hero', classId: 'fighter' });
  addEffectToActor(gameState.player, 'prone');
  syncActorState(gameState.player);

  gameState.combat = {
    ...gameState.combat,
    active: true,
    activeActorId: 'player',
    actionsRemaining: 1,
    bonusActionsRemaining: 1,
    movementRemaining: 30,
    enemies: [],
    turnOrder: ['player']
  };

  expect(performStand('player')).toBe(true);
  expect(gameState.player.mechanics.activeEffects.some((effect) => effect.id === 'prone')).toBe(false);
  expect(gameState.combat.movementRemaining).toBe(15);
});

test('escape action breaks grappled movement locks on a successful check', () => {
  const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.95);

  gameState.player = createActor({
    name: 'Hero',
    classId: 'fighter',
    abilities: { STR: 16, DEX: 12, CON: 14, INT: 10, WIS: 10, CHA: 8 }
  });
  addEffectToActor(gameState.player, 'grappled', {
    escapeDc: 10,
    source: 'monster:grappler',
    sourceActorId: 'enemy_0'
  });
  syncActorState(gameState.player);

  gameState.combat = {
    ...gameState.combat,
    active: true,
    activeActorId: 'player',
    actionsRemaining: 1,
    bonusActionsRemaining: 1,
    movementRemaining: 0,
    enemies: [],
    turnOrder: ['player']
  };

  expect(performEscape('player')).toBe(true);
  expect(gameState.combat.actionsRemaining).toBe(0);
  expect(gameState.player.mechanics.activeEffects.some((effect) => effect.id === 'grappled')).toBe(false);
  expect(gameState.combat.movementRemaining).toBe(30);

  randomSpy.mockRestore();
});

test('evocation sculpt spells spares allies caught in a burning hands cone', () => {
  const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);

  gameState.player = createActor({
    name: 'Evoker',
    classId: 'wizard',
    subclassId: 'evocation',
    level: 3,
    abilities: { STR: 8, DEX: 14, CON: 12, INT: 18, WIS: 12, CHA: 10 },
    preparedSpells: ['burning_hands'],
    spellbook: ['burning_hands'],
    spellcastingMode: 'spellbook',
    spellSlots: { 1: 2 },
    currentSlots: { 1: 2 }
  });
  syncActorState(gameState.player);

  const ally = createActor({
    id: 'ally',
    name: 'Scout',
    classId: 'rogue',
    hp: 10,
    maxHp: 10
  });
  syncActorState(ally);
  gameState.roster.ally = ally;
  gameState.party = ['ally'];

  const enemy = createActor({
    id: 'enemy',
    uniqueId: 'enemy_0',
    type: 'enemy',
    name: 'Fungal Beast',
    hp: 10,
    maxHp: 10
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
    turnOrder: ['player', 'ally', enemy.uniqueId]
  };

  placeToken(gameState.combat.grid, { id: 'player', x: 1, y: 2, team: 'allies', hp: gameState.player.hp, reach: 1 });
  placeToken(gameState.combat.grid, { id: 'ally', x: 2, y: 2, team: 'allies', hp: ally.hp, reach: 1 });
  placeToken(gameState.combat.grid, { id: enemy.uniqueId, x: 3, y: 2, team: 'enemies', hp: enemy.hp, reach: 1 });

  performCastSpell('burning_hands', enemy.uniqueId, 'player');

  expect(gameState.roster.ally.hp).toBe(10);
  expect(gameState.combat.enemies[0].hp).toBeLessThan(10);

  randomSpy.mockRestore();
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

  gameState.combat.bonusActionsRemaining = 1;
  performCunningAction('hide', 'player');

  expect(gameState.combat.bonusActionsRemaining).toBe(0);
  expect(gameState.player.combatFlags.hidden).toBe(true);
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

test('ray of frost applies its speed-reducing rider on hit', () => {
  const randomSpy = jest.spyOn(Math, 'random')
    .mockReturnValueOnce(0.70)
    .mockReturnValueOnce(0.00);

  gameState.player = createActor({
    name: 'Evoker',
    classId: 'wizard',
    abilities: { STR: 8, DEX: 14, CON: 12, INT: 16, WIS: 12, CHA: 10 },
    knownSpells: ['ray_of_frost'],
    preparedSpells: [],
    spellbook: ['ray_of_frost'],
    spellcastingMode: 'spellbook'
  });
  syncActorState(gameState.player);

  const enemy = createActor({
    id: 'enemy',
    uniqueId: 'enemy_0',
    type: 'enemy',
    name: 'Raider',
    ac: 10
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
  placeToken(gameState.combat.grid, { id: enemy.uniqueId, x: 3, y: 2, team: 'enemies', hp: enemy.hp, reach: 1 });

  performCastSpell('ray_of_frost', enemy.uniqueId, 'player');

  expect(gameState.combat.enemies[0].mechanics.activeEffects.some((effect) => effect.id === 'ray_of_frost_slow')).toBe(true);
  expect(gameState.combat.enemies[0].speed).toBe(20);

  randomSpy.mockRestore();
});

test('guiding bolt leaves a one-hit mark that the next successful attack consumes', () => {
  const randomSpy = jest.spyOn(Math, 'random')
    .mockReturnValueOnce(0.70)
    .mockReturnValueOnce(0.00)
    .mockReturnValueOnce(0.70)
    .mockReturnValueOnce(0.00);

  gameState.player = createActor({
    name: 'Cleric',
    classId: 'cleric',
    abilities: { STR: 12, DEX: 10, CON: 14, INT: 10, WIS: 16, CHA: 13 },
    knownSpells: ['sacred_flame'],
    preparedSpells: ['guiding_bolt'],
    spellcastingMode: 'prepared',
    spellSlots: { 1: 1 },
    currentSlots: { 1: 1 }
  });
  syncActorState(gameState.player);

  const enemy = createActor({
    id: 'enemy',
    uniqueId: 'enemy_0',
    type: 'enemy',
    name: 'Cultist',
    ac: 10
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

  performCastSpell('guiding_bolt', enemy.uniqueId, 'player');
  expect(gameState.combat.enemies[0].mechanics.activeEffects.some((effect) => effect.id === 'guiding_bolt_mark')).toBe(true);

  gameState.combat.actionsRemaining = 1;
  performAttack(enemy.uniqueId, 'player');

  expect(gameState.combat.enemies[0].mechanics.activeEffects.some((effect) => effect.id === 'guiding_bolt_mark')).toBe(false);

  randomSpy.mockRestore();
});

test('bless applies to up to three allies on the caster side', () => {
  gameState.player = createActor({
    name: 'Cleric',
    classId: 'cleric',
    abilities: { STR: 12, DEX: 10, CON: 14, INT: 10, WIS: 16, CHA: 13 },
    preparedSpells: ['bless'],
    spellcastingMode: 'prepared',
    spellSlots: { 1: 1 },
    currentSlots: { 1: 1 }
  });
  syncActorState(gameState.player);

  const ally = createActor({
    id: 'ally',
    name: 'Scout',
    classId: 'fighter'
  });
  syncActorState(ally);
  gameState.roster.ally = ally;
  gameState.party = ['ally'];
  const enemy = createActor({
    id: 'enemy',
    uniqueId: 'enemy_0',
    type: 'enemy',
    name: 'Raider',
    hp: 10,
    maxHp: 10
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
    turnOrder: ['player', 'ally', enemy.uniqueId]
  };

  placeToken(gameState.combat.grid, { id: 'player', x: 1, y: 2, team: 'allies', hp: gameState.player.hp, reach: 1 });
  placeToken(gameState.combat.grid, { id: 'ally', x: 2, y: 2, team: 'allies', hp: ally.hp, reach: 1 });
  placeToken(gameState.combat.grid, { id: enemy.uniqueId, x: 5, y: 2, team: 'enemies', hp: enemy.hp, reach: 1 });

  performCastSpell('bless', 'ally', 'player');

  expect(gameState.player.mechanics.activeEffects.some((effect) => effect.id === 'blessed')).toBe(true);
  expect(gameState.roster.ally.mechanics.activeEffects.some((effect) => effect.id === 'blessed')).toBe(true);
});

test('shield of faith recast moves concentration to the new target', () => {
  gameState.player = createActor({
    name: 'Cleric',
    classId: 'cleric',
    abilities: { STR: 12, DEX: 10, CON: 14, INT: 10, WIS: 16, CHA: 13 },
    preparedSpells: ['shield_of_faith'],
    spellcastingMode: 'prepared',
    spellSlots: { 1: 2 },
    currentSlots: { 1: 2 }
  });
  syncActorState(gameState.player);

  const ally = createActor({
    id: 'ally',
    name: 'Guardian',
    classId: 'fighter'
  });
  syncActorState(ally);
  gameState.roster.ally = ally;
  gameState.party = ['ally'];
  const enemy = createActor({
    id: 'enemy',
    uniqueId: 'enemy_0',
    type: 'enemy',
    name: 'Watcher',
    hp: 10,
    maxHp: 10
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
    turnOrder: ['player', 'ally', enemy.uniqueId]
  };

  placeToken(gameState.combat.grid, { id: 'player', x: 1, y: 2, team: 'allies', hp: gameState.player.hp, reach: 1 });
  placeToken(gameState.combat.grid, { id: 'ally', x: 2, y: 2, team: 'allies', hp: ally.hp, reach: 1 });
  placeToken(gameState.combat.grid, { id: enemy.uniqueId, x: 5, y: 2, team: 'enemies', hp: enemy.hp, reach: 1 });

  performCastSpell('shield_of_faith', 'player', 'player');
  expect(gameState.player.mechanics.activeEffects.some((effect) => effect.id === 'shield_of_faith')).toBe(true);

  gameState.combat.bonusActionsRemaining = 1;
  performCastSpell('shield_of_faith', 'ally', 'player');

  expect(gameState.player.mechanics.activeEffects.some((effect) => effect.id === 'shield_of_faith')).toBe(false);
  expect(gameState.roster.ally.mechanics.activeEffects.some((effect) => effect.id === 'shield_of_faith')).toBe(true);
});

test('sleep applies to multiple low-hp targets in hp order within the chosen area', () => {
  const randomSpy = jest.spyOn(Math, 'random')
    .mockReturnValueOnce(0.99)
    .mockReturnValueOnce(0.99)
    .mockReturnValueOnce(0.99)
    .mockReturnValueOnce(0.99)
    .mockReturnValueOnce(0.99);

  gameState.player = createActor({
    name: 'Wizard',
    classId: 'wizard',
    abilities: { STR: 8, DEX: 14, CON: 12, INT: 16, WIS: 12, CHA: 10 },
    preparedSpells: ['sleep'],
    spellbook: ['sleep'],
    spellcastingMode: 'spellbook',
    spellSlots: { 1: 1 },
    currentSlots: { 1: 1 }
  });
  syncActorState(gameState.player);

  const enemyA = createActor({ id: 'enemy_a', uniqueId: 'enemy_a_0', type: 'enemy', name: 'A', hp: 5, maxHp: 5 });
  const enemyB = createActor({ id: 'enemy_b', uniqueId: 'enemy_b_0', type: 'enemy', name: 'B', hp: 4, maxHp: 4 });
  const enemyC = createActor({ id: 'enemy_c', uniqueId: 'enemy_c_0', type: 'enemy', name: 'C', hp: 32, maxHp: 32 });
  syncActorState(enemyA);
  syncActorState(enemyB);
  syncActorState(enemyC);

  gameState.combat = {
    ...gameState.combat,
    active: true,
    activeActorId: 'player',
    actionsRemaining: 1,
    bonusActionsRemaining: 1,
    grid: createBattleGrid(8, 6, 5),
    enemies: [enemyA, enemyB, enemyC],
    turnOrder: ['player', enemyA.uniqueId, enemyB.uniqueId, enemyC.uniqueId]
  };

  placeToken(gameState.combat.grid, { id: 'player', x: 1, y: 2, team: 'allies', hp: gameState.player.hp, reach: 1 });
  placeToken(gameState.combat.grid, { id: enemyA.uniqueId, x: 3, y: 2, team: 'enemies', hp: enemyA.hp, reach: 1 });
  placeToken(gameState.combat.grid, { id: enemyB.uniqueId, x: 3, y: 3, team: 'enemies', hp: enemyB.hp, reach: 1 });
  placeToken(gameState.combat.grid, { id: enemyC.uniqueId, x: 7, y: 0, team: 'enemies', hp: enemyC.hp, reach: 1 });

  performCastSpell('sleep', enemyA.uniqueId, 'player');

  expect(gameState.combat.enemies[0].mechanics.activeEffects.some((effect) => effect.id === 'unconscious')).toBe(true);
  expect(gameState.combat.enemies[1].mechanics.activeEffects.some((effect) => effect.id === 'unconscious')).toBe(true);
  expect(gameState.combat.enemies[2].mechanics.activeEffects.some((effect) => effect.id === 'unconscious')).toBe(false);

  randomSpy.mockRestore();
});

test('burning hands uses a forward cone instead of a target cluster approximation', () => {
  const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.00);

  gameState.player = createActor({
    name: 'Wizard',
    classId: 'wizard',
    abilities: { STR: 8, DEX: 14, CON: 12, INT: 16, WIS: 12, CHA: 10 },
    preparedSpells: ['burning_hands'],
    spellbook: ['burning_hands'],
    spellcastingMode: 'spellbook',
    spellSlots: { 1: 1 },
    currentSlots: { 1: 1 }
  });
  syncActorState(gameState.player);

  const northA = createActor({ id: 'north_a', uniqueId: 'north_a_0', type: 'enemy', name: 'North A', hp: 8, maxHp: 8 });
  const northB = createActor({ id: 'north_b', uniqueId: 'north_b_0', type: 'enemy', name: 'North B', hp: 8, maxHp: 8 });
  const eastEnemy = createActor({ id: 'east_enemy', uniqueId: 'east_enemy_0', type: 'enemy', name: 'East Enemy', hp: 8, maxHp: 8 });
  syncActorState(northA);
  syncActorState(northB);
  syncActorState(eastEnemy);

  gameState.combat = {
    ...gameState.combat,
    active: true,
    activeActorId: 'player',
    actionsRemaining: 1,
    bonusActionsRemaining: 1,
    grid: createBattleGrid(8, 8, 5),
    enemies: [northA, northB, eastEnemy],
    turnOrder: ['player', northA.uniqueId, northB.uniqueId, eastEnemy.uniqueId]
  };

  placeToken(gameState.combat.grid, { id: 'player', x: 3, y: 4, team: 'allies', hp: gameState.player.hp, reach: 1 });
  placeToken(gameState.combat.grid, { id: northA.uniqueId, x: 3, y: 3, team: 'enemies', hp: northA.hp, reach: 1 });
  placeToken(gameState.combat.grid, { id: northB.uniqueId, x: 4, y: 2, team: 'enemies', hp: northB.hp, reach: 1 });
  placeToken(gameState.combat.grid, { id: eastEnemy.uniqueId, x: 5, y: 4, team: 'enemies', hp: eastEnemy.hp, reach: 1 });

  performCastSpell('burning_hands', { facing: 'north' }, 'player');

  expect(gameState.combat.enemies[0].hp).toBeLessThan(8);
  expect(gameState.combat.enemies[1].hp).toBeLessThan(8);
  expect(gameState.combat.enemies[2].hp).toBe(8);

  randomSpy.mockRestore();
});

test('sleep breaks concentration on creatures it renders unconscious', () => {
  const randomSpy = jest.spyOn(Math, 'random')
    .mockReturnValueOnce(0.99)
    .mockReturnValueOnce(0.99)
    .mockReturnValueOnce(0.99)
    .mockReturnValueOnce(0.99)
    .mockReturnValueOnce(0.99);

  gameState.player = createActor({
    name: 'Wizard',
    classId: 'wizard',
    abilities: { STR: 8, DEX: 14, CON: 12, INT: 16, WIS: 12, CHA: 10 },
    preparedSpells: ['sleep'],
    spellbook: ['sleep'],
    spellcastingMode: 'spellbook',
    spellSlots: { 1: 1 },
    currentSlots: { 1: 1 }
  });
  syncActorState(gameState.player);

  const enemy = createActor({ id: 'enemy', uniqueId: 'enemy_0', type: 'enemy', name: 'A', hp: 5, maxHp: 5 });
  syncActorState(enemy);
  addEffectToActor(enemy, 'blessed', { source: 'concentration:enemy_0:bless' });
  addEffectToActor(enemy, 'enemy_concentration', {
    id: 'enemy_concentration',
    source: 'concentration:enemy_0:bless',
    concentration: true,
    modifiers: []
  });

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
  placeToken(gameState.combat.grid, { id: enemy.uniqueId, x: 3, y: 2, team: 'enemies', hp: enemy.hp, reach: 1 });

  performCastSpell('sleep', enemy.uniqueId, 'player');

  expect(gameState.combat.enemies[0].mechanics.concentrationEffectId).toBe(null);
  expect(gameState.combat.enemies[0].mechanics.activeEffects.some((effect) => effect.source === 'concentration:enemy_0:bless')).toBe(false);

  randomSpy.mockRestore();
});

test('incapacitated actors cannot spend actions to attack', () => {
  gameState.player = createActor({ name: 'Hero', classId: 'fighter' });
  syncActorState(gameState.player);

  const enemy = createActor({
    id: 'enemy',
    uniqueId: 'enemy_0',
    type: 'enemy',
    name: 'Guard',
    hp: 10,
    maxHp: 10
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
  addEffectToActor(gameState.player, 'incapacitated');

  performAttack(enemy.uniqueId, 'player');

  expect(gameState.combat.actionsRemaining).toBe(1);
  expect(gameState.combat.enemies[0].hp).toBe(10);
});

test('charmed actors cannot target the charmer with attacks or harmful spells', () => {
  gameState.player = createActor({
    name: 'Hero',
    classId: 'wizard',
    preparedSpells: ['firebolt'],
    spellbook: ['firebolt'],
    spellcastingMode: 'spellbook'
  });
  syncActorState(gameState.player);
  addEffectToActor(gameState.player, 'charmed', {
    source: 'spell:enemy_0',
    sourceActorId: 'enemy_0'
  });

  const enemy = createActor({
    id: 'enemy',
    uniqueId: 'enemy_0',
    type: 'enemy',
    name: 'Siren',
    hp: 10,
    maxHp: 10
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

  performAttack(enemy.uniqueId, 'player');
  expect(gameState.combat.enemies[0].hp).toBe(10);

  performCastSpell('firebolt', enemy.uniqueId, 'player');
  expect(gameState.combat.enemies[0].hp).toBe(10);
});

test('channel divinity prioritizes the most wounded ally without healing past half health', () => {
  gameState.player = createActor({
    name: 'Cleric',
    classId: 'cleric',
    level: 2,
    hp: 18,
    maxHp: 20,
    resources: {
      channel_divinity: { current: 1, max: 1 }
    }
  });
  syncActorState(gameState.player);

  const ally = createActor({
    id: 'ally',
    name: 'Scout',
    hp: 2,
    maxHp: 16
  });
  syncActorState(ally);
  gameState.roster.ally = ally;
  gameState.party = ['ally'];

  gameState.combat = {
    ...gameState.combat,
    active: true,
    activeActorId: 'player',
    actionsRemaining: 1,
    bonusActionsRemaining: 1,
    grid: createBattleGrid(8, 6, 5),
    enemies: [],
    turnOrder: ['player', 'ally']
  };

  performAbility('channel_divinity', 'player');

  expect(gameState.player.resources.channel_divinity.current).toBe(0);
  expect(gameState.roster.ally.hp).toBe(8);
});

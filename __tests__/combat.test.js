import { createBattleGrid, placeToken } from '../battlegrid.js';
import { applyOpportunityAttacks, hasReactionAvailable } from '../combat.js';
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

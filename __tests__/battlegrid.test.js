import { canTargetToken, collectTemplateTargets, createBattleGrid, getOpportunityAttackTriggers, getReachableTiles, getTemplateTiles, getTileEffects, placeToken, setTerrain, setTileEffect, setZoneEffect } from '../battlegrid.js';

test('line of sight blocks ranged targeting through obstructing terrain', () => {
  const grid = createBattleGrid(8, 6, 5);
  placeToken(grid, { id: 'player', x: 1, y: 2, team: 'allies', hp: 10, reach: 1 });
  placeToken(grid, { id: 'enemy', x: 4, y: 2, team: 'enemies', hp: 10, reach: 1 });
  setTerrain(grid, 2, 2, { blocksLineOfSight: true });

  expect(canTargetToken(grid, 'player', 'enemy', 30)).toBe(false);
});

test('leaving an adjacent enemy triggers an opportunity attack hook', () => {
  const grid = createBattleGrid(8, 6, 5);
  placeToken(grid, { id: 'player', x: 1, y: 2, team: 'allies', hp: 10, reach: 1 });
  placeToken(grid, { id: 'enemy', x: 2, y: 2, team: 'enemies', hp: 10, reach: 1 });

  const path = [
    { x: 1, y: 2 },
    { x: 1, y: 1 },
    { x: 0, y: 1 }
  ];

  const triggers = getOpportunityAttackTriggers(grid, 'player', path);

  expect(triggers).toHaveLength(1);
  expect(triggers[0].hostileId).toBe('enemy');
  expect(triggers[0].moverId).toBe('player');
});

test('tiles can store persistent hazard definitions', () => {
  const grid = createBattleGrid(8, 6, 5);
  setTileEffect(grid, 2, 3, {
    id: 'burning_ground',
    name: 'Burning Ground',
    triggers: ['enter', 'turn_start'],
    damage: '1d6',
    damageType: 'fire',
    statusEffectId: 'burning'
  });

  expect(getTileEffects(grid, 2, 3)).toHaveLength(1);
  expect(getTileEffects(grid, 2, 3)[0]).toMatchObject({
    id: 'burning_ground',
    damageType: 'fire',
    statusEffectId: 'burning'
  });
});

test('cone templates generate predictable 15-foot wedges in each cardinal facing', () => {
  const grid = createBattleGrid(8, 8, 5);
  const northTiles = getTemplateTiles(grid, { template: 'cone', origin: { x: 3, y: 4 }, sizeFeet: 15, facing: 'north' });
  const eastTiles = getTemplateTiles(grid, { template: 'cone', origin: { x: 3, y: 4 }, sizeFeet: 15, facing: 'east' });

  expect(northTiles).toEqual(expect.arrayContaining([
    { x: 3, y: 3 },
    { x: 2, y: 2 },
    { x: 3, y: 2 },
    { x: 4, y: 2 },
    { x: 2, y: 1 },
    { x: 3, y: 1 },
    { x: 4, y: 1 }
  ]));
  expect(eastTiles).toEqual(expect.arrayContaining([
    { x: 4, y: 4 },
    { x: 5, y: 3 },
    { x: 5, y: 4 },
    { x: 5, y: 5 },
    { x: 6, y: 3 },
    { x: 6, y: 4 },
    { x: 6, y: 5 }
  ]));
});

test('radius templates collect creatures in the affected area', () => {
  const grid = createBattleGrid(8, 8, 5);
  placeToken(grid, { id: 'player', x: 1, y: 2, team: 'allies', hp: 10, reach: 1 });
  placeToken(grid, { id: 'enemy_a', x: 3, y: 2, team: 'enemies', hp: 10, reach: 1 });
  placeToken(grid, { id: 'enemy_b', x: 4, y: 3, team: 'enemies', hp: 10, reach: 1 });
  placeToken(grid, { id: 'enemy_c', x: 7, y: 7, team: 'enemies', hp: 10, reach: 1 });

  const targets = collectTemplateTargets(grid, {
    template: 'radius',
    center: { x: 3, y: 2 },
    origin: { x: 1, y: 2 },
    sizeFeet: 20
  }, { excludeTeam: 'allies' });

  expect(targets.map((entry) => entry.id)).toEqual(expect.arrayContaining(['enemy_a', 'enemy_b']));
  expect(targets.map((entry) => entry.id)).not.toContain('enemy_c');
});

test('zone effects participate in tile lookups for enter/start/end hazard processing', () => {
  const grid = createBattleGrid(8, 8, 5);
  setZoneEffect(grid, {
    id: 'embers',
    template: 'radius',
    center: { x: 3, y: 3 },
    radiusFeet: 10,
    triggers: ['turn_start'],
    damage: '1d4',
    damageType: 'fire'
  });

  expect(getTileEffects(grid, 3, 3).some((effect) => effect.id === 'embers')).toBe(true);
  expect(getTileEffects(grid, 4, 4).some((effect) => effect.id === 'embers')).toBe(true);
  expect(getTileEffects(grid, 7, 7).some((effect) => effect.id === 'embers')).toBe(false);
});

test('reachable movement tiles respect cost, occupancy, and difficult terrain', () => {
  const grid = createBattleGrid(8, 8, 5);
  placeToken(grid, { id: 'player', x: 1, y: 1, team: 'allies', hp: 10, reach: 1 });
  placeToken(grid, { id: 'ally', x: 2, y: 1, team: 'allies', hp: 10, reach: 1 });
  setTerrain(grid, 1, 2, { difficult: true });

  const reachable = getReachableTiles(grid, 'player', 10);

  expect(reachable.some((tile) => tile.x === 2 && tile.y === 1)).toBe(false);
  expect(reachable.some((tile) => tile.x === 1 && tile.y === 2 && tile.cost === 10)).toBe(true);
  expect(reachable.some((tile) => tile.x === 4 && tile.y === 4)).toBe(false);
});

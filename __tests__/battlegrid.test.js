import { canTargetToken, createBattleGrid, getOpportunityAttackTriggers, placeToken, setTerrain } from '../battlegrid.js';

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

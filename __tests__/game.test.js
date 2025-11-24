import { gameState } from '../data/gameState.js';

test('initial threat meter exists', () => {
  expect(gameState.threat).toBeDefined();
  expect(gameState.threat.level).toBe(0);
});

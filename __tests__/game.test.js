import { gameState, initializeNewGame, performShortRest, resetGameState } from '../data/gameState.js';

beforeEach(() => {
  resetGameState();
});

test('initial threat meter exists', () => {
  expect(gameState.threat).toBeDefined();
  expect(gameState.threat.level).toBe(0);
});

test('short rest refreshes fighter second wind', () => {
  initializeNewGame(
    'Bran',
    'human',
    'fighter',
    'soldier',
    { STR: 15, DEX: 12, CON: 14, INT: 10, WIS: 10, CHA: 8 },
    ['athletics', 'survival'],
    []
  );

  gameState.player.resources.second_wind.current = 0;

  performShortRest();

  expect(gameState.player.resources.second_wind.current).toBe(1);
});

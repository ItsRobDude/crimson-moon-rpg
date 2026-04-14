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

test('short rest automatically applies arcane recovery once per long rest', () => {
  initializeNewGame(
    'Lys',
    'elf',
    'wizard',
    'sage',
    { STR: 8, DEX: 14, CON: 12, INT: 15, WIS: 13, CHA: 10 },
    ['investigation', 'arcana'],
    ['firebolt', 'magic_missile']
  );

  gameState.player.currentSlots[1] = 0;

  performShortRest();

  expect(gameState.player.currentSlots[1]).toBe(1);
  expect(gameState.player.resources.arcane_recovery.current).toBe(0);
});

test('fighter fighting style is reflected in derived combat stats', () => {
  initializeNewGame(
    'Bran',
    'human',
    'fighter',
    'soldier',
    { STR: 15, DEX: 12, CON: 14, INT: 10, WIS: 10, CHA: 8 },
    ['athletics', 'survival'],
    {
      fightingStyle: 'defense'
    }
  );

  expect(gameState.player.fightingStyle).toBe('defense');
  expect(gameState.player.ac).toBe(18);
});

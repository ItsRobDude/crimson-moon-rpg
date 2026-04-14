import { initializeNewGame, gameState, resetGameState } from '../data/gameState.js';

beforeEach(() => {
  resetGameState();
});

test('new characters inherit background, unified proficiencies, and racial traits', () => {
  initializeNewGame(
    'Lys',
    'elf',
    'wizard',
    'sage',
    { STR: 8, DEX: 14, CON: 12, INT: 15, WIS: 13, CHA: 10 },
    ['investigation', 'arcana'],
    ['firebolt', 'magic_missile']
  );

  expect(gameState.player.backgroundId).toBe('sage');
  expect(gameState.player.proficiencies.skills).toEqual(
    expect.arrayContaining(['investigation', 'arcana', 'history', 'perception'])
  );
  expect(gameState.player.proficiencies.languages).toContain('Draconic');
  expect(gameState.player.traits.map((trait) => trait.id)).toEqual(
    expect.arrayContaining(['darkvision', 'fey_ancestry', 'keen_senses', 'trance'])
  );
  expect(gameState.player.senses.darkvision).toBe(60);
  expect(gameState.player.spellcastingMode).toBe('spellbook');
  expect(gameState.player.knownSpells).toContain('firebolt');
  expect(gameState.player.spellbook).toContain('magic_missile');
  expect(gameState.player.preparedSpells.length).toBeGreaterThan(0);
});

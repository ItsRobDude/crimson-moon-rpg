import { addItem, advanceTime, equipItem, gameState, getInventoryEntries, initializeNewGame, performShortRest, resetGameState, useConsumable } from '../data/gameState.js';
import { addEffectToActor } from '../data/mechanics.js';

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
  expect(gameState.player.ac).toBe(19);
});

test('stackable inventory entries merge quantities and consume one unit at a time', () => {
  initializeNewGame(
    'Mira',
    'human',
    'cleric',
    'acolyte',
    { STR: 12, DEX: 10, CON: 14, INT: 10, WIS: 15, CHA: 13 },
    ['medicine', 'religion'],
    []
  );

  addItem('torch');
  addItem('torch');

  const torchEntry = getInventoryEntries().find((entry) => entry.itemId === 'torch');
  expect(torchEntry.quantity).toBe(2);

  const result = useConsumable('torch');
  expect(result.success).toBe(true);
  expect(getInventoryEntries().find((entry) => entry.itemId === 'torch')?.quantity || 0).toBe(1);
});

test('narrative time advancement expires time-slot effects and day rollover effects', () => {
  initializeNewGame(
    'Lys',
    'elf',
    'wizard',
    'sage',
    { STR: 8, DEX: 14, CON: 12, INT: 15, WIS: 13, CHA: 10 },
    ['investigation', 'arcana'],
    ['firebolt', 'magic_missile']
  );

  addEffectToActor(gameState.player, 'camp_focus', {
    name: 'Camp Focus',
    durationType: 'time_slots',
    remaining: 1,
    modifiers: [{ type: 'flat_bonus', target: 'ability_check', value: 1 }]
  });
  addEffectToActor(gameState.player, 'restless_day', {
    name: 'Restless Day',
    durationType: 'rest_of_day',
    remaining: 1,
    modifiers: [{ type: 'flat_bonus', target: 'initiative', value: -1 }]
  });

  advanceTime(1);
  expect(gameState.player.mechanics.activeEffects.some((effect) => effect.id === 'camp_focus')).toBe(false);
  expect(gameState.player.mechanics.activeEffects.some((effect) => effect.id === 'restless_day')).toBe(true);

  advanceTime(5);
  expect(gameState.player.mechanics.activeEffects.some((effect) => effect.id === 'restless_day')).toBe(false);
});

test('scrolls can be invoked by anyone and are consumed on use', () => {
  initializeNewGame(
    'Kest',
    'human',
    'fighter',
    'soldier',
    { STR: 15, DEX: 12, CON: 14, INT: 10, WIS: 10, CHA: 8 },
    ['athletics', 'survival'],
    []
  );

  addItem('scroll_bless');
  const before = getInventoryEntries().find((entry) => entry.itemId === 'scroll_bless').quantity;
  const result = useConsumable('scroll_bless');

  expect(result.success).toBe(true);
  expect(gameState.player.mechanics.activeEffects.some((effect) => effect.id === 'blessed')).toBe(true);
  expect((getInventoryEntries().find((entry) => entry.itemId === 'scroll_bless')?.quantity || 0)).toBe(before - 1);
});

test('shield proficiency is enforced for equipment legality', () => {
  initializeNewGame(
    'Lys',
    'elf',
    'wizard',
    'sage',
    { STR: 8, DEX: 14, CON: 12, INT: 15, WIS: 13, CHA: 10 },
    ['investigation', 'arcana'],
    ['firebolt', 'magic_missile']
  );

  addItem('shield');

  expect(equipItem('shield').success).toBe(false);
  expect(gameState.player.equipped.shield).toBe(null);
});

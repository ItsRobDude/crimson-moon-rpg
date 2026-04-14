import { addItem, advanceTime, equipItem, gameState, getInventoryEntries, initializeNewGame, loadGame, performLongRest, performShortRest, resetGameState, saveGame, useConsumable } from '../data/gameState.js';
import { addEffectToActor } from '../data/mechanics.js';

beforeEach(() => {
  resetGameState();
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }
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

test('save and load preserves mechanics-heavy player state', () => {
  initializeNewGame(
    'Lys',
    'elf',
    'wizard',
    'sage',
    { STR: 8, DEX: 14, CON: 12, INT: 15, WIS: 13, CHA: 10 },
    ['investigation', 'arcana'],
    {
      spellSelection: {
        cantrips: ['firebolt', 'ray_of_frost'],
        preparedSpells: ['magic_missile', 'mage_armor'],
        spellbook: ['magic_missile', 'mage_armor', 'shield']
      }
    }
  );

  gameState.player.currentSlots[1] = 1;
  gameState.player.resources.arcane_recovery.current = 0;
  addEffectToActor(gameState.player, 'mage_armor', {
    id: 'mage_armor',
    name: 'Mage Armor',
    durationType: 'long_rest',
    remaining: 1,
    modifiers: [{ type: 'ac_formula', target: 'ac', base: 13, dexCap: null, requiresUnarmored: true }]
  });
  addEffectToActor(gameState.player, 'camp_focus', {
    name: 'Camp Focus',
    durationType: 'scenes',
    remaining: 2,
    modifiers: [{ type: 'flat_bonus', target: 'ability_check', value: 1 }]
  });
  gameState.player.mechanics.proficiencyMultipliers.skills.arcana = 2;
  gameState.sceneMemory.test_marker = true;
  gameState.timeline.day = 2;
  gameState.timeline.slot = 'dusk';

  saveGame();
  resetGameState();

  expect(loadGame()).toBe(true);
  expect(gameState.player.name).toBe('Lys');
  expect(gameState.player.spellcastingMode).toBe('spellbook');
  expect(gameState.player.currentSlots[1]).toBe(1);
  expect(gameState.player.resources.arcane_recovery.current).toBe(0);
  expect(gameState.player.mechanics.activeEffects.some((effect) => effect.id === 'mage_armor')).toBe(true);
  expect(gameState.player.mechanics.activeEffects.some((effect) => effect.id === 'camp_focus')).toBe(true);
  expect(gameState.player.mechanics.proficiencyMultipliers.skills.arcana).toBe(2);
  expect(gameState.sceneMemory.test_marker).toBe(true);
  expect(gameState.timeline.day).toBe(2);
  expect(gameState.timeline.slot).toBe('dusk');
});

test('load normalizes partial legacy saves while preserving newer Sporefall and timeline progress', () => {
  initializeNewGame(
    'Kest',
    'human',
    'fighter',
    'soldier',
    { STR: 15, DEX: 12, CON: 14, INT: 10, WIS: 10, CHA: 8 },
    ['athletics', 'survival'],
    []
  );

  gameState.flags.sporefall_eoin_met = true;
  gameState.flags.sporefall_cathedral_letter_found = true;
  gameState.sceneMemory.sporefall_street_search_seen = true;
  gameState.timeline.day = 3;
  gameState.timeline.slot = 'night';
  gameState.timeline.actionCount = 9;
  gameState.currentSceneId = 'SCENE_HUB_SPOREFALL';
  gameState.quests.investigate_whisperwood.currentStage = 4;

  saveGame();

  const saved = JSON.parse(localStorage.getItem('crimson_moon_save'));
  delete saved.timeline.silverthornActionCount;
  delete saved.reputation.whisperwood_survivors;
  delete saved.discoveredLocations.whisperwood;
  delete saved.story;
  saved.quests.investigate_whisperwood = {
    currentStage: 4,
    completed: false
  };
  localStorage.setItem('crimson_moon_save', JSON.stringify(saved));

  resetGameState();

  expect(loadGame()).toBe(true);
  expect(gameState.currentSceneId).toBe('SCENE_HUB_SPOREFALL');
  expect(gameState.flags.sporefall_eoin_met).toBe(true);
  expect(gameState.flags.sporefall_cathedral_letter_found).toBe(true);
  expect(gameState.sceneMemory.sporefall_street_search_seen).toBe(true);
  expect(gameState.timeline.day).toBe(3);
  expect(gameState.timeline.slot).toBe('night');
  expect(gameState.timeline.silverthornActionCount).toBe(0);
  expect(gameState.reputation.whisperwood_survivors).toBe(0);
  expect(gameState.discoveredLocations.whisperwood).toBe(false);
  expect(gameState.story.canonicalStartScene).toBe('SCENE_BRIEFING');
  expect(gameState.quests.investigate_whisperwood.currentStage).toBe(4);
  expect(Array.isArray(gameState.quests.investigate_whisperwood.stages)).toBe(true);
});

test('save and load preserves concentration markers and Sporefall route flags', () => {
  initializeNewGame(
    'Lys',
    'elf',
    'wizard',
    'sage',
    { STR: 8, DEX: 14, CON: 12, INT: 15, WIS: 13, CHA: 10 },
    ['investigation', 'arcana'],
    ['firebolt', 'magic_missile']
  );

  addEffectToActor(gameState.player, 'blessed', {
    source: 'concentration:player:bless',
    concentration: true,
    remaining: 5,
    durationType: 'turns'
  });
  gameState.flags.sporefall_eoin_met = true;
  gameState.flags.sporefall_home_trap_hint = true;
  gameState.flags.sporefall_home_unlocked = true;
  gameState.sceneMemory.sporefall_street_search_seen = true;
  gameState.currentSceneId = 'SCENE_SPOREFALL_OVERSEER_STUDY';

  saveGame();
  resetGameState();

  expect(loadGame()).toBe(true);
  expect(gameState.player.mechanics.concentrationEffectId).toContain('concentration:player:bless');
  expect(gameState.player.mechanics.activeEffects.some((effect) => effect.id === 'blessed')).toBe(true);
  expect(gameState.flags.sporefall_eoin_met).toBe(true);
  expect(gameState.flags.sporefall_home_trap_hint).toBe(true);
  expect(gameState.flags.sporefall_home_unlocked).toBe(true);
  expect(gameState.sceneMemory.sporefall_street_search_seen).toBe(true);
  expect(gameState.currentSceneId).toBe('SCENE_SPOREFALL_OVERSEER_STUDY');
});

test('long rest clears long-rest effects and restores spell resources after load-safe state changes', () => {
  initializeNewGame(
    'Mira',
    'human',
    'cleric',
    'acolyte',
    { STR: 12, DEX: 10, CON: 14, INT: 10, WIS: 15, CHA: 13 },
    ['medicine', 'religion'],
    []
  );

  gameState.player.currentSlots[1] = 0;
  addEffectToActor(gameState.player, 'mage_armor', {
    id: 'mage_armor',
    name: 'Mage Armor',
    durationType: 'long_rest',
    remaining: 1,
    modifiers: [{ type: 'ac_formula', target: 'ac', base: 13, dexCap: null, requiresUnarmored: true }]
  });

  performLongRest();

  expect(gameState.player.currentSlots[1]).toBe(gameState.player.spellSlots[1]);
  expect(gameState.player.mechanics.activeEffects.some((effect) => effect.id === 'mage_armor')).toBe(false);
});

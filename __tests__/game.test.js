import { addItem, advanceTime, applyPendingLevelUp, equipItem, gameState, getInventoryEntries, getInventoryUseCost, getStoredSaveState, initializeNewGame, loadGame, performLongRest, performShortRest, resetGameState, SAVE_STORAGE_KEY, saveGame, useConsumable } from '../data/gameState.js';
import { scenes } from '../data/scenes.js';
import { addEffectToActor } from '../data/mechanics.js';
import { buildSilverthornRuntimeScene, buildSporefallRuntimeScene } from '../game.js';

beforeEach(() => {
  resetGameState();
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }
});

function levelPlayerToFour(levelChoices = {}) {
  gameState.pendingLevelUp = true;
  expect(applyPendingLevelUp(levelChoices[2] || {})).toMatchObject({ success: true, nextLevel: 2 });
  gameState.pendingLevelUp = true;
  expect(applyPendingLevelUp(levelChoices[3] || {})).toMatchObject({ success: true, nextLevel: 3 });
  gameState.pendingLevelUp = true;
  expect(applyPendingLevelUp(levelChoices[4] || {})).toMatchObject({ success: true, nextLevel: 4 });
}

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

test('fighter level-up path to 4 grants subclass, action surge, and Tough with persistent hit points', () => {
  initializeNewGame(
    'Bran',
    'human',
    'fighter',
    'soldier',
    { STR: 15, DEX: 12, CON: 14, INT: 10, WIS: 10, CHA: 8 },
    ['athletics', 'survival'],
    { fightingStyle: 'defense' }
  );

  levelPlayerToFour({
    3: { subclassId: 'champion' },
    4: { mode: 'feat', featId: 'tough' }
  });

  expect(gameState.player.level).toBe(4);
  expect(gameState.player.subclassId).toBe('champion');
  expect(gameState.player.resources.second_wind.max).toBe(1);
  expect(gameState.player.resources.action_surge.max).toBe(1);
  expect(gameState.player.feats).toContain('tough');
  expect(gameState.player.maxHp - gameState.player.maxHpBase).toBe(8);

  saveGame();
  resetGameState();
  expect(loadGame()).toBe(true);
  expect(gameState.player.feats).toContain('tough');
  expect(gameState.player.maxHp - gameState.player.maxHpBase).toBe(8);
  expect(gameState.player.subclassId).toBe('champion');
});

test('rogue level-up path to 4 keeps thief item economy honest while supporting ASI', () => {
  initializeNewGame(
    'Kest',
    'human',
    'rogue',
    'criminal',
    { STR: 10, DEX: 15, CON: 13, INT: 12, WIS: 10, CHA: 14 },
    ['stealth', 'sleight_of_hand', 'perception', 'deception'],
    { expertiseSkills: ['stealth', 'sleight_of_hand'] }
  );

  levelPlayerToFour({
    3: { subclassId: 'thief' },
    4: { mode: 'asi', abilityScoreIncreases: [{ ability: 'DEX', amount: 2 }] }
  });

  expect(gameState.player.level).toBe(4);
  expect(gameState.player.subclassId).toBe('thief');
  expect(gameState.player.abilities.DEX).toBe(18);
  addItem('torch');
  expect(getInventoryUseCost('torch')).toBe('bonus');
});

test('wizard level-up path to 4 grants evocation and Alert while updating spell slots', () => {
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
        preparedSpells: ['magic_missile'],
        spellbook: ['magic_missile', 'shield', 'mage_armor']
      }
    }
  );

  levelPlayerToFour({
    2: { subclassId: 'evocation' },
    3: {},
    4: { mode: 'feat', featId: 'alert' }
  });

  expect(gameState.player.level).toBe(4);
  expect(gameState.player.subclassId).toBe('evocation');
  expect(gameState.player.feats).toContain('alert');
  expect(gameState.player.spellSlots).toEqual({ 1: 4, 2: 3 });
  expect(gameState.player.currentSlots).toEqual({ 1: 4, 2: 3 });
});

test('cleric level-up path to 4 keeps Life domain fixed and applies Resilient correctly', () => {
  initializeNewGame(
    'Mira',
    'human',
    'cleric',
    'acolyte',
    { STR: 12, DEX: 10, CON: 14, INT: 10, WIS: 15, CHA: 13 },
    ['medicine', 'religion'],
    {
      spellSelection: {
        cantrips: ['guidance', 'sacred_flame'],
        preparedSpells: ['cure_wounds', 'bless']
      }
    }
  );

  levelPlayerToFour({
    2: {},
    3: {},
    4: { mode: 'feat', featId: 'resilient', featAbility: 'WIS' }
  });

  expect(gameState.player.level).toBe(4);
  expect(gameState.player.subclassId).toBe('life');
  expect(gameState.player.resources.channel_divinity.max).toBe(1);
  expect(gameState.player.feats).toContain('resilient:WIS');
  expect(gameState.player.abilities.WIS).toBe(17);
  expect(gameState.player.proficiencies.saves).toContain('WIS');
  expect(gameState.player.spellSlots).toEqual({ 1: 4, 2: 3 });
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

test('thief rogues can use consumables as bonus-action object interactions while scrolls remain actions', () => {
  initializeNewGame(
    'Kest',
    'human',
    'rogue',
    'criminal',
    { STR: 10, DEX: 15, CON: 13, INT: 12, WIS: 10, CHA: 14 },
    ['stealth', 'sleight_of_hand', 'perception', 'deception'],
    {
      expertiseSkills: ['stealth', 'sleight_of_hand']
    }
  );
  gameState.player.level = 3;
  gameState.player.subclassId = 'thief';

  addItem('torch');
  addItem('scroll_bless');

  expect(getInventoryUseCost('torch')).toBe('bonus');
  expect(getInventoryUseCost('potion_healing')).toBe('bonus');
  expect(getInventoryUseCost('scroll_bless')).toBe('action');
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

test('stored save reader classifies missing, invalid, and valid save payloads', () => {
  expect(getStoredSaveState().status).toBe('missing');

  localStorage.setItem(SAVE_STORAGE_KEY, 'true');
  let saveState = getStoredSaveState();
  expect(saveState.status).toBe('invalid');
  expect(localStorage.getItem(SAVE_STORAGE_KEY)).toBe('true');

  saveState = getStoredSaveState({ cleanupInvalid: true });
  expect(saveState.status).toBe('invalid');
  expect(localStorage.getItem(SAVE_STORAGE_KEY)).toBeNull();

  localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify({ currentSceneId: 'SCENE_BRIEFING' }));
  saveState = getStoredSaveState();
  expect(saveState.status).toBe('valid');
  expect(saveState.data.currentSceneId).toBe('SCENE_BRIEFING');
});

test('load clears corrupted or unusable saves instead of attempting partial boot', () => {
  localStorage.setItem(SAVE_STORAGE_KEY, '{ "corrupt": ');
  expect(loadGame()).toBe(false);
  expect(localStorage.getItem(SAVE_STORAGE_KEY)).toBeNull();

  localStorage.setItem(SAVE_STORAGE_KEY, '[]');
  expect(loadGame()).toBe(false);
  expect(localStorage.getItem(SAVE_STORAGE_KEY)).toBeNull();
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

  const saved = JSON.parse(localStorage.getItem(SAVE_STORAGE_KEY));
  delete saved.timeline.silverthornActionCount;
  delete saved.reputation.whisperwood_survivors;
  delete saved.discoveredLocations.whisperwood;
  delete saved.story;
  saved.quests.investigate_whisperwood = {
    currentStage: 4,
    completed: false
  };
  localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(saved));

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
  expect(gameState.quests.investigate_whisperwood.stages[4]).toBeDefined();
  expect(gameState.quests.investigate_whisperwood.completed).toBe(false);
});

test('updateQuestStage keeps investigate_whisperwood active at stage 4 without inferring completion', async () => {
  const { updateQuestStage } = await import('../data/gameState.js');

  initializeNewGame(
    'Kest',
    'human',
    'fighter',
    'soldier',
    { STR: 15, DEX: 12, CON: 14, INT: 10, WIS: 10, CHA: 8 },
    ['athletics', 'survival'],
    []
  );

  updateQuestStage('investigate_whisperwood', 4);

  expect(gameState.quests.investigate_whisperwood.currentStage).toBe(4);
  expect(gameState.quests.investigate_whisperwood.completed).toBe(false);
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

test('save strips transient combat previews but preserves stable combat ui state for later restoration', () => {
  initializeNewGame(
    'Kest',
    'human',
    'fighter',
    'soldier',
    { STR: 15, DEX: 12, CON: 14, INT: 10, WIS: 10, CHA: 8 },
    ['athletics', 'survival'],
    []
  );

  gameState.combat = {
    ...gameState.combat,
    active: true,
    activeActorId: 'player',
    turnOrder: ['player'],
    uiState: {
      actorId: 'player',
      subMenu: { type: 'move_preview', destination: { x: 2, y: 1 } }
    },
    transientPreview: {
      destination: { x: 2, y: 1 }
    }
  };

  saveGame();

  const stored = JSON.parse(localStorage.getItem(SAVE_STORAGE_KEY));
  expect(stored.combat.uiState).toEqual({
    actorId: 'player',
    subMenu: { type: 'move_preview', destination: { x: 2, y: 1 } }
  });
  expect(stored.combat.transientPreview).toBeNull();

  resetGameState();
  expect(loadGame()).toBe(true);
  expect(gameState.combat.uiState.actorId).toBe('player');
  expect(gameState.combat.uiState.subMenu).toEqual({ type: 'move_preview', destination: { x: 2, y: 1 } });
  expect(gameState.combat.transientPreview).toBeNull();
});

test('load normalizes malformed combat ui state into a safe neutral submenu', () => {
  initializeNewGame(
    'Mira',
    'human',
    'cleric',
    'acolyte',
    { STR: 12, DEX: 10, CON: 14, INT: 10, WIS: 15, CHA: 13 },
    ['medicine', 'religion'],
    []
  );

  const storedState = JSON.parse(JSON.stringify(gameState));
  storedState.combat = {
    ...storedState.combat,
    active: true,
    activeActorId: 'player',
    turnOrder: ['player'],
    uiState: {
      actorId: 42,
      subMenu: { type: 'unsupported_preview', destination: { x: 'bad', y: 1 } }
    },
    transientPreview: {
      destination: { x: 9, y: 9 }
    }
  };

  localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(storedState));

  resetGameState();
  expect(loadGame()).toBe(true);
  expect(gameState.combat.uiState).toEqual({
    actorId: null,
    subMenu: null
  });
  expect(gameState.combat.transientPreview).toBeNull();
});

test('silverthorn gate flow now musters Lark and Kieran before departure', () => {
  initializeNewGame(
    'Bran',
    'human',
    'fighter',
    'soldier',
    { STR: 15, DEX: 12, CON: 14, INT: 10, WIS: 10, CHA: 8 },
    ['athletics', 'survival'],
    []
  );

  const gateScene = buildSilverthornRuntimeScene('SCENE_SILVERTHORN_GATES', scenes.SCENE_SILVERTHORN_GATES);
  expect(gateScene.choices.some((choice) => choice.nextScene === 'SCENE_SILVERTHORN_LARK_RECRUIT')).toBe(true);
  expect(gateScene.choices.some((choice) => choice.nextScene === 'SCENE_SILVERTHORN_KIERAN_RECRUIT')).toBe(true);
  expect(gateScene.choices.some((choice) => choice.nextScene === 'SCENE_TRAVEL_SHADOWMIRE')).toBe(false);
});

test('dreadcap linger option only appears after key Eoin info and a handling choice', () => {
  initializeNewGame(
    'Bran',
    'human',
    'fighter',
    'soldier',
    { STR: 15, DEX: 12, CON: 14, INT: 10, WIS: 10, CHA: 8 },
    ['athletics', 'survival'],
    []
  );

  let eoinTalk = buildSporefallRuntimeScene('SCENE_EOIN_TALK', scenes.SCENE_EOIN_TALK);
  expect(eoinTalk.choices.some((choice) => choice.nextScene === 'SCENE_DREADCAP_WARNING')).toBe(false);

  gameState.flags.sporefall_eoin_key_info_heard = true;
  gameState.flags.sporefall_eoin_choice_made = true;

  eoinTalk = buildSporefallRuntimeScene('SCENE_EOIN_TALK', scenes.SCENE_EOIN_TALK);
  expect(eoinTalk.choices.some((choice) => choice.nextScene === 'SCENE_DREADCAP_WARNING')).toBe(true);
});

test('leaving promptly after the Eoin choice bypasses the dreadcap on that pass', () => {
  initializeNewGame(
    'Bran',
    'human',
    'fighter',
    'soldier',
    { STR: 15, DEX: 12, CON: 14, INT: 10, WIS: 10, CHA: 8 },
    ['athletics', 'survival'],
    []
  );

  gameState.flags.sporefall_eoin_key_info_heard = true;
  gameState.flags.sporefall_eoin_choice_made = true;

  const hubScene = buildSporefallRuntimeScene('SCENE_HUB_SPOREFALL', scenes.SCENE_HUB_SPOREFALL);
  expect(hubScene.choices.some((choice) => choice.nextScene === 'SCENE_DREADCAP_WARNING')).toBe(false);
  expect(hubScene.choices.some((choice) => choice.nextScene === 'SCENE_EOIN_TALK')).toBe(true);
});

test('dreadcap aftermath is the true-kill reward scene and defeat path does not grant the bow', () => {
  expect(scenes.SCENE_DREADCAP_COLOSSUS.winScene).toBe('SCENE_DREADCAP_AFTERMATH');
  expect(scenes.SCENE_DREADCAP_COLOSSUS.loseScene).toBe('SCENE_DEFEAT');
  expect(scenes.SCENE_DREADCAP_AFTERMATH.onEnter.effects.some((effect) => effect.type === 'addItem' && effect.itemId === 'aislings_corrupt_vigil')).toBe(true);
});

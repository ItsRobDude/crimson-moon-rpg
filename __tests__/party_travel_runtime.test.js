import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { companions } from '../data/companions.js';
import { races } from '../data/races.js';
import { gameState, addCompanion, initializeNewGame, loadGame, resetGameState, saveGame, SAVE_STORAGE_KEY } from '../data/gameState.js';
import { narrativeStateRegistry } from '../data/narrativeSafety.js';
import { scenes } from '../data/scenes.js';
import { getRuntimeScene, getTravelEventPool } from '../game.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const registryNote = fs.readFileSync(path.join(__dirname, '..', 'notes', 'narrative_state_registry.md'), 'utf8');

function initializePlayer() {
  initializeNewGame(
    'Kest',
    'human',
    'fighter',
    'soldier',
    { STR: 15, DEX: 12, CON: 14, INT: 10, WIS: 10, CHA: 8 },
    ['athletics', 'survival'],
    []
  );
}

beforeEach(() => {
  resetGameState();
  initializePlayer();
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }
});

test('companion roster now only ships canon-safe recruit candidates', () => {
  expect(Object.keys(companions).sort()).toEqual(['kieran_brogan', 'lark', 'neala']);
  expect(companions.lark.raceId).toBe('viridian_mixedling');
  expect(companions.lark.presentation?.stature).toBe('small');
  expect(companions.lark.presentation?.ancestry).toBe('mixed_viridian');
  expect(companions.lark.description).toContain('Viridian blood');
  expect(races.viridian_mixedling.playerSelectable).toBe(false);
  expect(companions.kieran_brogan.description).toContain('warm heart for his own');
  expect(companions.neala.description).toContain('Thorne Guild');
});

test('Eoin talk now keeps him sheltered while still exposing route and protection choices', () => {
  const scene = getRuntimeScene('SCENE_EOIN_TALK');
  const labels = scene.choices.map((choice) => choice.text);

  expect(labels).toEqual(expect.arrayContaining([
    expect.stringContaining("Stay hidden"),
    expect.stringContaining("Show me the north road"),
    expect.stringContaining("Keep lower in the cellar mouth")
  ]));
  expect(labels.some((label) => label.includes('Stay close to me'))).toBe(false);
});

test('adding a late companion at higher level now stays numerically stable', () => {
  gameState.player.level = 3;

  addCompanion('neala');

  expect(gameState.party).toContain('neala');
  expect(gameState.roster.neala.level).toBe(3);
  expect(Number.isFinite(gameState.roster.neala.maxHp)).toBe(true);
  expect(gameState.roster.neala.maxHp).toBeGreaterThan(0);
});

test('party state persists across save and load once a companion is recruited', () => {
  addCompanion('lark');

  saveGame();
  resetGameState();

  expect(loadGame()).toBe(true);
  expect(localStorage.getItem(SAVE_STORAGE_KEY)).not.toBeNull();
  expect(gameState.party).toContain('lark');
  expect(gameState.roster.lark?.name).toBe('Lark');
});

test('runtime scenes react to traveling as a group while Eoin remains a revisitable survivor', () => {
  addCompanion('lark');
  addCompanion('kieran_brogan');
  gameState.flags.sporefall_eoin_met = true;
  gameState.flags.sporefall_eoin_talked = true;

  let scene = getRuntimeScene('SCENE_HUB_SPOREFALL');
  expect(scene.text).toContain('Lark and Kieran Brogan spread through the street');
  expect(scene.choices.some((choice) => choice.text.includes('show you the way north'))).toBe(true);

  addCompanion('neala');
  scene = getRuntimeScene('SCENE_BRIARWOOD_INN');
  expect(scene.text).toContain('Neala marks doors');
});

test('travel event pool filters by route and party state without reviving the old Elara branch events', () => {
  let pool = getTravelEventPool('whisperwood');
  expect(pool.some((event) => event.id === 'whisperwood_refugee_trace')).toBe(false);

  addCompanion('lark');
  pool = getTravelEventPool('whisperwood');
  expect(pool.some((event) => event.id === 'whisperwood_refugee_trace')).toBe(true);
  expect(pool.every((event) => event.destinations.includes('whisperwood'))).toBe(true);
  expect(getTravelEventPool('thieves_hideout').some((event) => event.id === 'elara_route_guild_marks')).toBe(false);
});

test('companion-aid hooks exist on existing routes without making companions mandatory', () => {
  const northApproachChoice = scenes.SCENE_SPOREFALL_NORTH_APPROACH.choices.find((choice) => choice.text.includes('Cross the open street'));
  const hazeChoice = scenes.SCENE_SHADOWMIRE_HAZE.choices.find((choice) => choice.text.includes('Watch the treetops'));
  const arrivalChoice = scenes.SCENE_ARRIVAL_WHISPERWOOD.choices.find((choice) => choice.text.includes('Search the nearest street'));
  const trapChoice = scenes.SCENE_SPOREFALL_OVERSEER_DOOR.choices.find((choice) => choice.text.includes('Trace the carved grooves'));
  const townScoutChoice = scenes.SCENE_HUSHBRIAR_TOWN.choices.find((choice) => choice.text.includes('Scout the area'));
  const stoneScene = scenes.SCENE_ELARA_STONE_DECISION;

  expect(hazeChoice.companionAid?.companionId).toBe('lark');
  expect(arrivalChoice.companionAid?.companionId).toBe('lark');
  expect(northApproachChoice.companionAid?.companionId).toBe('lark');
  expect(trapChoice.companionAid?.companionId).toBe('kieran_brogan');
  expect(townScoutChoice.companionAid?.companionId).toBe('neala');
  expect(stoneScene.choices.some((choice) => choice.text.includes('blood stays unspent'))).toBe(true);
  expect(stoneScene.choices.some((choice) => choice.text.includes('saving the world'))).toBe(true);
});

test('current early-thread and late-route flags are registered in both safety sources', () => {
  ['silverthorn_watch_hostile', 'sporefall_eoin_glimpsed', 'sporefall_eoin_met', 'sporefall_eoin_talked', 'sporefall_eoin_comforted', 'elara_choice_spared', 'elara_choice_sacrifice_declared', 'elara_choice_deferred_by_aodhan', 'processing_truth_learned'].forEach((flagId) => {
    expect(narrativeStateRegistry.flags[flagId]).toBeDefined();
    expect(registryNote).toContain(`\`${flagId}\``);
  });
});

test('moonwell missable-state flags are registered in both safety sources', () => {
  ['hushbriar_fionnlagh_met', 'moonwell_night_available', 'moonwell_seen', 'moonwell_missed', 'moonwell_morning_setup_seen'].forEach((flagId) => {
    expect(narrativeStateRegistry.flags[flagId]).toBeDefined();
    expect(registryNote).toContain(`\`${flagId}\``);
  });
});

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { companions } from '../data/companions.js';
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
  expect(Object.keys(companions).sort()).toEqual(['eoin', 'neala']);
  expect(companions.eoin.description).toContain('Sporefall survivor');
  expect(companions.neala.description).toContain('Thorne Guild');
});

test('Eoin talk now exposes recruit, refusal, and lockout outcomes before the route is resolved', () => {
  const scene = getRuntimeScene('SCENE_EOIN_TALK');
  const labels = scene.choices.map((choice) => choice.text);

  expect(labels).toEqual(expect.arrayContaining([
    expect.stringContaining("Stay close to me"),
    expect.stringContaining("Stay hidden"),
    expect.stringContaining("not dragging you")
  ]));
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
  addCompanion('eoin');
  gameState.flags.eoin_recruited = true;

  saveGame();
  resetGameState();

  expect(loadGame()).toBe(true);
  expect(localStorage.getItem(SAVE_STORAGE_KEY)).not.toBeNull();
  expect(gameState.party).toContain('eoin');
  expect(gameState.roster.eoin?.name).toBe('Eoin');
});

test('runtime scenes react to traveling as a group and surface companion-specific route help', () => {
  addCompanion('eoin');
  gameState.flags.eoin_recruited = true;
  gameState.flags.sporefall_eoin_met = true;
  gameState.flags.sporefall_eoin_talked = true;

  let scene = getRuntimeScene('SCENE_HUB_SPOREFALL');
  expect(scene.text).toContain('Eoin stays close enough');
  expect(scene.choices.some((choice) => choice.text.includes('show you the way north'))).toBe(true);

  addCompanion('neala');
  scene = getRuntimeScene('SCENE_BRIARWOOD_INN');
  expect(scene.text).toContain('Neala marks doors');
});

test('travel event pool filters by route and party state without reviving the old Elara branch events', () => {
  let pool = getTravelEventPool('whisperwood');
  expect(pool.some((event) => event.id === 'whisperwood_refugee_trace')).toBe(false);

  addCompanion('eoin');
  pool = getTravelEventPool('whisperwood');
  expect(pool.some((event) => event.id === 'whisperwood_refugee_trace')).toBe(true);
  expect(pool.every((event) => event.destinations.includes('whisperwood'))).toBe(true);
  expect(getTravelEventPool('thieves_hideout').some((event) => event.id === 'elara_route_guild_marks')).toBe(false);
});

test('companion-aid hooks exist on existing routes without making companions mandatory', () => {
  const northApproachChoice = scenes.SCENE_SPOREFALL_NORTH_APPROACH.choices.find((choice) => choice.text.includes('Cross the open street'));
  const townScoutChoice = scenes.SCENE_HUSHBRIAR_TOWN.choices.find((choice) => choice.text.includes('Scout the area'));
  const stoneScene = scenes.SCENE_ELARA_STONE_DECISION;

  expect(northApproachChoice.companionAid?.companionId).toBe('eoin');
  expect(townScoutChoice.companionAid?.companionId).toBe('neala');
  expect(stoneScene.choices.some((choice) => choice.text.includes('blood stays unspent'))).toBe(true);
  expect(stoneScene.choices.some((choice) => choice.text.includes('saving the world'))).toBe(true);
});

test('current companion and late-route flags are registered in both safety sources', () => {
  ['eoin_recruited', 'eoin_refused', 'eoin_locked_out', 'eoin_bonded', 'elara_choice_spared', 'elara_choice_sacrifice_declared', 'elara_choice_deferred_by_aodhan', 'processing_truth_learned'].forEach((flagId) => {
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

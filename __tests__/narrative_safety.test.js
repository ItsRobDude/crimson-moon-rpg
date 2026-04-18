import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { gameState, initializeNewGame, resetGameState } from '../data/gameState.js';
import { EARLY_ROUTE_SPOILER_TERMS, narrativeStateRegistry, SCENE_FALLBACK_MODES } from '../data/narrativeSafety.js';
import { scenes } from '../data/scenes.js';
import { sceneSafetyPolicies, storyEvents, storySceneTriggers } from '../data/storyTimeline.js';
import { getRuntimeScene } from '../game.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function initializePlayer() {
  initializeNewGame(
    'Ward',
    'human',
    'fighter',
    'soldier',
    { STR: 15, DEX: 12, CON: 14, INT: 10, WIS: 10, CHA: 8 },
    ['athletics', 'survival'],
    []
  );
}

function freshState(mutator = null) {
  resetGameState();
  initializePlayer();
  if (mutator) mutator();
}

function expectNoForbiddenSpoilers(scene) {
  const combinedText = `${scene.text || ''}\n${(scene.choices || []).map((choice) => choice.text || '').join('\n')}`.toLowerCase();
  EARLY_ROUTE_SPOILER_TERMS.forEach((term) => {
    expect(combinedText).not.toContain(term);
  });
}

test('timeline triggers and narrative safety policies only reference real scenes, real events, and approved fallback modes', () => {
  Object.entries(storySceneTriggers).forEach(([sceneId, trigger]) => {
    expect(scenes[sceneId]).toBeDefined();
    ['activate', 'complete', 'unlock'].forEach((field) => {
      (trigger[field] || []).forEach((eventId) => {
        expect(storyEvents[eventId]).toBeDefined();
      });
    });
  });

  Object.entries(sceneSafetyPolicies).forEach(([sceneId, policy]) => {
    expect(scenes[sceneId]).toBeDefined();
    expect(Object.values(SCENE_FALLBACK_MODES)).toContain(policy.fallbackMode);
    (policy.prerequisites?.storyEvents || []).forEach((eventId) => {
      expect(storyEvents[eventId]).toBeDefined();
    });
  });
});

test('critical Act I safety coverage exists for the fragile early-route scenes', () => {
  const requiredCoverage = [
    'SCENE_HUB_SILVERTHORN',
    'SCENE_RUSTY_BLADE_RUMORS',
    'SCENE_SILVERTHORN_NOTICE_WHISPERWOOD',
    'SCENE_SILVERTHORN_GATE_CAPTAIN',
    'SCENE_TRAVEL_SHADOWMIRE',
    'SCENE_SPOREFALL_WAKE',
    'SCENE_ARRIVAL_WHISPERWOOD',
    'SCENE_MEET_EOIN',
    'SCENE_EOIN_TALK',
    'SCENE_EOIN_MOTHER_TALK',
    'SCENE_HUB_SPOREFALL',
    'SCENE_SPOREFALL_CATHEDRAL_APPROACH',
    'SCENE_SPOREFALL_OVERSEER_JOURNAL',
    'SCENE_SPOREFALL_OVERSEER_CORRESPONDENCE',
    'SCENE_SPOREFALL_NORTH_APPROACH',
    'SCENE_SPOREFALL_NORTH_BRIDGE',
    'SCENE_SPOREFALL_NORTH_ROUTE_DISCOVERED'
  ];

  requiredCoverage.forEach((sceneId) => {
    expect(sceneSafetyPolicies[sceneId]).toBeDefined();
  });
});

test('late Hushbriar spine and retired teaser branches carry explicit safety policy coverage', () => {
  [
    'SCENE_ARRIVAL_HUSHBRIAR',
    'SCENE_HUSHBRIAR_TOWN',
    'SCENE_BRIARWOOD_INN',
    'SCENE_HUSHBRIAR_SCREAMS',
    'SCENE_MOONWELL',
    'SCENE_HUSHBRIAR_AFTERMATH_HUNT',
    'SCENE_THIEVES_HIDEOUT',
    'SCENE_ELARA_HIDEAWAY',
    'SCENE_ELARA_STONE_DECISION',
    'SCENE_HUSHBRIAR_PROCESSING_REVELATION'
  ].forEach((sceneId) => {
    expect(sceneSafetyPolicies[sceneId]).toBeDefined();
  });

  expect(sceneSafetyPolicies.SCENE_HUSHBRIAR_AFTERMATH_HUNT.fallbackMode).toBe(SCENE_FALLBACK_MODES.DEGRADE);
  expect(sceneSafetyPolicies.SCENE_THIEVES_HIDEOUT.fallbackMode).toBe(SCENE_FALLBACK_MODES.DEGRADE);
  expect(sceneSafetyPolicies.SCENE_ELARA_STONE_DECISION.fallbackMode).toBe(SCENE_FALLBACK_MODES.DEGRADE);
  expect(sceneSafetyPolicies.SCENE_HUSHBRIAR_PROCESSING_REVELATION.fallbackMode).toBe(SCENE_FALLBACK_MODES.DEGRADE);
});

test('late-route registry ownership matches the draft-first Hushbriar split', () => {
  [
    'hushbriar_fionnlagh_met',
    'moonwell_night_available',
    'moonwell_seen',
    'moonwell_missed',
    'moonwell_morning_setup_seen'
  ].forEach((flagId) => {
    expect(narrativeStateRegistry.flags[flagId].thread).toBe('hushbriar_demigod_thread');
  });

  [
    'hushbriar_guild_ledger_found',
    'hushbriar_guild_trusted',
    'hushbriar_guild_hostile',
    'elara_met',
    'elara_choice_spared',
    'elara_choice_sacrifice_declared',
    'elara_choice_deferred_by_aodhan',
    'processing_truth_learned'
  ].forEach((flagId) => {
    expect(narrativeStateRegistry.flags[flagId].thread).toBe('hushbriar_elara_resolution');
  });
});

test('early-route runtime scenes stay free of hidden ritual spoiler terms across current variants', () => {
  freshState();
  expectNoForbiddenSpoilers(getRuntimeScene('SCENE_HUB_SILVERTHORN'));
  expectNoForbiddenSpoilers(getRuntimeScene('SCENE_RUSTY_BLADE_RUMORS'));
  expectNoForbiddenSpoilers(getRuntimeScene('SCENE_SILVERTHORN_NOTICE_WHISPERWOOD'));
  expectNoForbiddenSpoilers(getRuntimeScene('SCENE_SILVERTHORN_GATE_CAPTAIN'));

  freshState(() => {
    gameState.flags.sporefall_eoin_met = true;
  });
  expectNoForbiddenSpoilers(getRuntimeScene('SCENE_ARRIVAL_WHISPERWOOD'));

  freshState();
  expectNoForbiddenSpoilers(getRuntimeScene('SCENE_MEET_EOIN'));

  freshState(() => {
    gameState.flags.sporefall_eoin_met = true;
    gameState.flags.sporefall_eoin_talked = true;
    gameState.flags.sporefall_bridge_seen = true;
    gameState.flags.sporefall_cathedral_vision_seen = true;
  });
  expectNoForbiddenSpoilers(getRuntimeScene('SCENE_EOIN_TALK'));
  expectNoForbiddenSpoilers(getRuntimeScene('SCENE_HUB_SPOREFALL'));
  expectNoForbiddenSpoilers(getRuntimeScene('SCENE_SPOREFALL_CATHEDRAL_APPROACH'));
  expectNoForbiddenSpoilers(getRuntimeScene('SCENE_SPOREFALL_NORTH_APPROACH'));

  freshState(() => {
    gameState.flags.sporefall_bridge_body_seen = true;
  });
  expectNoForbiddenSpoilers(getRuntimeScene('SCENE_EOIN_MOTHER_TALK'));
  expectNoForbiddenSpoilers(getRuntimeScene('SCENE_SPOREFALL_NORTH_BRIDGE'));
});

test('critical Act I scenes still expose a meaningful next step instead of dead-ending', () => {
  freshState();
  [
    'SCENE_HUB_SILVERTHORN',
    'SCENE_RUSTY_BLADE_RUMORS',
    'SCENE_SILVERTHORN_NOTICE_WHISPERWOOD',
    'SCENE_SILVERTHORN_GATE_CAPTAIN',
    'SCENE_ARRIVAL_WHISPERWOOD',
    'SCENE_MEET_EOIN'
  ].forEach((sceneId) => {
    const scene = getRuntimeScene(sceneId);
    expect(scene.choices?.length).toBeGreaterThan(0);
  });

  freshState(() => {
    gameState.flags.sporefall_eoin_met = true;
    gameState.flags.sporefall_eoin_talked = true;
  });
  [
    'SCENE_EOIN_TALK',
    'SCENE_HUB_SPOREFALL',
    'SCENE_SPOREFALL_CATHEDRAL_APPROACH',
    'SCENE_SPOREFALL_NORTH_APPROACH',
    'SCENE_SPOREFALL_NORTH_BRIDGE'
  ].forEach((sceneId) => {
    const scene = getRuntimeScene(sceneId);
    expect(scene.choices?.length).toBeGreaterThan(0);
  });
});

test('story-critical silverthorn and sporefall flags and scene-memory keys used in runtime code are registered', () => {
  const gameSource = fs.readFileSync(path.join(projectRoot, 'game.js'), 'utf8');

  const discoveredFlags = [...new Set(
    [...gameSource.matchAll(/gameState\.flags\.([a-zA-Z0-9_]+)/g)]
      .map((match) => match[1])
      .filter((key) => key.startsWith('silverthorn_') || key.startsWith('sporefall_'))
  )];

  const discoveredSceneMemory = [...new Set(
    [...gameSource.matchAll(/(?:getSceneMemory|setSceneMemory)\('([a-zA-Z0-9_]+)'/g)]
      .map((match) => match[1])
      .filter((key) => key.startsWith('silverthorn_') || key.startsWith('sporefall_'))
  )];

  const registeredFlags = Object.keys(narrativeStateRegistry.flags);
  const registeredSceneMemory = Object.keys(narrativeStateRegistry.sceneMemory);

  discoveredFlags.forEach((key) => {
    expect(registeredFlags).toContain(key);
  });
  discoveredSceneMemory.forEach((key) => {
    expect(registeredSceneMemory).toContain(key);
  });
});

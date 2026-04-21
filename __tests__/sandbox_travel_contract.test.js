import { discoverLocation, gameState, resetGameState } from '../data/gameState.js';
import { STORY_EVENT_STATUS, getStoryEventStatus, syncStoryStateForScene } from '../data/storyTimeline.js';
import { getHubSceneForLocation, getRuntimeScene, isLocationTraversable } from '../game.js';

function advanceToSporefallSandbox() {
  [
    'SCENE_BRIEFING',
    'SCENE_HUB_SILVERTHORN',
    'SCENE_TRAVEL_SHADOWMIRE',
    'SCENE_ARRIVAL_WHISPERWOOD',
    'SCENE_MEET_EOIN',
    'SCENE_EOIN_TALK',
    'SCENE_HUB_SPOREFALL'
  ].forEach((sceneId) => syncStoryStateForScene(gameState.story, sceneId));
}

beforeEach(() => {
  resetGameState();
});

test('opening funnel keeps known off-spine world locations unavailable until the first Sporefall hub', () => {
  discoverLocation('durnhelm');

  expect(isLocationTraversable('durnhelm')).toBe(false);

  advanceToSporefallSandbox();

  expect(isLocationTraversable('durnhelm')).toBe(true);
});

test('known world places can be traversable even before their main event thread unlocks', () => {
  advanceToSporefallSandbox();
  discoverLocation('lament_hill');

  expect(getStoryEventStatus(gameState.story, 'lament_hill_thread')).toBe(STORY_EVENT_STATUS.LOCKED);
  expect(isLocationTraversable('lament_hill')).toBe(true);
  expect(getHubSceneForLocation('lament_hill')).toBe('SCENE_HUB_LAMENT_HILL');
});

test('hidden sublocations stay off the map even if discovered in state', () => {
  advanceToSporefallSandbox();
  discoverLocation('thieves_hideout');

  expect(isLocationTraversable('thieves_hideout')).toBe(false);
  expect(getHubSceneForLocation('thieves_hideout')).toBeNull();
});

test('known late world places without authored ambient hubs remain non-traversable in the first pass', () => {
  advanceToSporefallSandbox();
  discoverLocation('soul_mill');

  expect(getHubSceneForLocation('soul_mill')).toBeNull();
  expect(isLocationTraversable('soul_mill')).toBe(false);
});

test('known Hushbriar can stay traversable before its main event thread and lands in ambient town content', () => {
  advanceToSporefallSandbox();
  discoverLocation('hushbriar');

  expect(getStoryEventStatus(gameState.story, 'hushbriar_demigod_thread')).toBe(STORY_EVENT_STATUS.LOCKED);
  expect(isLocationTraversable('hushbriar')).toBe(true);

  const town = getRuntimeScene('SCENE_HUSHBRIAR_TOWN');
  const inn = getRuntimeScene('SCENE_BRIARWOOD_INN');

  expect(town.choices.some((choice) => choice.nextScene === 'SCENE_MOONWELL_AMBIENT')).toBe(true);
  expect(town.choices.some((choice) => choice.nextScene === 'SCENE_HUSHBRIAR_BRIDGE_SHADOWS')).toBe(true);
  expect(inn.choices.some((choice) => choice.nextScene === 'SCENE_FIONNLAGH_HUB')).toBe(false);
});

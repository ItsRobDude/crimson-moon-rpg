import {
  CANONICAL_START_SCENE,
  STORY_EVENT_STATUS,
  createDefaultStoryState,
  ensureStoryState,
  getLocationStoryRequirement,
  getStoryEventStatus,
  meetsStoryRequirement,
  syncStoryStateForScene
} from '../data/storyTimeline.js';

test('default story state matches the canonical Silverthorn opening', () => {
  const storyState = createDefaultStoryState();

  expect(storyState.canonicalStartScene).toBe(CANONICAL_START_SCENE);
  expect(storyState.currentEventId).toBe('alderic_briefing');
  expect(getStoryEventStatus(storyState, 'alderic_briefing')).toBe(STORY_EVENT_STATUS.AVAILABLE);
  expect(getStoryEventStatus(storyState, 'silverthorn_departure')).toBe(STORY_EVENT_STATUS.LOCKED);
});

test('scene sync advances the story from briefing to departure', () => {
  const storyState = createDefaultStoryState();

  syncStoryStateForScene(storyState, 'SCENE_BRIEFING');
  const changes = syncStoryStateForScene(storyState, 'SCENE_HUB_SILVERTHORN');

  expect(changes.completed).toContain('alderic_briefing');
  expect(changes.unlocked).toContain('silverthorn_departure');
  expect(getStoryEventStatus(storyState, 'alderic_briefing')).toBe(STORY_EVENT_STATUS.COMPLETED);
  expect(getStoryEventStatus(storyState, 'silverthorn_departure')).toBe(STORY_EVENT_STATUS.AVAILABLE);
});

test('ensureStoryState upgrades legacy saves without story data', () => {
  const storyState = ensureStoryState({ currentActId: 'not_real' });

  expect(storyState.canonicalStartScene).toBe(CANONICAL_START_SCENE);
  expect(storyState.currentActId).toBe('act_1_briefing_and_departure');
  expect(getStoryEventStatus(storyState, 'alderic_briefing')).toBe(STORY_EVENT_STATUS.AVAILABLE);
});

test('late-game locations stay locked until their story threads open', () => {
  const storyState = createDefaultStoryState();

  expect(meetsStoryRequirement(storyState, getLocationStoryRequirement('durnhelm'))).toBe(false);

  syncStoryStateForScene(storyState, 'SCENE_BRIEFING');
  syncStoryStateForScene(storyState, 'SCENE_HUB_SILVERTHORN');
  syncStoryStateForScene(storyState, 'SCENE_SHADOWMIRE_ROAD');
  syncStoryStateForScene(storyState, 'SCENE_ARRIVAL_WHISPERWOOD');
  syncStoryStateForScene(storyState, 'SCENE_EOIN_TALK');
  syncStoryStateForScene(storyState, 'SCENE_AODHAN_TALK');

  expect(meetsStoryRequirement(storyState, getLocationStoryRequirement('durnhelm'))).toBe(true);
  expect(meetsStoryRequirement(storyState, getLocationStoryRequirement('hushbriar'))).toBe(false);
});

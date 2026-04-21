import {
  CANONICAL_START_SCENE,
  STORY_EVENT_STATUS,
  createDefaultStoryState,
  ensureStoryState,
  getLocationStoryRequirement,
  getStoryEventStatus,
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

test('location story requirements now remain local to hidden sublocations only', () => {
  expect(getLocationStoryRequirement('durnhelm')).toBeNull();
  expect(getLocationStoryRequirement('lament_hill')).toBeNull();
  expect(getLocationStoryRequirement('hushbriar')).toBeNull();
  expect(getLocationStoryRequirement('solasmor')).toBeNull();
  expect(getLocationStoryRequirement('soul_mill')).toBeNull();
  expect(getLocationStoryRequirement('thieves_hideout')).toEqual({
    id: 'retired_hushbriar_guild_branch',
    oneOf: ['available', 'active', 'completed']
  });
});

test('sporefall investigation now unlocks Aodhan and Durnhelm before Lament Hill or Hushbriar open', () => {
  const storyState = createDefaultStoryState();

  syncStoryStateForScene(storyState, 'SCENE_BRIEFING');
  syncStoryStateForScene(storyState, 'SCENE_HUB_SILVERTHORN');
  syncStoryStateForScene(storyState, 'SCENE_TRAVEL_SHADOWMIRE');
  syncStoryStateForScene(storyState, 'SCENE_ARRIVAL_WHISPERWOOD');
  syncStoryStateForScene(storyState, 'SCENE_MEET_EOIN');

  expect(getStoryEventStatus(storyState, 'eoin_thread')).toBe(STORY_EVENT_STATUS.ACTIVE);
  expect(getStoryEventStatus(storyState, 'sporefall_investigation')).toBe(STORY_EVENT_STATUS.LOCKED);

  syncStoryStateForScene(storyState, 'SCENE_EOIN_TALK');
  syncStoryStateForScene(storyState, 'SCENE_HUB_SPOREFALL');

  expect(getStoryEventStatus(storyState, 'eoin_thread')).toBe(STORY_EVENT_STATUS.COMPLETED);
  expect(getStoryEventStatus(storyState, 'sporefall_investigation')).toBe(STORY_EVENT_STATUS.ACTIVE);
  expect(getStoryEventStatus(storyState, 'aodhan_thread')).toBe(STORY_EVENT_STATUS.LOCKED);
  expect(getStoryEventStatus(storyState, 'durnhelm_thread')).toBe(STORY_EVENT_STATUS.LOCKED);

  syncStoryStateForScene(storyState, 'SCENE_SPOREFALL_OVERSEER_JOURNAL');

  expect(getStoryEventStatus(storyState, 'sporefall_investigation')).toBe(STORY_EVENT_STATUS.COMPLETED);
  expect(getStoryEventStatus(storyState, 'aodhan_thread')).toBe(STORY_EVENT_STATUS.AVAILABLE);
  expect(getStoryEventStatus(storyState, 'durnhelm_thread')).toBe(STORY_EVENT_STATUS.AVAILABLE);
  expect(getStoryEventStatus(storyState, 'lament_hill_thread')).toBe(STORY_EVENT_STATUS.LOCKED);
  expect(getStoryEventStatus(storyState, 'hushbriar_demigod_thread')).toBe(STORY_EVENT_STATUS.LOCKED);
  expect(getStoryEventStatus(storyState, 'retired_hushbriar_guild_branch')).toBe(STORY_EVENT_STATUS.LOCKED);
  expect(getStoryEventStatus(storyState, 'dormant_hushbriar_future_route')).toBe(STORY_EVENT_STATUS.LOCKED);
});

test('post-Moonwell continuation stays on the canonical Elara route and keeps dormant branches locked', () => {
  const storyState = createDefaultStoryState();

  [
    'SCENE_BRIEFING',
    'SCENE_HUB_SILVERTHORN',
    'SCENE_TRAVEL_SHADOWMIRE',
    'SCENE_ARRIVAL_WHISPERWOOD',
    'SCENE_MEET_EOIN',
    'SCENE_EOIN_TALK',
    'SCENE_HUB_SPOREFALL',
    'SCENE_SPOREFALL_OVERSEER_JOURNAL',
    'SCENE_DURNHELM_GATES',
    'SCENE_DURNHELM_ENTRY',
    'SCENE_DURNHELM_CATHAL',
    'SCENE_LAMENT_HILL_APPROACH',
    'SCENE_LAMENT_AINE_REVEAL',
    'SCENE_ARRIVAL_HUSHBRIAR',
    'SCENE_FIONNLAGH_HUB',
    'SCENE_HUSHBRIAR_SCREAMS',
    'SCENE_MOONWELL',
    'SCENE_AODHAN_DEFEAT'
  ].forEach((sceneId) => {
    syncStoryStateForScene(storyState, sceneId);
  });

  expect(getStoryEventStatus(storyState, 'hushbriar_demigod_thread')).toBe(STORY_EVENT_STATUS.ACTIVE);
  expect(getStoryEventStatus(storyState, 'hushbriar_elara_resolution')).toBe(STORY_EVENT_STATUS.LOCKED);
  expect(getStoryEventStatus(storyState, 'retired_hushbriar_guild_branch')).toBe(STORY_EVENT_STATUS.LOCKED);
  expect(getStoryEventStatus(storyState, 'dormant_hushbriar_future_route')).toBe(STORY_EVENT_STATUS.LOCKED);

  syncStoryStateForScene(storyState, 'SCENE_AFTERMATH');
  expect(getStoryEventStatus(storyState, 'aodhan_thread')).toBe(STORY_EVENT_STATUS.COMPLETED);
  expect(getStoryEventStatus(storyState, 'hushbriar_demigod_thread')).toBe(STORY_EVENT_STATUS.ACTIVE);
  expect(getStoryEventStatus(storyState, 'hushbriar_elara_resolution')).toBe(STORY_EVENT_STATUS.AVAILABLE);

  syncStoryStateForScene(storyState, 'SCENE_HUSHBRIAR_AFTERMATH_HUNT');
  expect(getStoryEventStatus(storyState, 'hushbriar_elara_resolution')).toBe(STORY_EVENT_STATUS.ACTIVE);

  [
    'SCENE_HUSHBRIAR_DOCK',
    'SCENE_HUSHBRIAR_LEDGER',
    'SCENE_THIEVES_HIDEOUT',
    'SCENE_ELARA_HIDEAWAY',
    'SCENE_ELARA_COUNSEL',
    'SCENE_ELARA_STONE_DECISION',
    'SCENE_HUSHBRIAR_PROCESSING_REVELATION'
  ].forEach((sceneId) => {
    syncStoryStateForScene(storyState, sceneId);
  });

  expect(getStoryEventStatus(storyState, 'hushbriar_elara_resolution')).toBe(STORY_EVENT_STATUS.COMPLETED);
  expect(getStoryEventStatus(storyState, 'retired_hushbriar_guild_branch')).toBe(STORY_EVENT_STATUS.LOCKED);
  expect(getStoryEventStatus(storyState, 'dormant_hushbriar_future_route')).toBe(STORY_EVENT_STATUS.LOCKED);
  expect(getLocationStoryRequirement('thieves_hideout')).toEqual({
    id: 'retired_hushbriar_guild_branch',
    oneOf: ['available', 'active', 'completed']
  });
  expect(getLocationStoryRequirement('soul_mill')).toBeNull();
  expect(getLocationStoryRequirement('solasmor')).toBeNull();
});

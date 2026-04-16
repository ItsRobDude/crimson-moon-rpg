import { gameState, resetGameState } from '../data/gameState.js';
import { scenes } from '../data/scenes.js';
import { storySceneTriggers } from '../data/storyTimeline.js';
import { getHubSceneForLocation } from '../game.js';

beforeEach(() => {
  resetGameState();
  gameState.flags = {};
});

test('Aine now points directly into authored Archives and Hushbriar late-game routes', () => {
  const aineChoices = scenes.SCENE_LAMENT_AINE_REVEAL.choices;

  expect(aineChoices.some((choice) => choice.nextScene === 'SCENE_ARCHIVES_APPROACH')).toBe(true);
  expect(aineChoices.some((choice) => choice.nextScene === 'SCENE_HUSHBRIAR_GUILD_ROAD')).toBe(true);
  expect(aineChoices.some((choice) => choice.action === 'openMap')).toBe(false);
});

test('Archives route is authored and archives_truth completes at the truth chamber', () => {
  expect(scenes.SCENE_ARCHIVES_APPROACH.choices.some((choice) => choice.nextScene === 'SCENE_ARCHIVES_CAVERN')).toBe(true);
  expect(scenes.SCENE_ARCHIVES_CAVERN.choices.some((choice) => choice.nextScene === 'SCENE_ARCHIVES_GATEKEEPER')).toBe(true);
  expect(scenes.SCENE_ARCHIVES_GATEKEEPER.choices.some((choice) => choice.nextScene === 'SCENE_ARCHIVES_TRUTH_CHAMBER')).toBe(true);
  expect(scenes.SCENE_ARCHIVES_TRUTH_CHAMBER.choices.some((choice) => choice.nextScene === 'SCENE_ARCHIVES_AUDIENCE')).toBe(true);

  expect(storySceneTriggers.SCENE_ARCHIVES_APPROACH.activate).toEqual(['archives_truth']);
  expect(storySceneTriggers.SCENE_ARCHIVES_TRUTH_CHAMBER.complete).toEqual(['archives_truth']);
});

test('Thalion audience contains one-pass missable truth gates and a closing flag', () => {
  const audienceChoices = scenes.SCENE_ARCHIVES_AUDIENCE.choices;
  const aldericChoice = audienceChoices.find((choice) => choice.text.includes('Alderic buy for himself'));
  const confessionChoice = audienceChoices.find((choice) => choice.text.includes('sin chained you'));
  const leaveChoice = audienceChoices.find((choice) => choice.text.includes('Bow out before he decides'));

  expect(aldericChoice.requires.notFlag).toEqual(['archives_thalion_audience_closed', 'archives_alderic_truth_learned', 'archives_alderic_truth_missed']);
  expect(aldericChoice.onSuccess.effects).toContainEqual({ type: 'flag', flagId: 'archives_alderic_truth_learned', value: true });
  expect(aldericChoice.onFail.effects).toContainEqual({ type: 'flag', flagId: 'archives_alderic_truth_missed', value: true });

  expect(confessionChoice.requires.notFlag).toEqual(['archives_thalion_audience_closed', 'archives_thalion_confession_learned', 'archives_thalion_confession_missed']);
  expect(confessionChoice.onSuccess.effects).toContainEqual({ type: 'flag', flagId: 'archives_thalion_confession_learned', value: true });
  expect(confessionChoice.onFail.effects).toContainEqual({ type: 'flag', flagId: 'archives_thalion_confession_missed', value: true });

  expect(leaveChoice.effects).toContainEqual({ type: 'flag', flagId: 'archives_thalion_audience_closed', value: true });
});

test('Hushbriar now opens on the guild-investigation route and the ledger/Elara flags exist', () => {
  expect(getHubSceneForLocation('hushbriar')).toBe('SCENE_HUSHBRIAR_GUILD_ROAD');
  expect(scenes.SCENE_HUSHBRIAR_LEDGER.onEnter.effects).toContainEqual({ type: 'flag', flagId: 'hushbriar_guild_ledger_found', value: true });
  expect(scenes.SCENE_ELARA_HIDEAWAY.onEnter.effects).toContainEqual({ type: 'flag', flagId: 'elara_met', value: true });
});

test('Elara route choices differ based on Stone possession and whether Aodhan still lives', () => {
  const elaraChoices = scenes.SCENE_ELARA_HIDEAWAY.choices;
  const stoneChoice = elaraChoices.find((choice) => choice.text.includes('Stone is already in my hands'));
  const aodhanChoice = elaraChoices.find((choice) => choice.text.includes('Aodhan still lives'));
  const protectChoice = elaraChoices.find((choice) => choice.text.includes('move you before the hunters'));

  expect(stoneChoice.requires.itemId).toBe('stone_of_oblivion');
  expect(stoneChoice.effects).toContainEqual({ type: 'flag', flagId: 'elara_route_stone_hunt_declared', value: true });

  expect(aodhanChoice.requires.notFlag).toBe('aodhan_dead');
  expect(aodhanChoice.effects).toContainEqual({ type: 'flag', flagId: 'elara_route_aodhan_lured', value: true });

  expect(protectChoice.effects).toContainEqual({ type: 'flag', flagId: 'elara_route_protect', value: true });
});

test('thieves hideout travel resolves to the committed Elara route state', () => {
  expect(getHubSceneForLocation('thieves_hideout')).toBe('SCENE_THIEVES_HIDEOUT');

  gameState.flags.elara_route_protect = true;
  expect(getHubSceneForLocation('thieves_hideout')).toBe('SCENE_ELARA_PROTECT_ROUTE');

  gameState.flags = { elara_route_stone_hunt_declared: true };
  expect(getHubSceneForLocation('thieves_hideout')).toBe('SCENE_ELARA_STONE_ROUTE');

  gameState.flags = { elara_route_aodhan_lured: true };
  expect(getHubSceneForLocation('thieves_hideout')).toBe('SCENE_ELARA_BETRAY_ROUTE');
});

test('remaining late-route surfaces no longer collapse into pure map-bounce placeholders', () => {
  expect(scenes.SCENE_SOUL_MILL_APPROACH.choices.some((choice) => choice.action === 'openMap')).toBe(false);
  expect(scenes.SCENE_SOLASMOR_GATES.choices.some((choice) => choice.action === 'openMap')).toBe(false);
  expect(scenes.SCENE_THIEVES_HIDEOUT.choices.length).toBeGreaterThan(0);
});

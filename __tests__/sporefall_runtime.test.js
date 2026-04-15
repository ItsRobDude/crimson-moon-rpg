import { gameState, initializeNewGame, resetGameState } from '../data/gameState.js';
import { getRuntimeScene } from '../game.js';
import { scenes } from '../data/scenes.js';

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
});

test('sporefall arrival routes early perception success to eoin and failure to a short delay', () => {
  const scene = getRuntimeScene('SCENE_ARRIVAL_WHISPERWOOD');
  const searchChoice = scene.choices.find((choice) => choice.text.includes('survivors'));

  expect(searchChoice).toBeDefined();
  expect(searchChoice.type).toBe('skillCheck');
  expect(searchChoice.skill).toBe('perception');
  expect(searchChoice.dc).toBe(10);
  expect(searchChoice.nextSceneSuccess).toBe('SCENE_MEET_EOIN');
  expect(searchChoice.nextSceneFail).toBe('SCENE_SPOREFALL_STREET_SEARCH');
});

test('post-eoin sporefall hub exposes directional cathedral, house, and north routes', () => {
  gameState.flags.sporefall_eoin_met = true;
  gameState.flags.sporefall_eoin_talked = true;

  const scene = getRuntimeScene('SCENE_HUB_SPOREFALL');
  const labels = scene.choices.map((choice) => choice.text);

  expect(labels).toEqual(expect.arrayContaining([
    expect.stringContaining('west'),
    expect.stringContaining('east'),
    expect.stringContaining('north')
  ]));
});

test('shadowmire collapse now routes into blackout and Sporefall instead of the old immediate ruins path', () => {
  expect(scenes.SCENE_TRAVEL_SHADOWMIRE.choices[0].nextScene).toBe('SCENE_SHADOWMIRE_HAZE');
  expect(scenes.SCENE_SHADOWMIRE_HAZE.choices[0].nextScene).toBe('SCENE_SHADOWMIRE_DYING_BIRDS');
  expect(scenes.SCENE_SHADOWMIRE_HAZE.choices[1].nextScene).toBe('SCENE_SHADOWMIRE_DYING_BIRDS');
  expect(scenes.SCENE_SHADOWMIRE_DYING_BIRDS.choices[0].nextScene).toBe('SCENE_SPOREFALL_WAKE');
  expect(scenes.SCENE_SPOREFALL_WAKE.choices[0].nextSceneSuccess).toBe('SCENE_ARRIVAL_WHISPERWOOD');
});

test('revisiting Sporefall arrival after meeting Eoin returns to the hub instead of replaying first-contact flow', () => {
  gameState.flags.sporefall_eoin_met = true;

  const scene = getRuntimeScene('SCENE_ARRIVAL_WHISPERWOOD');
  const labels = scene.choices.map((choice) => choice.text);

  expect(labels).toEqual(expect.arrayContaining([
    expect.stringContaining('central street'),
    expect.stringContaining("Eoin's hiding place")
  ]));
  expect(labels.some((label) => label.includes('survivors'))).toBe(false);
});

test('cathedral clue search and overseer study rewards are revisit-safe', () => {
  let scene = getRuntimeScene('SCENE_SPOREFALL_CATHEDRAL_APPROACH');
  expect(scene.choices.some((choice) => choice.text.includes("courier's bag"))).toBe(true);

  gameState.flags.sporefall_cathedral_letter_found = true;
  scene = getRuntimeScene('SCENE_SPOREFALL_CATHEDRAL_APPROACH');
  expect(scene.choices.some((choice) => choice.text.includes("courier's bag"))).toBe(false);

  scene = getRuntimeScene('SCENE_SPOREFALL_OVERSEER_STUDY');
  expect(scene.choices.some((choice) => choice.text.includes('journal'))).toBe(true);
  expect(scene.choices.some((choice) => choice.text.includes('correspondence'))).toBe(true);
  expect(scene.choices.some((choice) => choice.text.includes('desk drawer'))).toBe(true);

  gameState.flags.sporefall_journal_found = true;
  gameState.flags.sporefall_letter_found = true;
  gameState.flags.sporefall_compass_found = true;
  scene = getRuntimeScene('SCENE_SPOREFALL_OVERSEER_STUDY');
  expect(scene.choices.some((choice) => choice.text.includes('journal'))).toBe(false);
  expect(scene.choices.some((choice) => choice.text.includes('correspondence'))).toBe(false);
  expect(scene.choices.some((choice) => choice.text.includes('desk drawer'))).toBe(false);
});

test('overseer door exposes the safe rune choice only after the trap hint is known', () => {
  let scene = getRuntimeScene('SCENE_SPOREFALL_OVERSEER_DOOR');
  expect(scene.choices.some((choice) => choice.text.includes('Wolf and Serpent'))).toBe(false);

  gameState.flags.sporefall_home_trap_hint = true;
  scene = getRuntimeScene('SCENE_SPOREFALL_OVERSEER_DOOR');
  expect(scene.choices.some((choice) => choice.text.includes('Wolf and Serpent'))).toBe(true);
});

test('north route discovery keeps the directional sandbox viable instead of dead-ending the act', () => {
  gameState.flags.sporefall_eoin_met = true;
  gameState.flags.sporefall_eoin_talked = true;
  gameState.flags.sporefall_north_route_open = true;

  const scene = getRuntimeScene('SCENE_HUB_SPOREFALL');
  expect(scene.choices.some((choice) => choice.text.includes('northern skip route'))).toBe(true);
});

test('Eoin dialogue reacts to discovered cathedral and north-side clues', () => {
  gameState.flags.sporefall_eoin_met = true;
  gameState.flags.sporefall_eoin_talked = true;
  gameState.flags.sporefall_cathedral_vision_seen = true;
  gameState.flags.sporefall_bridge_seen = true;

  const scene = getRuntimeScene('SCENE_EOIN_TALK');

  expect(scene.text).toContain("grip tightens");
  expect(scene.text).toContain("relieved and guilty");
});

test('legacy Eoin assistance no longer routes back into the old ruins prototype', () => {
  expect(scenes.SCENE_EOIN_ASSISTANCE.choices[0].nextScene).toBe('SCENE_HUB_SPOREFALL');
});

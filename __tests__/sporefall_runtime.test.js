import { addItem, gameState, initializeNewGame, resetGameState } from '../data/gameState.js';
import { addEffectToActor } from '../data/mechanics.js';
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

test('torchlight opens a stronger arrival read and Eoin only allows the symbolic ration comfort beat', () => {
  addEffectToActor(gameState.player, 'torchlight', {
    id: 'torchlight',
    name: 'Torchlight',
    durationType: 'time_slots',
    remaining: 1,
    modifiers: []
  });
  addItem('rations');
  addItem('antitoxin');
  addItem('healer_kit');

  let scene = getRuntimeScene('SCENE_ARRIVAL_WHISPERWOOD');
  expect(scene.choices.some((choice) => choice.text.includes('torch high'))).toBe(true);

  scene = getRuntimeScene('SCENE_MEET_EOIN');
  const labels = scene.choices.map((choice) => choice.text);
  expect(labels.some((label) => label.includes('ration'))).toBe(true);
  expect(labels.some((label) => label.includes('antitoxin'))).toBe(false);
  expect(labels.some((label) => label.includes('healer kit'))).toBe(false);
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
    expect.stringContaining("Eoin")
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

test('cathedral approach exposes a stone-reading clue pass for dwarven or mason-aware characters', () => {
  addItem('mason_tools');

  const scene = getRuntimeScene('SCENE_SPOREFALL_CATHEDRAL_APPROACH');
  const masonryChoice = scene.choices.find((choice) => choice.text.includes('cracked cathedral stone'));

  expect(masonryChoice).toBeDefined();
  expect(masonryChoice.toolAid?.toolId).toBe('mason_tools');
  expect(masonryChoice.traitAid?.traitId).toBe('stonecunning');
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

test('Aodhan clues now surface a route out of Sporefall toward the Moonwell path', () => {
  gameState.flags.sporefall_eoin_met = true;
  gameState.flags.sporefall_eoin_talked = true;
  gameState.flags.sporefall_cathedral_vision_seen = true;

  const scene = getRuntimeScene('SCENE_HUB_SPOREFALL');

  expect(scene.choices.some((choice) => choice.text.includes("follow Aodhan's trail toward Hushbriar"))).toBe(true);
});

test('Eoin dialogue reacts to discovered cathedral and north-side clues', () => {
  gameState.flags.sporefall_eoin_met = true;
  gameState.flags.sporefall_eoin_talked = true;
  gameState.flags.sporefall_cathedral_vision_seen = true;
  gameState.flags.sporefall_bridge_seen = true;

  const scene = getRuntimeScene('SCENE_EOIN_TALK');

  expect(scene.text).toContain("grips the broken spear");
  expect(scene.text).toContain("hopeful and sick");
});

test('Eoin comfort follow-up stays symbolic and never implies treatment or recovery', () => {
  gameState.flags.sporefall_eoin_met = true;
  gameState.flags.sporefall_eoin_talked = true;
  gameState.flags.sporefall_eoin_comforted = true;

  const talkScene = getRuntimeScene('SCENE_EOIN_TALK');
  const hubScene = getRuntimeScene('SCENE_HUB_SPOREFALL');
  const arrivalScene = getRuntimeScene('SCENE_ARRIVAL_WHISPERWOOD');

  expect(talkScene.text).toContain('untouched and useless');
  expect(talkScene.text).not.toContain('lighter now');
  expect(talkScene.text).not.toContain('breathing');
  expect(talkScene.text).not.toContain('meal');

  expect(hubScene.text).toContain('startled gratitude');
  expect(hubScene.text).not.toContain('meal in him');
  expect(hubScene.text).not.toContain('steadied enough');

  expect(arrivalScene.text).toContain('untouched ration beside Eoin');
  expect(arrivalScene.text).not.toContain('devour the ration');
  expect(arrivalScene.text).not.toContain('steadiness in his breath');
});

test('north approach exposes stonework reading and bridge investigation that fits Eoin lore', () => {
  let scene = getRuntimeScene('SCENE_SPOREFALL_NORTH_APPROACH');
  const markerChoice = scene.choices.find((choice) => choice.text.includes('bridgework'));

  expect(markerChoice).toBeDefined();
  expect(markerChoice.skill).toBe('history');
  expect(markerChoice.traitAid?.traitId).toBe('stonecunning');
  expect(markerChoice.toolAid?.toolId).toBe('mason_tools');

  scene = getRuntimeScene('SCENE_SPOREFALL_NORTH_BRIDGE');
  const descendChoice = scene.choices.find((choice) => choice.text.includes('follow the smell'));
  expect(descendChoice).toBeDefined();
  expect(descendChoice.itemAid?.itemId).toBe('rope');
  expect(descendChoice.statusAid?.statusId).toBe('torchlight');
  expect(descendChoice.onSuccess.effects).toEqual(expect.arrayContaining([
    expect.objectContaining({ type: 'flag', flagId: 'sporefall_bridge_body_seen', value: true })
  ]));
});

test('north approach offers avoid and delay routes instead of forcing the ambush path', () => {
  const scene = getRuntimeScene('SCENE_SPOREFALL_NORTH_APPROACH');
  const labels = scene.choices.map((choice) => choice.text);

  expect(labels).toEqual(expect.arrayContaining([
    expect.stringContaining('Slip through the stalls'),
    expect.stringContaining('Fall back for now')
  ]));

  const stealthAvoid = scene.choices.find((choice) => choice.text.includes('Slip through the stalls'));
  expect(stealthAvoid.type).toBe('skillCheck');
  expect(stealthAvoid.skill).toBe('stealth');
  expect(stealthAvoid.nextSceneSuccess).toBe('SCENE_SPOREFALL_NORTH_ROUTE_DISCOVERED');
  expect(stealthAvoid.nextSceneFail).toBe('SCENE_SPOREFALL_NORTH_AMBUSH');
});

test('Eoin mother dialogue turns sharper after the bridge body is found', () => {
  let scene = getRuntimeScene('SCENE_EOIN_MOTHER_TALK');
  expect(scene.text).not.toContain('under the north bridge');

  gameState.flags.sporefall_bridge_body_seen = true;
  scene = getRuntimeScene('SCENE_EOIN_MOTHER_TALK');

  expect(scene.text).toContain('north bridge');
  expect(scene.text).toContain('Whatever hope carried him this far does not die cleanly');
});

test('early Sporefall critical path does not surface Neala or Liobhan', () => {
  const earlySceneIds = [
    'SCENE_ARRIVAL_WHISPERWOOD',
    'SCENE_SPOREFALL_STREET_SEARCH',
    'SCENE_MEET_EOIN',
    'SCENE_EOIN_TALK',
    'SCENE_HUB_SPOREFALL',
    'SCENE_SPOREFALL_NORTH_APPROACH',
    'SCENE_SPOREFALL_NORTH_BRIDGE'
  ];

  earlySceneIds.forEach((sceneId) => {
    const scene = getRuntimeScene(sceneId);
    expect(scene.text).not.toContain('Neala');
    expect(scene.text).not.toContain('Liobhan');
    expect((scene.choices || []).some((choice) => choice.text.includes('Neala') || choice.text.includes('Liobhan'))).toBe(false);
  });
});

test('legacy Eoin assistance no longer routes back into the old ruins prototype', () => {
  expect(scenes.SCENE_EOIN_ASSISTANCE.choices[0].nextScene).toBe('SCENE_HUB_SPOREFALL');
});

test('Eoin authored dialogue no longer reads like a mature tactical helper', () => {
  expect(scenes.SCENE_MEET_EOIN.text).toContain('boy');
  expect(scenes.SCENE_EOIN_RECRUITED.text).toContain("Don't leave me here");
  expect(scenes.SCENE_EOIN_TALK.choices.some((choice) => choice.text.includes('mum'))).toBe(true);
  expect(scenes.SCENE_EOIN_TALK.choices.some((choice) => choice.text.includes('keep the borough from taking you blind'))).toBe(false);
});

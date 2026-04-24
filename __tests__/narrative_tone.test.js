import { gameState, initializeNewGame, resetGameState } from '../data/gameState.js';
import { scenes } from '../data/scenes.js';
import { getRuntimeScene } from '../game.js';

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

function freshState(mutator = null) {
  resetGameState();
  initializePlayer();
  if (mutator) mutator();
}

beforeEach(() => {
  freshState();
});

test('Silverthorn runtime scenes keep fear socially grounded instead of flattening into neutral hub text', () => {
  const hub = getRuntimeScene('SCENE_HUB_SILVERTHORN');
  const rumors = getRuntimeScene('SCENE_RUSTY_BLADE_RUMORS');
  const gate = getRuntimeScene('SCENE_SILVERTHORN_GATE_CAPTAIN');
  const hubChoices = hub.choices.map((choice) => choice.text);

  expect(hub.text).toContain('lowered voice');
  expect(hub.text).toContain('hurried prayer');
  expect(hubChoices).toContain('Read what fear has posted');
  expect(hubChoices).not.toContain('Visit Notice Board');
  expect(hubChoices).not.toContain('Continue');

  expect(rumors.text).toContain('too short of breath');
  expect(rumors.text).not.toContain('mysterious danger');

  expect(gate.text).toContain('two scarred fingers');
  expect(gate.text).toContain('fear can be outrun');
});

test('Shadowmire and Sporefall retain concrete bodily horror across runtime variants', () => {
  const quietMile = scenes.SCENE_SHADOWMIRE_QUIET_MILE;
  const birds = scenes.SCENE_SHADOWMIRE_DYING_BIRDS;
  const firstArrival = getRuntimeScene('SCENE_ARRIVAL_WHISPERWOOD');

  expect(quietMile.text).toContain('no fresh cart bells');
  expect(quietMile.text).toContain('The forest simply stops spending sound');
  expect(birds.text).toContain('sweet and rotten at once');
  expect(birds.text).toContain('your eyes begin to sting');
  expect(firstArrival.text).toContain('dragged fingertips');
  expect(firstArrival.text).toContain('mistake for existing');

  freshState(() => {
    gameState.flags.sporefall_eoin_met = true;
  });

  const revisitArrival = getRuntimeScene('SCENE_ARRIVAL_WHISPERWOOD');
  expect(revisitArrival.text).toContain('blood-washed');
  expect(revisitArrival.text).toContain("no one had time to close");
});

test('Eoin scenes keep a frightened young voice instead of maturing into a tactical helper', () => {
  const meet = scenes.SCENE_MEET_EOIN;
  const talk = scenes.SCENE_EOIN_TALK;
  const talkChoices = talk.choices.map((choice) => choice.text).join('\n');

  expect(meet.text).toContain('A boy no older than his early teens');
  expect(meet.text).toContain('broken spear');
  expect(talk.text).toContain('he and his mum slept under a bridge');
  expect(talk.text).toContain('moonlight finds too much of the wall through him');
  expect(`${talk.text}\n${talkChoices}`).not.toContain('tactical');
  expect(talkChoices).not.toContain('Form a plan with Eoin');
  expect(talkChoices).not.toContain('Assess the threat');
});

test('Moonwell, Hushbriar, and Elara material keep grief, dread, and hunted vulnerability visible', () => {
  const moonwell = scenes.SCENE_MOONWELL;
  const aodhan = scenes.SCENE_AODHAN_TALK;
  const fionnlagh = scenes.SCENE_FIONNLAGH_HUB;
  const elara = scenes.SCENE_ELARA_HIDEAWAY;
  const elaraChoices = elara.choices.map((choice) => choice.text);

  expect(moonwell.text).toContain('looks flayed open');
  expect(moonwell.text).toContain('Two small bodies wrapped in spider silk');
  expect(aodhan.text).toContain('fever-bright with exhaustion and fury');
  expect(aodhan.text).not.toContain('chosen one');

  expect(fionnlagh.text).toContain('expects to find a corpse where you are standing');
  expect(fionnlagh.text).toContain('Every hour here feels wrong before it even happens');

  expect(elara.text).toContain('drawn by hands too tired to trust their own lines');
  expect(elara.text).toContain('torn between dying for the world and running');
  expect(elaraChoices).not.toContain('Comfort Elara');
  expect(elaraChoices).not.toContain('Ask About Prophecy');
});

test('Cathal and Thalion stay distinct, wounded voices rather than clean lore exposition', () => {
  const cathal = scenes.SCENE_DURNHELM_CATHAL;
  const gatekeeper = scenes.SCENE_ARCHIVES_GATEKEEPER;
  const truth = scenes.SCENE_ARCHIVES_TRUTH_CHAMBER;

  expect(cathal.text).toContain('spits pink into the dirt');
  expect(cathal.text).toContain('swears at the sky');
  expect(cathal.text).not.toContain('According to legend');

  expect(gatekeeper.text).toContain('last keeper and longest penitent');
  expect(gatekeeper.text).toContain('convenient truth');
  expect(gatekeeper.text).not.toContain('Welcome, traveler');

  expect(truth.text).toContain('He gives it like testimony');
  expect(truth.text).toContain('that sentence bruise the air');
  expect(truth.text).not.toContain('As you know');
});

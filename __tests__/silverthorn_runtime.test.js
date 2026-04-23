import { gameState, initializeNewGame, resetGameState, setTimeline } from '../data/gameState.js';
import { getRuntimeScene } from '../game.js';
import { scenes } from '../data/scenes.js';

function initializePlayer() {
  initializeNewGame(
    'Mira',
    'human',
    'cleric',
    'acolyte',
    { STR: 12, DEX: 10, CON: 14, INT: 10, WIS: 15, CHA: 13 },
    ['medicine', 'religion'],
    []
  );
}

beforeEach(() => {
  resetGameState();
  initializePlayer();
});

test('temple counsel offers a one-time shared-mechanics ward before departure', () => {
  setTimeline(1, 'midday');

  const scene = getRuntimeScene('SCENE_SILVERTHORN_TEMPLE_COUNSEL');
  const wardChoice = scene.choices.find((choice) => choice.text.includes('Submit to the road ward'));

  expect(wardChoice).toBeDefined();
  expect(wardChoice.type).toBe('skillCheck');
  expect(wardChoice.skill).toBe('religion');
  expect(wardChoice.onSuccess.effects.some((effect) => effect.type === 'customEffect' && effect.id === 'dawnroad_ward')).toBe(true);
  expect(wardChoice.onSuccess.effects.some((effect) => effect.type === 'flag' && effect.flagId === 'silverthorn_temple_ward_taken')).toBe(true);

  gameState.flags.silverthorn_temple_ward_taken = true;

  const revisit = getRuntimeScene('SCENE_SILVERTHORN_TEMPLE_COUNSEL');
  expect(revisit.choices.some((choice) => choice.text.includes('Submit to the road ward'))).toBe(false);
});

test('gate captain route study is one-time and grants a mixed narrative-combat prep effect', () => {
  setTimeline(1, 'afternoon');

  const scene = getRuntimeScene('SCENE_SILVERTHORN_GATE_CAPTAIN');
  const routeChoice = scene.choices.find((choice) => choice.text.includes('Study the route marks'));

  expect(routeChoice).toBeDefined();
  expect(routeChoice.type).toBe('skillCheck');
  expect(routeChoice.skill).toBe('survival');
  expect(routeChoice.onSuccess.effects.some((effect) => effect.type === 'customEffect' && effect.id === 'roadwise_briefing')).toBe(true);
  expect(routeChoice.onSuccess.effects.some((effect) => effect.type === 'flag' && effect.flagId === 'silverthorn_gate_route_briefed')).toBe(true);

  const routeEffect = routeChoice.onSuccess.effects.find((effect) => effect.id === 'roadwise_briefing');
  expect(routeEffect.durationType).toBe('until_next_combat');
  expect(routeEffect.modifiers).toEqual(expect.arrayContaining([
    expect.objectContaining({ type: 'flat_bonus', target: 'skill_check', skill: 'perception', value: 2 }),
    expect.objectContaining({ type: 'flat_bonus', target: 'initiative', value: 1 })
  ]));

  gameState.flags.silverthorn_gate_route_briefed = true;

  const revisit = getRuntimeScene('SCENE_SILVERTHORN_GATE_CAPTAIN');
  expect(revisit.choices.some((choice) => choice.text.includes('Study the route marks'))).toBe(false);
});

test('Silverthorn rumor surfaces carry relic tension and the vanished-borough panic without spoiling the hidden truth', () => {
  setTimeline(1, 'afternoon');

  const rumors = getRuntimeScene('SCENE_RUSTY_BLADE_RUMORS');
  const notices = getRuntimeScene('SCENE_SILVERTHORN_NOTICE_WHISPERWOOD');
  const gateCaptain = getRuntimeScene('SCENE_SILVERTHORN_GATE_CAPTAIN');

  expect(rumors.text).toContain('Durnhelm');
  expect(rumors.text).toContain('relic');
  expect(rumors.text).toContain('Whisperwood');
  expect(rumors.text).toContain('patrols vanish');
  expect(rumors.text).not.toContain('Underdark');
  expect(rumors.text).not.toContain('Ciara');
  expect(rumors.text).not.toContain('hide the relic first');
  expect(rumors.text).not.toContain('left pieces of themselves');

  expect(notices.text).toContain('Whisperwood');
  expect(notices.text).toContain('eastern milestones');
  expect(notices.text).not.toContain('portal');
  expect(notices.text).not.toContain('ordinary means');
  expect(notices.text).not.toContain('taken whole');

  expect(gateCaptain.text).toContain('Durnhelm');
  expect(gateCaptain.text).toContain('Whisperwood');
  expect(gateCaptain.text).not.toContain('Liam');
  expect(gateCaptain.text).not.toContain('Whisperwood is gone');
  expect(gateCaptain.text).not.toContain('spores darken');
});

test('contracts notices no longer strand the player and instead push toward rumor follow-up or the eastern gate', () => {
  setTimeline(1, 'afternoon');

  const firstPass = getRuntimeScene('SCENE_SILVERTHORN_NOTICE_CONTRACTS');
  expect(firstPass.text).toContain('The Rusty Blade');
  expect(firstPass.choices).toEqual(expect.arrayContaining([
    expect.objectContaining({ nextScene: 'SCENE_RUSTY_BLADE_RUMORS', buttonText: 'Follow the Rumor' }),
    expect.objectContaining({ nextScene: 'SCENE_SILVERTHORN_GATES', buttonText: 'Head for the Gates' })
  ]));

  getRuntimeScene('SCENE_RUSTY_BLADE_RUMORS');

  const revisit = getRuntimeScene('SCENE_SILVERTHORN_NOTICE_CONTRACTS');
  expect(revisit.text).not.toContain('The talk keeps spilling toward The Rusty Blade.');
  expect(revisit.choices.some((choice) => choice.nextScene === 'SCENE_RUSTY_BLADE_RUMORS')).toBe(false);
  expect(revisit.choices.some((choice) => choice.nextScene === 'SCENE_SILVERTHORN_GATES')).toBe(true);
});

test('opening briefing restores Liam, Aodhan, and the cold mark without spilling later truth', () => {
  const briefing = scenes.SCENE_BRIEFING;
  const charge = scenes.SCENE_BRIEFING_2;
  const dismissal = scenes.SCENE_BRIEFING_DISMISSAL;

  expect(briefing.text).toContain("Liam's party");
  expect(charge.text).toContain('Aodhan O Duibh');
  expect(charge.text).toContain('cold enough to make you flinch');
  expect(dismissal.text).toContain('If Liam lives');

  expect(`${briefing.text}\n${charge.text}`).not.toContain('Ciara');
  expect(`${briefing.text}\n${charge.text}`).not.toContain('Underdark');
});

test('early plague descriptions follow the black dust and lung-first infection canon', () => {
  const haze = getRuntimeScene('SCENE_SHADOWMIRE_HAZE');
  const birds = getRuntimeScene('SCENE_SHADOWMIRE_DYING_BIRDS');
  const wake = getRuntimeScene('SCENE_SPOREFALL_WAKE');

  expect(haze.text).toContain('dark purple it reads black');
  expect(birds.text).toContain('black-purple dust');
  expect(birds.choices[0].failText).toContain('lungs seize');
  expect(birds.choices[0].failText).toContain('spit');
  expect(wake.text).toContain('Black-purple dust');
  expect(wake.text).not.toContain('blue-violet plants glow through the drifting spores');
});

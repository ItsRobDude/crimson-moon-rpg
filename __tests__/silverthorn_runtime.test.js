import { gameState, initializeNewGame, resetGameState, setTimeline } from '../data/gameState.js';
import { getRuntimeScene } from '../game.js';

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

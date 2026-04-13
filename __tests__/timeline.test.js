import { advanceTime, gameState, getTimelineLabel, resetGameState } from '../data/gameState.js';

beforeEach(() => {
  resetGameState();
});

test('new game timeline starts in the Silverthorn briefing window', () => {
  expect(getTimelineLabel()).toBe('Day 1 - Midday');
});

test('advancing time rolls from night into the next morning', () => {
  gameState.timeline.slot = 'night';
  const result = advanceTime(1);

  expect(result.current).toBe('Day 2 - Morning');
  expect(gameState.timeline.day).toBe(2);
  expect(gameState.timeline.slot).toBe('morning');
});

test('silverthorn actions increment the dedicated city counter', () => {
  advanceTime(2, { inSilverthorn: true });

  expect(gameState.timeline.actionCount).toBe(2);
  expect(gameState.timeline.silverthornActionCount).toBe(2);
});

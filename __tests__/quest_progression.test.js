import { quests } from '../data/quests.js';
import { scenes } from '../data/scenes.js';
import { gameState, initializeNewGame, resetGameState, updateQuestStage } from '../data/gameState.js';

beforeEach(() => {
  resetGameState();
});

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

test('investigate_whisperwood now defines canonical quest guidance through the processing reveal', () => {
  const stageKeys = Object.keys(quests.investigate_whisperwood.stages).map(Number);

  expect(stageKeys).toEqual(expect.arrayContaining([5, 6, 7, 8, 9, 10]));
  expect(quests.investigate_whisperwood.stages[5].thread).toBe('The Witness Trail North');
  expect(quests.investigate_whisperwood.stages[8].thread).toBe('Hushbriar Under Occupation');
  expect(quests.investigate_whisperwood.stages[10].text).toContain('processing');
});

test('quest stages expose sparse remembered leads instead of route checklists', () => {
  const stages = Object.values(quests.investigate_whisperwood.stages);

  stages.forEach((stage) => {
    expect(stage.leads).toBeDefined();
    expect(stage.leads).toHaveLength(1);
  });

  expect(quests.investigate_whisperwood.stages[1].leads[0]).toContain('rumor, prayer, supplies');
  expect(quests.investigate_whisperwood.stages[1].leads[0]).not.toContain('Rusty Blade');
  expect(quests.investigate_whisperwood.stages[10].leads[0]).toContain('not a clean route');
});

test('canonical mid and late route scenes now own the active whisperwood quest stages', () => {
  expect(scenes.SCENE_DURNHELM_GATES.onEnter.questUpdate).toEqual({ id: 'investigate_whisperwood', stage: 5 });
  expect(scenes.SCENE_LAMENT_HILL_APPROACH.onEnter.questUpdate).toEqual({ id: 'investigate_whisperwood', stage: 6 });
  expect(scenes.SCENE_ARCHIVES_APPROACH.onEnter.questUpdate).toEqual({ id: 'investigate_whisperwood', stage: 7 });
  expect(scenes.SCENE_ARRIVAL_HUSHBRIAR.onEnter.questUpdate).toEqual({ id: 'investigate_whisperwood', stage: 8 });
  expect(scenes.SCENE_HUSHBRIAR_AFTERMATH_HUNT.onEnter.questUpdate).toEqual({ id: 'investigate_whisperwood', stage: 9 });
  expect(scenes.SCENE_HUSHBRIAR_PROCESSING_REVELATION.onEnter.questUpdate).toEqual({ id: 'investigate_whisperwood', stage: 10 });
});

test('updateQuestStage never regresses the whisperwood quest on revisits', () => {
  initializePlayer();

  expect(updateQuestStage('investigate_whisperwood', 8)).toBe(true);
  expect(gameState.quests.investigate_whisperwood.currentStage).toBe(8);

  expect(updateQuestStage('investigate_whisperwood', 3)).toBe(false);
  expect(gameState.quests.investigate_whisperwood.currentStage).toBe(8);

  expect(updateQuestStage('investigate_whisperwood', 10)).toBe(true);
  expect(gameState.quests.investigate_whisperwood.currentStage).toBe(10);
  expect(gameState.quests.investigate_whisperwood.completed).toBe(false);
});

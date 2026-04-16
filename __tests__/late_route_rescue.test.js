import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { enemies } from '../data/enemies.js';
import { scenes } from '../data/scenes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const approvedFallback = 'portraits/npc_male_placeholder_portrait.png';

test('Durnhelm route now exposes an authored local loop instead of an immediate map bounce', () => {
  const gateChoices = scenes.SCENE_DURNHELM_GATES.choices;
  const entryChoices = scenes.SCENE_DURNHELM_ENTRY.choices;
  const forgeChoices = scenes.SCENE_DURNHELM_FORGE_APPROACH.choices;
  const cathalChoices = scenes.SCENE_DURNHELM_CATHAL.choices;

  expect(gateChoices.some((choice) => choice.nextScene === 'SCENE_DURNHELM_ENTRY')).toBe(true);
  expect(entryChoices.some((choice) => choice.nextScene === 'SCENE_DURNHELM_FORGE_APPROACH')).toBe(true);
  expect(entryChoices.some((choice) => choice.action === 'openMap')).toBe(false);
  expect(forgeChoices.some((choice) => choice.nextScene === 'SCENE_DURNHELM_CATHAL')).toBe(true);
  expect(cathalChoices.some((choice) => choice.nextScene === 'SCENE_LAMENT_HILL_APPROACH')).toBe(true);
});

test('early Hushbriar arrest flow no longer uses Neala and routes pressure into prison', () => {
  const earlySceneIds = [
    'SCENE_ARRIVAL_HUSHBRIAR',
    'SCENE_HUSHBRIAR_GATES',
    'SCENE_PRISON_CAPTURE',
    'SCENE_PRISON_CELL',
    'SCENE_PRISON_GUARD_RETURN'
  ];

  earlySceneIds.forEach((sceneId) => {
    const scene = scenes[sceneId];
    const combinedText = `${scene.text || ''}\n${(scene.choices || []).map((choice) => choice.text || '').join('\n')}`;

    expect(combinedText).not.toContain('Neala');
    expect(combinedText).not.toContain('Liobhan');
  });

  const gateChoices = scenes.SCENE_HUSHBRIAR_GATES.choices.filter((choice) => choice.type === 'skillCheck');
  gateChoices.forEach((choice) => {
    expect(choice.nextSceneFail).toBe('SCENE_PRISON_CAPTURE');
  });

  expect(scenes.SCENE_HUSHBRIAR_COMBAT_GUARDS.enemies).toEqual(['silverthorn_guard', 'silverthorn_guard']);
});

test('prison bribe path is a normal paid escape choice and lockpick failure stays local', () => {
  const prisonBribe = scenes.SCENE_PRISON_CELL.choices.find((choice) => choice.text.includes('50 gold'));
  const guardReturnBribe = scenes.SCENE_PRISON_GUARD_RETURN.choices.find((choice) => choice.text.includes('50 gold'));
  const lockpickChoice = scenes.SCENE_PRISON_CELL.choices.find((choice) => choice.type === 'skillCheck');

  expect(prisonBribe).toBeDefined();
  expect(prisonBribe.cost).toBe(50);
  expect(prisonBribe.nextScene).toBe('SCENE_PRISON_ESCAPE');
  expect(prisonBribe.action).toBeUndefined();

  expect(guardReturnBribe).toBeDefined();
  expect(guardReturnBribe.cost).toBe(50);
  expect(guardReturnBribe.nextScene).toBe('SCENE_PRISON_ESCAPE');
  expect(guardReturnBribe.action).toBeUndefined();

  expect(lockpickChoice.nextSceneFail).toBe('SCENE_PRISON_GUARD_RETURN');
  expect(lockpickChoice.nextSceneFail).not.toBe('SCENE_DEFEAT');
});

test('enemy portraits and runtime portrait fallbacks resolve to real files', () => {
  expect(fs.existsSync(path.join(projectRoot, approvedFallback))).toBe(true);

  Object.values(enemies).forEach((enemy) => {
    expect(fs.existsSync(path.join(projectRoot, enemy.portrait))).toBe(true);
  });

  const gameSource = fs.readFileSync(path.join(projectRoot, 'game.js'), 'utf8');
  const combatSource = fs.readFileSync(path.join(projectRoot, 'combat.js'), 'utf8');

  expect(gameSource).toContain(approvedFallback);
  expect(combatSource).toContain(approvedFallback);
  expect(gameSource).not.toContain('portraits/placeholder.png');
  expect(combatSource).not.toContain('portraits/placeholder.png');
});

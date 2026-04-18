import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { enemies } from '../data/enemies.js';
import { gameState, resetGameState } from '../data/gameState.js';
import { scenes } from '../data/scenes.js';
import { storySceneTriggers } from '../data/storyTimeline.js';
import { getRuntimeScene } from '../game.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const approvedFallback = 'portraits/npc_male_placeholder_portrait.png';

beforeEach(() => {
  resetGameState();
});

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
  expect(scenes.SCENE_DURNHELM_ENTRY.text).toContain('amber-eyed stranger');
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

test('Hushbriar town and inn keep the occupied dread through the Fionnlagh path', () => {
  expect(scenes.SCENE_HUSHBRIAR_TOWN.text).toContain('occupied more than governed');
  expect(scenes.SCENE_HUSHBRIAR_TOWN.text).toContain('sweet-rot stink');

  expect(scenes.SCENE_HUSHBRIAR_MARKET.text).toContain('sagging herbalist tent');
  expect(scenes.SCENE_HUSHBRIAR_MARKET.text).not.toBe('A few run-down shops are open: an herbalist tent, a library, and a provisioner.');

  expect(scenes.SCENE_BRIARWOOD_INN.text).toContain('refugees');
  expect(scenes.SCENE_BRIARWOOD_INN.text).toContain('pilgrims');
  expect(scenes.SCENE_BRIARWOOD_INN.text).not.toBe('The inn is crowded.');

  expect(scenes.SCENE_FIONNLAGH_HUB.text).toContain('Every hour here feels wrong before it even happens');
  expect(scenes.SCENE_FIONNLAGH_PLAGUE_INFO.text).toContain('black at the mouth');
  expect(scenes.SCENE_FIONNLAGH_CLAN_INFO.text).toContain('split along every old wound');
  expect(scenes.SCENE_HUSHBRIAR_CORRUPTED.choices.some((choice) => choice.action === 'openMap')).toBe(false);
});

test('Lament Hill now routes through authored scenes to Aine before unlocking the next threads', () => {
  const approachChoices = scenes.SCENE_LAMENT_HILL_APPROACH.choices;
  const visionChoices = scenes.SCENE_LAMENT_HILL_VISION.choices;
  const cottageChoices = scenes.SCENE_LAMENT_COTTAGE.choices;
  const signsChoices = scenes.SCENE_LAMENT_COTTAGE_SIGNS.choices;
  const catChoices = scenes.SCENE_LAMENT_CAT_DISCOVERY.choices;
  const gravesChoices = scenes.SCENE_LAMENT_GRAVES.choices;
  const accusationChoices = scenes.SCENE_LAMENT_AINE_ACCUSATION.choices;

  expect(approachChoices.some((choice) => choice.nextScene === 'SCENE_LAMENT_HILL_VISION')).toBe(true);
  expect(visionChoices.some((choice) => choice.nextScene === 'SCENE_LAMENT_COTTAGE')).toBe(true);
  expect(cottageChoices.some((choice) => choice.nextScene === 'SCENE_LAMENT_CAT_DISCOVERY')).toBe(true);
  expect(cottageChoices.some((choice) => choice.action === 'openMap')).toBe(false);
  expect(gravesChoices.some((choice) => choice.action === 'openMap')).toBe(false);
  expect(signsChoices.some((choice) => choice.nextScene === 'SCENE_LAMENT_AINE_ACCUSATION')).toBe(true);
  expect(catChoices.every((choice) => choice.nextScene === 'SCENE_LAMENT_AINE_ACCUSATION')).toBe(true);
  expect(accusationChoices.every((choice) => choice.nextScene === 'SCENE_LAMENT_AINE_REVEAL')).toBe(true);

  expect(storySceneTriggers.SCENE_LAMENT_COTTAGE.complete).toBeUndefined();
  expect(storySceneTriggers.SCENE_LAMENT_COTTAGE.unlock).toBeUndefined();
  expect(storySceneTriggers.SCENE_LAMENT_AINE_REVEAL.complete).toEqual(['lament_hill_thread']);
  expect(storySceneTriggers.SCENE_LAMENT_AINE_REVEAL.unlock).toEqual(['archives_truth', 'hushbriar_demigod_thread']);
});

test('late-game conversations preserve stronger distinct voices after the rewrite', () => {
  expect(scenes.SCENE_ARCHIVES_GATEKEEPER.text).toContain('last keeper and longest penitent');
  expect(scenes.SCENE_THIEVES_HIDEOUT.text).toContain('next sentence expensive');
  expect(scenes.SCENE_GUILD_BARGAIN.text).toContain("That's leverage");
  expect(scenes.SCENE_ELARA_HIDEAWAY.text).toContain('torn between dying for the world and running');
  expect(scenes.SCENE_DURNHELM_CATHAL.text).toContain('swears at the sky');
  expect(scenes.SCENE_ARCHIVES_TRUTH_CHAMBER.text).toContain('He gives it like testimony');
});

test('Sporefall street-search fail text stays in the same grim register', () => {
  const survivorSearch = scenes.SCENE_ARRIVAL_WHISPERWOOD.choices.find((choice) => choice.type === 'skillCheck');

  expect(survivorSearch.failText).toContain('cold mucus');
  expect(survivorSearch.failText).toContain('slow, dragging shift');
  expect(survivorSearch.failText).not.toContain('gross and slimy');
});

test('Moonwell route now hands off into the canonical Elara continuation instead of a hard dead stop', () => {
  expect(scenes.SCENE_INVESTIGATION.choices.some((choice) => choice.nextScene === 'SCENE_TRACKING_CHOLDRITHS')).toBe(true);
  expect(scenes.SCENE_INVESTIGATION.text).not.toContain('Neala');
  expect(scenes.SCENE_INVESTIGATION.text).not.toContain('Liobh');
  expect(scenes.SCENE_THIEVES_CONFRONTATION.choices[0].nextScene).toBe('SCENE_TRACKING_CHOLDRITHS');
  expect(scenes.SCENE_MOONWELL.text).toContain('world is darkening in earnest');
  expect(scenes.SCENE_AODHAN_TALK.text).toContain('The barrier around the borough has broken');
  expect(scenes.SCENE_AODHAN_TALK.text).toContain('Liam should have had more than this');
  expect(scenes.SCENE_AODHAN_COMBAT.enemies).toEqual(['aodhan']);
  expect(scenes.SCENE_AFTERMATH.choices).toEqual([
    expect.objectContaining({ nextScene: 'SCENE_HUSHBRIAR_AFTERMATH_HUNT' })
  ]);
  expect(scenes.SCENE_HUSHBRIAR_AFTERMATH_HUNT.text).toContain('the girl the town failed to hide');
  expect(scenes.SCENE_HUSHBRIAR_DOCK.choices.some((choice) => choice.nextScene === 'SCENE_THIEVES_HIDEOUT')).toBe(true);
  expect(scenes.SCENE_ELARA_HIDEAWAY.choices.some((choice) => choice.nextScene === 'SCENE_ELARA_COUNSEL')).toBe(true);
  expect(scenes.SCENE_ELARA_COUNSEL.text).toContain('The Stone between you has already made the air sound like judgment');
  expect(scenes.SCENE_HUSHBRIAR_PROCESSING_REVELATION.text).toContain('strong and healthy');
  expect(scenes.SCENE_HUSHBRIAR_PROCESSING_REVELATION.text).toContain('Soul Mill');
});

test('after meeting Fionnlagh, Hushbriar at night surfaces the missable Moonwell event and dawn consequence', () => {
  gameState.flags.hushbriar_fionnlagh_met = true;
  gameState.flags.moonwell_night_available = true;

  let scene = getRuntimeScene('SCENE_BRIARWOOD_INN');
  expect(scene.choices.some((choice) => choice.text.includes('follow the screams'))).toBe(true);
  expect(scene.choices.some((choice) => choice.text.includes('wait for dawn'))).toBe(true);

  scene = getRuntimeScene('SCENE_HUSHBRIAR_TOWN');
  expect(scene.choices.some((choice) => choice.text.includes('Follow the screaming'))).toBe(true);

  expect(scenes.SCENE_HUSHBRIAR_MORNING_SETUP.onEnter.effects).toEqual(expect.arrayContaining([
    expect.objectContaining({ type: 'flag', flagId: 'moonwell_missed', value: true }),
    expect.objectContaining({ type: 'flag', flagId: 'moonwell_morning_setup_seen', value: true })
  ]));
  expect(scenes.SCENE_HUSHBRIAR_MORNING_SETUP.text).toContain('three directions at once');
  expect(scenes.SCENE_HUSHBRIAR_MORNING_SETUP.text).toContain('woman he thinks the town is hiding');
  expect(scenes.SCENE_HUSHBRIAR_MORNING_SETUP.choices.some((choice) => choice.text.includes('Briarwood'))).toBe(false);
  expect(scenes.SCENE_HUSHBRIAR_MORNING_SETUP.choices.every((choice) => {
    if (choice.type === 'skillCheck') {
      return choice.nextSceneSuccess === 'SCENE_MOONWELL' && choice.nextSceneFail === 'SCENE_MOONWELL';
    }
    return choice.nextScene === 'SCENE_MOONWELL';
  })).toBe(true);
});

test('morning-after runtime keeps the panic on Aodhan and the nearby intervention path', () => {
  gameState.flags.moonwell_morning_setup_seen = true;

  const town = getRuntimeScene('SCENE_HUSHBRIAR_TOWN');
  const inn = getRuntimeScene('SCENE_BRIARWOOD_INN');

  expect(town.text).toContain('Aodhan turned guards and guild alike into obstacles');
  expect(inn.text).toContain('shattered doors');
  expect(inn.text).toContain('guild blades');
});

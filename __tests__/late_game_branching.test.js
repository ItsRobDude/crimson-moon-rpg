import { gameState, resetGameState } from '../data/gameState.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scenes } from '../data/scenes.js';
import { storySceneTriggers } from '../data/storyTimeline.js';
import { getHubSceneForLocation } from '../game.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const routeStatusNote = fs.readFileSync(path.join(__dirname, '..', 'notes', 'campaign_route_status.md'), 'utf8');
const solasmorPacket = fs.readFileSync(path.join(__dirname, '..', 'notes', 'route_packets', 'solasmor_route.md'), 'utf8');
const soulMillPacket = fs.readFileSync(path.join(__dirname, '..', 'notes', 'route_packets', 'soul_mill_route.md'), 'utf8');
const elaraPacket = fs.readFileSync(path.join(__dirname, '..', 'notes', 'route_packets', 'elara_future_branch.md'), 'utf8');

beforeEach(() => {
  resetGameState();
  gameState.flags = {};
});

test('Aine now points directly into authored Archives and canonical Hushbriar arrival routes', () => {
  const aineChoices = scenes.SCENE_LAMENT_AINE_REVEAL.choices;

  expect(aineChoices.some((choice) => choice.nextScene === 'SCENE_ARCHIVES_APPROACH')).toBe(true);
  expect(aineChoices.some((choice) => choice.nextScene === 'SCENE_ARRIVAL_HUSHBRIAR')).toBe(true);
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
  const aldericChoice = audienceChoices.find((choice) => choice.text.includes('forbidden counsel'));
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

test('Hushbriar now opens on the canonical town route and the post-Moonwell continuation is authored', () => {
  expect(getHubSceneForLocation('hushbriar')).toBe('SCENE_HUSHBRIAR_TOWN');
  expect(scenes.SCENE_ARRIVAL_HUSHBRIAR.choices.some((choice) => choice.nextScene === 'SCENE_HUSHBRIAR_GATES')).toBe(true);
  expect(scenes.SCENE_MOONWELL_AMBIENT.choices.some((choice) => choice.nextScene === 'SCENE_HUSHBRIAR_TOWN')).toBe(true);
  expect(scenes.SCENE_THIEVES_HIDEOUT_CONTACT.choices.some((choice) => choice.nextScene === 'SCENE_ELARA_HIDEAWAY')).toBe(false);
  expect(scenes.SCENE_AFTERMATH.choices.some((choice) => choice.nextScene === 'SCENE_HUSHBRIAR_AFTERMATH_HUNT')).toBe(true);
  expect(scenes.SCENE_HUSHBRIAR_LEDGER.onEnter.effects).toContainEqual({ type: 'flag', flagId: 'hushbriar_guild_ledger_found', value: true });
  expect(scenes.SCENE_ELARA_HIDEAWAY.onEnter.effects).toContainEqual({ type: 'flag', flagId: 'elara_met', value: true });
  expect(scenes.SCENE_ELARA_COUNSEL.choices.some((choice) => choice.nextScene === 'SCENE_ELARA_STONE_DECISION')).toBe(true);
  expect(scenes.SCENE_HUSHBRIAR_AFTERMATH_HUNT.background).not.toBe('landscapes/silverthorn_market_avenue.png');
  expect(scenes.SCENE_ELARA_STONE_DECISION.background).not.toBe('landscapes/silverthorn_market_avenue.png');
});

test('Elara route now converges on a stone decision or an Aodhan-still-holds-the-stone warning', () => {
  const elaraChoices = scenes.SCENE_ELARA_HIDEAWAY.choices;
  const stoneChoice = elaraChoices.find((choice) => choice.text.includes('I have the Stone'));
  const aodhanChoice = elaraChoices.find((choice) => choice.text.includes('Aodhan still carries the Stone'));
  const counselChoices = scenes.SCENE_ELARA_COUNSEL.choices;
  const stoneDecisionChoices = scenes.SCENE_ELARA_STONE_DECISION.choices;
  const warningChoices = scenes.SCENE_ELARA_AODHAN_WARNING.choices;
  const refusalChoices = scenes.SCENE_GUILD_REFUSAL.choices;
  const breachChoices = scenes.SCENE_HIDEOUT_BREACH_APPROACH.choices;

  expect(stoneChoice.requires.itemId).toBe('stone_of_oblivion');
  expect(aodhanChoice.requires.notFlag).toBe('aodhan_dead');
  expect(counselChoices[0].nextScene).toBe('SCENE_ELARA_STONE_DECISION');
  expect(refusalChoices.every((choice) => choice.nextScene === 'SCENE_HIDEOUT_BREACH_APPROACH')).toBe(true);
  expect(breachChoices.every((choice) => {
    if (choice.type === 'skillCheck') {
      return choice.nextSceneSuccess === 'SCENE_ELARA_HIDEAWAY' && choice.nextSceneFail === 'SCENE_ELARA_HIDEAWAY';
    }
    return false;
  })).toBe(true);

  expect(stoneDecisionChoices[0].effects).toContainEqual({ type: 'flag', flagId: 'elara_choice_spared', value: true });
  expect(stoneDecisionChoices[1].effects).toContainEqual({ type: 'flag', flagId: 'elara_choice_sacrifice_declared', value: true });
  expect(warningChoices[0].effects).toContainEqual({ type: 'flag', flagId: 'elara_choice_deferred_by_aodhan', value: true });
});

test('hidden or under-authored late routes do not resolve as direct map hubs', () => {
  expect(getHubSceneForLocation('thieves_hideout')).toBeNull();
  expect(getHubSceneForLocation('soul_mill')).toBeNull();
  expect(getHubSceneForLocation('solasmor')).toBeNull();
});

test('Silverthorn hub resolution hard-closes to the eastern gate after the watch turns hostile', () => {
  gameState.flags.silverthorn_watch_hostile = true;
  expect(getHubSceneForLocation('silverthorn')).toBe('SCENE_SILVERTHORN_GATES');
});

test('canonical late-route surfaces stay authored while deleted holdfast and teaser scenes stay out of the live scene map', () => {
  expect(scenes.SCENE_THIEVES_HIDEOUT.choices.length).toBeGreaterThan(0);
  expect(scenes.SCENE_HUSHBRIAR_PROCESSING_REVELATION.choices).toEqual([
    expect.objectContaining({ action: 'showStartMenu' })
  ]);
  expect(scenes.SCENE_ELARA_PROTECT_ROUTE).toBeUndefined();
  expect(scenes.SCENE_SOUL_MILL_APPROACH).toBeUndefined();
  expect(scenes.SCENE_SOLASMOR_APPROACH).toBeUndefined();
});

test('route-status note documents the new canonical continuation, aligned alternate, and dormant future branches', () => {
  [
    'silverthorn_sporefall_opening',
    'durnhelm_relic_lead',
    'lament_hill_truth',
    'archives_truth_branch',
    'hushbriar_moonwell_spine',
    'hushbriar_elara_resolution',
    'hushbriar_hideout_hostile_access',
    'elara_holdfast_loop',
    'solasmor_late_teaser',
    'soul_mill_processing_route'
  ].forEach((routeId) => {
    expect(routeStatusNote).toContain(`\`${routeId}\``);
  });

  expect(routeStatusNote).toContain('`retired`');
  expect(routeStatusNote).toContain('`dormant`');
  expect(routeStatusNote).toContain('`alternate_aligned`');
  expect(routeStatusNote).toContain('notes/route_packets/solasmor_route.md');
  expect(routeStatusNote).toContain('notes/route_packets/soul_mill_route.md');
  expect(routeStatusNote).toContain('notes/route_packets/elara_future_branch.md');

  expect(storySceneTriggers.SCENE_DURNHELM_GATES.activate).toEqual(['durnhelm_thread']);
  expect(storySceneTriggers.SCENE_LAMENT_AINE_REVEAL.unlock).toEqual(['archives_truth', 'hushbriar_demigod_thread']);
  expect(storySceneTriggers.SCENE_ARRIVAL_HUSHBRIAR.activate).toEqual(['hushbriar_demigod_thread']);
  expect(storySceneTriggers.SCENE_AFTERMATH.unlock).toEqual(['hushbriar_elara_resolution']);
  expect(storySceneTriggers.SCENE_HUSHBRIAR_AFTERMATH_HUNT.activate).toEqual(['hushbriar_elara_resolution']);
  expect(storySceneTriggers.SCENE_THIEVES_HIDEOUT).toBeUndefined();
  expect(storySceneTriggers.SCENE_ELARA_HIDEAWAY.activate).toEqual(['hushbriar_elara_resolution']);
  expect(storySceneTriggers.SCENE_HUSHBRIAR_PROCESSING_REVELATION.complete).toEqual(['hushbriar_elara_resolution']);
});

test('dormant and retired late routes have design packets with status and completion targets', () => {
  [
    solasmorPacket,
    soulMillPacket,
    elaraPacket
  ].forEach((packet) => {
    expect(packet).toContain('Route status:');
    expect(packet).toContain('Completion target:');
    expect(packet).toContain('Allowed entry beat:');
    expect(packet).toContain('Named NPC rules:');
    expect(packet).toContain('## Required Before Promotion');
  });

  expect(solasmorPacket).toContain('Route status: `dormant`');
  expect(solasmorPacket).toContain('Allowed cities: `Solasmor`');
  expect(soulMillPacket).toContain('Route status: `dormant`');
  expect(soulMillPacket).toContain('Allowed cities: `Hushbriar`, `Soul Mill`');
  expect(elaraPacket).toContain('Route status: `alternate_aligned`');
  expect(elaraPacket).toContain('`Elara`, `Neala`, and `Liobhan`');
});

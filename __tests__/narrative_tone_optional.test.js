import { initializeNewGame, resetGameState } from '../data/gameState.js';
import { scenes } from '../data/scenes.js';
import { travelEvents } from '../data/travelEvents.js';
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

test('Silverthorn support scenes keep pressure and scarcity instead of reading like neutral service nodes', () => {
  const market = getRuntimeScene('SCENE_SILVERTHORN_MARKET');
  const store = getRuntimeScene('SCENE_SILVERTHORN_GENERAL_STORE');
  const blacksmith = getRuntimeScene('SCENE_SILVERTHORN_BLACKSMITH');
  const inn = getRuntimeScene('SCENE_RUSTY_BLADE_INN');
  const prayer = getRuntimeScene('SCENE_SILVERTHORN_TEMPLE_PRAYER');

  expect(market.text).toContain('anxious places are loud');
  expect(market.text).toContain('trying not to discuss the eastern road too loudly');
  expect(store.text).toContain('ration limits');
  expect(store.text).toContain('last handful of coin');
  expect(store.text).not.toContain('adventurers always wish they had packed sooner');
  expect(blacksmith.text).toContain('worked too hard to close');
  expect(blacksmith.text).toContain('triage');
  expect(inn.text).toContain('one bad rumor away from turning into a war room');
  expect(inn.text).toContain('dangerous news arrives disguised as conversation');
  expect(prayer.text).toContain('run out of cleaner defenses');
  expect(prayer.text).toContain('smaller room to echo in');
  expect(prayer.text).not.toContain('path you have chosen');
});

test('Silverthorn support runtime keeps civic strain visible across notices, gates, and quarantine beats', () => {
  const board = getRuntimeScene('SCENE_SILVERTHORN_NOTICE_BOARD');
  const contracts = getRuntimeScene('SCENE_SILVERTHORN_NOTICE_CONTRACTS');
  const gates = getRuntimeScene('SCENE_SILVERTHORN_GATES');
  const quarantine = getRuntimeScene('SCENE_SILVERTHORN_QUARANTINE');

  expect(board.text).toContain('trying to understand events faster than the crown can contain them');
  expect(contracts.text).toContain('Curfew fines');
  expect(contracts.text).toContain('larger than one vanished borough');
  expect(gates.text).toContain('inspected twice');
  expect(gates.text).toContain('learned suspicion');
  expect(quarantine.text).toContain('burn pits');
  expect(quarantine.text).toContain('bodies are being destroyed');
});

test('secondary Sporefall support scenes preserve contaminated movement and damaged-space discovery', () => {
  const streetSearch = getRuntimeScene('SCENE_SPOREFALL_STREET_SEARCH');
  const aloneAgain = getRuntimeScene('SCENE_ALONE_AGAIN');
  const study = getRuntimeScene('SCENE_SPOREFALL_OVERSEER_STUDY');
  const journal = getRuntimeScene('SCENE_SPOREFALL_OVERSEER_JOURNAL');
  const letter = getRuntimeScene('SCENE_SPOREFALL_OVERSEER_CORRESPONDENCE');
  const drawer = getRuntimeScene('SCENE_SPOREFALL_OVERSEER_DRAWER');
  const cathedral = getRuntimeScene('SCENE_SPOREFALL_CATHEDRAL_APPROACH');
  const northRoute = getRuntimeScene('SCENE_SPOREFALL_NORTH_ROUTE_DISCOVERED');

  expect(streetSearch.text).toContain('brown smear');
  expect(streetSearch.text).toContain('too late');
  expect(aloneAgain.text).toContain('desperation keeps dragging him back');
  expect(study.text).toContain('too important to carry or too painful to destroy');
  expect(journal.text).toContain('clear enough to wound');
  expect(letter.text).toContain('trust waiting to be betrayed');
  expect(drawer.text).toContain('grief-laden place');
  expect(cathedral.text).toContain('blackened corpse');
  expect(northRoute.text).toContain('trading understanding for speed');
});

test('optional evasion and support-route scenes stay tonally serious beyond the central horror set pieces', () => {
  const skirt = scenes.SCENE_SKIRT_BEAST;
  const durnhelmMarket = scenes.SCENE_DURNHELM_MARKET_RUINS;
  const screams = scenes.SCENE_HUSHBRIAR_SCREAMS;
  const guildRoad = scenes.SCENE_HUSHBRIAR_GUILD_ROAD;
  const dock = scenes.SCENE_HUSHBRIAR_DOCK;
  const ledger = scenes.SCENE_HUSHBRIAR_LEDGER;

  expect(skirt.text).toContain('opened grave');
  expect(skirt.text).toContain('permission borrowed');
  expect(skirt.text).not.toContain('The spores glow faintly on your cloak');
  expect(durnhelmMarket.text).toContain('keeper clearly not among the living');
  expect(screams.text).toContain('wet drag');
  expect(guildRoad.text).toContain('healthy enough to carry blame');
  expect(dock.text).toContain('river rot mingles with lamp oil');
  expect(ledger.text).toContain('hurried, angry, and afraid');
});

test('archives support scenes and travel events keep the wider world morally costly and hunted', () => {
  const approach = scenes.SCENE_ARCHIVES_APPROACH;
  const cavern = scenes.SCENE_ARCHIVES_CAVERN;
  const audience = scenes.SCENE_ARCHIVES_AUDIENCE;
  const warning = scenes.SCENE_ARCHIVES_AODHAN_WARNING;
  const aftermath = scenes.SCENE_ARCHIVES_AFTERMATH;
  const eventText = travelEvents.map((event) => event.text).join('\n');

  expect(approach.text).toContain('dark listening back');
  expect(cavern.text).toContain('cemetery that cannot possibly fit inside the hill');
  expect(audience.text).toContain('confession by the drop');
  expect(warning.text).toContain('slower cruelty');
  expect(aftermath.text).toContain('not as rumor but as obligation');
  expect(eventText).toContain("child's shoe");
  expect(eventText).toContain('armed quiet');
  expect(eventText).toContain('smugglers or mourners');
});

import { addEffectToActor, canActorTargetActor, canApplyEffectToActor, createDefaultMechanicsState, effectHasDataFlag, getApproachBlockedSourceIds, getBonusSkillChoiceCount, getBonusToolChoiceCount, getDerivedActorState, getEffectModifiers, removeEffectsFromActorBySource, setProficiencyMultiplier, tickActorEffects } from '../data/mechanics.js';
import { syncActorState } from '../data/gameState.js';
import { spells } from '../data/spells.js';
import { getSkillBonus } from '../rules.js';

function createActor(overrides = {}) {
  return {
    name: 'Test Hero',
    classId: 'rogue',
    level: 4,
    proficiencyBonus: 2,
    abilities: { STR: 10, DEX: 14, CON: 12, INT: 10, WIS: 10, CHA: 15 },
    modifiers: { STR: 0, DEX: 2, CON: 1, INT: 0, WIS: 0, CHA: 2 },
    skills: ['persuasion'],
    equipped: {},
    statusEffects: [],
    mechanics: createDefaultMechanicsState(
      { STR: 10, DEX: 14, CON: 12, INT: 10, WIS: 10, CHA: 15 },
      { saveProficiencies: ['DEX', 'INT'], baseSpeed: 30 }
    ),
    ...overrides
  };
}

test('derived state keeps base, permanent, and temporary ability layers separate', () => {
  const actor = createActor();
  actor.mechanics.permanentAbilityBonuses.STR = 2;

  addEffectToActor(actor, 'ogre_strength', {
    name: 'Ogre Strength',
    durationType: 'turns',
    remaining: 2,
    modifiers: [
      { type: 'ability_bonus', ability: 'STR', value: 1 }
    ]
  });

  const snapshot = getDerivedActorState(actor);

  expect(snapshot.abilities.STR).toBe(13);
  expect(snapshot.breakdowns.abilities.STR).toEqual({
    base: 10,
    permanent: 2,
    temporary: 1,
    total: 13
  });
});

test('skill bonuses include persistent effect modifiers and social penalties', () => {
  const actor = createActor();

  addEffectToActor(actor, 'poisoned');
  addEffectToActor(actor, 'courtly_blessing', {
    name: 'Courtly Blessing',
    durationType: 'scenes',
    remaining: 1,
    modifiers: [
      { type: 'flat_bonus', target: 'skill_check', skill: 'persuasion', value: 2 }
    ]
  });

  const result = getSkillBonus(actor, 'persuasion');

  expect(result.bonus).toBe(6);
  expect(result.effectModifiers.flat).toBe(2);
  expect(result.effectModifiers.disadvantage).toBe(true);
});

test('expertise doubles proficiency on trained skills', () => {
  const actor = createActor({
    skills: ['stealth'],
    proficiencies: {
      skills: ['stealth'],
      saves: [],
      weapons: [],
      armor: [],
      tools: [],
      languages: []
    }
  });
  setProficiencyMultiplier(actor, 'skills', 'stealth', 2);

  const result = getSkillBonus(actor, 'stealth');

  expect(result.bonus).toBe(6);
});

test('Alert adds five to initiative through the shared feat layer', () => {
  const actor = createActor({ feats: ['alert'] });

  expect(getDerivedActorState(actor).initiativeModifier).toBe(7);
});

test('Resilient adds the chosen save proficiency and ability score through the shared feat layer', () => {
  const actor = createActor({ feats: ['resilient:WIS'] });
  const snapshot = getDerivedActorState(actor);

  expect(snapshot.abilities.WIS).toBe(11);
  expect(snapshot.proficiencies.saves).toContain('WIS');
});

test('Tough reapplies from saved feat state when actor sync runs', () => {
  const actor = createActor({
    level: 4,
    hp: 16,
    maxHp: 16,
    maxHpBase: 16,
    feats: ['tough']
  });

  syncActorState(actor);

  expect(actor.maxHp).toBe(24);
  expect(actor.hp).toBe(24);
});

test('tile-bound effects can be removed cleanly when the actor leaves the tile', () => {
  const actor = createActor();

  addEffectToActor(actor, 'burning', {
    source: 'tile:2,3:burning_ground'
  });

  expect(actor.mechanics.activeEffects).toHaveLength(1);
  removeEffectsFromActorBySource(actor, 'tile:2,3:burning_ground');
  expect(actor.mechanics.activeEffects).toHaveLength(0);
});

test('derived state exposes unified proficiencies and racial senses/resistances', () => {
  const actor = createActor({
    raceId: 'dwarf',
    proficiencies: {
      skills: ['athletics', 'insight'],
      saves: ['CON', 'WIS'],
      weapons: ['simple', 'martial'],
      armor: ['light', 'medium'],
      tools: ['smith_tools'],
      languages: ['Common', 'Dwarvish']
    }
  });

  actor.mechanics.proficiencies = { ...actor.proficiencies };
  const snapshot = getDerivedActorState(actor);

  expect(snapshot.proficiencies.skills).toContain('athletics');
  expect(snapshot.proficiencies.tools).toContain('smith_tools');
  expect(snapshot.senses.darkvision).toBe(60);
  expect(snapshot.resistances).toContain('poison');
});

test('racial trait handlers feed contextual save modifiers', () => {
  const actor = createActor({ raceId: 'elf' });

  const charmSaveModifiers = getEffectModifiers(actor, {
    target: 'saving_throw',
    ability: 'WIS',
    tags: ['charm']
  });

  expect(charmSaveModifiers.advantage).toBe(true);
});

test('versatile humans expose an extra skill choice hook', () => {
  expect(getBonusSkillChoiceCount('human')).toBe(1);
});

test('stonecunning exposes a dwarf tool choice hook', () => {
  expect(getBonusToolChoiceCount('dwarf')).toBe(1);
});

test('mage armor uses an AC formula, allows shields, and expires on long rest', () => {
  const actor = createActor({
    classId: 'wizard',
    equipped: { armor: null, shield: 'shield', weapon: null }
  });

  const applied = addEffectToActor(actor, spells.mage_armor.effect.id, {
    id: spells.mage_armor.effect.id,
    name: spells.mage_armor.effect.name,
    durationType: spells.mage_armor.effect.durationType,
    remaining: spells.mage_armor.effect.remaining,
    modifiers: spells.mage_armor.effect.modifiers
  });

  expect(applied).not.toBeNull();
  expect(getDerivedActorState(actor).ac).toBe(17);

  tickActorEffects(actor, 'scene_change');
  expect(actor.mechanics.activeEffects.some((effect) => effect.id === 'mage_armor')).toBe(true);

  tickActorEffects(actor, 'long_rest');
  expect(actor.mechanics.activeEffects.some((effect) => effect.id === 'mage_armor')).toBe(false);
});

test('mage armor cannot apply to an armored target', () => {
  const actor = createActor({
    classId: 'wizard',
    equipped: { armor: 'leather_armor', shield: null, weapon: null }
  });

  expect(canApplyEffectToActor(actor, spells.mage_armor.effect.id, {
    id: spells.mage_armor.effect.id,
    name: spells.mage_armor.effect.name,
    durationType: spells.mage_armor.effect.durationType,
    remaining: spells.mage_armor.effect.remaining,
    modifiers: spells.mage_armor.effect.modifiers
  })).toBe(false);

  expect(addEffectToActor(actor, spells.mage_armor.effect.id, {
    id: spells.mage_armor.effect.id,
    name: spells.mage_armor.effect.name,
    durationType: spells.mage_armor.effect.durationType,
    remaining: spells.mage_armor.effect.remaining,
    modifiers: spells.mage_armor.effect.modifiers
  })).toBeNull();
});

test('magical sleep immunity is enforced through shared effect eligibility', () => {
  const elf = createActor({ raceId: 'elf' });
  const human = createActor({ raceId: 'human' });

  expect(canApplyEffectToActor(elf, 'unconscious', { applicationTags: ['magical_sleep'] })).toBe(false);
  expect(addEffectToActor(elf, 'unconscious', { applicationTags: ['magical_sleep'] })).toBeNull();

  expect(canApplyEffectToActor(human, 'unconscious', { applicationTags: ['magical_sleep'] })).toBe(true);
  expect(addEffectToActor(human, 'unconscious', { applicationTags: ['magical_sleep'] })).not.toBeNull();
});

test('turn-based effects decrement on turn end rather than turn start and end', () => {
  const actor = createActor();

  addEffectToActor(actor, 'burning', {
    remaining: 2,
    durationType: 'turns'
  });

  tickActorEffects(actor, 'turn_start');
  expect(actor.mechanics.activeEffects.find((effect) => effect.id === 'burning')?.remaining).toBe(2);

  tickActorEffects(actor, 'turn_end');
  expect(actor.mechanics.activeEffects.find((effect) => effect.id === 'burning')?.remaining).toBe(1);
});

test('prone exposes incoming melee advantage and incoming ranged disadvantage through the shared effect layer', () => {
  const actor = createActor();
  addEffectToActor(actor, 'prone');

  const meleeIncoming = getEffectModifiers(actor, {
    target: 'incoming_attack_roll',
    tags: ['melee_attack']
  });
  const rangedIncoming = getEffectModifiers(actor, {
    target: 'incoming_attack_roll',
    tags: ['ranged_attack']
  });

  expect(meleeIncoming.advantage).toBe(true);
  expect(rangedIncoming.disadvantage).toBe(true);
});

test('prone now halves speed instead of collapsing movement entirely', () => {
  const actor = createActor();
  addEffectToActor(actor, 'prone');

  expect(getDerivedActorState(actor).speed).toBe(15);
});

test('higher exhaustion tiers collapse speed and eventually lock the actor down', () => {
  const actor = createActor();
  addEffectToActor(actor, 'exhausted_4');

  let snapshot = getDerivedActorState(actor);
  let saveModifiers = getEffectModifiers(actor, { target: 'saving_throw', ability: 'CON' });
  expect(snapshot.speed).toBe(0);
  expect(saveModifiers.disadvantage).toBe(true);

  addEffectToActor(actor, 'exhausted_6');
  snapshot = getDerivedActorState(actor);
  const incoming = getEffectModifiers(actor, { target: 'incoming_attack_roll', tags: ['melee_attack'] });

  expect(snapshot.speed).toBe(0);
  expect(effectHasDataFlag(actor, 'actionLocked')).toBe(true);
  expect(effectHasDataFlag(actor, 'reactionLocked')).toBe(true);
  expect(effectHasDataFlag(actor, 'incomingMeleeAttacksCritical')).toBe(true);
  expect(incoming.advantage).toBe(true);
});

test('charmed blocks hostile targeting only against the source actor', () => {
  const actor = createActor();

  addEffectToActor(actor, 'charmed', {
    source: 'spell:tempter',
    sourceActorId: 'tempter'
  });

  expect(canActorTargetActor(actor, 'tempter', { harmful: true })).toBe(false);
  expect(canActorTargetActor(actor, 'someone_else', { harmful: true })).toBe(true);
});

test('frightened exposes its blocked source for movement logic', () => {
  const actor = createActor();

  addEffectToActor(actor, 'frightened', {
    source: 'aura:shade',
    sourceActorId: 'shade'
  });

  expect(getApproachBlockedSourceIds(actor)).toContain('shade');
});

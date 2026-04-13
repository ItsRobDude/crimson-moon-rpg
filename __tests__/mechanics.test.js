import { addEffectToActor, createDefaultMechanicsState, getDerivedActorState, removeEffectsFromActorBySource } from '../data/mechanics.js';
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

test('tile-bound effects can be removed cleanly when the actor leaves the tile', () => {
  const actor = createActor();

  addEffectToActor(actor, 'burning', {
    source: 'tile:2,3:burning_ground'
  });

  expect(actor.mechanics.activeEffects).toHaveLength(1);
  removeEffectsFromActorBySource(actor, 'tile:2,3:burning_ground');
  expect(actor.mechanics.activeEffects).toHaveLength(0);
});

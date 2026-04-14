import { items } from './items.js';
import { races } from './races.js';
import { classes } from './classes.js';

export const ABILITY_KEYS = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

export const CLASS_SAVE_PROFICIENCIES = {
    fighter: ['STR', 'CON'],
    rogue: ['DEX', 'INT'],
    wizard: ['INT', 'WIS'],
    cleric: ['WIS', 'CHA']
};

export const SKILL_TO_ABILITY = {
    acrobatics: 'DEX',
    animal_handling: 'WIS',
    arcana: 'INT',
    athletics: 'STR',
    deception: 'CHA',
    history: 'INT',
    insight: 'WIS',
    intimidation: 'CHA',
    investigation: 'INT',
    medicine: 'WIS',
    nature: 'INT',
    perception: 'WIS',
    performance: 'CHA',
    persuasion: 'CHA',
    religion: 'INT',
    sleight_of_hand: 'DEX',
    stealth: 'DEX',
    survival: 'WIS'
};

export const SOCIAL_SKILLS = ['deception', 'insight', 'intimidation', 'performance', 'persuasion'];

export const traitDefinitions = {
    versatile: {
        id: 'versatile',
        name: 'Versatile',
        description: 'Humans adapt quickly and bring an extra trained skill into danger.',
        bonusSkillChoices: 1
    },
    darkvision: {
        id: 'darkvision',
        name: 'Darkvision',
        description: 'You can see in darkness out to 60 feet.',
        senses: { darkvision: 60 }
    },
    fey_ancestry: {
        id: 'fey_ancestry',
        name: 'Fey Ancestry',
        description: 'Advantage on saves against being charmed, and magic can\'t put you to sleep.',
        modifiers: [
            { type: 'advantage', target: 'saving_throw', tags: ['charm'] }
        ],
        conditionImmunities: ['magical_sleep']
    },
    dwarven_resilience: {
        id: 'dwarven_resilience',
        name: 'Dwarven Resilience',
        description: 'Advantage on saving throws against poison, and resistance to poison damage.',
        modifiers: [
            { type: 'advantage', target: 'saving_throw', tags: ['poison'] }
        ],
        damageResistances: ['poison']
    }
};

export const PROFICIENCY_KEYS = ['skills', 'saves', 'weapons', 'armor', 'tools', 'languages'];

export function createProficiencyState(seed = {}) {
    return {
        skills: [...new Set((seed.skills || []).map((skill) => String(skill).toLowerCase()))],
        saves: [...new Set((seed.saves || []).map((save) => String(save).toUpperCase()))],
        weapons: [...new Set(seed.weapons || [])],
        armor: [...new Set(seed.armor || [])],
        tools: [...new Set(seed.tools || [])],
        languages: [...new Set(seed.languages || [])]
    };
}

export function mergeProficiencyStates(...states) {
    const merged = createProficiencyState();
    states.filter(Boolean).forEach((state) => {
        PROFICIENCY_KEYS.forEach((key) => {
            merged[key] = [...new Set([...(merged[key] || []), ...((state[key] || []))])];
        });
    });
    return merged;
}

export function getTraitDefinition(traitId) {
    return traitDefinitions[traitId] || null;
}

export function getRaceTraitDefinitions(raceId) {
    const race = races[raceId];
    if (!race?.traits) return [];
    return race.traits.map(getTraitDefinition).filter(Boolean);
}

export function getBonusSkillChoiceCount(raceId) {
    return getRaceTraitDefinitions(raceId).reduce((sum, trait) => sum + (trait.bonusSkillChoices || 0), 0);
}

export const effectDefinitions = {
    poisoned: {
        id: 'poisoned',
        name: 'Poisoned',
        description: 'Disadvantage on attack rolls and ability checks.',
        durationType: 'turns',
        defaultDuration: 3,
        modifiers: [
            { type: 'disadvantage', target: 'attack_roll' },
            { type: 'disadvantage', target: 'ability_check' }
        ]
    },
    blessed: {
        id: 'blessed',
        name: 'Blessed',
        description: 'Add 1d4 to attack rolls and saving throws.',
        durationType: 'turns',
        defaultDuration: 5,
        modifiers: [
            { type: 'dice_bonus', target: 'attack_roll', dice: '1d4' },
            { type: 'dice_bonus', target: 'saving_throw', dice: '1d4' }
        ]
    },
    spore_sickness: {
        id: 'spore_sickness',
        name: 'Spore Sickness',
        description: 'Disadvantage on Constitution checks and social pressure due to coughing and fatigue.',
        durationType: 'turns',
        defaultDuration: 10,
        modifiers: [
            { type: 'disadvantage', target: 'ability_check', ability: 'CON' },
            { type: 'disadvantage', target: 'skill_check', tags: ['social'] }
        ]
    },
    frightened: {
        id: 'frightened',
        name: 'Frightened',
        description: 'Disadvantage on attacks and social rolls while fear grips the actor.',
        durationType: 'turns',
        defaultDuration: 3,
        modifiers: [
            { type: 'disadvantage', target: 'attack_roll' },
            { type: 'disadvantage', target: 'skill_check', tags: ['social'] }
        ]
    },
    charmed: {
        id: 'charmed',
        name: 'Charmed',
        description: 'The actor is socially compromised by magical influence.',
        durationType: 'turns',
        defaultDuration: 3,
        modifiers: [
            { type: 'disadvantage', target: 'skill_check', tags: ['social'] }
        ]
    },
    burning: {
        id: 'burning',
        name: 'Burning',
        description: 'Open flame singes and distracts the actor.',
        durationType: 'turns',
        defaultDuration: 2,
        modifiers: [
            { type: 'disadvantage', target: 'ability_check', ability: 'DEX' },
            { type: 'flat_bonus', target: 'speed', value: -5 }
        ]
    },
    exhausted_1: {
        id: 'exhausted_1',
        name: 'Exhaustion I',
        description: 'Disadvantage on ability checks.',
        durationType: 'rests',
        defaultDuration: 1,
        modifiers: [
            { type: 'disadvantage', target: 'ability_check' }
        ]
    },
    exhausted_2: {
        id: 'exhausted_2',
        name: 'Exhaustion II',
        description: 'Speed halved and disadvantage on ability checks.',
        durationType: 'rests',
        defaultDuration: 1,
        modifiers: [
            { type: 'disadvantage', target: 'ability_check' },
            { type: 'multiplier', target: 'speed', value: 0.5 }
        ]
    }
};

export function getAbilityMod(score) {
    return Math.floor((score - 10) / 2);
}

export function getProficiencyBonus(level = 1) {
    return Math.ceil(1 + (level / 4));
}

export function createDefaultMechanicsState(baseAbilities = null, options = {}) {
    const abilitySeed = baseAbilities || {
        STR: 10,
        DEX: 10,
        CON: 10,
        INT: 10,
        WIS: 10,
        CHA: 10
    };

    return {
        baseAbilities: { ...abilitySeed },
        permanentAbilityBonuses: { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 },
        permanentStatBonuses: {
            ac: 0,
            speed: 0,
            initiative: 0,
            spellSaveDC: 0,
            attack: 0,
            damage: 0
        },
        baseSpeed: options.baseSpeed || 30,
        size: options.size || 'medium',
        saveProficiencies: [...(options.saveProficiencies || [])],
        proficiencies: createProficiencyState(options.proficiencies || { saves: options.saveProficiencies || [] }),
        activeEffects: [],
        concentrationEffectId: null,
        temporaryHp: options.temporaryHp || 0,
        bonusTraits: [...(options.bonusTraits || [])]
    };
}

export function ensureActorMechanics(actor, options = {}) {
    if (!actor) return null;

    if (!actor.mechanics) {
        actor.mechanics = createDefaultMechanicsState(actor.abilities, options);
    }

    if (!actor.mechanics.baseAbilities) {
        actor.mechanics.baseAbilities = { ...actor.abilities };
    }
    if (!actor.mechanics.permanentAbilityBonuses) {
        actor.mechanics.permanentAbilityBonuses = { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 };
    }
    if (!actor.mechanics.permanentStatBonuses) {
        actor.mechanics.permanentStatBonuses = { ac: 0, speed: 0, initiative: 0, spellSaveDC: 0, attack: 0, damage: 0 };
    }
    if (!actor.mechanics.activeEffects) {
        actor.mechanics.activeEffects = [];
    }
    if (!actor.mechanics.proficiencies) {
        actor.mechanics.proficiencies = createProficiencyState(actor.proficiencies || { saves: actor.mechanics.saveProficiencies || [] });
    } else {
        actor.mechanics.proficiencies = createProficiencyState(mergeProficiencyStates(actor.proficiencies || {}, actor.mechanics.proficiencies));
    }
    if (!actor.mechanics.saveProficiencies || actor.mechanics.saveProficiencies.length === 0) {
        const fallback = CLASS_SAVE_PROFICIENCIES[actor.classId] || [];
        actor.mechanics.saveProficiencies = [...fallback];
    }
    actor.mechanics.proficiencies.skills = [...new Set([
        ...(actor.mechanics.proficiencies.skills || []),
        ...((actor.skills || []).map((skill) => String(skill).toLowerCase()))
    ])];
    if (actor.classId) {
        const cls = classes[actor.classId];
        actor.mechanics.proficiencies.weapons = [...new Set([
            ...(actor.mechanics.proficiencies.weapons || []),
            ...((actor.proficiencies?.weapons || [])),
            ...((cls?.weaponProficiencies || []))
        ])];
        actor.mechanics.proficiencies.armor = [...new Set([
            ...(actor.mechanics.proficiencies.armor || []),
            ...((actor.proficiencies?.armor || [])),
            ...((cls?.armorProficiencies || []))
        ])];
    }
    actor.mechanics.proficiencies.saves = [...new Set([
        ...(actor.mechanics.proficiencies.saves || []),
        ...(actor.mechanics.saveProficiencies || [])
    ])];
    if (!actor.mechanics.baseSpeed) {
        actor.mechanics.baseSpeed = options.baseSpeed || actor.speed || 30;
    }
    if (!actor.mechanics.bonusTraits) {
        actor.mechanics.bonusTraits = [];
    }

    if (!actor.statusEffects) {
        actor.statusEffects = [];
    }

    syncLegacyStatusEffects(actor);
    return actor;
}

export function getActorTraitDefinitions(actor) {
    ensureActorMechanics(actor);
    const racialTraits = getRaceTraitDefinitions(actor.raceId);
    const bonusTraits = (actor.mechanics.bonusTraits || []).map(getTraitDefinition).filter(Boolean);
    const traitMap = new Map();
    [...racialTraits, ...bonusTraits].forEach((trait) => {
        traitMap.set(trait.id, trait);
    });
    return [...traitMap.values()];
}

export function syncLegacyStatusEffects(actor) {
    if (!actor || !actor.mechanics) return;
    actor.statusEffects = actor.mechanics.activeEffects.map(effect => ({
        id: effect.id,
        remaining: effect.remaining,
        source: effect.source || null
    }));
}

export function createEffectInstance(effectId, overrides = {}) {
    const definition = effectDefinitions[effectId];
    if (!definition && !overrides.modifiers) return null;

    return {
        id: overrides.id || effectId || 'custom_effect',
        source: overrides.source || null,
        remaining: overrides.remaining ?? definition?.defaultDuration ?? null,
        durationType: overrides.durationType || definition?.durationType || 'turns',
        concentration: overrides.concentration ?? !!definition?.concentration,
        modifiers: overrides.modifiers || definition?.modifiers || [],
        data: overrides.data || {},
        name: overrides.name || definition?.name || 'Custom Effect'
    };
}

export function addEffectToActor(actor, effectId, overrides = {}) {
    ensureActorMechanics(actor);
    const instance = createEffectInstance(effectId, overrides);
    if (!instance) return null;

    const existing = actor.mechanics.activeEffects.find(effect => effect.id === effectId && effect.source === instance.source);
    if (existing) {
        if (instance.remaining !== null) {
            existing.remaining = Math.max(existing.remaining ?? 0, instance.remaining);
        }
        syncLegacyStatusEffects(actor);
        applyDerivedState(actor);
        return existing;
    }

    if (instance.concentration) {
        actor.mechanics.concentrationEffectId = effectId;
    }

    actor.mechanics.activeEffects.push(instance);
    syncLegacyStatusEffects(actor);
    applyDerivedState(actor);
    return instance;
}

export function removeEffectFromActor(actor, effectId) {
    ensureActorMechanics(actor);
    actor.mechanics.activeEffects = actor.mechanics.activeEffects.filter(effect => effect.id !== effectId);
    if (actor.mechanics.concentrationEffectId === effectId) {
        actor.mechanics.concentrationEffectId = null;
    }
    syncLegacyStatusEffects(actor);
    applyDerivedState(actor);
}

export function removeEffectsFromActorBySource(actor, source, exact = true) {
    ensureActorMechanics(actor);
    actor.mechanics.activeEffects = actor.mechanics.activeEffects.filter(effect => {
        if (!effect.source) return true;
        if (exact) return effect.source !== source;
        return !String(effect.source).startsWith(source);
    });
    if (actor.mechanics.concentrationEffectId && !actor.mechanics.activeEffects.some(effect => effect.id === actor.mechanics.concentrationEffectId)) {
        actor.mechanics.concentrationEffectId = null;
    }
    syncLegacyStatusEffects(actor);
    applyDerivedState(actor);
}

export function tickActorEffects(actor, trigger = 'turn_end') {
    ensureActorMechanics(actor);

    actor.mechanics.activeEffects = actor.mechanics.activeEffects.filter(effect => {
        if (effect.remaining === null || effect.remaining === undefined) return true;

        if (effect.durationType === 'turns' && (trigger === 'turn_end' || trigger === 'turn_start')) {
            effect.remaining -= 1;
        } else if (effect.durationType === 'scenes' && trigger === 'scene_change') {
            effect.remaining -= 1;
        } else if (effect.durationType === 'rests' && (trigger === 'short_rest' || trigger === 'long_rest')) {
            effect.remaining -= 1;
        }

        return effect.remaining > 0;
    });

    syncLegacyStatusEffects(actor);
    applyDerivedState(actor);
}

function modifierApplies(modifier, context) {
    if (!modifier) return false;
    if (modifier.target && modifier.target !== context.target) {
        if (!(modifier.target === 'ability_check' && context.target === 'skill_check')) {
            return false;
        }
    }
    if (modifier.ability && modifier.ability !== context.ability) return false;
    if (modifier.skill && modifier.skill !== context.skill) return false;
    if (modifier.tags && modifier.tags.length > 0) {
        const contextTags = context.tags || [];
        if (!modifier.tags.some(tag => contextTags.includes(tag))) return false;
    }
    return true;
}

export function getEffectModifiers(actor, context = {}) {
    ensureActorMechanics(actor);
    const result = {
        flat: 0,
        dice: [],
        multipliers: [],
        advantage: false,
        disadvantage: false,
        notes: []
    };

    actor.mechanics.activeEffects.forEach(effect => {
        (effect.modifiers || []).forEach(modifier => {
            if (!modifierApplies(modifier, context)) return;

            if (modifier.type === 'flat_bonus') {
                result.flat += modifier.value || 0;
                result.notes.push(`${effect.name}: ${modifier.value >= 0 ? '+' : ''}${modifier.value}`);
            } else if (modifier.type === 'dice_bonus' && modifier.dice) {
                result.dice.push(modifier.dice);
                result.notes.push(`${effect.name}: ${modifier.dice}`);
            } else if (modifier.type === 'advantage') {
                result.advantage = true;
                result.notes.push(`${effect.name}: advantage`);
            } else if (modifier.type === 'disadvantage') {
                result.disadvantage = true;
                result.notes.push(`${effect.name}: disadvantage`);
            } else if (modifier.type === 'multiplier') {
                result.multipliers.push(modifier.value || 1);
                result.notes.push(`${effect.name}: x${modifier.value}`);
            }
        });
    });

    getActorTraitDefinitions(actor).forEach((trait) => {
        (trait.modifiers || []).forEach((modifier) => {
            if (!modifierApplies(modifier, context)) return;

            if (modifier.type === 'flat_bonus') {
                result.flat += modifier.value || 0;
                result.notes.push(`${trait.name}: ${modifier.value >= 0 ? '+' : ''}${modifier.value}`);
            } else if (modifier.type === 'dice_bonus' && modifier.dice) {
                result.dice.push(modifier.dice);
                result.notes.push(`${trait.name}: ${modifier.dice}`);
            } else if (modifier.type === 'advantage') {
                result.advantage = true;
                result.notes.push(`${trait.name}: advantage`);
            } else if (modifier.type === 'disadvantage') {
                result.disadvantage = true;
                result.notes.push(`${trait.name}: disadvantage`);
            } else if (modifier.type === 'multiplier') {
                result.multipliers.push(modifier.value || 1);
                result.notes.push(`${trait.name}: x${modifier.value}`);
            }
        });
    });

    return result;
}

export function getAbilityScore(actor, ability) {
    ensureActorMechanics(actor);
    const base = actor.mechanics.baseAbilities[ability] ?? actor.abilities?.[ability] ?? 10;
    const permanent = actor.mechanics.permanentAbilityBonuses[ability] || 0;
    const temporary = actor.mechanics.activeEffects.reduce((sum, effect) => {
        return sum + (effect.modifiers || []).reduce((inner, modifier) => {
            if (modifier.type === 'ability_bonus' && modifier.ability === ability) {
                return inner + (modifier.value || 0);
            }
            return inner;
        }, 0);
    }, 0);

    return base + permanent + temporary;
}

export function getDerivedActorState(actor) {
    ensureActorMechanics(actor);
    const traits = getActorTraitDefinitions(actor);

    const abilities = {};
    const modifiers = {};
    const abilityBreakdown = {};

    ABILITY_KEYS.forEach((ability) => {
        const base = actor.mechanics.baseAbilities[ability] ?? actor.abilities?.[ability] ?? 10;
        const permanent = actor.mechanics.permanentAbilityBonuses[ability] || 0;
        const temporary = actor.mechanics.activeEffects.reduce((sum, effect) => {
            return sum + (effect.modifiers || []).reduce((inner, modifier) => {
                if (modifier.type === 'ability_bonus' && modifier.ability === ability) {
                    return inner + (modifier.value || 0);
                }
                return inner;
            }, 0);
        }, 0);

        abilities[ability] = base + permanent + temporary;
        modifiers[ability] = getAbilityMod(abilities[ability]);
        abilityBreakdown[ability] = { base, permanent, temporary, total: abilities[ability] };
    });

    const proficiencyBonus = actor.proficiencyBonus || getProficiencyBonus(actor.level || 1);
    const speedContext = getEffectModifiers(actor, { target: 'speed' });
    let speed = (actor.mechanics.baseSpeed || actor.speed || 30) + (actor.mechanics.permanentStatBonuses.speed || 0) + speedContext.flat;
    speedContext.multipliers.forEach(multiplier => {
        speed = Math.max(0, Math.floor(speed * multiplier));
    });

    let ac = 10 + modifiers.DEX;
    const armor = actor.equipped?.armor ? items[actor.equipped.armor] : null;
    if (armor) {
        ac = armor.acBase;
        if (armor.modifiers?.ac) {
            ac += armor.modifiers.ac;
        }
    }
    const acContext = getEffectModifiers(actor, { target: 'ac' });
    ac += (actor.mechanics.permanentStatBonuses.ac || 0) + acContext.flat;

    const initiativeContext = getEffectModifiers(actor, { target: 'initiative' });
    const initiativeModifier = modifiers.DEX + (actor.mechanics.permanentStatBonuses.initiative || 0) + initiativeContext.flat;

    const spellcastingAbility = getSpellcastingAbility(actor.classId);
    const spellSaveDC = 8 + proficiencyBonus + modifiers[spellcastingAbility] + (actor.mechanics.permanentStatBonuses.spellSaveDC || 0);
    const senses = {};
    const damageResistances = [];
    const conditionImmunities = [];

    traits.forEach((trait) => {
        Object.entries(trait.senses || {}).forEach(([sense, distance]) => {
            senses[sense] = Math.max(senses[sense] || 0, distance);
        });
        (trait.damageResistances || []).forEach((resistance) => {
            if (!damageResistances.includes(resistance)) damageResistances.push(resistance);
        });
        (trait.conditionImmunities || []).forEach((condition) => {
            if (!conditionImmunities.includes(condition)) conditionImmunities.push(condition);
        });
    });

    return {
        abilities,
        modifiers,
        proficiencyBonus,
        proficiencies: createProficiencyState(actor.mechanics.proficiencies),
        traits: traits.map((trait) => ({ id: trait.id, name: trait.name, description: trait.description })),
        senses,
        speed,
        ac,
        initiativeModifier,
        spellcastingAbility,
        spellSaveDC,
        resistances: damageResistances,
        conditionImmunities,
        conditions: actor.mechanics.activeEffects.map(effect => effect.id),
        temporaryHp: actor.mechanics.temporaryHp || 0,
        breakdowns: {
            abilities: abilityBreakdown,
            ac: {
                armor: armor ? armor.name : 'Unarmored',
                total: ac
            },
            speed: {
                base: actor.mechanics.baseSpeed || actor.speed || 30,
                total: speed
            },
            spellSaveDC
        }
    };
}

export function applyDerivedState(actor) {
    const derived = getDerivedActorState(actor);
    actor.abilities = { ...derived.abilities };
    actor.modifiers = { ...derived.modifiers };
    actor.proficiencyBonus = derived.proficiencyBonus;
    actor.proficiencies = createProficiencyState(derived.proficiencies);
    actor.traits = [...derived.traits];
    actor.senses = { ...derived.senses };
    actor.resistances = [...derived.resistances];
    actor.conditionImmunities = [...derived.conditionImmunities];
    actor.speed = derived.speed;
    return derived;
}

export function getSkillAbility(skillName) {
    return SKILL_TO_ABILITY[skillName] || 'DEX';
}

export function getSkillTags(skillName) {
    const tags = [];
    if (SOCIAL_SKILLS.includes(skillName)) tags.push('social');
    if (skillName === 'stealth') tags.push('stealth');
    if (skillName === 'perception' || skillName === 'investigation' || skillName === 'insight') tags.push('awareness');
    return tags;
}

export function getSpellcastingAbility(classId) {
    if (classId === 'cleric') return 'WIS';
    if (classId === 'wizard') return 'INT';
    return 'INT';
}

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
    keen_senses: {
        id: 'keen_senses',
        name: 'Keen Senses',
        description: 'You have proficiency in the Perception skill.',
        proficiencies: {
            skills: ['perception']
        }
    },
    trance: {
        id: 'trance',
        name: 'Trance',
        description: 'Elves rest through a meditative trance rather than normal sleep.'
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
    },
    dwarven_combat_training: {
        id: 'dwarven_combat_training',
        name: 'Dwarven Combat Training',
        description: 'You are practiced with a few traditional dwarven weapons.',
        proficiencies: {
            weapons: ['battleaxe', 'handaxe', 'light_hammer', 'warhammer']
        }
    },
    stonecunning: {
        id: 'stonecunning',
        name: 'Stonecunning',
        description: 'You have a practiced eye for stonework and artisan tools.',
        bonusToolChoices: 1,
        toolChoices: ['smith_tools', 'brewer_supplies', 'mason_tools']
    },
    fighting_style_defense: {
        id: 'fighting_style_defense',
        name: 'Defense Fighting Style',
        description: 'While you wear armor, you gain a +1 bonus to AC.',
        modifiers: [
            { type: 'flat_bonus', target: 'ac', value: 1, tags: ['armored'] }
        ]
    },
    fighting_style_dueling: {
        id: 'fighting_style_dueling',
        name: 'Dueling Fighting Style',
        description: 'You gain a +2 bonus to damage rolls with a single one-handed melee weapon.',
        modifiers: [
            { type: 'flat_bonus', target: 'damage_roll', value: 2, tags: ['melee_weapon', 'one_handed'] }
        ]
    },
    fighting_style_archery: {
        id: 'fighting_style_archery',
        name: 'Archery Fighting Style',
        description: 'You gain a +2 bonus to attack rolls you make with ranged weapons.',
        modifiers: [
            { type: 'flat_bonus', target: 'attack_roll', value: 2, tags: ['ranged_weapon'] }
        ]
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

export function getBonusToolChoiceCount(raceId) {
    return getRaceTraitDefinitions(raceId).reduce((sum, trait) => sum + (trait.bonusToolChoices || 0), 0);
}

export function getBonusToolChoiceOptions(raceId) {
    return [...new Set(
        getRaceTraitDefinitions(raceId).flatMap((trait) => trait.toolChoices || [])
    )];
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
        description: 'Disadvantage on attacks and checks while fear grips the actor, and the actor resists moving closer to the source of fear.',
        durationType: 'turns',
        defaultDuration: 3,
        modifiers: [
            { type: 'disadvantage', target: 'attack_roll' },
            { type: 'disadvantage', target: 'ability_check' },
            { type: 'disadvantage', target: 'skill_check' }
        ],
        data: {
            blocksApproachToSource: true
        }
    },
    charmed: {
        id: 'charmed',
        name: 'Charmed',
        description: 'The actor is socially compromised by magical influence and cannot turn hostile intent against the charmer.',
        durationType: 'turns',
        defaultDuration: 3,
        modifiers: [
            { type: 'disadvantage', target: 'skill_check', tags: ['social'] },
            { type: 'disadvantage', target: 'skill_check', skill: 'insight' }
        ],
        data: {
            preventHostileActionsAgainstSource: true
        }
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
    prone: {
        id: 'prone',
        name: 'Prone',
        description: 'The actor is sprawled on the ground.',
        durationType: 'turns',
        defaultDuration: 1,
        modifiers: [
            { type: 'disadvantage', target: 'attack_roll' },
            { type: 'multiplier', target: 'speed', value: 0.5 },
            { type: 'advantage', target: 'incoming_attack_roll', tags: ['melee_attack'] },
            { type: 'disadvantage', target: 'incoming_attack_roll', tags: ['ranged_attack'] }
        ],
        data: {
            combatLocked: false
        }
    },
    incapacitated: {
        id: 'incapacitated',
        name: 'Incapacitated',
        description: 'The actor cannot take actions or reactions.',
        durationType: 'turns',
        defaultDuration: 1,
        modifiers: [],
        data: {
            actionLocked: true,
            reactionLocked: true
        }
    },
    restrained: {
        id: 'restrained',
        name: 'Restrained',
        description: 'The actor is bound or hindered and struggles to move.',
        durationType: 'turns',
        defaultDuration: 2,
        modifiers: [
            { type: 'disadvantage', target: 'attack_roll' },
            { type: 'multiplier', target: 'speed', value: 0 },
            { type: 'disadvantage', target: 'saving_throw', ability: 'DEX' },
            { type: 'advantage', target: 'incoming_attack_roll' }
        ]
    },
    grappled: {
        id: 'grappled',
        name: 'Grappled',
        description: 'The actor is held in place and movement is reduced to zero.',
        durationType: 'turns',
        defaultDuration: 2,
        modifiers: [
            { type: 'multiplier', target: 'speed', value: 0 }
        ],
        data: {
            maintainedBySource: true
        }
    },
    blinded: {
        id: 'blinded',
        name: 'Blinded',
        description: 'The actor cannot see and struggles to aim or react.',
        durationType: 'turns',
        defaultDuration: 2,
        modifiers: [
            { type: 'disadvantage', target: 'attack_roll' },
            { type: 'disadvantage', target: 'ability_check', tags: ['awareness'] },
            { type: 'disadvantage', target: 'skill_check', tags: ['awareness'] },
            { type: 'advantage', target: 'incoming_attack_roll' }
        ]
    },
    deafened: {
        id: 'deafened',
        name: 'Deafened',
        description: 'The actor cannot hear and has trouble reacting to warnings.',
        durationType: 'scenes',
        defaultDuration: 1,
        modifiers: [
            { type: 'disadvantage', target: 'ability_check', tags: ['awareness'] }
        ]
    },
    unconscious: {
        id: 'unconscious',
        name: 'Unconscious',
        description: 'The actor is unconscious and unable to act.',
        durationType: 'turns',
        defaultDuration: 2,
        modifiers: [
            { type: 'multiplier', target: 'speed', value: 0 },
            { type: 'advantage', target: 'incoming_attack_roll' },
            { type: 'disadvantage', target: 'saving_throw', ability: 'STR' },
            { type: 'disadvantage', target: 'saving_throw', ability: 'DEX' }
        ],
        data: {
            actionLocked: true,
            reactionLocked: true,
            incomingMeleeAttacksCritical: true
        }
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
    },
    exhausted_3: {
        id: 'exhausted_3',
        name: 'Exhaustion III',
        description: 'Movement is sluggish and attacks feel leaden.',
        durationType: 'long_rest',
        defaultDuration: 1,
        modifiers: [
            { type: 'disadvantage', target: 'ability_check' },
            { type: 'disadvantage', target: 'attack_roll' },
            { type: 'disadvantage', target: 'saving_throw' },
            { type: 'multiplier', target: 'speed', value: 0.5 }
        ]
    },
    exhausted_4: {
        id: 'exhausted_4',
        name: 'Exhaustion IV',
        description: 'The body begins to fail, dragging every movement toward collapse.',
        durationType: 'long_rest',
        defaultDuration: 1,
        modifiers: [
            { type: 'disadvantage', target: 'ability_check' },
            { type: 'disadvantage', target: 'attack_roll' },
            { type: 'disadvantage', target: 'saving_throw' },
            { type: 'multiplier', target: 'speed', value: 0 }
        ]
    },
    exhausted_5: {
        id: 'exhausted_5',
        name: 'Exhaustion V',
        description: 'Only the barest motion remains; the body can no longer meaningfully fight back.',
        durationType: 'long_rest',
        defaultDuration: 1,
        modifiers: [
            { type: 'disadvantage', target: 'ability_check' },
            { type: 'disadvantage', target: 'attack_roll' },
            { type: 'disadvantage', target: 'saving_throw' },
            { type: 'multiplier', target: 'speed', value: 0 }
        ],
        data: {
            actionLocked: true,
            reactionLocked: true
        }
    },
    exhausted_6: {
        id: 'exhausted_6',
        name: 'Exhaustion VI',
        description: 'The body gives out entirely.',
        durationType: 'long_rest',
        defaultDuration: 1,
        modifiers: [
            { type: 'disadvantage', target: 'ability_check' },
            { type: 'disadvantage', target: 'attack_roll' },
            { type: 'disadvantage', target: 'saving_throw' },
            { type: 'multiplier', target: 'speed', value: 0 },
            { type: 'advantage', target: 'incoming_attack_roll' }
        ],
        data: {
            actionLocked: true,
            reactionLocked: true,
            incomingMeleeAttacksCritical: true
        }
    },
    antitoxin_guard: {
        id: 'antitoxin_guard',
        name: 'Antitoxin',
        description: 'The actor steels their body against poisonous agents for the rest of the day.',
        durationType: 'rest_of_day',
        defaultDuration: 1,
        modifiers: [
            { type: 'advantage', target: 'saving_throw', tags: ['poison'] }
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
        proficiencyMultipliers: {
            skills: { ...(options.proficiencyMultipliers?.skills || {}) },
            saves: { ...(options.proficiencyMultipliers?.saves || {}) }
        },
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
    if (!actor.mechanics.proficiencyMultipliers) {
        actor.mechanics.proficiencyMultipliers = { skills: {}, saves: {} };
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
        sourceActorId: overrides.sourceActorId || definition?.sourceActorId || overrides.data?.sourceActorId || definition?.data?.sourceActorId || null,
        remaining: overrides.remaining ?? definition?.defaultDuration ?? null,
        durationType: overrides.durationType || definition?.durationType || 'turns',
        concentration: overrides.concentration ?? !!definition?.concentration,
        modifiers: overrides.modifiers || definition?.modifiers || [],
        blockedSpellIds: [...new Set([...(overrides.blockedSpellIds || []), ...(definition?.blockedSpellIds || [])])],
        applicationTags: [...new Set([...(overrides.applicationTags || []), ...(definition?.applicationTags || [])])],
        data: {
            ...(definition?.data || {}),
            ...(overrides.data || {})
        },
        onExpire: overrides.onExpire || definition?.onExpire || null,
        name: overrides.name || definition?.name || 'Custom Effect'
    };
}

function getEffectKey(effect) {
    return `${effect.id}:${effect.source || ''}`;
}

export function getEffectSourceActorId(effect) {
    return effect?.sourceActorId || effect?.data?.sourceActorId || null;
}

function normalizeProficiencyKey(category, key) {
    if (category === 'skills') return String(key).toLowerCase();
    if (category === 'saves') return String(key).toUpperCase();
    return String(key);
}

export function getProficiencyMultiplier(actor, category, key) {
    ensureActorMechanics(actor);
    const normalized = normalizeProficiencyKey(category, key);
    return actor.mechanics.proficiencyMultipliers?.[category]?.[normalized] || 1;
}

export function setProficiencyMultiplier(actor, category, key, multiplier = 1) {
    ensureActorMechanics(actor);
    const normalized = normalizeProficiencyKey(category, key);
    if (!actor.mechanics.proficiencyMultipliers[category]) {
        actor.mechanics.proficiencyMultipliers[category] = {};
    }
    actor.mechanics.proficiencyMultipliers[category][normalized] = multiplier;
}

export function dropConcentration(actor) {
    ensureActorMechanics(actor);
    actor.mechanics.activeEffects = actor.mechanics.activeEffects.filter((effect) => !effect.concentration);
    actor.mechanics.concentrationEffectId = null;
    syncLegacyStatusEffects(actor);
    applyDerivedState(actor);
}

function getEffectApplicationFailure(actor, instance) {
    if (!actor || !instance) return 'invalid_effect';

    const snapshot = getDerivedActorState(actor);
    if ((instance.applicationTags || []).some((tag) => snapshot.conditionImmunities.includes(tag))) {
        return 'immunity';
    }

    const requiresUnarmored = (instance.modifiers || []).some((modifier) => modifier.type === 'ac_formula' && modifier.requiresUnarmored);
    if (requiresUnarmored && actor.equipped?.armor) {
        return 'requires_unarmored';
    }

    return null;
}

export function canApplyEffectToActor(actor, effectId, overrides = {}) {
    ensureActorMechanics(actor);
    const instance = createEffectInstance(effectId, overrides);
    if (!instance) return false;
    return !getEffectApplicationFailure(actor, instance);
}

export function hasActiveEffect(actor, effectId) {
    ensureActorMechanics(actor);
    return actor.mechanics.activeEffects.some((effect) => effect.id === effectId);
}

export function effectHasDataFlag(actor, flagName) {
    ensureActorMechanics(actor);
    return actor.mechanics.activeEffects.some((effect) => effect.data?.[flagName]);
}

export function effectBlocksSpell(actor, spellId) {
    ensureActorMechanics(actor);
    if (!spellId) return false;
    return actor.mechanics.activeEffects.some((effect) => (effect.blockedSpellIds || []).includes(spellId));
}

export function canActorTargetActor(actor, targetActorId, options = {}) {
    ensureActorMechanics(actor);
    if (!options.harmful || !targetActorId) return true;

    return !actor.mechanics.activeEffects.some((effect) => {
        const sourceActorId = getEffectSourceActorId(effect);
        if (!sourceActorId || sourceActorId !== targetActorId) return false;
        return effect.id === 'charmed' || effect.data?.preventHostileActionsAgainstSource;
    });
}

export function getApproachBlockedSourceIds(actor) {
    ensureActorMechanics(actor);
    return actor.mechanics.activeEffects
        .filter((effect) => effect.id === 'frightened' || effect.data?.blocksApproachToSource)
        .map(getEffectSourceActorId)
        .filter(Boolean);
}

export function getSourceMaintainedEffects(actor) {
    ensureActorMechanics(actor);
    return actor.mechanics.activeEffects.filter((effect) => effect.data?.maintainedBySource && getEffectSourceActorId(effect));
}

export function addEffectToActor(actor, effectId, overrides = {}) {
    ensureActorMechanics(actor);
    const instance = createEffectInstance(effectId, overrides);
    if (!instance) return null;
    if (getEffectApplicationFailure(actor, instance)) return null;

    const existing = actor.mechanics.activeEffects.find(effect => getEffectKey(effect) === getEffectKey(instance));
    if (existing) {
        if (instance.remaining !== null) {
            existing.remaining = Math.max(existing.remaining ?? 0, instance.remaining);
        }
        syncLegacyStatusEffects(actor);
        applyDerivedState(actor);
        return existing;
    }

    if (instance.concentration) {
        dropConcentration(actor);
        actor.mechanics.concentrationEffectId = getEffectKey(instance);
    }

    actor.mechanics.activeEffects.push(instance);
    if (instance.id === 'incapacitated' || instance.id === 'unconscious') {
        dropConcentration(actor);
    }
    syncLegacyStatusEffects(actor);
    applyDerivedState(actor);
    return instance;
}

export function removeEffectFromActor(actor, effectId) {
    ensureActorMechanics(actor);
    actor.mechanics.activeEffects = actor.mechanics.activeEffects.filter(effect => effect.id !== effectId);
    if (actor.mechanics.concentrationEffectId && !actor.mechanics.activeEffects.some(effect => getEffectKey(effect) === actor.mechanics.concentrationEffectId)) {
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
    if (actor.mechanics.concentrationEffectId && !actor.mechanics.activeEffects.some(effect => getEffectKey(effect) === actor.mechanics.concentrationEffectId)) {
        actor.mechanics.concentrationEffectId = null;
    }
    syncLegacyStatusEffects(actor);
    applyDerivedState(actor);
}

function shouldDecrementEffect(effect, trigger, options = {}) {
    const stepAmount = Math.max(1, Number(options.amount) || 1);

    switch (effect.durationType) {
    case 'turns':
        return trigger === 'turn_end' ? stepAmount : 0;
    case 'rounds':
        return trigger === 'round_end' ? stepAmount : 0;
    case 'scenes':
        return trigger === 'scene_change' ? stepAmount : 0;
    case 'time_slots':
        return trigger === 'time_passed' ? stepAmount : 0;
    case 'rests':
        return (trigger === 'short_rest' || trigger === 'long_rest') ? stepAmount : 0;
    case 'short_rest':
        return trigger === 'short_rest' ? stepAmount : 0;
    case 'long_rest':
        return trigger === 'long_rest' ? stepAmount : 0;
    case 'rest_of_day':
        return trigger === 'day_rollover' ? stepAmount : 0;
    case 'until_next_combat':
        return trigger === 'combat_start' ? stepAmount : 0;
    case 'permanent':
        return 0;
    default:
        return 0;
    }
}

function shouldRemoveOnTrigger(effect, trigger) {
    if (trigger === 'combat_end' && ['turns', 'rounds'].includes(effect.durationType)) {
        return true;
    }
    if (trigger === 'scene_change' && effect.concentration && effect.durationType !== 'scenes') {
        return true;
    }
    return false;
}

function runEffectExpire(actor, effect) {
    if (!effect?.onExpire) return;
    if (effect.onExpire.removeSource) {
        removeEffectsFromActorBySource(actor, effect.onExpire.removeSource, effect.onExpire.exact !== false);
    }
    if (effect.onExpire.clearTemporaryHp) {
        actor.mechanics.temporaryHp = 0;
    }
}

export function tickActorEffects(actor, trigger = 'turn_end', options = {}) {
    ensureActorMechanics(actor);
    const expiredEffects = [];

    actor.mechanics.activeEffects = actor.mechanics.activeEffects.filter(effect => {
        if (shouldRemoveOnTrigger(effect, trigger)) {
            expiredEffects.push(effect);
            return false;
        }

        if (effect.remaining === null || effect.remaining === undefined) return true;
        const decrement = shouldDecrementEffect(effect, trigger, options);
        if (decrement > 0) {
            effect.remaining -= decrement;
        }
        if (effect.remaining > 0) {
            return true;
        }
        expiredEffects.push(effect);
        return false;
    });

    expiredEffects.forEach((effect) => runEffectExpire(actor, effect));
    syncLegacyStatusEffects(actor);
    if (actor.mechanics.concentrationEffectId && !actor.mechanics.activeEffects.some(effect => getEffectKey(effect) === actor.mechanics.concentrationEffectId)) {
        actor.mechanics.concentrationEffectId = null;
    }
    applyDerivedState(actor);
    return expiredEffects;
}

function modifierApplies(modifier, context, effect = null) {
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
    const sourceActorId = getEffectSourceActorId(effect);
    if (modifier.sourceActorOnly && sourceActorId && context.sourceActorId !== sourceActorId) return false;
    if (modifier.excludeSourceActor && sourceActorId && context.sourceActorId === sourceActorId) return false;
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
            if (!modifierApplies(modifier, context, effect)) return;

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
                result.multipliers.push(modifier.value ?? 1);
                result.notes.push(`${effect.name}: x${modifier.value}`);
            }
        });
    });

    getActorTraitDefinitions(actor).forEach((trait) => {
        (trait.modifiers || []).forEach((modifier) => {
            if (!modifierApplies(modifier, context, trait)) return;

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
                result.multipliers.push(modifier.value ?? 1);
                result.notes.push(`${trait.name}: x${modifier.value}`);
            }
        });
    });

    return result;
}

export function consumeIncomingHitEffects(actor, context = {}) {
    ensureActorMechanics(actor);
    const consumedSources = [];

    actor.mechanics.activeEffects = actor.mechanics.activeEffects.filter((effect) => {
        if (!effect.data?.consumeOnIncomingHit) return true;
        const applies = (effect.modifiers || []).some((modifier) => modifierApplies(modifier, {
            target: 'incoming_attack_roll',
            ...context
        }, effect));
        if (!applies) return true;
        consumedSources.push(effect.id);
        return false;
    });

    if (actor.mechanics.concentrationEffectId && !actor.mechanics.activeEffects.some((effect) => getEffectKey(effect) === actor.mechanics.concentrationEffectId)) {
        actor.mechanics.concentrationEffectId = null;
    }
    syncLegacyStatusEffects(actor);
    applyDerivedState(actor);
    return consumedSources;
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

    const armor = actor.equipped?.armor ? items[actor.equipped.armor] : null;
    const shield = actor.equipped?.shield ? items[actor.equipped.shield] : null;
    let acBase = 10 + modifiers.DEX;
    if (armor) {
        const dexContribution = armor.armorType === 'heavy'
            ? 0
            : (armor.dexCap === null || armor.dexCap === undefined
                ? modifiers.DEX
                : Math.min(modifiers.DEX, armor.dexCap));
        acBase = armor.acBase + dexContribution;
        if (armor.modifiers?.ac) {
            acBase += armor.modifiers.ac;
        }
    }

    actor.mechanics.activeEffects.forEach((effect) => {
        (effect.modifiers || []).forEach((modifier) => {
            if (modifier.type !== 'ac_formula') return;
            if (modifier.requiresUnarmored && armor) return;
            const dexContribution = modifier.dexCap === null || modifier.dexCap === undefined
                ? modifiers.DEX
                : Math.min(modifiers.DEX, modifier.dexCap);
            acBase = Math.max(acBase, (modifier.base || 10) + dexContribution);
        });
    });

    let ac = acBase;
    if (shield?.acBonus) {
        ac += shield.acBonus;
    }
    const acTags = [];
    if (armor) acTags.push('armored');
    if (shield) acTags.push('shielded');
    const acContext = getEffectModifiers(actor, { target: 'ac', tags: acTags });
    ac += (actor.mechanics.permanentStatBonuses.ac || 0) + acContext.flat;

    const initiativeContext = getEffectModifiers(actor, { target: 'initiative' });
    const initiativeModifier = modifiers.DEX + (actor.mechanics.permanentStatBonuses.initiative || 0) + initiativeContext.flat;

    const spellcastingAbility = getSpellcastingAbility(actor.classId);
    const spellSaveDC = 8 + proficiencyBonus + modifiers[spellcastingAbility] + (actor.mechanics.permanentStatBonuses.spellSaveDC || 0);
    const proficiencies = createProficiencyState(actor.mechanics.proficiencies);
    const senses = {};
    const damageResistances = [];
    const conditionImmunities = [];

    traits.forEach((trait) => {
        const traitProficiencies = trait.proficiencies || {};
        Object.keys(traitProficiencies).forEach((key) => {
            proficiencies[key] = [...new Set([...(proficiencies[key] || []), ...(traitProficiencies[key] || [])])];
        });
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
        proficiencies,
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
                shield: shield ? shield.name : null,
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
    actor.ac = derived.ac;
    actor.initiativeModifier = derived.initiativeModifier;
    actor.spellSaveDC = derived.spellSaveDC;
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

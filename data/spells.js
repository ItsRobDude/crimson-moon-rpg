export const spells = {
    "firebolt": {
        id: "firebolt",
        name: "Fire Bolt",
        level: 0,
        classes: ["wizard"],
        school: "Evocation",
        castingTime: "action",
        rangeFeet: 120,
        durationType: "instant",
        concentration: false,
        targeting: "enemy",
        type: "attack",
        attack: true,
        damage: "1d10",
        damageType: "fire",
        scaling: "Damage improves with character level.",
        description: "You hurl a mote of fire at a creature or object."
    },
    "ray_of_frost": {
        id: "ray_of_frost",
        name: "Ray of Frost",
        level: 0,
        classes: ["wizard"],
        school: "Evocation",
        castingTime: "action",
        rangeFeet: 60,
        durationType: "instant",
        concentration: false,
        targeting: "enemy",
        type: "attack",
        attack: true,
        damage: "1d8",
        damageType: "cold",
        scaling: "Damage improves with character level.",
        description: "A frigid beam of blue-white light streaks toward a creature."
    },
    "guidance": {
        id: "guidance",
        name: "Guidance",
        level: 0,
        classes: ["cleric"],
        school: "Divination",
        castingTime: "action",
        rangeFeet: 5,
        durationType: "concentration",
        concentration: true,
        targeting: "ally",
        type: "buff",
        combatSupported: false,
        effect: {
            id: "guidance",
            name: "Guidance",
            modifiers: [
                { type: "dice_bonus", target: "ability_check", dice: "1d4" }
            ],
            remaining: 10,
            durationType: "turns"
        },
        scaling: "No upcast scaling.",
        description: "You touch one willing creature and guide its efforts."
    },
    "sacred_flame": {
        id: "sacred_flame",
        name: "Sacred Flame",
        level: 0,
        classes: ["cleric"],
        school: "Evocation",
        castingTime: "action",
        rangeFeet: 60,
        durationType: "instant",
        concentration: false,
        targeting: "enemy",
        type: "save",
        saveAbility: "DEX",
        halfOnSave: false,
        damage: "1d8",
        damageType: "radiant",
        scaling: "Damage improves with character level.",
        description: "Flame-like radiance descends on a creature you can see."
    },
    "cure_wounds": {
        id: "cure_wounds",
        name: "Cure Wounds",
        level: 1,
        classes: ["cleric"],
        school: "Evocation",
        castingTime: "action",
        rangeFeet: 5,
        durationType: "instant",
        concentration: false,
        targeting: "ally",
        type: "heal",
        amount: "1d8",
        scaling: "Heal an extra 1d8 for each slot level above 1st.",
        description: "A creature you touch regains hit points."
    },
    "guiding_bolt": {
        id: "guiding_bolt",
        name: "Guiding Bolt",
        level: 1,
        classes: ["cleric"],
        school: "Evocation",
        castingTime: "action",
        rangeFeet: 120,
        durationType: "instant",
        concentration: false,
        targeting: "enemy",
        type: "attack",
        attack: true,
        damage: "4d6",
        damageType: "radiant",
        scaling: "Damage increases by 1d6 for each slot level above 1st.",
        description: "A flash of light streaks toward a creature of your choice."
    },
    "bless": {
        id: "bless",
        name: "Bless",
        level: 1,
        classes: ["cleric"],
        school: "Enchantment",
        castingTime: "action",
        rangeFeet: 30,
        durationType: "concentration",
        concentration: true,
        targeting: "ally",
        type: "buff",
        effect: {
            id: "blessed",
            name: "Blessed",
            remaining: 5,
            durationType: "turns"
        },
        scaling: "A higher slot can bless additional allies.",
        description: "You bless a creature so its attacks and saving throws gain divine favor."
    },
    "shield_of_faith": {
        id: "shield_of_faith",
        name: "Shield of Faith",
        level: 1,
        classes: ["cleric"],
        school: "Abjuration",
        castingTime: "bonus",
        rangeFeet: 60,
        durationType: "concentration",
        concentration: true,
        targeting: "ally",
        type: "buff",
        effect: {
            id: "shield_of_faith",
            name: "Shield of Faith",
            modifiers: [
                { type: "flat_bonus", target: "ac", value: 2 }
            ],
            remaining: 10,
            durationType: "turns"
        },
        scaling: "No upcast scaling.",
        description: "A shimmering field appears and grants a +2 bonus to AC."
    },
    "magic_missile": {
        id: "magic_missile",
        name: "Magic Missile",
        level: 1,
        classes: ["wizard"],
        school: "Evocation",
        castingTime: "action",
        rangeFeet: 120,
        durationType: "instant",
        concentration: false,
        targeting: "enemy",
        type: "auto",
        damage: "3d4+3",
        damageType: "force",
        scaling: "Create one extra dart for each slot level above 1st.",
        description: "You create three glowing darts of magical force. They hit unerringly."
    },
    "burning_hands": {
        id: "burning_hands",
        name: "Burning Hands",
        level: 1,
        classes: ["wizard"],
        school: "Evocation",
        castingTime: "action",
        rangeFeet: 15,
        durationType: "instant",
        concentration: false,
        targeting: "enemy",
        type: "save",
        saveAbility: "DEX",
        damage: "3d6",
        damageType: "fire",
        scaling: "Damage increases by 1d6 for each slot level above 1st.",
        description: "A thin sheet of flames shoots forth from your fingertips."
    },
    "shield": {
        id: "shield",
        name: "Shield",
        level: 1,
        classes: ["wizard"],
        school: "Abjuration",
        castingTime: "reaction",
        rangeFeet: 0,
        durationType: "turns",
        concentration: false,
        targeting: "self",
        type: "reaction",
        effect: {
            id: "shield_spell",
            name: "Shield",
            modifiers: [
                { type: "flat_bonus", target: "ac", value: 5 }
            ],
            remaining: 1,
            durationType: "turns"
        },
        scaling: "No upcast scaling.",
        description: "An invisible barrier of magical force appears and protects you."
    },
    "mage_armor": {
        id: "mage_armor",
        name: "Mage Armor",
        level: 1,
        classes: ["wizard"],
        school: "Abjuration",
        castingTime: "action",
        rangeFeet: 5,
        durationType: "long_rest",
        concentration: false,
        targeting: "ally",
        type: "buff",
        effect: {
            id: "mage_armor",
            name: "Mage Armor",
            modifiers: [
                { type: "flat_bonus", target: "ac", value: 3 }
            ],
            remaining: null,
            durationType: "scenes"
        },
        scaling: "No upcast scaling.",
        description: "Protective magical force surrounds a willing creature who is not wearing armor."
    },
    "sleep": {
        id: "sleep",
        name: "Sleep",
        level: 1,
        classes: ["wizard"],
        school: "Enchantment",
        castingTime: "action",
        rangeFeet: 90,
        durationType: "turns",
        concentration: false,
        targeting: "enemy",
        type: "auto_status",
        amount: "5d8",
        appliedEffectId: "unconscious",
        effectDuration: 2,
        scaling: "A higher slot affects 2d8 additional hit points.",
        description: "This spell sends creatures into a magical slumber."
    }
};

export function getSpell(spellId) {
    return spells[spellId] || null;
}

export function getSpellIdsForClass(classId, filters = {}) {
    const {
        level = null,
        minLevel = null,
        maxLevel = null,
        type = null,
        combatOnly = false
    } = filters;

    return Object.values(spells)
        .filter((spell) => spell.classes.includes(classId))
        .filter((spell) => level === null || spell.level === level)
        .filter((spell) => minLevel === null || spell.level >= minLevel)
        .filter((spell) => maxLevel === null || spell.level <= maxLevel)
        .filter((spell) => type === null || spell.type === type)
        .filter((spell) => !combatOnly || spell.combatSupported !== false)
        .map((spell) => spell.id);
}

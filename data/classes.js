export const classes = {
    "fighter": {
        name: "Fighter",
        description: "A master of martial combat.",
        hitDie: 10,
        primaryStats: ["STR", "CON"],
        skillProficiencies: ["athletics", "survival", "intimidation", "acrobatics", "animal_handling", "history", "insight", "perception"],
        weaponProficiencies: ["simple", "martial"],
        armorProficiencies: ["light", "medium", "heavy", "shields"],
        progression: {
            1: { features: ["second_wind"], proficiencyBonus: 2 },
            2: { features: ["action_surge"], proficiencyBonus: 2 },
            3: { features: ["martial_archetype"], proficiencyBonus: 2 },
            4: { features: ["ability_score_improvement"], proficiencyBonus: 2 }
        },
        subclasses: {
            "champion": {
                name: "Champion",
                description: "You focus on the development of raw physical power to deadly perfection.",
                features: ["improved_critical"]
            }
        }
    },
    "rogue": {
        name: "Rogue",
        description: "A scoundrel who uses stealth and trickery.",
        hitDie: 8,
        primaryStats: ["DEX", "INT"],
        skillProficiencies: ["stealth", "perception", "investigation", "acrobatics", "athletics", "deception", "insight", "intimidation", "sleight_of_hand", "persuasion"],
        weaponProficiencies: ["simple", "hand_crossbow", "longsword", "rapier", "shortsword"],
        armorProficiencies: ["light"],
        progression: {
            1: { features: ["sneak_attack", "thieves_cant"], proficiencyBonus: 2 },
            2: { features: ["cunning_action"], proficiencyBonus: 2 },
            3: { features: ["roguish_archetype"], proficiencyBonus: 2 },
            4: { features: ["ability_score_improvement"], proficiencyBonus: 2 }
        },
        subclasses: {
            "thief": {
                name: "Thief",
                description: "You hone your skills in the larcenous arts.",
                features: ["fast_hands", "second_story_work"]
            }
        }
    },
    "wizard": {
        name: "Wizard",
        description: "A scholarly magic-user.",
        hitDie: 6,
        primaryStats: ["INT", "WIS"],
        skillProficiencies: ["arcana", "history", "insight", "investigation", "medicine", "religion"],
        weaponProficiencies: ["dagger", "dart", "sling", "quarterstaff", "light_crossbow"],
        armorProficiencies: [],
        progression: {
            1: { features: ["spellcasting", "arcane_recovery"], proficiencyBonus: 2, spellSlots: { 1: 2 } },
            2: { features: ["arcane_tradition"], proficiencyBonus: 2, spellSlots: { 1: 3 } },
            3: { features: [], proficiencyBonus: 2, spellSlots: { 1: 4, 2: 2 } },
            4: { features: ["ability_score_improvement"], proficiencyBonus: 2, spellSlots: { 1: 4, 2: 3 } }
        },
        subclasses: {
            "evocation": {
                name: "School of Evocation",
                description: "You focus your study on magic that creates powerful elemental effects.",
                features: ["sculpt_spells"] // Simplified: Protects allies from AoE
            }
        }
    },
    "cleric": {
        name: "Cleric",
        description: "A priestly champion.",
        hitDie: 8,
        primaryStats: ["WIS", "CHA"],
        skillProficiencies: ["history", "insight", "medicine", "persuasion", "religion"],
        weaponProficiencies: ["simple"],
        armorProficiencies: ["light", "medium", "shields"],
        progression: {
            1: { features: ["spellcasting", "divine_domain"], proficiencyBonus: 2, spellSlots: { 1: 2 } },
            2: { features: ["channel_divinity"], proficiencyBonus: 2, spellSlots: { 1: 3 } },
            3: { features: [], proficiencyBonus: 2, spellSlots: { 1: 4, 2: 2 } },
            4: { features: ["ability_score_improvement"], proficiencyBonus: 2, spellSlots: { 1: 4, 2: 3 } }
        },
        subclasses: {
            "life": {
                name: "Life Domain",
                description: "The Life domain focuses on the vibrant positive energy.",
                features: ["disciple_of_life"] // Bonus healing
            }
        }
    }
};

export const featureDefinitions = {
    "second_wind": {
        name: "Second Wind",
        type: "active",
        actionType: "bonus",
        resource: "second_wind",
        description: "Regain 1d10 + Level HP."
    },
    "action_surge": {
        name: "Action Surge",
        type: "active",
        actionType: "free", // Technically 'No Action' to trigger, but grants Action
        resource: "action_surge",
        description: "Gain an additional action on your turn."
    },
    "improved_critical": {
        name: "Improved Critical",
        type: "passive",
        description: "Your weapon attacks score a critical hit on a roll of 19 or 20."
    },
    "sneak_attack": {
        name: "Sneak Attack",
        type: "passive",
        description: "Deal extra damage (1d6/2 levels) if you have advantage or an ally is within 5ft."
    },
    "cunning_action": {
        name: "Cunning Action",
        type: "passive", // Unlocks Bonus Actions
        description: "You can take a Bonus Action on each of your turns to Dash, Disengage, or Hide."
    },
    "fast_hands": {
        name: "Fast Hands",
        type: "passive",
        description: "You can use the 'Use an Object' action as a bonus action."
    },
    "sculpt_spells": {
        name: "Sculpt Spells",
        type: "passive",
        description: "Allies automatically succeed saving throws against your Evocation spells and take no damage if they would normally take half."
    },
    "disciple_of_life": {
        name: "Disciple of Life",
        type: "passive",
        description: "Healing spells of 1st level or higher regain additional HP equal to 2 + Spell Level."
    },
    "channel_divinity": {
        name: "Channel Divinity",
        type: "active",
        actionType: "action",
        resource: "channel_divinity",
        description: "Channel divine energy to fuel magical effects."
    },
    "ability_score_improvement": {
        name: "Ability Score Improvement",
        type: "choice",
        description: "Increase one ability score by 2, or two by 1, or choose a Feat."
    }
};

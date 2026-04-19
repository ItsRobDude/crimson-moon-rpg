export const classes = {
    "fighter": {
        name: "Fighter",
        description: "A master of martial combat.",
        hitDie: 10,
        primaryStats: ["STR", "CON"],
        saveProficiencies: ["STR", "CON"],
        skillChoices: 2,
        skillProficiencies: ["athletics", "survival", "intimidation", "acrobatics", "animal_handling", "history", "insight", "perception"],
        weaponProficiencies: ["simple", "martial"],
        armorProficiencies: ["light", "medium", "heavy", "shields"],
        subclassLevel: 3,
        fightingStyleChoices: ["defense", "dueling", "archery"],
        progression: {
            1: { features: ["fighting_style", "second_wind"], proficiencyBonus: 2 },
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
        saveProficiencies: ["DEX", "INT"],
        skillChoices: 4,
        skillProficiencies: ["stealth", "perception", "investigation", "acrobatics", "athletics", "deception", "insight", "intimidation", "sleight_of_hand", "persuasion"],
        weaponProficiencies: ["simple", "hand_crossbow", "longsword", "rapier", "shortsword"],
        armorProficiencies: ["light"],
        subclassLevel: 3,
        expertiseChoices: 2,
        progression: {
            1: { features: ["expertise", "sneak_attack", "thieves_cant"], proficiencyBonus: 2 },
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
        saveProficiencies: ["INT", "WIS"],
        skillChoices: 2,
        skillProficiencies: ["arcana", "history", "insight", "investigation", "medicine", "religion"],
        weaponProficiencies: ["dagger", "dart", "sling", "quarterstaff", "light_crossbow"],
        armorProficiencies: [],
        subclassLevel: 2,
        spellcasting: {
            mode: "spellbook",
            preparationAbility: "INT",
            cantripsKnown: 2,
            spellbookCount: 6,
            minimumPrepared: 1
        },
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
        saveProficiencies: ["WIS", "CHA"],
        skillChoices: 2,
        skillProficiencies: ["history", "insight", "medicine", "persuasion", "religion"],
        weaponProficiencies: ["simple"],
        armorProficiencies: ["light", "medium", "shields"],
        subclassLevel: 1,
        defaultSubclass: "life",
        spellcasting: {
            mode: "prepared",
            preparationAbility: "WIS",
            cantripsKnown: 2,
            minimumPrepared: 1
        },
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
    "fighting_style": {
        name: "Fighting Style",
        type: "choice",
        description: "Choose Defense, Dueling, or Archery."
    },
    "expertise": {
        name: "Expertise",
        type: "choice",
        description: "Double your proficiency bonus for two trained skills."
    },
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
    "martial_archetype": {
        name: "Martial Archetype",
        type: "choice",
        description: "Choose your fighter subclass."
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
    "thieves_cant": {
        name: "Thieves' Cant",
        type: "passive",
        surfaced: false,
        description: "Recorded on the sheet, but not surfaced as an active runtime mechanic in this build."
    },
    "roguish_archetype": {
        name: "Roguish Archetype",
        type: "choice",
        description: "Choose your rogue subclass."
    },
    "fast_hands": {
        name: "Fast Hands",
        type: "passive",
        description: "Consumables and adventuring gear use your bonus action instead of your action."
    },
    "second_story_work": {
        name: "Second-Story Work",
        type: "passive",
        surfaced: false,
        description: "Recorded on the sheet, but not surfaced as an active runtime mechanic in this build."
    },
    "arcane_tradition": {
        name: "Arcane Tradition",
        type: "choice",
        description: "Choose your wizard subclass."
    },
    "sculpt_spells": {
        name: "Sculpt Spells",
        type: "passive",
        description: "Allies automatically succeed saving throws against your Evocation spells and take no damage if they would normally take half."
    },
    "divine_domain": {
        name: "Divine Domain",
        type: "passive",
        description: "Your cleric domain is fixed to Life in the current playable slice."
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
        description: "Life clerics can preserve life and restore a wounded ally up to half health."
    },
    "arcane_recovery": {
        name: "Arcane Recovery",
        type: "passive",
        resource: "arcane_recovery",
        description: "Once per long rest, recover an expended spell slot during a short rest."
    },
    "ability_score_improvement": {
        name: "Ability Score Improvement",
        type: "choice",
        description: "Increase one ability score by 2, two by 1, or choose Alert, Mobile, Resilient, or Tough."
    }
};

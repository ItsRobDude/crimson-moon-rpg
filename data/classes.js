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
            3: { features: ["martial_archetype"], proficiencyBonus: 2 }
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
            3: { features: ["roguish_archetype"], proficiencyBonus: 2 }
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
            3: { features: [], proficiencyBonus: 2, spellSlots: { 1: 4, 2: 2 } }
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
            3: { features: [], proficiencyBonus: 2, spellSlots: { 1: 4, 2: 2 } }
        }
    }
};

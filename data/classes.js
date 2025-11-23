export const classes = {
    "fighter": {
        name: "Fighter",
        description: "A master of martial combat, skilled with a variety of weapons and armor.",
        hitDie: 10,
        primaryStats: ["STR", "CON"],
        proficiencies: ["athletics", "survival", "intimidation"]
    },
    "rogue": {
        name: "Rogue",
        description: "A scoundrel who uses stealth and trickery to overcome obstacles and enemies.",
        hitDie: 8,
        primaryStats: ["DEX", "INT"],
        proficiencies: ["stealth", "perception", "investigation", "acrobatics"]
    },
    "wizard": {
        name: "Wizard",
        description: "A scholarly magic-user capable of manipulating the structures of reality.",
        hitDie: 6,
        primaryStats: ["INT", "WIS"],
        proficiencies: ["arcana", "history", "insight"]
    },
    "cleric": {
        name: "Cleric",
        description: "A priestly champion who wields divine magic in service of a higher power.",
        hitDie: 8,
        primaryStats: ["WIS", "CHA"],
        proficiencies: ["religion", "medicine", "persuasion"]
    }
};

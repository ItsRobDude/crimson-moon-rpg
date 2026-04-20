export const races = {
    "human": {
        name: "Human",
        description: "Versatile and ambitious, humans are found in every corner of the realm.",
        abilityBonuses: { STR: 1, DEX: 1, CON: 1, INT: 1, WIS: 1, CHA: 1 },
        traits: ["versatile"]
    },
    "viridian_mixedling": {
        name: "Viridian Mixedling",
        description: "Small-bodied and sharp-eyed, Viridian mixedlings carry tangled halfling, elven, and human blood without fitting cleanly into any single people's story.",
        abilityBonuses: { DEX: 1, INT: 1, WIS: 1 },
        traits: ["darkvision", "fey_ancestry", "keen_senses", "small_bodied"],
        playerSelectable: false
    },
    "elf": {
        name: "Elf",
        description: "Graceful and long-lived, elves have a keen mind and mastery of magic.",
        abilityBonuses: { DEX: 2, INT: 1 },
        traits: ["darkvision", "fey_ancestry", "keen_senses", "trance"]
    },
    "dwarf": {
        name: "Dwarf",
        description: "Bold and hardy, dwarves are known as skilled warriors, miners, and workers of stone and metal.",
        abilityBonuses: { CON: 2, STR: 2 },
        traits: ["darkvision", "dwarven_resilience", "dwarven_combat_training", "stonecunning"]
    }
};

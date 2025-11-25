export const companions = {
    "aodhan": {
        name: "Aodhan",
        raceId: "human",
        classId: "fighter",
        description: "A stoic guard of Hushbriar, skilled with the blade.",
        baseStats: { STR: 16, DEX: 12, CON: 14, INT: 10, WIS: 12, CHA: 10 },
        portrait: "portraits/aodhan_portrait.png",
        defaultEquipment: {
            weapon: "longsword",
            armor: "chainmail"
        },
        // AI Preference hints
        ai: {
            style: "aggressive", // aggressive, defensive, support
            preferredRange: "melee"
        }
    },
    "elara": {
        name: "Elara",
        raceId: "elf",
        classId: "wizard",
        description: "A researcher of the arcane, fascinated by the spores.",
        baseStats: { STR: 8, DEX: 14, CON: 12, INT: 16, WIS: 12, CHA: 10 },
        portrait: "portraits/elara_portrait.png",
        defaultEquipment: {
            weapon: "dagger"
        },
        ai: {
            style: "ranged_caster",
            preferredRange: "ranged"
        }
    },
    "neala": {
        name: "Neala",
        raceId: "human",
        classId: "cleric", // Using Cleric for healer role
        description: "A healer tending to the afflicted in the Briarwood.",
        baseStats: { STR: 12, DEX: 10, CON: 14, INT: 12, WIS: 16, CHA: 13 },
        portrait: "portraits/neala_portrait.png",
        defaultEquipment: {
            weapon: "mace",
            armor: "leather_armor"
        },
        ai: {
            style: "healer",
            preferredRange: "melee" // Clerics can be melee, or ranged. Let's say melee for now.
        }
    }
};

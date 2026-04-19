export const companions = {
    eoin: {
        name: 'Eoin',
        raceId: 'human',
        classId: 'rogue',
        description: 'A half-starved Sporefall survivor who still knows how to move through ruin without waking every hungry thing in it.',
        baseStats: { STR: 10, DEX: 15, CON: 12, INT: 11, WIS: 14, CHA: 12 },
        skills: ['perception', 'stealth', 'survival'],
        portrait: 'portraits/npc_male_placeholder_portrait.png',
        defaultEquipment: {
            weapon: 'shortbow',
            armor: 'leather_armor'
        }
    },
    neala: {
        name: 'Neala',
        raceId: 'elf',
        classId: 'rogue',
        description: 'A Thorne Guild scout who survives by reading patrol patterns, bad lies, and the price hidden in every favor.',
        baseStats: { STR: 11, DEX: 16, CON: 13, INT: 13, WIS: 14, CHA: 14 },
        skills: ['deception', 'insight', 'perception', 'stealth'],
        portrait: 'portraits/neala_portrait.png',
        defaultEquipment: {
            weapon: 'shortsword',
            armor: 'leather_armor'
        }
    }
};

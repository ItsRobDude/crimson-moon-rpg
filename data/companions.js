export const companions = {
    lark: {
        name: 'Lark',
        raceId: 'elf',
        classId: 'fighter',
        description: 'An elven scout from the Veridian Forest, hardened by a clan split over Sporefall\'s spreading wound and still walking east on the first purpose that felt truer than drift.',
        baseStats: { STR: 12, DEX: 15, CON: 13, INT: 10, WIS: 12, CHA: 10 },
        skills: ['acrobatics', 'perception', 'survival'],
        portrait: 'portraits/npc_male_placeholder_portrait.png',
        fightingStyle: 'archery',
        defaultEquipment: {
            weapon: 'shortbow',
            armor: 'leather_armor'
        }
    },
    kieran_brogan: {
        name: 'Kieran Brogan',
        raceId: 'dwarf',
        classId: 'rogue',
        description: 'A poor Silverthorn dwarf with quick hands, an Ilmatari conscience, and a gift for obeying cruel orders in the one way that leaves the wrong people bleeding for it.',
        baseStats: { STR: 8, DEX: 15, CON: 13, INT: 12, WIS: 12, CHA: 13 },
        skills: ['perception', 'persuasion', 'sleight_of_hand', 'stealth'],
        expertiseSkills: ['sleight_of_hand', 'stealth'],
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

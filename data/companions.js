export const companions = {
    lark: {
        name: 'Lark',
        raceId: 'elf',
        classId: 'fighter',
        description: 'A hard-eyed elven scout who watches every treeline like something in it once learned her name.',
        baseStats: { STR: 12, DEX: 15, CON: 13, INT: 10, WIS: 12, CHA: 10 },
        skills: ['acrobatics', 'perception', 'survival'],
        portrait: 'portraits/npc_female_placeholder_portrait.png',
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
        description: 'A poor Silverthorn dwarf with quick hands, an Ilmatari streak of pity, and a habit of obeying wicked orders in the most inconvenient way possible.',
        baseStats: { STR: 8, DEX: 15, CON: 13, INT: 12, WIS: 12, CHA: 13 },
        skills: ['perception', 'persuasion', 'sleight_of_hand', 'stealth'],
        expertiseSkills: ['sleight_of_hand', 'stealth'],
        portrait: 'portraits/npc_male_placeholder_portrait.png',
        defaultEquipment: {
            weapon: 'shortbow',
            armor: 'leather_armor'
        }
    },
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

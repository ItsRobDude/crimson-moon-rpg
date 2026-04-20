export const companions = {
    lark: {
        name: 'Lark',
        raceId: 'viridian_mixedling',
        classId: 'fighter',
        description: 'A small-bodied scout of tangled Viridian blood, morally conflicted, watchful, and clever enough to know the forest can be wounded by the hands claiming to save it.',
        baseStats: { STR: 12, DEX: 15, CON: 13, INT: 10, WIS: 12, CHA: 10 },
        skills: ['acrobatics', 'perception', 'survival'],
        portrait: 'portraits/npc_male_placeholder_portrait.png',
        presentation: {
            stature: 'small',
            ancestry: 'mixed_viridian',
            voice: 'sparse_contemplative'
        },
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
        description: 'A poor Silverthorn dwarf with quick hands, a warm heart for his own, and an Ilmatari conscience sharp enough to turn sarcasm into mercy when the city gives him nothing cleaner to work with.',
        baseStats: { STR: 8, DEX: 15, CON: 13, INT: 12, WIS: 12, CHA: 13 },
        skills: ['perception', 'persuasion', 'sleight_of_hand', 'stealth'],
        expertiseSkills: ['sleight_of_hand', 'stealth'],
        portrait: 'portraits/npc_male_placeholder_portrait.png',
        presentation: {
            stature: 'stocky',
            voice: 'warm_sardonic'
        },
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

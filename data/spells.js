export const spells = {
    "firebolt": {
        name: "Fire Bolt",
        level: 0,
        type: "attack",
        damage: "1d10",
        damageType: "fire",
        description: "You hurl a mote of fire at a creature or object."
    },
    "cure_wounds": {
        name: "Cure Wounds",
        level: 1,
        type: "heal",
        amount: "1d8+3",
        description: "A creature you touch regains hit points."
    },
    "magic_missile": {
        name: "Magic Missile",
        level: 1,
        type: "attack", // Auto-hit usually, but we keep as attack for simplicity or make 'auto'
        damage: "3d4+3", // 3 darts
        damageType: "force",
        description: "You create three glowing darts of magical force. They hit unerringly."
    },
    "burning_hands": {
        name: "Burning Hands",
        level: 1,
        type: "save",
        saveAbility: "DEX",
        damage: "3d6",
        damageType: "fire",
        description: "A thin sheet of flames shoots forth from your fingertips."
    }
};

export const spells = {
    "firebolt": {
        name: "Fire Bolt",
        type: "attack",
        damage: "1d10",
        description: "You hurl a mote of fire at a creature or object."
    },
    "cure_wounds": {
        name: "Cure Wounds",
        type: "heal",
        amount: "1d8+3",
        description: "A creature you touch regains hit points."
    },
    "magic_missile": {
        name: "Magic Missile",
        type: "attack",
        damage: "1d4+1", // Per dart, simplified for now
        description: "You create three glowing darts of magical force."
    }
};

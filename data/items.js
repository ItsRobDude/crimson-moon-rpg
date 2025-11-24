export const items = {
    "longsword": {
        name: "Longsword",
        type: "weapon",
        damage: "1d8",
        modifier: "STR",
        description: "A versatile blade."
    },
    "shortbow": {
        name: "Shortbow",
        type: "weapon",
        damage: "1d6",
        modifier: "DEX",
        description: "A small bow used for hunting and skirmishing."
    },
    "dagger": {
        name: "Dagger",
        type: "weapon",
        damage: "1d4",
        modifier: "DEX",
        description: "A sharp knife, easily concealed."
    },
    "leather_armor": {
        name: "Leather Armor",
        type: "armor",
        armorType: "light",
        acBase: 11,
        description: "Sturdy leather armor."
    },
    "chainmail": {
        name: "Chain Mail",
        type: "armor",
        armorType: "heavy",
        acBase: 16,
        reqStr: 13,
        description: "Made of interlocking metal rings."
    },
    "potion_healing": {
        name: "Potion of Healing",
        type: "consumable",
        effect: "heal",
        amount: "2d4+2",
        description: "A red liquid that heals wounds."
    }
};

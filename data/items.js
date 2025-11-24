export const items = {
    "longsword": {
        name: "Longsword",
        type: "weapon",
        subtype: "martial",
        damage: "1d8",
        modifier: "STR",
        damageType: "slashing",
        description: "A versatile blade.",
        price: 20
    },
    "shortbow": {
        name: "Shortbow",
        type: "weapon",
        subtype: "simple",
        damage: "1d6",
        modifier: "DEX",
        damageType: "piercing",
        description: "A small bow used for hunting and skirmishing.",
        price: 25
    },
    "dagger": {
        name: "Dagger",
        type: "weapon",
        subtype: "simple",
        damage: "1d4",
        modifier: "DEX",
        damageType: "piercing",
        description: "A sharp knife, easily concealed.",
        price: 5
    },
    "leather_armor": {
        name: "Leather Armor",
        type: "armor",
        armorType: "light",
        acBase: 11,
        description: "Sturdy leather armor.",
        price: 10
    },
    "chainmail": {
        name: "Chain Mail",
        type: "armor",
        armorType: "heavy",
        acBase: 16,
        reqStr: 13,
        description: "Made of interlocking metal rings.",
        price: 75
    },
    "potion_healing": {
        name: "Potion of Healing",
        type: "consumable",
        effect: "heal",
        amount: "2d4+2",
        description: "A red liquid that heals wounds.",
        price: 50
    },
    "torch": {
        name: "Torch",
        type: "consumable",
        effect: "light",
        description: "Provides light in dark places.",
        price: 1
    },
    "antitoxin": {
        name: "Antitoxin",
        type: "consumable",
        effect: "cure_poison",
        description: "A vial of fluid that neutralizes poison.",
        price: 25
    },
    "stone_of_oblivion": {
        name: "Stone of Oblivion",
        type: "key_item",
        description: "A dark stone pulsing with ominous energy. Retrieved from Aodhan.",
        price: 0
    }
};

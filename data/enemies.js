export const enemies = {
    "fungal_beast": {
        name: "Lesser Fungal Beast",
        hp: 15,
        ac: 12,
        attackBonus: 3,
        damage: "1d6+1",
        xp: 50,
        description: "A shambling mass of mushrooms and rotting wood.",
        resistances: ["bludgeoning"],
        vulnerabilities: ["fire"]
    },
    "spore_zombie": {
        name: "Spore Walker",
        hp: 22,
        ac: 10,
        attackBonus: 4,
        damage: "1d8+2",
        xp: 75,
        description: "A humanoid corpse reanimated by the fungal network.",
        resistances: ["poison"],
        vulnerabilities: ["radiant", "fire"]
    },
    "choldrith": {
        name: "Choldrith",
        hp: 30,
        ac: 13,
        attackBonus: 5,
        damage: "2d4+2",
        xp: 100,
        description: "A horrifying hybrid of drow and spider, serving the dark.",
        resistances: ["poison"],
        vulnerabilities: ["fire"]
    }
};

const GENERIC_ENEMY_PORTRAIT = "portraits/npc_male_placeholder_portrait.png";

export const enemies = {
    "fungal_beast": {
        name: "Lesser Fungal Beast",
        hp: 15,
        ac: 12,
        attackBonus: 3,
        damage: "1d6+1",
        xp: 50,
        portrait: GENERIC_ENEMY_PORTRAIT,
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
        portrait: GENERIC_ENEMY_PORTRAIT,
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
        portrait: GENERIC_ENEMY_PORTRAIT,
        description: "A horrifying hybrid of drow and spider, serving the dark.",
        resistances: ["poison"],
        vulnerabilities: ["fire"]
    },
    "wolf": {
        name: "Shadowmire Wolf",
        hp: 11,
        ac: 13,
        attackBonus: 4,
        damage: "2d4+2",
        xp: 50,
        portrait: GENERIC_ENEMY_PORTRAIT,
        description: "A large grey wolf with glowing eyes, tainted by the forest's corruption.",
        vulnerabilities: []
    },
    "silverthorn_guard": {
        name: "Silverthorn Guard",
        hp: 18,
        ac: 14,
        attackBonus: 4,
        damage: "1d8+2",
        xp: 50,
        portrait: GENERIC_ENEMY_PORTRAIT,
        description: "A tired city soldier enforcing the Blackened King's will.",
        vulnerabilities: []
    },
    "dreadcap_colossus_lesser": {
        name: "Dreadcap Colossus",
        hp: 58,
        ac: 13,
        attackBonus: 5,
        attackName: "Rot-Slick Slam",
        damage: "1d10+3",
        damageType: "bludgeoning",
        speed: 25,
        reachFeet: 10,
        multiattack: 2,
        xp: 250,
        portrait: GENERIC_ENEMY_PORTRAIT,
        description: "A huge knot of corpse-fungus and rooted muscle that prowls Sporefall when the living linger too long.",
        resistances: ["poison"],
        vulnerabilities: ["fire"],
        regeneration: {
            amount: 6,
            suppressedBy: ["fire", "radiant"]
        },
        specialActions: [
            {
                id: "spore_cloud",
                name: "Spore Cloud",
                kind: "burst",
                radiusFeet: 10,
                damage: "2d6",
                damageType: "poison",
                saveAbility: "CON",
                saveDc: 12,
                halfOnSave: true,
                recharge: 5,
                minTargets: 2,
                applyEffectsOnFail: [
                    { id: "poisoned", remaining: 2, durationType: "turns" },
                    { id: "blinded", remaining: 1, durationType: "turns" }
                ]
            },
            {
                id: "ensnaring_vines",
                name: "Ensnaring Vines",
                kind: "single",
                rangeFeet: 15,
                damage: "1d6+2",
                damageType: "bludgeoning",
                saveAbility: "STR",
                saveDc: 12,
                ignoreIfTargetHas: ["grappled", "restrained"],
                applyEffectsOnFail: [
                    { id: "grappled", remaining: 10, durationType: "turns", escapeDc: 13 },
                    { id: "restrained", remaining: 2, durationType: "turns", escapeDc: 13 }
                ]
            }
        ]
    }
};

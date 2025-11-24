export const npcs = {
    "alderic": {
        id: "alderic",
        name: "Prince Alderic O’Dorcha",
        portrait: "portraits/alderic_portrait.png",
        faction: "silverthorn",
        description: "The brooding prince of Silverthorn.",
        baseDisposition: "neutral",
        relationshipStart: 0,
        relationshipMin: -100,
        relationshipMax: 100
    },
    "eoin": {
        id: "eoin",
        name: "Eoin",
        portrait: "portraits/npc_male_placeholder_portrait.png",
        faction: "whisperwood_survivors",
        description: "A ragged survivor of the Sporefall.",
        baseDisposition: "wary",
        relationshipStart: 0,
        relationshipMin: -100,
        relationshipMax: 100
    },
    "dwarven_captain": {
        id: "dwarven_captain",
        name: "Captain Thrain",
        portrait: "portraits/npc_male_placeholder_portrait.png",
        faction: "durnhelm",
        description: "A stoic guard of the deep roads.",
        baseDisposition: "suspicious",
        relationshipStart: -10,
        relationshipMin: -100,
        relationshipMax: 100,
        combatStats: {
            base: {
                level: 8,
                attributes: {
                    strength: 18,
                    dexterity: 13,
                    constitution: 16,
                    intelligence: 10,
                    wisdom: 12,
                    charisma: 11
                },
                hp: 85, // d10 hit die + con
                ac: 18, // plate
                speed: 25,
                proficiencies: {
                    savingThrows: ["strength", "constitution"],
                    skills: ["athletics", "intimidation", "perception"],
                    weapons: ["simple", "martial"],
                    armor: ["all", "shields"]
                },
                resistances: "poison",
                immunities: "",
                vulnerabilities: "",
                actions: [
                    { name: "Battleaxe", type: "attack", toHit: 7, damage: "1d8+4", damageType: "slashing" },
                    { name: "Heavy Crossbow", type: "attack", toHit: 4, damage: "1d10+1", damageType: "piercing", range: "100/400" },
                    { name: "Second Wind", type: "ability", description: "Once per short rest, can use a bonus action to regain 1d10 + 8 hit points." },
                    { name: "Action Surge", type: "ability", description: "Once per short rest, can take one additional action on his turn." }
                ],
                specialTraits: [
                    { name: "Dwarven Resilience", description: "Has advantage on saving throws against poison." }
                ],
            },
            perLevel: {
                hp: "1d10+3",
                toHit: 0.5,
                damage: 0
            }
        }
    },
    "fionnlagh": {
        id: "fionnlagh",
        name: "Fionnlagh Ó Faoláin",
        portrait: "portraits/npc_male_placeholder_portrait.png", // Placeholder
        faction: "whisperwood_survivors",
        description: "Lark's father, a weary man sensing a great darkness.",
        baseDisposition: "friendly",
        relationshipStart: 50,
        relationshipMin: 0,
        relationshipMax: 100
    },
    "neala": {
        id: "neala",
        name: "Neala Creach",
        portrait: "portraits/npc_female_placeholder_portrait.png", // Placeholder
        faction: "silverthorn", // Actually Thieves Guild but wearing Silverthorn insignia in lore? Or just generic? Lore says "brandishing 'S' insignia... Neala Creach and Liobhan Sceith".
        description: "A sharp-tongued elven rogue.",
        baseDisposition: "hostile",
        relationshipStart: -20,
        relationshipMin: -100,
        relationshipMax: 100,
        combatStats: {
            base: {
                level: 5,
                attributes: {
                    strength: 11,
                    dexterity: 18,
                    constitution: 14,
                    intelligence: 13,
                    wisdom: 12,
                    charisma: 16
                },
                hp: 44, // d8 hit die + con
                ac: 16, // studded leather + dex
                speed: 35,
                proficiencies: {
                    savingThrows: ["dexterity", "intelligence"],
                    skills: ["acrobatics", "deception", "perception", "stealth"],
                    weapons: ["simple", "hand crossbows", "longswords", "rapiers", "shortswords"],
                    armor: ["light"]
                },
                resistances: "",
                immunities: "",
                vulnerabilities: "",
                actions: [
                    { name: "Shortsword", type: "attack", toHit: 7, damage: "1d6+4", damageType: "piercing" },
                    { name: "Dagger", type: "attack", toHit: 7, damage: "1d4+4", damageType: "piercing", range: "20/60" },
                    { name: "Sneak Attack", type: "ability", description: "Once per turn, can deal an extra 3d6 damage to one creature she hits with an attack if she has advantage on the attack roll." },
                    { name: "Cunning Action", type: "ability", description: "On each of her turns, can use a bonus action to take the Dash, Disengage, or Hide action." }
                ],
                specialTraits: [
                    { name: "Fey Ancestry", description: "Has advantage on saving throws against being charmed, and magic can’t put her to sleep." }
                ],
            },
            perLevel: {
                hp: "1d8+2",
                toHit: 0.5,
                damage: 0.5 // for sneak attack
            }
        }
    },
    "liobhan": {
        id: "liobhan",
        name: "Liobhán Sceith",
        portrait: "portraits/npc_female_placeholder_portrait.png", // Placeholder
        faction: "silverthorn",
        description: "A calm but deadly rogue.",
        baseDisposition: "hostile",
        relationshipStart: -20,
        relationshipMin: -100,
        relationshipMax: 100,
        combatStats: {
            base: {
                level: 5,
                attributes: {
                    strength: 11,
                    dexterity: 18,
                    constitution: 14,
                    intelligence: 13,
                    wisdom: 12,
                    charisma: 16
                },
                hp: 44,
                ac: 16,
                speed: 35,
                proficiencies: {
                    savingThrows: ["dexterity", "intelligence"],
                    skills: ["acrobatics", "deception", "perception", "stealth"],
                    weapons: ["simple", "hand crossbows", "longswords", "rapiers", "shortswords"],
                    armor: ["light"]
                },
                resistances: "",
                immunities: "",
                vulnerabilities: "",
                actions: [
                    { name: "Shortsword", type: "attack", toHit: 7, damage: "1d6+4", damageType: "piercing" },
                    { name: "Dagger", type: "attack", toHit: 7, damage: "1d4+4", damageType: "piercing", range: "20/60" },
                    { name: "Sneak Attack", type: "ability", description: "Once per turn, can deal an extra 3d6 damage to one creature she hits with an attack if she has advantage on the attack roll." },
                    { name: "Cunning Action", type: "ability", description: "On each of her turns, can use a bonus action to take the Dash, Disengage, or Hide action." }
                ],
                specialTraits: [
                    { name: "Fey Ancestry", description: "Has advantage on saving throws against being charmed, and magic can’t put her to sleep." }
                ],
            },
            perLevel: {
                hp: "1d8+2",
                toHit: 0.5,
                damage: 0.5 // for sneak attack
            }
        }
    },
    "aodhan": {
        id: "aodhan",
        name: "Aodhan",
        portrait: "portraits/npc_male_placeholder_portrait.png", // Placeholder
        faction: "whisperwood_survivors", // Formerly?
        description: "A fallen friend, now lost to darkness.",
        baseDisposition: "hostile",
        relationshipStart: -50,
        relationshipMin: -100,
        relationshipMax: 0
    },
    "elara": {
        id: "elara",
        name: "Elara",
        portrait: "portraits/npc_female_placeholder_portrait.png",
        faction: "whisperwood_survivors", // Or Neutral
        description: "A mysterious figure, possibly the demigod of prophecy.",
        baseDisposition: "neutral",
        relationshipStart: 0
    },
    "ciara": {
        id: "ciara",
        name: "Ciara",
        portrait: "portraits/npc_female_placeholder_portrait.png",
        faction: "silverthorn", // Or Enemy
        description: "A powerful sorceress leading the assault.",
        baseDisposition: "hostile",
        relationshipStart: -100
    },
    "blackened_king": {
        id: "blackened_king",
        name: "The Blackened King",
        portrait: "portraits/npc_male_placeholder_portrait.png",
        faction: "silverthorn", // Enemy
        description: "The tyrant ruling from the shadows.",
        baseDisposition: "hostile",
        relationshipStart: -100
    },
    "aine": {
        id: "aine",
        name: "Aine",
        portrait: "portraits/npc_female_placeholder_portrait.png",
        faction: "whisperwood_survivors",
        description: "A mysterious cat (or witch) watching from Lament Hill.",
        baseDisposition: "wary",
        relationshipStart: 0
    },
    "cathal": {
        id: "cathal",
        name: "Cathal",
        portrait: "portraits/npc_male_placeholder_portrait.png",
        faction: "durnhelm",
        description: "A contact who knows about the Stone of Oblivion.",
        baseDisposition: "neutral",
        relationshipStart: 0
    }
};

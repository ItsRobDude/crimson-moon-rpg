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
        relationshipMax: 100
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
        relationshipMax: 100
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
        relationshipMax: 100
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

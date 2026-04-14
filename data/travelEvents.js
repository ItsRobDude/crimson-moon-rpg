export const travelEvents = [
    {
        id: "ambush_beast",
        text: "You are ambushed by a pack of corrupted beasts!",
        type: "combat",
        enemyId: "fungal_beast"
    },
    {
        id: "strange_sight",
        text: "You notice a strange glow in the undergrowth.",
        type: "skillCheck",
        skill: "investigation",
        dc: 12,
        successText: "You find a pouch dropped by a traveler. (Gain 20 gold)",
        failText: "It was just luminescent moss.",
        onSuccess: { addGold: 20 }
    },
    {
        id: "mire_cache",
        text: "Beneath a collapsed milestone you uncover a weatherproof satchel and a few intact trail supplies.",
        type: "discovery",
        effects: [
            { type: "addItem", itemId: "rations", quantity: 2, logText: "You salvage two days of trail rations." },
            { type: "addItem", itemId: "torch", quantity: 2, logText: "You recover spare torches." },
            { type: "status", id: "exhausted_1", duration: 1, characterId: "player", logText: "The detour leaves you winded." }
        ]
    }
];

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
    }
];

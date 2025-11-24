export const statusEffects = {
    "poisoned": {
        id: "poisoned",
        name: "Poisoned",
        description: "Disadvantage on attack rolls and ability checks.",
        duration: 3 // turns or scenes
    },
    "blessed": {
        id: "blessed",
        name: "Blessed",
        description: "Add 1d4 to attack rolls and saving throws.",
        duration: 5
    },
    "spore_sickness": {
        id: "spore_sickness",
        name: "Spore Sickness",
        duration: 10,
        description: "The spores have infected your lungs. Disadvantage on CON checks.",
        effect: { type: "disadvantage", skill: "constitution" }
    }
};

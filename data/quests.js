export const quests = {
    "investigate_whisperwood": {
        id: "investigate_whisperwood",
        title: "Investigate Whisperwood",
        description: "Travel to Sporefall and uncover what happened to Whisperwood Borough, Eoin, and Aodhan.",
        completionStage: null,
        stages: {
            0: {
                text: "Meet with Prince Alderic for your briefing.",
                suggestions: [
                    "Begin a new day in his chamber and hear what Silverthorn is willing to admit.",
                    "Use the briefing to learn what the eastern road is asking of you."
                ]
            },
            1: {
                text: "Prepare in Silverthorn before you take the eastern gate. The Rusty Blade, the temple road, and the market quarter are the surest places to gather what you need.",
                suggestions: [
                    "The Rusty Blade is a strong first stop if you want rumors and the city's mood.",
                    "Temple Road offers blessing, counsel, and steadier nerves before departure.",
                    "The market quarter is the cleanest route to supplies once you know what you are missing."
                ]
            },
            2: {
                text: "Survive the road and reach Sporefall, the ruins of Whisperwood Borough.",
                suggestions: [
                    "Keep moving east and judge the road carefully when it starts to feel wrong.",
                    "Treat each interruption as a clue, not just an obstacle."
                ]
            },
            3: {
                text: "Find Eoin and learn where the first real clues lie.",
                suggestions: [
                    "Follow any human trace that feels too deliberate to belong to the dead streets.",
                    "If you find the frightened survivor, earn enough trust to hear where the danger points next."
                ]
            },
            4: {
                text: "Pursue Aodhan's trail through Sporefall's cathedral quarter, overseer's row, or northern streets.",
                suggestions: [
                    "Choose the route that best matches what Eoin and the borough have already shown you.",
                    "The cathedral, the overseer's row, and the north side each hide a different angle on the ruin."
                ]
            }
        },
        currentStage: 0,
        completed: false
    }
};

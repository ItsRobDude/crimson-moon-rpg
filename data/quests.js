export const quests = {
    "investigate_whisperwood": {
        id: "investigate_whisperwood",
        title: "Investigate Whisperwood",
        description: "Travel to Sporefall and uncover what happened to Whisperwood Borough, Eoin, and Aodhan.",
        completionStage: null,
        stages: {
            0: {
                text: "Meet with Prince Alderic for your briefing.",
                thread: "Alderic's Charge",
                recentUpdate: "Silverthorn has finally named Aodhan and Liam in the same breath. Alderic is waiting with the writ and whatever truth the court is willing to spend.",
                pressure: "Nothing is chasing your heels yet, but the whole eastern road is about to become your only honest next step.",
                suggestions: [
                    "Begin a new day in his chamber and hear what Silverthorn is willing to admit.",
                    "Use the briefing to learn what the eastern road is asking of you."
                ]
            },
            1: {
                text: "Prepare in Silverthorn before you take the eastern gate. The Rusty Blade, the temple road, and the market quarter are the surest places to gather what you need.",
                thread: "Silverthorn Preparations",
                recentUpdate: "Alderic has set the charge and marked you for the road. You still have a little city left to spend before you commit to Shadowmire.",
                pressure: "Silverthorn will let you wander, but every stop is still time spent before the eastern road takes control of the story.",
                suggestions: [
                    "The Rusty Blade is a strong first stop if you want rumors and the city's mood.",
                    "Temple Road offers blessing, counsel, and steadier nerves before departure.",
                    "The market quarter is the cleanest route to supplies once you know what you are missing."
                ]
            },
            2: {
                text: "Survive the road and reach Sporefall, the ruins of Whisperwood Borough.",
                thread: "The Eastern Road",
                recentUpdate: "Silverthorn is behind you now. Shadowmire has started showing the first real signs that the road east is already lost.",
                pressure: "From here on, interruption is part of the route. Treat every omen, corpse, and survivor as a clue, not wasted time.",
                suggestions: [
                    "Keep moving east and judge the road carefully when it starts to feel wrong.",
                    "Treat each interruption as a clue, not just an obstacle."
                ]
            },
            3: {
                text: "Find Eoin and learn where the first real clues lie.",
                thread: "The Survivor in Sporefall",
                recentUpdate: "There is still one frightened human voice left in the borough. If you can steady Eoin, Sporefall's first true leads should finally stop hiding behind the dead.",
                pressure: "Eoin can point you toward the right quarter, but every route through the borough trades speed, certainty, and what kind of truth you reach first.",
                suggestions: [
                    "Follow any human trace that feels too deliberate to belong to the dead streets.",
                    "If you find the frightened survivor, earn enough trust to hear where the danger points next."
                ]
            },
            4: {
                text: "Pursue Aodhan's trail through Sporefall's cathedral quarter, overseer's row, or northern streets.",
                thread: "Sporefall's Three Live Trails",
                recentUpdate: "The borough has finally split into real leads. The cathedral, the overseer's row, and the north side each promise a different angle on Aodhan's path.",
                pressure: "You are not choosing a safe route. You are choosing which wound in Sporefall to read first and what kind of understanding you are willing to postpone.",
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

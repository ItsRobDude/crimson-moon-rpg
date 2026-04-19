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
            },
            5: {
                text: "Follow the witness trail north to Durnhelm and learn what Aodhan tore out of the dwarven holds.",
                thread: "The Witness Trail North",
                recentUpdate: "Sporefall has finally yielded a real northbound lead. Durnhelm still holds road-witnesses, wreckage, and one wounded forgemaster who may know what Aodhan stole.",
                pressure: "The borough is behind you, but not settled. If Cathal's warning proves true, every hour you give Aodhan is another hour for relic knowledge to turn uglier.",
                suggestions: [
                    "Take the Durnhelm lead while the witness trail is still warm.",
                    "Read the gate slaughter, the forge quarter, and Cathal's account for the shape of Aodhan's next move."
                ]
            },
            6: {
                text: "Climb Lament Hill, face Aine's grief, and learn what the Stone of Oblivion truly demands.",
                thread: "Aine on Lament Hill",
                recentUpdate: "Cathal has spent the last honest lead he had. The witch on Lament Hill may be the only living witness left who understands the Stone's appetite.",
                pressure: "This is no scholar's errand. The hill is still holding old violence, fresh grief, and a woman with every reason to hate what Silverthorn sent.",
                suggestions: [
                    "Reach the cottage and the graves before the hill decides you do not belong there.",
                    "Let the hill's grief tell you what Aodhan did before you ask Aine to speak it aloud."
                ]
            },
            7: {
                text: "If you dare the Forbidden Archives, take only enough truth to sharpen the Hushbriar hunt.",
                thread: "The Forbidden Archives",
                recentUpdate: "Aine has offered a cruel fork: race straight to Hushbriar or steal a narrower truth from the Archives before the coast takes the cost.",
                pressure: "The Archives are optional, but the time you spend there is still time Aodhan spends closing on the demigod.",
                suggestions: [
                    "Take the Archives only if you need the Stone's truth badly enough to pay in time and certainty.",
                    "Leave as soon as you have what Hushbriar truly needs."
                ]
            },
            8: {
                text: "Enter occupied Hushbriar, find Fionnlagh, and stay alert for the night that breaks toward Moonwell.",
                thread: "Hushbriar Under Occupation",
                recentUpdate: "The coast has narrowed the hunt to one place: Hushbriar, where soldiers, refugees, and frightened locals are all bracing for someone else's disaster.",
                pressure: "The town is not a resting point. If you miss the right people, or the right hour, the road to Moonwell will change shape without asking you.",
                suggestions: [
                    "Use the inn and Fionnlagh to read what Hushbriar fears but will not say in the street.",
                    "Stay ready for occupation pressure to turn into open night-horror without much warning."
                ]
            },
            9: {
                text: "Follow the broken-night clues through panic, dockside whispers, and the guild's bridge refuge until Elara is found.",
                thread: "The Hidden Demigod",
                recentUpdate: "Moonwell did not end the hunt. It shattered the town and left one urgent thread behind it: find Elara before panic, soldiers, or guild fear spends her first.",
                pressure: "Hushbriar is in open panic now. The clue trail is live, hostile, and short on mercy; if you move badly, the next truth may come with knives first.",
                suggestions: [
                    "Chase the nearest aftermath clue instead of trying to settle the whole town.",
                    "Read the dock, the ledger, and the guild's fear for where Elara is really being kept."
                ]
            },
            10: {
                text: "The demigod choice has opened a worse truth: Hushbriar is being emptied into processing lines, carts, and smoke.",
                thread: "Processing And The Next Dark",
                recentUpdate: "Elara's fate is no longer the only horror in the room. Silverthorn's answer for Hushbriar is organized disappearance, and the Soul Mill is now part of the road ahead.",
                pressure: "This is a cliff, not a conclusion. What you know now is enough to move the whole war into uglier territory.",
                suggestions: [
                    "Carry the processing truth into whatever comes next.",
                    "Treat the Soul Mill as knowledge earned, not yet a route you can safely follow."
                ]
            }
        },
        currentStage: 0,
        completed: false
    }
};

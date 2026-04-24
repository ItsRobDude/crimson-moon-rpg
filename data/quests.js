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
                leads: [
                    "Alderic is waiting with the writ, the names, and whatever truth Silverthorn is willing to admit."
                ],
                suggestions: [
                    "Alderic is waiting in his chamber with the writ and whatever truth Silverthorn is willing to admit.",
                    "The eastern road, Aodhan, and Liam are already the names tightening around this charge."
                ]
            },
            1: {
                text: "Prepare in Silverthorn before you take the eastern gate. The Rusty Blade, the temple road, and the market quarter are the surest places to gather what you need.",
                thread: "Silverthorn Preparations",
                recentUpdate: "Alderic has set the charge and marked you for the road. You still have a little city left to spend before you commit to Shadowmire.",
                pressure: "Silverthorn will let you wander, but every stop is still time spent before the eastern road takes control of the story.",
                leads: [
                    "Silverthorn still has rumor, prayer, supplies, and gate counsel to spend before the eastern road takes over."
                ],
                suggestions: [
                    "The Rusty Blade carries the city's loudest rumors and the clearest measure of its fear.",
                    "Temple Road offers blessing, counsel, and steadier nerves before departure.",
                    "The market quarter is where missing supplies can still be bought before the gate closes behind you."
                ]
            },
            2: {
                text: "Survive the road and reach Sporefall, the ruins of Whisperwood Borough.",
                thread: "The Eastern Road",
                recentUpdate: "Silverthorn is behind you now. Shadowmire has started showing the first real signs that the road east is already lost.",
                pressure: "From here on, interruption is part of the route. Treat every omen, corpse, and survivor as a clue, not wasted time.",
                leads: [
                    "The road itself has started leaving evidence; not every interruption is noise."
                ],
                suggestions: [
                    "Every interruption on the eastern road may matter more than it first appears.",
                    "Shadowmire is already warning you that the route to Sporefall has gone wrong in stages, not all at once."
                ]
            },
            3: {
                text: "Find Eoin and learn where the first real clues lie.",
                thread: "The Survivor in Sporefall",
                recentUpdate: "There is still one frightened human voice left in the borough. If you can steady Eoin, Sporefall's first true leads should finally stop hiding behind the dead.",
                pressure: "Eoin can point you toward the right quarter, but every route through the borough trades speed, certainty, and what kind of truth you reach first.",
                leads: [
                    "A living voice remains somewhere inside Sporefall, and fear has not made him useless yet."
                ],
                suggestions: [
                    "Any human trace that feels too deliberate for a dead street may belong to the survivor you still need.",
                    "If Eoin can be steadied, his fear should finally narrow Sporefall's first live leads."
                ]
            },
            4: {
                text: "Pursue Aodhan's trail through Sporefall's cathedral quarter, overseer's row, or northern streets.",
                thread: "Sporefall's Three Live Trails",
                recentUpdate: "The borough has finally split into real leads. The cathedral, the overseer's row, and the north side each promise a different angle on Aodhan's path.",
                pressure: "You are not choosing a safe route. You are choosing which wound in Sporefall to read first and what kind of understanding you are willing to postpone.",
                leads: [
                    "Sporefall is no longer silent; several wounds now point at Aodhan from different angles."
                ],
                suggestions: [
                    "The cathedral, the overseer's row, and the north side are all pointing at Aodhan from different wounds in the borough.",
                    "Whatever Sporefall has already shown you may matter when deciding which truth you read first."
                ]
            },
            5: {
                text: "Follow the witness trail north to Durnhelm and learn what Aodhan tore out of the dwarven holds.",
                thread: "The Witness Trail North",
                recentUpdate: "Sporefall has finally yielded a real northbound lead. Durnhelm still holds road-witnesses, wreckage, and one wounded forgemaster who may know what Aodhan stole.",
                pressure: "The borough is behind you, but not settled. If Cathal's warning proves true, every hour you give Aodhan is another hour for relic knowledge to turn uglier.",
                leads: [
                    "Durnhelm holds the next living account of what Aodhan took and how violently he took it."
                ],
                suggestions: [
                    "The northbound witness trail still runs through Durnhelm's dead, its survivors, and Cathal's account.",
                    "The forge quarter and the gate slaughter may say as much about Aodhan's next move as any living witness does."
                ]
            },
            6: {
                text: "Climb Lament Hill, face Aine's grief, and learn what the Stone of Oblivion truly demands.",
                thread: "Aine on Lament Hill",
                recentUpdate: "Cathal has spent the last honest lead he had. The witch on Lament Hill may be the only living witness left who understands the Stone's appetite.",
                pressure: "This is no scholar's errand. The hill is still holding old violence, fresh grief, and a woman with every reason to hate what Silverthorn sent.",
                leads: [
                    "Cathal's warning leaves Lament Hill as the next place where the Stone may finally be named honestly."
                ],
                suggestions: [
                    "The cottage, the graves, and Aine's anger are all part of the same truth waiting on the hill.",
                    "Lament Hill may say what Aodhan did long before Aine decides whether you deserve the words."
                ]
            },
            7: {
                text: "If you dare the Forbidden Archives, take only enough truth to sharpen the Hushbriar hunt.",
                thread: "The Forbidden Archives",
                recentUpdate: "Aine has offered a cruel fork: race straight to Hushbriar or steal a narrower truth from the Archives before the coast takes the cost.",
                pressure: "The Archives are optional, but the time you spend there is still time Aodhan spends closing on the demigod.",
                leads: [
                    "The Archives may sharpen what you know, but they are a cost, not a required road."
                ],
                suggestions: [
                    "The Archives promise sharper truth about the Stone, but they also cost time the coast may not have.",
                    "Whatever is taken from that place should be only what the Hushbriar hunt cannot do without."
                ]
            },
            8: {
                text: "Enter occupied Hushbriar, find Fionnlagh, and stay alert for the night that breaks toward Moonwell.",
                thread: "Hushbriar Under Occupation",
                recentUpdate: "The coast has narrowed the hunt to one place: Hushbriar, where soldiers, refugees, and frightened locals are all bracing for someone else's disaster.",
                pressure: "The town is not a resting point. If you miss the right people, or the right hour, the road to Moonwell will change shape without asking you.",
                leads: [
                    "Hushbriar is holding too many frightened people in one place, and one of them knows where the night is bending."
                ],
                suggestions: [
                    "The inn, Fionnlagh, and the street panic each hold a different read on what Hushbriar fears.",
                    "Occupation pressure here feels close to becoming something worse at night."
                ]
            },
            9: {
                text: "Follow the broken-night clues through panic, dockside whispers, and the guild's bridge refuge until Elara is found.",
                thread: "The Hidden Demigod",
                recentUpdate: "Moonwell did not end the hunt. It shattered the town and left one urgent thread behind it: find Elara before panic, soldiers, or guild fear spends her first.",
                pressure: "Hushbriar is in open panic now. The clue trail is live, hostile, and short on mercy; if you move badly, the next truth may come with knives first.",
                leads: [
                    "Elara is still hidden somewhere inside the panic, and more than one frightened faction has reason to keep her there."
                ],
                suggestions: [
                    "The nearest aftermath clue is more trustworthy than trying to calm the whole town at once.",
                    "The dock, the ledger, and the guild's fear all point toward where Elara is really being hidden."
                ]
            },
            10: {
                text: "The demigod choice has opened a worse truth: Hushbriar is being emptied into processing lines, carts, and smoke.",
                thread: "Processing And The Next Dark",
                recentUpdate: "Elara's fate is no longer the only horror in the room. Silverthorn's answer for Hushbriar is organized disappearance, and the Soul Mill is now part of the road ahead.",
                pressure: "This is a cliff, not a conclusion. What you know now is enough to move the whole war into uglier territory.",
                leads: [
                    "The Soul Mill is knowledge earned in horror, not a clean route the map is ready to hand you."
                ],
                suggestions: [
                    "The processing truth now follows whatever choice comes next.",
                    "The Soul Mill is knowledge earned, not yet a route the road is ready to give you."
                ]
            }
        },
        currentStage: 0,
        completed: false
    }
};

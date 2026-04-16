export const scenes = {
    "SCENE_ARRIVAL_HUSHBRIAR": {
        id: "SCENE_ARRIVAL_HUSHBRIAR",
        location: "hushbriar",
        background: "landscapes/silverthorn_market_avenue.png", // Placeholder until hushbriar landscape exists
        text: "You arrive at Hushbriar Cove a careful distance behind a Silverthorn patrol column. The road shoulders have been hacked clear, footprints press deep into the mud, and the sweet-rot smell from the corpse-choked creek still clings to your clothes. By the time the gates come into view, dusk has collapsed into cold fog and two soldiers stand watch beside a torch too weak for the work being asked of it.",
        onEnter: {
            addGold: 10 // Starting cash or adjustment
        },
        choices: [
            {
                text: "Approach the gates calmly.",
                nextScene: "SCENE_HUSHBRIAR_GATES"
            },
            {
                text: "Observe the guards first (Perception)",
                type: "skillCheck",
                skill: "perception",
                dc: 12,
                successText: "The guard on the left looks exhausted, leaning heavily on his spear. The one on the right is alert, his eyes scanning every face with suspicion.",
                failText: "It's too dark to make out details, but they seem on edge.",
                nextSceneSuccess: "SCENE_HUSHBRIAR_GATES",
                nextSceneFail: "SCENE_HUSHBRIAR_GATES"
            }
        ]
    },
    "SCENE_HUSHBRIAR_GATES": {
        id: "SCENE_HUSHBRIAR_GATES",
        location: "hushbriar",
        background: "landscapes/silverthorn_market_avenue.png", // Placeholder
        text: "'Halt, travelers. State your business, and be quick about it,' the older guard says. He looks tired enough to sway where he stands, but the younger one circles closer, eyes narrowing as he studies your gear, your faces, and anything that might tie you to Silverthorn's failed business in the east.",
        choices: [
            {
                text: "Say you only seek shelter and keep your heads low (Persuasion)",
                type: "skillCheck",
                skill: "persuasion",
                dc: 10,
                successText: "You keep your voice level and your story small. The older guard exhales through his teeth and waves you through. 'The emperor is conducting a search. Stay out of our way and keep your heads low.'",
                failText: "The younger guard stiffens. 'That mark... you're the ones who failed the Blackened King.' More soldiers answer his shout before you can clear the gate. Your weapons are stripped away and iron bites your wrists.",
                nextSceneSuccess: "SCENE_HUSHBRIAR_TOWN",
                nextSceneFail: "SCENE_PRISON_CAPTURE"
            },
            {
                text: "Blend in with the late refugees and slip past them (Stealth)",
                type: "skillCheck",
                skill: "stealth",
                dc: 14,
                successText: "You let a cluster of weary refugees swallow your silhouettes just long enough to pass the torchlight test. By the time the younger guard realizes he has miscounted the column, you are already inside the walls.",
                failText: "Your movement draws the wrong kind of attention. The younger guard lunges, catches the edge of your cloak, and calls the watch before you can vanish into the crowd.",
                nextSceneSuccess: "SCENE_HUSHBRIAR_TOWN",
                nextSceneFail: "SCENE_PRISON_CAPTURE"
            },
            {
                text: "Refuse the order and go for your weapons",
                nextScene: "SCENE_HUSHBRIAR_COMBAT_GUARDS"
            }
        ]
    },
    "SCENE_HUSHBRIAR_COMBAT_GUARDS": {
        id: "SCENE_HUSHBRIAR_COMBAT_GUARDS",
        location: "hushbriar",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "Silverthorn soldiers close in through fog, torchlight, and shouted orders. Steel clears leather as you lunge for the only opening before the press of bodies turns into chains.",
        type: "combat",
        enemies: ["silverthorn_guard", "silverthorn_guard"],
        winScene: "SCENE_HUSHBRIAR_TOWN",
        loseScene: "SCENE_PRISON_CAPTURE"
    },
    "SCENE_PRISON_CAPTURE": {
        id: "SCENE_PRISON_CAPTURE",
        location: "hushbriar",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "The gate watch does not kill you. It binds you, marches you through a city trying not to meet your eyes, and throws you into a holding cell with the promise that traitors do not leave Hushbriar by the front gate.",
        choices: [
            { text: "Wake to the scrape of boots beyond the bars...", nextScene: "SCENE_PRISON_CELL" }
        ]
    },
    "SCENE_PRISON_CELL": {
        id: "SCENE_PRISON_CELL",
        location: "hushbriar",
        background: "landscapes/alderics_chamber.webp", // Placeholder for cell
        text: "You wake in a cold stone cell with your wrists rubbed raw and your gear piled on a table just beyond the bars. A guard paces the corridor in uneven intervals. 'Twenty-four hours,' he mutters without looking at you. 'Then the scaffold can decide whether the King still remembers your names.'",
        choices: [
            {
                text: "Work the lock with whatever scrap and wire you can reach (Sleight of Hand)",
                type: "skillCheck",
                skill: "sleight_of_hand",
                dc: 14,
                successText: "The mechanism grudges you every inch, but at last it clicks. You slip out, reclaim your gear, and move before anyone thinks to look twice.",
                failText: "The pick slips, the lock snaps loud enough to wake the corridor, and the pacing guard wheels back toward your cell with a curse.",
                nextSceneSuccess: "SCENE_PRISON_ESCAPE",
                nextSceneFail: "SCENE_PRISON_GUARD_RETURN"
            },
            {
                text: "Offer the guard 50 gold to forget what he heard",
                cost: 50,
                nextScene: "SCENE_PRISON_ESCAPE"
            },
            {
                text: "Wait for the next change of watch",
                nextScene: "SCENE_PRISON_GUARD_RETURN"
            }
        ]
    },
    "SCENE_PRISON_GUARD_RETURN": {
        id: "SCENE_PRISON_GUARD_RETURN",
        location: "hushbriar",
        background: "landscapes/alderics_chamber.webp",
        text: "The guard stalks back to your cell, listening to the bars and lock with the bitter patience of a man who has heard too many desperate ideas in one night. He does not open the door, but he does lean close enough to make quiet bargains possible.",
        choices: [
            {
                text: "Press 50 gold through the bars and buy one loose latch",
                cost: 50,
                nextScene: "SCENE_PRISON_ESCAPE"
            },
            {
                text: "Lure him close and rush him when he unlocks the bars",
                nextScene: "SCENE_HUSHBRIAR_COMBAT_GUARDS"
            },
            {
                text: "Stay still until the corridor settles again",
                nextScene: "SCENE_PRISON_CELL"
            }
        ]
    },
    "SCENE_PRISON_ESCAPE": {
        id: "SCENE_PRISON_ESCAPE",
        location: "hushbriar",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "Whether by a loosened latch or bought silence, the cell no longer holds you. You reclaim your gear, duck past the watch before the corridor changes hands, and slip back toward Hushbriar's darkened streets.",
        choices: [
            { text: "Sneak into the town shadows", nextScene: "SCENE_HUSHBRIAR_TOWN" }
        ]
    },
    "SCENE_HUSHBRIAR_TOWN": {
        id: "SCENE_HUSHBRIAR_TOWN",
        location: "hushbriar",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "Inside the walls, Hushbriar feels occupied more than governed. Wood elves move in short, careful bursts between doorways, never lingering long enough for a patrol to question them, and the whole town smells of wet ash, horse sweat, and the sweet-rot stink drifting in from the corpse-clogged creek. Silverthorn tack fills the inn stables, but every shuttered home around it looks as if grief is holding the door from the other side. The Briarwood Inn still burns with enough light to gather refugees, pilgrims, and anyone too frightened to sleep alone.",
        choices: [
            {
                text: "Enter the Briarwood Inn.",
                nextScene: "SCENE_BRIARWOOD_INN"
            },
            {
                text: "Visit the shops.",
                nextScene: "SCENE_HUSHBRIAR_MARKET"
            },
            {
                text: "Scout the area (Survival)",
                type: "skillCheck",
                skill: "survival",
                dc: 10,
                companionAid: {
                    companionId: "neala",
                    bonus: 2,
                    logText: "Neala points out which alleys are actually escape lanes and which ones are just where patrols want the desperate to run."
                },
                successText: "You find a cache tucked beneath a split rain barrel: dried meat, lamp oil, and coin abandoned by a family that fled too fast to carry all of it.",
                failText: "You find cold cookfires, doors barred from the inside, and the signs of people learning to disappear before soldiers notice them.",
                onSuccess: { addGold: 10 },
                nextSceneSuccess: "SCENE_HUSHBRIAR_TOWN", // Loops back for now
                nextSceneFail: "SCENE_HUSHBRIAR_TOWN"
            }
        ]
    },
    "SCENE_HUSHBRIAR_MARKET": {
        id: "SCENE_HUSHBRIAR_MARKET",
        location: "hushbriar",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "The market survives in the way a wound survives: poorly covered and never clean. A sagging herbalist tent trades in bitter roots and fever draughts, a soot-stained provisioner measures food as if every handful might start a fight, and even the little library keeps its door half-shut, as though books have become something a person might be punished for wanting.",
        type: "shop",
        shopId: "silverthorn_market", // Reuse for now
        choices: [
            { text: "Return to town center.", nextScene: "SCENE_HUSHBRIAR_TOWN" }
        ]
    },
    "SCENE_HUSHBRIAR_CORRUPTED": {
        id: "SCENE_HUSHBRIAR_CORRUPTED",
        location: "hushbriar",
        background: "landscapes/silverthorn_market_avenue.png", // Placeholder: needs corrupted variant
        text: "If you reach this quarter after the town has already started sealing itself against the worst of the night, Hushbriar feels less conquered than abandoned in place. Patrols still pass, but between them the streets are all wet ash, shuttered grief, and red fungal creep climbing the woodwork where the creek-mist settles thickest.",
        choices: [
            {
                text: "Make for the Briarwood Inn while the patrol turns the corner.",
                nextScene: "SCENE_BRIARWOOD_INN"
            },
            {
                text: "Slip back toward the town center.",
                nextScene: "SCENE_HUSHBRIAR_TOWN"
            }
        ]
    },
    "SCENE_BRIARWOOD_INN": {
        id: "SCENE_BRIARWOOD_INN",
        location: "hushbriar",
        background: "landscapes/silverthorn_market_avenue.png", // Placeholder
        text: "Heat, damp wool, and low-voiced fear hit you at once. The Briarwood Inn is crowded with refugees sleeping upright over untouched bowls, pilgrims clutching prayer charms hard enough to leave marks in their palms, and locals who only dare speak once they have checked where the Silverthorn guards are standing. Even with the room full, nobody sounds safe. They sound like people trying not to be the loudest thing in a town that has started listening for weakness.",
        onEnter: {
            questUpdate: { id: "investigate_whisperwood", stage: 0 }
        },
        choices: [
            {
                text: "Pay for hearthspace and let the room watch over your rest",
                cost: 2,
                action: "shortRest"
            },
            {
                text: "Sit with the refugees and listen for which roads are still swallowing people (Insight)",
                type: "skillCheck",
                skill: "insight",
                dc: 12,
                companionAid: {
                    companionId: "neala",
                    bonus: 2,
                    logText: "Neala separates real fear from planted rumor before the lies settle in."
                },
                successText: "Between the refugees, dock hands, and hollow-eyed pilgrims, a pattern emerges: the bridge road is watched hardest, the creek paths are full of bodies, and no one who mentions a hidden boat ever does so above a whisper.",
                failText: "The room gives you fragments only: screams by the creek, guards at the bridge, and too many stories spoken with the shape of rumor but the smell of truth.",
                nextSceneSuccess: "SCENE_BRIARWOOD_INN",
                nextSceneFail: "SCENE_BRIARWOOD_INN"
            },
            {
                text: "Talk to Fionnlagh (if alive)",
                requires: { npcState: { id: "fionnlagh", status: "alive" } }, // Logic needed in game.js
                nextScene: "SCENE_FIONNLAGH_HUB"
            },
            {
                text: "Leave the Inn",
                nextScene: "SCENE_HUSHBRIAR_TOWN"
            }
        ]
    },
    "SCENE_FIONNLAGH_HUB": {
        id: "SCENE_FIONNLAGH_HUB",
        location: "hushbriar",
        background: "landscapes/silverthorn_market_avenue.png",
        npcPortrait: "portraits/npc_male_placeholder_portrait.png",
        onEnter: {
            once: true,
            effects: [
                { type: "flag", flagId: "hushbriar_fionnlagh_met", value: true },
                { type: "flag", flagId: "moonwell_night_available", value: true }
            ]
        },
        text: "Fionnlagh starts upright so fast his stool nearly tips. For one raw second he looks as though he expects to find a corpse where you are standing. His beard is damp with spilled drink, his vine-work headband sits crooked, and his eyes keep flicking toward the inn door like he can already hear something the rest of the room has not. 'Easy,' he mutters, though it sounds meant for himself. Then he recognizes you properly and the relief in his face only makes him look more frightened. 'By the gods... tell me you did not bring more death in with you. Every hour here feels wrong before it even happens.'",
        choices: [
            {
                text: "\"You said this is worse than plague. Tell me what you mean.\"",
                nextScene: "SCENE_FIONNLAGH_PLAGUE_INFO"
            },
            {
                text: "\"What became of the clan when all this started?\"",
                nextScene: "SCENE_FIONNLAGH_CLAN_INFO"
            },
            {
                text: "\"You keep looking at the door. What are you waiting to hear?\"",
                nextScene: "SCENE_HUSHBRIAR_SCREAMS"
            },
            {
                text: "Leave him to his drink and his dread.",
                nextScene: "SCENE_BRIARWOOD_INN"
            }
        ]
    },
    "SCENE_FIONNLAGH_PLAGUE_INFO": {
        id: "SCENE_FIONNLAGH_PLAGUE_INFO",
        location: "hushbriar",
        background: "landscapes/silverthorn_market_avenue.png",
        npcPortrait: "portraits/npc_male_placeholder_portrait.png",
        text: "Fionnlagh drags both hands down his face. 'Do not insult the dead by calling it sickness,' he whispers. He checks the nearest guard before leaning close enough for his voice to fray against your cheek. 'Sickness wastes a body. This thing empties one out and leaves something starving where the soul should be. I have seen men foam black at the mouth, tear at their own faces, and get back up looking at their wives like butcher's stock.'",
        choices: [
            { text: "\"Tell me the rest.\"", nextScene: "SCENE_FIONNLAGH_HUB" }
        ]
    },
    "SCENE_FIONNLAGH_CLAN_INFO": {
        id: "SCENE_FIONNLAGH_CLAN_INFO",
        location: "hushbriar",
        background: "landscapes/silverthorn_market_avenue.png",
        npcPortrait: "portraits/npc_male_placeholder_portrait.png",
        text: "Fionnlagh stares into his cup as if he expects to find an omen there. 'The clan did not break clean,' he says at last. 'It split along every old wound we were proud enough to call healed. Some blame the humans. Some blame our own. Some ran uphill to pray. Some took to the woods. Some shut their doors and waited for whichever mercy came last. Broken is too soft a word for what is left of us.'",
        choices: [
            { text: "\"Go on.\"", nextScene: "SCENE_FIONNLAGH_HUB" }
        ]
    },
    "SCENE_HUSHBRIAR_SCREAMS": {
        id: "SCENE_HUSHBRIAR_SCREAMS",
        location: "hushbriar",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "Before Fionnlagh can answer, a child's scream cuts across the night outside. A heartbeat later a woman's cry follows it, higher and more terrible, then several doors slam in panicked sequence as the whole lane tries to pretend it heard nothing. By the time you reach the street, the screaming has stopped. In its place comes the wet drag of something being hauled over mud, and a strand of spider silk glimmering between two fence posts where no web should be.",
        choices: [
            {
                text: "Run toward the lane before the silence settles.",
                nextScene: "SCENE_INVESTIGATION"
            },
            {
                text: "Go carefully, hand low and ready for steel.",
                nextScene: "SCENE_INVESTIGATION"
            }
        ]
    },
    "SCENE_INVESTIGATION": {
        id: "SCENE_INVESTIGATION",
        location: "hushbriar",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "The lane ends in a yard churned to black mud. One cottage door hangs half-off its hinges, and the threshold is glazed with blood already stringing dark in the night air. No one living remains in the yard, only the evidence of panic: dropped prayer charms, a wooden sword snapped in two, and long silken bands caught on the fence where something climbed out with weight enough to bend the posts. Beyond the yard, broken brush and drag-marks lead east toward the treeline.",
        choices: [
            {
                text: "Follow the drag-marks before the dark swallows them.",
                nextScene: "SCENE_TRACKING_CHOLDRITHS"
            },
            {
                text: "Back away and return to the inn with what you saw.",
                nextScene: "SCENE_BRIARWOOD_INN"
            }
        ]
    },
    "SCENE_THIEVES_CONFRONTATION": {
        id: "SCENE_THIEVES_CONFRONTATION",
        location: "hushbriar",
        background: "landscapes/silverthorn_market_avenue.png",
        npcPortrait: "portraits/npc_female_placeholder_portrait.png",
        text: "If you come here from an older save, the accusation-path is gone. The yard lies empty now but for blood, silk, and the same east-running trail toward the trees. Whatever did the killing has already left the lane behind.",
        choices: [
            {
                text: "Take the eastern trail toward the Moonwell.",
                nextScene: "SCENE_TRACKING_CHOLDRITHS"
            }
        ]
    },
    "SCENE_THIEVES_COMBAT": {
        id: "SCENE_THIEVES_COMBAT",
        location: "hushbriar",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "This older confrontation no longer resolves into combat in the live route. By the time you reach the yard, the only thing left to fight is the urge to waste more time while the trail east is still wet.",
        choices: [
            { text: "Take the eastern trail toward the Moonwell.", nextScene: "SCENE_TRACKING_CHOLDRITHS" }
        ]
    },
    "SCENE_TRACKING_CHOLDRITHS": {
        id: "SCENE_TRACKING_CHOLDRITHS",
        location: "hushbriar",
        background: "landscapes/forest_walk.png",
        text: "You follow dark blood, torn silk, and broken brush beyond the last houses of Hushbriar. The trail runs with ugly certainty beneath the trees until even the birds know better than to sing above it. The farther east you go, the colder the air grows, as though some wider darkness has finally remembered the road. At last the trail spills into the clearing of the Moonwell.",
        choices: [
            {
                text: "Approach the Moonwell in silence.",
                nextScene: "SCENE_MOONWELL"
            }
        ]
    },
    "SCENE_MOONWELL": {
        id: "SCENE_MOONWELL",
        location: "hushbriar",
        background: "landscapes/forest_walk_alt.png",
        text: "The Moonwell should be a place of still water and prayer. Tonight it looks flayed open. Black ripples keep disturbing the surface from below, though nothing breaks it. Two small bodies wrapped in spider silk hang above the well, turning slowly in the wind like accusations no god has answered. Beneath them stands Aodhan, head bowed, the Stone of Oblivion rising and falling in his hand as if grief has left the motion behind after everything else. Around the clearing the air feels wrong, stretched thin and tearing. Somewhere far beyond the trees, the world is darkening in earnest. He does not turn when he speaks. 'There should have been time,' he says quietly. 'For them. For all of this.'",
        onEnter: {
            once: true,
            effects: [
                { type: "flag", flagId: "moonwell_seen", value: true }
            ]
        },
        choices: [
            {
                text: "Confront Aodhan.",
                nextScene: "SCENE_AODHAN_TALK"
            }
        ]
    },
    "SCENE_AODHAN_TALK": {
        id: "SCENE_AODHAN_TALK",
        location: "hushbriar",
        background: "landscapes/forest_walk_alt.png",
        npcPortrait: "portraits/npc_male_placeholder_portrait.png",
        text: "Aodhan closes his hand around the Stone of Oblivion and turns at last. Moonlight catches the ruin in his face before anger can hide it. 'Sad, isn't it?' he says quietly, glancing once at the silk-wrapped bodies above the well. 'To die that young. To spend years praying the world kinder, then watch it bare its teeth in one night.' His eyes settle on you, fever-bright with exhaustion and fury. 'I held Sporefall shut for as long as I could. Do you feel it? The last ring of the spell is gone. The barrier around the borough has broken. The Underdark is spilling through at full strength now, and the plague is running with it. This is the moment it stops being contained. This is the moment the dark wins ground.'",
        choices: [
            {
                text: "\"Then this ends here, Aodhan.\"",
                nextScene: "SCENE_AODHAN_COMBAT"
            },
            {
                text: "Say nothing and let him pass into the dark.",
                nextScene: "SCENE_AFTERMATH"
            }
        ]
    },
    "SCENE_AODHAN_COMBAT": {
        id: "SCENE_AODHAN_COMBAT",
        location: "hushbriar",
        background: "landscapes/forest_walk_alt.png",
        text: "Something inside Aodhan gives way. Grief breaks open into violence, and dark power gathers around his arm like smoke learning how to bite.",
        type: "combat",
        enemies: ["spore_zombie"], // Placeholder for Aodhan
        winScene: "SCENE_AODHAN_DEFEAT",
        loseScene: "SCENE_DEFEAT"
    },
    "SCENE_AODHAN_DEFEAT": {
        id: "SCENE_AODHAN_DEFEAT",
        location: "hushbriar",
        background: "landscapes/forest_walk_alt.png",
        text: "Aodhan falls to his knees first, as though his body has only now remembered how tired it has always been. When he finally hits the earth, the Stone of Oblivion slips from his hand into the grass. The moment you take it, the ground answers with a low shudder, as if something far beneath the roots has felt the change and turned in its sleep.",
        onEnter: {
            addItem: "stone_of_oblivion",
            setFlag: "aodhan_dead" // Using generic flag system, but ideally we want explicit status logic
        },
        choices: [
            {
                text: "Lift your eyes to the sky.",
                nextScene: "SCENE_AFTERMATH"
            }
        ]
    },
    "SCENE_AFTERMATH": {
        id: "SCENE_AFTERMATH",
        location: "hushbriar",
        background: "landscapes/forest_walk.png",
        text: "Morning does not come. The darkness above the trees deepens until the moon bleeds red enough to stain the clouds around it, and the whole world seems to hold one terrible breath before giving way. Whatever had been buried beneath old stories and older prayers is buried no longer. It is here now, and it is not leaving quietly.",
        choices: [
            {
                text: "Turn back toward Silverthorn",
                nextScene: "SCENE_SILVERTHORN_QUARANTINE"
            },
            {
                text: "Take the road toward Lament Hill",
                nextScene: "SCENE_LAMENT_HILL_APPROACH"
            },
            {
                text: "Make for Durnhelm",
                nextScene: "SCENE_DURNHELM_GATES"
            }
        ]
    },
    "SCENE_SILVERTHORN_QUARANTINE": {
        id: "SCENE_SILVERTHORN_QUARANTINE",
        location: "silverthorn",
        background: "landscapes/forest_walk_alt.png",
        text: "You approach Silverthorn expecting orders and sanctuary, but the outer road is lined with makeshift barricades and exhausted guards. Smoke rises from burn pits where infected gear and bodies are being destroyed. No one is being allowed through the gates. The city has sealed itself away from the spreading plague.",
        choices: [
            {
                text: "Demand an audience with Alderic",
                type: "skillCheck",
                skill: "persuasion",
                dc: 14,
                successText: "The guards waver, but fear wins out. Even with your authority, they refuse to break the quarantine. One mutters that the prince no longer receives travelers from the outer roads.",
                failText: "The nearest guard lowers his spear and orders you back. Whatever loyalty he once held has been replaced by fear.",
                nextSceneSuccess: "SCENE_SILVERTHORN_QUARANTINE",
                nextSceneFail: "SCENE_SILVERTHORN_QUARANTINE"
            },
            {
                text: "Listen to the guards' rumors",
                type: "skillCheck",
                skill: "insight",
                dc: 12,
                successText: "Their whispers are full of dread. Some call Alderic the Blackened King now, and they speak of Aodhan as a wanted man who must not reach the city again.",
                failText: "The guards keep their distance and say little beyond repeated orders to stay back from the walls.",
                nextSceneSuccess: "SCENE_SILVERTHORN_QUARANTINE",
                nextSceneFail: "SCENE_SILVERTHORN_QUARANTINE"
            },
            {
                text: "Turn back and follow the other leads",
                action: "openMap"
            }
        ]
    },
    "SCENE_BRIEFING": {
        id: "SCENE_BRIEFING",
        location: "silverthorn",
        background: "landscapes/alderics_chamber.webp",
        npcPortrait: "portraits/alderic_portrait.png",
        text: "The chamber is dim and severe, lit by a single brazier and the red glow of wax seals melting over opened dispatches. Prince Alderic stands over a map table crowded with routes, blockades, and a red ring drawn hard around Whisperwood. He does not offer a seat. 'You are here,' he says at last, as if confirming a detail in a report. 'Good. Silverthorn still has use for those who can move before panic learns to outrank duty.'",
        onEnter: {
            once: true,
            questUpdate: { id: "investigate_whisperwood", stage: 1 },
            addGold: 150
        },
        choices: [
            {
                text: "Report on Aodhan's death (if dead)",
                requires: { flag: "aodhan_dead" }, // Needs logic update in game.js to check flags in requires?
                nextScene: "SCENE_ALDERIC_REACTION"
            },
            {
                text: "Say nothing and read the room before he reads you.",
                type: "skillCheck",
                skill: "perception",
                dc: 12,
                successText: "The room is stripped of comfort. No family emblems, no keepsakes, nothing soft. Only ledgers, wax, steel, and a map scarred around Whisperwood hard enough to tear the parchment.",
                failText: "The brazier throws more shadow than light, but even in half-darkness the prince's restraint feels less like calm than something locked down by force.",
                onSuccess: {
                    effects: [
                        { type: "relationship", npcId: "alderic", amount: 5 }
                    ]
                },
                nextSceneSuccess: "SCENE_BRIEFING_2", // Loop back or continue
                nextSceneFail: "SCENE_BRIEFING_2"
            },
            {
                text: "\"Enough ceremony. Tell me what matters.\"",
                nextScene: "SCENE_BRIEFING_2"
            }
        ]
    },
    "SCENE_ALDERIC_REACTION": {
        id: "SCENE_ALDERIC_REACTION",
        location: "silverthorn",
        background: "landscapes/alderics_chamber.webp",
        npcPortrait: "portraits/alderic_portrait.png",
        text: "Alderic absorbs the news without visible grief. Only the line of his mouth tightens. 'Aodhan is dead? Then whatever weakness survived in him dies with him. We move forward.'",
        choices: [
            { text: "\"Then give me the rest of the charge.\"", nextScene: "SCENE_BRIEFING_2" }
        ]
    },
    "SCENE_BRIEFING_2": {
        id: "SCENE_BRIEFING_2",
        location: "silverthorn",
        background: "landscapes/alderics_chamber.webp",
        npcPortrait: "portraits/alderic_portrait.png",
        text: "Alderic lays two fingers on the map as if pinning the borough in place. 'You will go to Whisperwood. You will learn what birthed this corruption. If there is a root to sever, you will sever it. My quartermaster has released coin for travel and what little surplus Silverthorn can still spare. Until you depart, the city is yours to use. When you are ready, take the eastern gate and follow the Shadowmire road.'",
        choices: [
            {
                text: "\"I hear the order. I will see it done.\"",
                effects: [
                    { type: "relationship", npcId: "alderic", amount: 10 },
                    { type: "reputation", factionId: "silverthorn", amount: 5 }
                ],
                nextScene: "SCENE_BRIEFING_DISMISSAL"
            },
            {
                text: "\"Before I go, tell me what sort of man Aodhan is now.\"",
                effects: [
                    { type: "relationship", npcId: "alderic", amount: 5 }
                ],
                nextScene: "SCENE_BRIEFING_INFO"
            }
        ]
    },
    "SCENE_BRIEFING_INFO": {
        id: "SCENE_BRIEFING_INFO",
        location: "silverthorn",
        background: "landscapes/alderics_chamber.webp",
        npcPortrait: "portraits/alderic_portrait.png",
        text: "'Aodhan was once counted among my trusted men,' Alderic says. The line sounds practiced, as though he has filed every rough edge from it before speaking. 'Now he is grief with a will and power enough to spread it. If you find him, do not make the mistake of calling pity mercy.'",
        choices: [
            {
                text: "\"That is enough. I will go.\"",
                effects: [
                    { type: "relationship", npcId: "alderic", amount: 5 }
                ],
                nextScene: "SCENE_BRIEFING_DISMISSAL"
            },
            {
                text: "\"A writ and a warning are thin armor. Send me better than that.\"",
                requires: {
                    relationship: { npcId: "alderic", min: 5 }
                },
                effects: [
                    { type: "addItem", itemId: "potion_healing" },
                    { type: "addGold", amount: 50 }
                ],
                nextScene: "SCENE_BRIEFING_DISMISSAL"
            }
        ]
    },
    "SCENE_BRIEFING_DISMISSAL": {
        id: "SCENE_BRIEFING_DISMISSAL",
        location: "silverthorn",
        background: "landscapes/alderics_chamber.webp",
        npcPortrait: "portraits/alderic_portrait.png",
        text: "Alderic slides a sealed writ across the table without breaking eye contact. 'Show that to any gate sergeant or quartermaster who thinks fear outranks duty. Do not bring me rumors. Bring me answers.' Behind you, the chamber doors stand open to the noise of a city pretending not to listen for bad news.",
        choices: [
            {
                text: "Take the writ and step back into Silverthorn.",
                nextScene: "SCENE_HUB_SILVERTHORN"
            }
        ]
    },
    "SCENE_ALDERIC_CHAMBER_RETURN": {
        id: "SCENE_ALDERIC_CHAMBER_RETURN",
        location: "silverthorn",
        background: "landscapes/alderics_chamber.webp",
        npcPortrait: "portraits/alderic_portrait.png",
        text: "Alderic remains where you left him, framed by candlelight and reports gone soft at the corners from too many hands. He looks up only long enough to confirm it is you. 'You already have your orders. If there is a need, speak it without wasting either of our time.'",
        choices: [
            {
                text: "\"State the charge again.\"",
                nextScene: "SCENE_ALDERIC_MISSION_REMINDER"
            },
            {
                text: "Leave him to his dispatches.",
                nextScene: "SCENE_HUB_SILVERTHORN"
            }
        ]
    },
    "SCENE_ALDERIC_MISSION_REMINDER": {
        id: "SCENE_ALDERIC_MISSION_REMINDER",
        location: "silverthorn",
        background: "landscapes/alderics_chamber.webp",
        npcPortrait: "portraits/alderic_portrait.png",
        text: "Alderic answers as if reciting from something settled long before you arrived. 'Whisperwood. Find the source. Sever it if it can be severed. Use the city while you still possess the luxury of walls. Then take the eastern road through Shadowmire.'",
        choices: [
            {
                text: "Return to the city.",
                nextScene: "SCENE_HUB_SILVERTHORN"
            }
        ]
    },
    "SCENE_SILVERTHORN_MARKET": {
        id: "SCENE_SILVERTHORN_MARKET",
        location: "silverthorn",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "The market district is the loudest corner of Silverthorn. Traders shout over one another, pack animals snort at loaded carts, and a dozen side streets promise food, steel, rumor, or trouble. A weathered sign for The Rusty Blade swings above a nearby lane.",
        choices: [
            { text: "Browse the General Store", nextScene: "SCENE_SILVERTHORN_GENERAL_STORE" },
            { text: "Visit the blacksmith", nextScene: "SCENE_SILVERTHORN_BLACKSMITH" },
            { text: "Step into The Rusty Blade", nextScene: "SCENE_RUSTY_BLADE_INN" },
            { text: "Return to City Center", nextScene: "SCENE_HUB_SILVERTHORN" }
        ]
    },
    "SCENE_SILVERTHORN_GENERAL_STORE": {
        id: "SCENE_SILVERTHORN_GENERAL_STORE",
        location: "silverthorn",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "Shelves crowd the walls of the general store, laden with lamp oil, dried meat, blankets, bandages, and the sort of practical supplies adventurers always wish they had packed sooner.",
        type: "shop",
        shopId: "silverthorn_general_store",
        choices: [
            { text: "Step back into the market district", nextScene: "SCENE_SILVERTHORN_MARKET" },
            { text: "Return to City Center", nextScene: "SCENE_HUB_SILVERTHORN" }
        ]
    },
    "SCENE_SILVERTHORN_BLACKSMITH": {
        id: "SCENE_SILVERTHORN_BLACKSMITH",
        location: "silverthorn",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "The forge glows orange behind a curtain of sparks. Racks of blades, bows, helms, and half-finished mail line the walls while apprentices hurry between bellows and anvils.",
        type: "shop",
        shopId: "silverthorn_armorer",
        choices: [
            { text: "Return to the market district", nextScene: "SCENE_SILVERTHORN_MARKET" },
            { text: "Head back to City Center", nextScene: "SCENE_HUB_SILVERTHORN" }
        ]
    },
    "SCENE_RUSTY_BLADE_INN": {
        id: "SCENE_RUSTY_BLADE_INN",
        location: "silverthorn",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "The Rusty Blade is half tavern, half barracks overflow. Couriers, sellswords, and merchants crowd the common room while a barkeep polishes tankards with the steady calm of someone used to overhearing dangerous things.",
        choices: [
            { text: "Take a room and rest", action: "longRest" },
            { text: "Listen for rumors about Whisperwood", nextScene: "SCENE_RUSTY_BLADE_RUMORS" },
            { text: "Return to the market district", nextScene: "SCENE_SILVERTHORN_MARKET" }
        ]
    },
    "SCENE_RUSTY_BLADE_RUMORS": {
        id: "SCENE_RUSTY_BLADE_RUMORS",
        location: "silverthorn",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "Most of what you hear is frightened speculation, but the useful thread repeats itself often enough: caravans from the east have stopped arriving, and every survivor who does return speaks of drifting red spores, missing patrols, and whole glades gone silent overnight.",
        choices: [
            { text: "Return to the common room", nextScene: "SCENE_RUSTY_BLADE_INN" },
            { text: "Head for the city gates", nextScene: "SCENE_SILVERTHORN_GATES" }
        ]
    },
    "SCENE_SILVERTHORN_TEMPLE": {
        id: "SCENE_SILVERTHORN_TEMPLE",
        location: "silverthorn",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "The Temple of Dawn is quieter than the market, filled with low prayer, warm candlelight, and the smell of incense. A few healers move between benches offering comfort to worried families and soldiers bound for the road.",
        choices: [
            { text: "Speak with the healers about the road ahead", nextScene: "SCENE_SILVERTHORN_TEMPLE_COUNSEL" },
            { text: "Offer a quiet prayer before you depart", nextScene: "SCENE_SILVERTHORN_TEMPLE_PRAYER" },
            { text: "Return to City Center", nextScene: "SCENE_HUB_SILVERTHORN" }
        ]
    },
    "SCENE_SILVERTHORN_TEMPLE_COUNSEL": {
        id: "SCENE_SILVERTHORN_TEMPLE_COUNSEL",
        location: "silverthorn",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "The healers warn that anything tied to Whisperwood should be treated with suspicion. They urge you to keep antitoxin close, burn tainted cloth, and trust no stream that runs red beneath the moon.",
        choices: [
            { text: "Remain in the temple a while longer", nextScene: "SCENE_SILVERTHORN_TEMPLE" },
            { text: "Return to City Center", nextScene: "SCENE_HUB_SILVERTHORN" }
        ]
    },
    "SCENE_SILVERTHORN_TEMPLE_PRAYER": {
        id: "SCENE_SILVERTHORN_TEMPLE_PRAYER",
        location: "silverthorn",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "You take a quiet moment beneath the stained glass and let the city's noise fall away. For a few breaths, the mission feels less like a command and more like a path you have chosen.",
        choices: [
            { text: "Step back into the temple hall", nextScene: "SCENE_SILVERTHORN_TEMPLE" },
            { text: "Return to City Center", nextScene: "SCENE_HUB_SILVERTHORN" }
        ]
    },
    "SCENE_SILVERTHORN_NOTICE_BOARD": {
        id: "SCENE_SILVERTHORN_NOTICE_BOARD",
        location: "silverthorn",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "A broad notice board stands near the square, layered with militia summons, missing-person sketches, merchant warnings, and handwritten pleas from families with kin somewhere beyond the eastern road.",
        choices: [
            { text: "Read the Whisperwood notices", nextScene: "SCENE_SILVERTHORN_NOTICE_WHISPERWOOD" },
            { text: "Read the city contracts and bounties", nextScene: "SCENE_SILVERTHORN_NOTICE_CONTRACTS" },
            { text: "Return to City Center", nextScene: "SCENE_HUB_SILVERTHORN" }
        ]
    },
    "SCENE_SILVERTHORN_NOTICE_WHISPERWOOD": {
        id: "SCENE_SILVERTHORN_NOTICE_WHISPERWOOD",
        location: "silverthorn",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "Several notices mention the same pattern: scouts vanish near Whisperwood's edge, hunters return feverish and confused, and an entire patrol failed to report back after entering the treeline under Alderic's banner.",
        choices: [
            { text: "Keep reading the board", nextScene: "SCENE_SILVERTHORN_NOTICE_BOARD" },
            { text: "Head for the city gates", nextScene: "SCENE_SILVERTHORN_GATES" }
        ]
    },
    "SCENE_SILVERTHORN_NOTICE_CONTRACTS": {
        id: "SCENE_SILVERTHORN_NOTICE_CONTRACTS",
        location: "silverthorn",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "Most postings are the ordinary labor of a strained city: escort work, cellar pests, and warehouse watches. But newer notices speak in harsher terms of curfew enforcement, vanished smugglers, suspicious alchemists, and sealed inspections no one is meant to ask about twice.",
        choices: [
            { text: "Return to the notice board", nextScene: "SCENE_SILVERTHORN_NOTICE_BOARD" },
            { text: "Return to City Center", nextScene: "SCENE_HUB_SILVERTHORN" }
        ]
    },
    "SCENE_SILVERTHORN_GATES": {
        id: "SCENE_SILVERTHORN_GATES",
        location: "silverthorn",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "Silverthorn's eastern gate rises above the road like a fortress wall. Wagons are being inspected before departure, and a tired gate captain keeps one hand on a ledger and the other on the pommel of his sword.",
        choices: [
            { text: "Ask the gate captain about the road", nextScene: "SCENE_SILVERTHORN_GATE_CAPTAIN" },
            { text: "Leave Silverthorn for Shadowmire", nextScene: "SCENE_TRAVEL_SHADOWMIRE" },
            { text: "Return to City Center", nextScene: "SCENE_HUB_SILVERTHORN" }
        ]
    },
    "SCENE_SILVERTHORN_GATE_CAPTAIN": {
        id: "SCENE_SILVERTHORN_GATE_CAPTAIN",
        location: "silverthorn",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "The captain taps the route on your writ. 'Stay on the road until the fog thickens, then trust your footing more than your eyes. If you see red drifting across the path, cover your mouth and keep moving. No patrol we sent past the old mile-stone has returned unchanged.'",
        choices: [
            { text: "Leave Silverthorn now", nextScene: "SCENE_TRAVEL_SHADOWMIRE" },
            { text: "Return to the gate plaza", nextScene: "SCENE_SILVERTHORN_GATES" }
        ]
    },
    "SCENE_TRAVEL_SHADOWMIRE": {
        id: "SCENE_TRAVEL_SHADOWMIRE",
        location: "shadowmire",
        background: "landscapes/forest_walk.png",
        text: "You leave Silverthorn behind and follow the eastern road beneath the living canopy of Shadowmire Forest. Pine and damp earth fill the air. Songbirds trade calls overhead, and for a few miles the road almost feels ordinary again despite the weight of Alderic's mission on your back.",
        onEnter: {
            questUpdate: { id: "investigate_whisperwood", stage: 2 }
        },
        choices: [
            {
                text: "Keep to the road and press deeper into Shadowmire",
                nextScene: "SCENE_SHADOWMIRE_HAZE"
            }
        ]
    },
    "SCENE_SHADOWMIRE_HAZE": {
        id: "SCENE_SHADOWMIRE_HAZE",
        location: "shadowmire",
        background: "landscapes/foggy_forest.png",
        text: "Hours later the light begins to flatten. A chill breeze slides through the trees, and a strange violet haze starts gathering low between the trunks. The birds go quiet one by one. Then a whole flock bursts upward at once, beating the air in panic over the road ahead.",
        choices: [
            {
                text: "Watch the treetops and listen for what scared them",
                nextScene: "SCENE_SHADOWMIRE_DYING_BIRDS"
            },
            {
                text: "Cover your mouth and hurry forward",
                nextScene: "SCENE_SHADOWMIRE_DYING_BIRDS"
            }
        ]
    },
    "SCENE_SHADOWMIRE_DYING_BIRDS": {
        id: "SCENE_SHADOWMIRE_DYING_BIRDS",
        location: "shadowmire",
        background: "landscapes/dying_bird_scene.png",
        text: "Before anyone can speak, the flock drops out of the purple haze like stones. Birds strike branch and earth alike, dead before they land. The air suddenly tastes wrong, sweet and rotten at once, and your eyes begin to sting as the mist thickens around the road.",
        choices: [
            {
                text: "Fight for one clean breath (CON Save)",
                type: "save",
                ability: "CON",
                dc: 12,
                successText: "You clamp a sleeve over your face and stay on your feet a little longer, but the world is already starting to tilt.",
                failText: "Your lungs seize on the first breath you take. You cough violently as the haze floods your senses and the world folds into darkness.",
                failEffect: { type: "status", id: "spore_sickness" },
                nextScene: "SCENE_SPOREFALL_WAKE"
            }
        ]
    },
    "SCENE_SHADOWMIRE_ROADSIDE_CORPSE": {
        id: "SCENE_SHADOWMIRE_ROADSIDE_CORPSE",
        location: "shadowmire",
        background: "landscapes/foggy_forest.png",
        text: "Two more hard hours pass beneath a forest that no longer feels alive. Near sunset you find a body in the middle of the road, black mold slick around the eyes, nose, and mouth. From the brush nearby comes a ragged cough, then another, then the wet sweetness of the spores rolling over everything at once.",
        choices: [
            {
                text: "Examine the body before the haze closes in (Medicine)",
                type: "skillCheck",
                skill: "medicine",
                dc: 11,
                successText: "There are no wounds, no sign of struggle, only the mold spreading from every place breath once passed. Whatever killed him was already in the air.",
                failText: "Your stomach turns before you can learn much beyond the mold and the wrong sweetness in the air.",
                nextSceneSuccess: "SCENE_SPOREFALL_WAKE",
                nextSceneFail: "SCENE_SPOREFALL_WAKE"
            },
            {
                text: "Call toward the coughing in the brush",
                nextScene: "SCENE_SPOREFALL_WAKE"
            }
        ]
    },
    "SCENE_SPOREFALL_WAKE": {
        id: "SCENE_SPOREFALL_WAKE",
        location: "whisperwood",
        background: "landscapes/sporefall_crimson_frontier.png",
        text: "When your eyes snap open, the sky above you is black and a swollen crimson moon hangs where daylight should be. Dead birds and small animals lie scattered around the road. Strange blue-violet plants glow through the drifting spores, and the memory of healthy Shadowmire already feels impossibly far away.",
        onEnter: {
            once: true,
            questUpdate: { id: "investigate_whisperwood", stage: 2 }
        },
        choices: [
            {
                text: "Steady your breathing and take stock (WIS Check)",
                type: "skillCheck",
                skill: "insight",
                dc: 11,
                successText: "You force yourself to count breaths and details instead of fear. The panic eases just enough for you to think.",
                failText: "The spores catch in your throat and the sight of the dead things around you makes your stomach lurch before you can steady yourself.",
                nextSceneSuccess: "SCENE_ARRIVAL_WHISPERWOOD",
                nextSceneFail: "SCENE_ARRIVAL_WHISPERWOOD"
            },
            {
                text: "Lie still and listen to the new forest (Perception)",
                type: "skillCheck",
                skill: "perception",
                dc: 12,
                successText: "Somewhere beyond the haze, something large moves with a wet, dragging rhythm. You mark the sound and plan your first steps carefully.",
                failText: "The woods answer only with the whisper of spores and a silence that feels too attentive.",
                nextSceneSuccess: "SCENE_ARRIVAL_WHISPERWOOD",
                nextSceneFail: "SCENE_ARRIVAL_WHISPERWOOD"
            }
        ]
    },
    "SCENE_ARRIVAL_WHISPERWOOD": {
        id: "SCENE_ARRIVAL_WHISPERWOOD",
        location: "whisperwood",
        background: "landscapes/sporefall_crimson_frontier.png",
        text: "You follow the ruined road until the borough opens beneath the crimson moon. Abandoned carts choke the street, roofs sag beneath wild growth, and every window stares back like a blind eye. This was once Whisperwood Borough. What survives of it now can only be called Sporefall.",
        choices: [
            {
                text: "Search the nearest street for survivors (Perception)",
                type: "skillCheck",
                skill: "perception",
                dc: 10,
                successText: "Out of the corner of your eye, something pale and human slips behind a nearby house. It is too careful to be a beast.",
                failText: "The growths split wetly under your fingers, leaving them glazed in cold mucus and black grit. Somewhere close by, something answers the sound with a slow, dragging shift.",
                onSuccess: {
                    effects: [
                        { type: "flag", flagId: "sporefall_eoin_glimpsed", value: true }
                    ]
                },
                onFail: {
                    effects: [
                        { type: "flag", flagId: "sporefall_eoin_delayed", value: true }
                    ]
                },
                nextSceneSuccess: "SCENE_MEET_EOIN",
                nextSceneFail: "SCENE_SPOREFALL_STREET_SEARCH"
            },
            {
                text: "Move between the ruined homes",
                nextScene: "SCENE_SPOREFALL_STREET_SEARCH"
            },
            {
                text: "Pause and listen for anyone still alive",
                nextScene: "SCENE_SPOREFALL_STREET_SEARCH"
            }
        ]
    },
    "SCENE_SPOREFALL_STREET_SEARCH": {
        id: "SCENE_SPOREFALL_STREET_SEARCH",
        location: "whisperwood",
        background: "landscapes/sporefall_crimson_frontier.png",
        text: "You press a little deeper into the borough before the silence breaks into something smaller and sadder than fear: a scuffed footstep, then a cough, then the scrape of someone trying not to be found. It comes from behind a ruined home whose door still hangs open on one hinge.",
        choices: [
            {
                text: "Follow the coughing behind the house",
                nextScene: "SCENE_MEET_EOIN"
            },
            {
                text: "Circle wide and cut off whoever is hiding",
                nextScene: "SCENE_MEET_EOIN"
            }
        ]
    },
    "SCENE_COMBAT_ENCOUNTER": {
        id: "SCENE_COMBAT_ENCOUNTER",
        location: "whisperwood",
        background: "landscapes/sporefall_outskirt_encounter.png",
        text: "A rustling becomes a rolling thunder of hooves and claws. Spores scatter as a hulking shape pushes through the undergrowth. It hasn't seen you yet, but the distance is closing fast.",
        choices: [
            {
                text: "Stand your ground and fight",
                nextScene: "SCENE_FUNGAL_AMBUSH"
            },
            {
                text: "Back away slowly (Acrobatics)",
                type: "skillCheck",
                skill: "acrobatics",
                dc: 12,
                successText: "You ease back, keeping low. The beast's head swings the other way as you clear the worst of the spores.",
                failText: "You stumble on slick moss. The beast lunges toward the noise!",
                nextSceneSuccess: "SCENE_SKIRT_BEAST",
                nextSceneFail: "SCENE_FUNGAL_AMBUSH"
            },
            {
                text: "Throw a stone to distract it",
                nextScene: "SCENE_SKIRT_BEAST"
            }
        ]
    },
    "SCENE_FUNGAL_AMBUSH": {
        id: "SCENE_FUNGAL_AMBUSH",
        location: "whisperwood",
        background: "landscapes/sporefall_outskirt_encounter.png",
        text: "The Fungal Beast erupts from the haze, spores streaming from its matted hide as it barrels toward you!",
        type: "combat",
        enemies: ["fungal_beast"],
        winScene: "SCENE_VICTORY",
        loseScene: "SCENE_DEFEAT"
    },
    "SCENE_SKIRT_BEAST": {
        id: "SCENE_SKIRT_BEAST",
        location: "whisperwood",
        background: "landscapes/sporefall_crimson_frontier.png",
        text: "You give the creature a wide berth, slipping between the trees while it snorts and paws at the moss. The spores glow faintly on your cloak, but the beast fades behind you.",
        onEnter: {
            questUpdate: { id: "investigate_whisperwood", stage: 3 },
            once: true
        },
        choices: [
            {
                text: "Keep moving while it's distracted",
                nextScene: "SCENE_MEET_EOIN"
            }
        ]
    },
    "SCENE_VICTORY": {
        id: "SCENE_VICTORY",
        location: "whisperwood",
        background: "landscapes/sporefall_crimson_frontier.png",
        text: "The beast collapses into a pile of sludge. Spores cling to your armor and weapons, and the forest goes silent. You wipe your gear clean and listen—a voice carries through the haze.",
        onEnter: {
             questUpdate: { id: "investigate_whisperwood", stage: 3 }
        },
        choices: [
            {
                text: "Hear a voice nearby...",
                nextScene: "SCENE_MEET_EOIN"
            }
        ]
    },
    "SCENE_MEET_EOIN": {
        id: "SCENE_MEET_EOIN",
        location: "whisperwood",
        background: "landscapes/sporefall_crimson_frontier.png",
        npcPortrait: "portraits/npc_male_placeholder_portrait.png",
        text: "A boy no older than his early teens edges out from behind the ruined house, one shoulder still tucked behind the wall as if he might snatch himself back out of sight if you blink wrong. He is pale enough for the red moon to make a ghost of him. His clothes hang in filthy strips, and the broken spear in his hands shakes so badly it looks borrowed from someone braver. 'Stay back,' he whispers, then louder, because fear makes him try again. 'Stay back. Are you real, or is the moon doing it again?'",
        choices: [
            {
                text: "\"Easy. I'm real. I'm not here to hurt you.\" (Persuasion)",
                type: "skillCheck",
                skill: "persuasion",
                dc: 12,
                successText: "The spear lowers a finger's width at a time. 'Silverthorn?' he says, like the name itself might vanish if he says it too loudly. His swallow is visible in his throat. 'Then... then maybe you're not a lie. I'm Eoin. Something bad happened. Worse than bad.'",
                failText: "He flinches as if your voice struck him. 'No. No, you sound wrong.' He backs into the ruin-shadow, eyes huge and wet in the crimson dark, but he cannot make himself run very far.",
                onSuccess: {
                    effects: [
                        { type: "flag", flagId: "sporefall_eoin_met", value: true },
                        { type: "relationship", npcId: "eoin", amount: 15 },
                        { type: "reputation", factionId: "whisperwood_survivors", amount: 10 }
                    ]
                },
                nextSceneSuccess: "SCENE_EOIN_TALK",
                nextSceneFail: "SCENE_ALONE_AGAIN"
            },
            {
                text: "\"Stop shaking and tell me what happened here.\"",
                effects: [
                    { type: "flag", flagId: "sporefall_eoin_met", value: true },
                    { type: "relationship", npcId: "eoin", amount: -10 }
                ],
                nextScene: "SCENE_ALONE_AGAIN"
            }
        ]
    },
    "SCENE_EOIN_TALK": {
        id: "SCENE_EOIN_TALK",
        location: "whisperwood",
        background: "landscapes/sporefall_crimson_frontier.png",
        npcPortrait: "portraits/npc_male_placeholder_portrait.png",
        text: "Once Eoin believes you are real, the words come in frightened bursts that trip over one another. The cathedral. Bells that never rang right. Something huge in the streets. The north side, where he and his mum slept under a bridge when the weather turned cruel. He keeps stopping to look at his own hands as if they belong to someone just out of sight. He does not say he is dead. He does not seem able to think it. But every time he goes still, the moonlight finds too much of the wall through him.",
        choices: [
            {
                text: "\"Slow down. Start with the cathedral.\"",
                effects: [
                    { type: "flag", flagId: "sporefall_eoin_talked", value: true }
                ],
                nextScene: "SCENE_EOIN_RITUAL_TALK"
            },
            {
                text: "\"You keep saying north. Is your mum there?\"",
                effects: [
                    { type: "flag", flagId: "sporefall_eoin_talked", value: true },
                    { type: "relationship", npcId: "eoin", amount: 5 }
                ],
                nextScene: "SCENE_EOIN_MOTHER_TALK"
            },
            {
                text: "\"Stay down. I need to look around first.\"",
                effects: [
                    { type: "flag", flagId: "sporefall_eoin_talked", value: true }
                ],
                nextScene: "SCENE_HUB_SPOREFALL"
            }
        ]
    },
    "SCENE_HUSHBRIAR_MORNING_SETUP": {
        id: "SCENE_HUSHBRIAR_MORNING_SETUP",
        location: "hushbriar",
        background: "landscapes/silverthorn_market_avenue.png",
        onEnter: {
            once: true,
            effects: [
                { type: "flag", flagId: "moonwell_missed", value: true },
                { type: "flag", flagId: "moonwell_morning_setup_seen", value: true }
            ]
        },
        text: "By first light, Hushbriar has given up the lie that the night passed cleanly. The town square is a knot of shouting, fleeing townsfolk, Silverthorn steel, and the first ugly whisper of guild knives answering back from the alleys. A mage with a dark stone has already carved his way through more than one door looking for someone the town refuses to name. Nobody can hold the square much longer. Whatever this becomes by noon, it will be war in miniature.",
        choices: [
            {
                text: "Follow the fresh ruin east before the square locks into slaughter.",
                nextScene: "SCENE_MOONWELL"
            },
            {
                text: "Slip back into the Briarwood and gather yourself first.",
                nextScene: "SCENE_BRIARWOOD_INN"
            }
        ]
    },
    "SCENE_EOIN_RECRUITED": {
        id: "SCENE_EOIN_RECRUITED",
        location: "whisperwood",
        background: "landscapes/sporefall_crimson_frontier.png",
        npcPortrait: "portraits/npc_male_placeholder_portrait.png",
        text: "Eoin looks past you toward the street and goes gray with the thought of being left in it. His fingers knot white around the broken spear. 'Don't leave me here,' he says too fast, then winces like he said too much. 'I can be quiet. I know some bits. Not all of it. Just... some. The bridge. The little lanes. Places Mum used to say were safer.' He drags in a thin breath. 'If I stay by myself, I keep hearing the town think.'",
        choices: [
            {
                text: "Let him come with you.",
                nextScene: "SCENE_HUB_SPOREFALL"
            }
        ]
    },
    "SCENE_EOIN_RITUAL_TALK": {
        id: "SCENE_EOIN_RITUAL_TALK",
        location: "whisperwood",
        background: "landscapes/sporefall_crimson_frontier.png",
        npcPortrait: "portraits/npc_male_placeholder_portrait.png",
        text: "Eoin folds his arms over himself so tightly it looks like he is trying to keep from spilling apart. 'The Overseer was there before it all went wrong. Folk said it was some rite. Something important.' He shakes his head hard. 'Then the dark came down all at once, like it had been waiting above us. After that there were people in the streets, only not right. Bent. Wrong. Like the town kept the shape and took the person out.' He glances west and almost hides behind the spear again. 'If anywhere remembers first, it'd be the cathedral.'",
        choices: [
            {
                text: "\"Tell me about the north side instead.\"",
                nextScene: "SCENE_EOIN_MOTHER_TALK"
            },
            {
                text: "\"All right. Keep your head down.\"",
                effects: [
                    { type: "flag", flagId: "sporefall_eoin_talked", value: true }
                ],
                nextScene: "SCENE_HUB_SPOREFALL"
            }
        ]
    },
    "SCENE_EOIN_MOTHER_TALK": {
        id: "SCENE_EOIN_MOTHER_TALK",
        location: "whisperwood",
        background: "landscapes/sporefall_crimson_frontier.png",
        npcPortrait: "portraits/npc_male_placeholder_portrait.png",
        text: "At the mention of his mother, Eoin's voice shrinks to something you have to lean in to catch. 'We slept under the footbridge on the north side when we had nowhere else. Mum said the stone kept the wind off if you tucked close enough.' He rubs at one eye with a dirty wrist. 'I was looking for her when it happened. I keep thinking if I could just see the bridge proper, I'd remember where she went. Or what I was meant to do.' He looks north, then snaps his gaze away like the street looked back.",
        choices: [
            {
                text: "\"Start again. What happened in the cathedral?\"",
                nextScene: "SCENE_EOIN_RITUAL_TALK"
            },
            {
                text: "\"Stay hidden a little longer.\"",
                effects: [
                    { type: "flag", flagId: "sporefall_eoin_talked", value: true }
                ],
                nextScene: "SCENE_HUB_SPOREFALL"
            }
        ]
    },
    "SCENE_EOIN_ASSISTANCE": {
        id: "SCENE_EOIN_ASSISTANCE",
        location: "whisperwood",
        background: "landscapes/sporefall_crimson_frontier.png",
        npcPortrait: "portraits/npc_male_placeholder_portrait.png",
        text: "Eoin keeps glancing over his shoulder as he presses a small vial into your hand, like he expects the street to punish him for helping. 'Take it,' he says. 'Please. Mum always said if you've only got one good thing left, you use it before the bad thing gets to choose for you.' He swallows. 'Don't be gone long. The streets get worse when they think they're alone.'",
        onEnter: {
            addItem: "potion_healing"
        },
        choices: [
            {
                text: "Take the vial and head back into Sporefall.",
                nextScene: "SCENE_HUB_SPOREFALL"
            }
        ]
    },
    "SCENE_ALONE_AGAIN": {
        id: "SCENE_ALONE_AGAIN",
        location: "whisperwood",
        background: "landscapes/sporefall_crimson_frontier.png",
        text: "The survivor retreats into the ruin-shadow, but not far. A pale outline lingers near a collapsed cellar door as if desperation keeps dragging him back toward you despite the fear. If you want answers, you can still follow.",
        choices: [
            {
                text: "Follow him carefully",
                effects: [
                    { type: "flag", flagId: "sporefall_eoin_met", value: true }
                ],
                nextScene: "SCENE_EOIN_TALK"
            }
        ]
    },
    "SCENE_HUB_SPOREFALL": {
        id: "SCENE_HUB_SPOREFALL",
        location: "whisperwood",
        background: "landscapes/sporefall_crimson_frontier.png",
        onEnter: {
            questUpdate: { id: "investigate_whisperwood", stage: 3 },
            once: true
        },
        text: "You step back into Sporefall's streets with Eoin's words still clinging to you. The borough lies broken in three promising directions: a western rise where the cathedral bells once carried, an eastern row of larger homes where the overseer once lived, and the northern streets where the homeless slept beneath the bridge.",
        choices: [
            {
                text: "Head west through the cathedral quarter",
                nextScene: "SCENE_SPOREFALL_CATHEDRAL_APPROACH"
            },
            {
                text: "Head east toward the overseer's row",
                nextScene: "SCENE_SPOREFALL_OVERSEER_APPROACH"
            },
            {
                text: "Head north through the broken market road",
                nextScene: "SCENE_SPOREFALL_NORTH_APPROACH"
            },
            {
                text: "Return to Eoin's hiding place",
                nextScene: "SCENE_EOIN_TALK"
            }
        ]
    },
    "SCENE_SPOREFALL_CATHEDRAL_APPROACH": {
        id: "SCENE_SPOREFALL_CATHEDRAL_APPROACH",
        location: "whisperwood",
        background: "landscapes/sporefall_whisperwood_reveal.png",
        text: "The western avenue climbs toward the Cathedral of Bone. Before the stairs, a blackened corpse lies slumped beside a torn courier's bag, its contents scattered across stone dust and spore-moss.",
        choices: [
            {
                text: "Search the courier's bag",
                nextScene: "SCENE_SPOREFALL_CATHEDRAL_APPROACH"
            },
            {
                text: "Climb toward the cathedral doors",
                nextScene: "SCENE_SPOREFALL_CATHEDRAL_ENTRY"
            },
            {
                text: "Return to the central street",
                nextScene: "SCENE_HUB_SPOREFALL"
            }
        ]
    },
    "SCENE_SPOREFALL_CATHEDRAL_ENTRY": {
        id: "SCENE_SPOREFALL_CATHEDRAL_ENTRY",
        location: "whisperwood",
        background: "landscapes/sporefall_whisperwood_reveal.png",
        text: "In the heart of Sporefall looms the Cathedral of Bone, marble and giant-bone architecture made profane by silence. Inside, the nave is strewn with the dead. Where pews should stand, bones lie in rows like the town tried to bury itself and failed.",
        choices: [
            {
                text: "Listen to the whispering dead (Perception)",
                type: "skillCheck",
                skill: "perception",
                dc: 12,
                successText: "The whispers do not mourn you. They warn someone deeper inside that you have arrived.",
                failText: "The whispering overlaps until grief itself becomes a language you cannot quite understand.",
                nextSceneSuccess: "SCENE_SPOREFALL_CATHEDRAL_VISION",
                nextSceneFail: "SCENE_SPOREFALL_CATHEDRAL_VISION"
            },
            {
                text: "Withdraw to the cathedral steps",
                nextScene: "SCENE_SPOREFALL_CATHEDRAL_APPROACH"
            }
        ]
    },
    "SCENE_SPOREFALL_CATHEDRAL_VISION": {
        id: "SCENE_SPOREFALL_CATHEDRAL_VISION",
        location: "whisperwood",
        background: "landscapes/sporefall_whisperwood_reveal.png",
        onEnter: {
            once: true,
            effects: [
                { type: "flag", flagId: "sporefall_cathedral_vision_seen", value: true }
            ]
        },
        text: "Sorrow hits like a physical blow. For one impossible instant you see a ritual chamber, a man on an altar, and darkness exploding from him as the rite breaks wrong. When the vision tears away, a chained specter stands in the aisle only long enough to point down a corridor before vanishing.",
        choices: [
            {
                text: "Carry that omen back into the street",
                nextScene: "SCENE_HUB_SPOREFALL"
            }
        ]
    },
    "SCENE_SPOREFALL_OVERSEER_APPROACH": {
        id: "SCENE_SPOREFALL_OVERSEER_APPROACH",
        location: "whisperwood",
        background: "landscapes/sporefall_crimson_frontier.png",
        text: "The eastern row was once the wealthy quarter. One house still announces itself even in ruin: a locked front door marked by a blue handprint, each finger painted over a rune-animal like part of a warning that expected only the living to read it.",
        choices: [
            {
                text: "Inspect the marked door",
                nextScene: "SCENE_SPOREFALL_OVERSEER_DOOR"
            },
            {
                text: "Return to the central street",
                nextScene: "SCENE_HUB_SPOREFALL"
            }
        ]
    },
    "SCENE_SPOREFALL_OVERSEER_DOOR": {
        id: "SCENE_SPOREFALL_OVERSEER_DOOR",
        location: "whisperwood",
        background: "landscapes/sporefall_crimson_frontier.png",
        text: "The blue handprint resolves into an arcane circuit spread through five rune-animals: Crow, Stag, Bear, Wolf, and Serpent. The magic hums low through the wood like the door is waiting for one wrong answer.",
        choices: [
            {
                text: "Study the runes (Arcana)",
                type: "skillCheck",
                skill: "arcana",
                dc: 14,
                successText: "The trap is intricate, but not impossible. Three runes carry divine weight here: Crow, Stag, and Bear. Wolf and Serpent feel like impostors forced into the circuit.",
                failText: "You can feel the spell's edges, but not enough to trust yourself with them yet.",
                onSuccess: {
                    effects: [
                        { type: "flag", flagId: "sporefall_home_trap_hint", value: true }
                    ]
                },
                nextSceneSuccess: "SCENE_SPOREFALL_OVERSEER_DOOR",
                nextSceneFail: "SCENE_SPOREFALL_OVERSEER_DOOR"
            },
            {
                text: "Trace the carved grooves (Investigation)",
                type: "skillCheck",
                skill: "investigation",
                dc: 14,
                successText: "Faint cuts in the wood reveal how the magic flows. Some of the animals belong. Two are only there to punish the impatient.",
                failText: "You find the grooves but not the pattern that would let you break it safely.",
                onSuccess: {
                    effects: [
                        { type: "flag", flagId: "sporefall_home_trap_hint", value: true }
                    ]
                },
                nextSceneSuccess: "SCENE_SPOREFALL_OVERSEER_DOOR",
                nextSceneFail: "SCENE_SPOREFALL_OVERSEER_DOOR"
            },
            {
                text: "Scratch out the Wolf and Serpent runes",
                nextScene: "SCENE_SPOREFALL_OVERSEER_STUDY"
            },
            {
                text: "Force the door and risk the trap",
                nextScene: "SCENE_SPOREFALL_OVERSEER_DOOR"
            },
            {
                text: "Return to overseer's row",
                nextScene: "SCENE_SPOREFALL_OVERSEER_APPROACH"
            }
        ]
    },
    "SCENE_SPOREFALL_OVERSEER_STUDY": {
        id: "SCENE_SPOREFALL_OVERSEER_STUDY",
        location: "whisperwood",
        background: "landscapes/sporefall_crimson_frontier.png",
        onEnter: {
            once: true,
            questUpdate: { id: "investigate_whisperwood", stage: 4 },
            effects: [
                { type: "flag", flagId: "sporefall_home_unlocked", value: true }
            ]
        },
        text: "Inside, the overseer's home looks half ransacked and half abandoned in haste. Desk drawers hang open. Shelves have been stripped unevenly. In the study, only the things too important to carry or too painful to destroy seem to remain.",
        choices: [
            {
                text: "Read the surviving journal leaves",
                nextScene: "SCENE_SPOREFALL_OVERSEER_JOURNAL"
            },
            {
                text: "Search the scattered correspondence",
                nextScene: "SCENE_SPOREFALL_OVERSEER_CORRESPONDENCE"
            },
            {
                text: "Open the desk drawer",
                nextScene: "SCENE_SPOREFALL_OVERSEER_DRAWER"
            },
            {
                text: "Leave the house for the central street",
                nextScene: "SCENE_HUB_SPOREFALL"
            }
        ]
    },
    "SCENE_SPOREFALL_OVERSEER_JOURNAL": {
        id: "SCENE_SPOREFALL_OVERSEER_JOURNAL",
        location: "whisperwood",
        background: "landscapes/sporefall_crimson_frontier.png",
        onEnter: {
            once: true,
            effects: [
                { type: "addItem", itemId: "aodhan_journal_leaf" },
                { type: "flag", flagId: "sporefall_journal_found", value: true }
            ]
        },
        text: "Most of the journal has been torn away. The surviving leaves tell two stories: one of Aodhan's warmth toward Fiona and the court he once believed in, and one of pure fury at Alderic for corrupting the ritual that should have protected Liam and the borough. The final surviving line is clear enough to wound: he will begin the real work in the cathedral.",
        choices: [
            {
                text: "Return to the study",
                nextScene: "SCENE_SPOREFALL_OVERSEER_STUDY"
            }
        ]
    },
    "SCENE_SPOREFALL_OVERSEER_CORRESPONDENCE": {
        id: "SCENE_SPOREFALL_OVERSEER_CORRESPONDENCE",
        location: "whisperwood",
        background: "landscapes/sporefall_crimson_frontier.png",
        onEnter: {
            once: true,
            effects: [
                { type: "addItem", itemId: "liam_letter" },
                { type: "flag", flagId: "sporefall_letter_found", value: true }
            ]
        },
        text: "One letter survives the rot better than the others. Liam writes to Aodhan about a powerful relic the dwarves uncovered, Alderic's concern, and the need for ritual support to protect their people. The letter does not read like a warning. It reads like trust waiting to be betrayed.",
        choices: [
            {
                text: "Return to the study",
                nextScene: "SCENE_SPOREFALL_OVERSEER_STUDY"
            }
        ]
    },
    "SCENE_SPOREFALL_OVERSEER_DRAWER": {
        id: "SCENE_SPOREFALL_OVERSEER_DRAWER",
        location: "whisperwood",
        background: "landscapes/sporefall_crimson_frontier.png",
        onEnter: {
            once: true,
            effects: [
                { type: "addItem", itemId: "wayward_compass" },
                { type: "flag", flagId: "sporefall_compass_found", value: true }
            ]
        },
        text: "In the desk drawer you find a compass that refuses every honest north. The needle shudders, then fixes hard toward some distant grief-laden place outside the borough. Whatever Aodhan left behind, he expected to need help finding his way back to it.",
        choices: [
            {
                text: "Return to the study",
                nextScene: "SCENE_SPOREFALL_OVERSEER_STUDY"
            }
        ]
    },
    "SCENE_SPOREFALL_NORTH_APPROACH": {
        id: "SCENE_SPOREFALL_NORTH_APPROACH",
        location: "whisperwood",
        background: "landscapes/sporefall_crimson_frontier.png",
        text: "The northern streets feel barer than the rest of Sporefall. Wind pushes ash and spores between abandoned stalls, and somewhere ahead the road widens toward the footbridge Eoin mentioned. It is also the fastest way to keep moving without ever touching the cathedral or the overseer's house.",
        choices: [
            {
                text: "Cross the open street toward the north road (Perception)",
                type: "skillCheck",
                skill: "perception",
                dc: 11,
                companionAid: {
                    companionId: "eoin",
                    bonus: 2,
                    logText: "Eoin still knows which stalls hid the desperate and which ones taught predators where to wait."
                },
                successText: "You catch the ambush before it closes and pick your way through the dead ground without giving it your throat.",
                failText: "Something lunges from behind an overturned cart before you can choose your footing.",
                nextSceneSuccess: "SCENE_SPOREFALL_NORTH_ROUTE_DISCOVERED",
                nextSceneFail: "SCENE_SPOREFALL_NORTH_AMBUSH"
            },
            {
                text: "Check the ruined footbridge first",
                nextScene: "SCENE_SPOREFALL_NORTH_BRIDGE"
            },
            {
                text: "Return to the central street",
                nextScene: "SCENE_HUB_SPOREFALL"
            }
        ]
    },
    "SCENE_SPOREFALL_NORTH_BRIDGE": {
        id: "SCENE_SPOREFALL_NORTH_BRIDGE",
        location: "whisperwood",
        background: "landscapes/sporefall_crimson_frontier.png",
        onEnter: {
            once: true,
            effects: [
                { type: "flag", flagId: "sporefall_bridge_seen", value: true }
            ]
        },
        text: "The footbridge sags over a sluggish black stream. Beneath it lie scraps of bedding, a cracked bowl, and the outline of a life lived one bad season at a time. Whatever warmth once sheltered here is gone. The place feels abandoned in a way that makes Eoin's fear hurt more, not less.",
        choices: [
            {
                text: "Push on toward the north road",
                nextScene: "SCENE_SPOREFALL_NORTH_ROUTE_DISCOVERED"
            },
            {
                text: "Return to the central street",
                nextScene: "SCENE_HUB_SPOREFALL"
            }
        ]
    },
    "SCENE_SPOREFALL_NORTH_AMBUSH": {
        id: "SCENE_SPOREFALL_NORTH_AMBUSH",
        location: "whisperwood",
        background: "landscapes/sporefall_outskirt_encounter.png",
        text: "Fungal dead spill from the shadows of the carts and market stalls, fast enough to prove that Sporefall still knows how to punish haste.",
        type: "combat",
        enemies: ["spore_zombie", "spore_zombie"],
        winScene: "SCENE_SPOREFALL_NORTH_ROUTE_DISCOVERED",
        loseScene: "SCENE_DEFEAT"
    },
    "SCENE_SPOREFALL_NORTH_ROUTE_DISCOVERED": {
        id: "SCENE_SPOREFALL_NORTH_ROUTE_DISCOVERED",
        location: "whisperwood",
        background: "landscapes/sporefall_crimson_frontier.png",
        onEnter: {
            once: true,
            questUpdate: { id: "investigate_whisperwood", stage: 4 },
            effects: [
                { type: "flag", flagId: "sporefall_north_route_open", value: true }
            ]
        },
        text: "Beyond the ambush, the northern road opens deeper into the ruined borough. You could keep moving this way and skip the cathedral quarter and overseer's row entirely, but you would be trading understanding for speed. The route is viable. It is not generous.",
        choices: [
            {
                text: "Mark the northern route and return to the central street",
                nextScene: "SCENE_HUB_SPOREFALL"
            }
        ]
    },
    "SCENE_RUINS_APPROACH": {
        id: "SCENE_RUINS_APPROACH",
        location: "whisperwood",
        background: "landscapes/sporefall_whisperwood_reveal.png",
        text: "You find the ruins Eoin spoke of. A hulking silhouette stands guard—a corpse bloated with fungus. It turns to you with a hollow groan.",
        type: "combat",
        enemies: ["spore_zombie"],
        winScene: "SCENE_RUINS_CLEARED",
        loseScene: "SCENE_DEFEAT"
    },
    "SCENE_RUINS_CLEARED": {
        id: "SCENE_RUINS_CLEARED",
        location: "whisperwood",
        background: "landscapes/sporefall_whisperwood_reveal.png",
        text: "The Spore Walker falls. The immediate threat is gone, but the corruption runs deep. You have found the path to the heart of the forest, but you need to report back first.",
        choices: [
            {
                text: "Return to Silverthorn (End of Demo)",
                nextScene: "SCENE_END"
            }
        ]
    },
    "SCENE_DEFEAT": {
        id: "SCENE_DEFEAT",
        location: "whisperwood",
        background: "landscapes/sporefall_outskirt_encounter.png",
        text: "Your vision fades as the spores overtake you...",
        choices: [
            {
                text: "Reload Save",
                action: "loadGame"
            }
        ]
    },
    "SCENE_END": {
        id: "SCENE_END",
        location: "silverthorn",
        background: "landscapes/alderics_chamber.webp",
        text: "You return to Alderic with news of your success. This is the end of the playable demo.",
        choices: [
            {
                text: "Open Map",
                action: "openMap"
            }
        ]
    },
    // Hubs
    "SCENE_HUB_SILVERTHORN": {
        id: "SCENE_HUB_SILVERTHORN",
        location: "silverthorn",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "You step out of Alderic's chamber and into the living heart of Silverthorn. Messengers cut through the crowd, temple bells carry over the rooftops, and every street seems to offer another lead, errand, or place to prepare before taking the eastern road.",
        choices: [
            {
                text: "Return to Alderic's chamber",
                nextScene: "SCENE_ALDERIC_CHAMBER_RETURN"
            },
            {
                text: "Walk to the market district",
                nextScene: "SCENE_SILVERTHORN_MARKET"
            },
            {
                text: "Visit the General Store",
                nextScene: "SCENE_SILVERTHORN_GENERAL_STORE"
            },
            {
                text: "Enter The Rusty Blade",
                nextScene: "SCENE_RUSTY_BLADE_INN"
            },
            {
                text: "Stop at the Temple of Dawn",
                nextScene: "SCENE_SILVERTHORN_TEMPLE"
            },
            {
                text: "Read the notice board",
                nextScene: "SCENE_SILVERTHORN_NOTICE_BOARD"
            },
            {
                text: "Head for the city gates",
                nextScene: "SCENE_SILVERTHORN_GATES"
            }
        ]
    },
    "SCENE_SHADOWMIRE_ROAD": {
        id: "SCENE_SHADOWMIRE_ROAD",
        location: "shadowmire",
        background: "landscapes/forest_walk.png",
        text: "You leave the safety of Silverthorn behind. The road ahead winds into the Shadowmire Forest. The canopy thickens, blotting out the crimson sun. A heavy mist clings to the ground, obscuring the path. The silence is unnatural.",
        choices: [
            {
                text: "Scan surroundings (Perception)",
                type: "skillCheck",
                skill: "perception",
                dc: 12,
                successText: "You squint into the fog. A pair of glowing eyes reflects the faint light. A wolf stalks the treeline, ready to pounce.",
                failText: "The fog is too dense. You see nothing but shifting shadows.",
                nextSceneSuccess: "SCENE_SHADOWMIRE_SPOTTED",
                nextSceneFail: "SCENE_SHADOWMIRE_AMBUSH"
            },
            {
                text: "Continue down the road",
                nextScene: "SCENE_SHADOWMIRE_AMBUSH"
            }
        ]
    },
    "SCENE_SHADOWMIRE_SPOTTED": {
        id: "SCENE_SHADOWMIRE_SPOTTED",
        location: "shadowmire",
        background: "landscapes/forest_walk_alt.png",
        text: "You spot the wolf before it strikes. It snarls, realizing it has been seen.",
        choices: [
            {
                text: "Attack (Advantage)",
                nextScene: "SCENE_SHADOWMIRE_COMBAT"
            },
            {
                text: "Try to scare it off (Intimidation)",
                type: "skillCheck",
                skill: "intimidation",
                dc: 13,
                successText: "You shout and brandish your weapon. The wolf hesitates, then turns and flees into the mist.",
                failText: "The wolf is desperate. It lunges!",
                nextSceneSuccess: "SCENE_TRAVEL_SHADOWMIRE",
                nextSceneFail: "SCENE_SHADOWMIRE_COMBAT"
            }
        ]
    },
    "SCENE_SHADOWMIRE_AMBUSH": {
        id: "SCENE_SHADOWMIRE_AMBUSH",
        location: "shadowmire",
        background: "landscapes/forest_walk_alt.png",
        text: "Suddenly, a growl erupts from the mist! A wolf leaps at you from the shadows!",
        type: "combat",
        enemies: ["wolf"],
        winScene: "SCENE_TRAVEL_SHADOWMIRE",
        loseScene: "SCENE_DEFEAT"
    },
    "SCENE_SHADOWMIRE_COMBAT": {
        id: "SCENE_SHADOWMIRE_COMBAT",
        location: "shadowmire",
        background: "landscapes/forest_walk_alt.png",
        text: "You engage the wolf.",
        type: "combat",
        enemies: ["wolf"],
        winScene: "SCENE_TRAVEL_SHADOWMIRE",
        loseScene: "SCENE_DEFEAT"
    },
    "SCENE_HUB_SHADOWMIRE": {
        id: "SCENE_HUB_SHADOWMIRE",
        location: "shadowmire",
        background: "landscapes/forest_walk.png",
        text: "Shadowmire closes around the road in damp green silence. The forest still lives here, but only just, and every mile east feels like a wager against how much longer that will remain true.",
        choices: [
            { text: "Keep to the eastern road", nextScene: "SCENE_TRAVEL_SHADOWMIRE" },
            { text: "Fall back toward Silverthorn while you still can", nextScene: "SCENE_HUB_SILVERTHORN" }
        ]
    },
    "SCENE_DURNHELM_GATES": {
        id: "SCENE_DURNHELM_GATES",
        location: "durnhelm",
        background: "landscapes/road_to_durnhelm.png",
        text: "Durnhelm rises from the mountain like a fortress-temple, but the beauty of the approach dies in the last mile. Broken wagons, splintered trees, and dwarven dead choke the road beneath the gates. Some bodies are burned to charcoal, some hacked apart, and some look as though the fight simply tore the shape of them apart mid-breath.",
        choices: [
            {
                text: "Read the slaughter outside the gates before you enter (Perception)",
                type: "skillCheck",
                skill: "perception",
                dc: 12,
                successText: "The dead are not arranged like a last stand. Their wounds and positions suggest pursuit, panic, and something powerful forcing its way out of the city rather than into it.",
                failText: "You can count the dead, but not the shape of what happened to them. All the scene offers cleanly is ruin, smoke, and a fight far beyond ordinary soldiers.",
                nextSceneSuccess: "SCENE_DURNHELM_ENTRY",
                nextSceneFail: "SCENE_DURNHELM_ENTRY"
            },
            { text: "Push through the broken gatehouse", nextScene: "SCENE_DURNHELM_ENTRY" },
            { text: "Turn away and follow the Lament Hill road instead", nextScene: "SCENE_LAMENT_HILL_APPROACH" }
        ]
    },
    "SCENE_DURNHELM_ENTRY": {
        id: "SCENE_DURNHELM_ENTRY",
        location: "durnhelm",
        background: "landscapes/near_durnhelm.png",
        text: "Inside the walls, Durnhelm is not empty. It is worse: alive enough to bury its dead. Survivors drag wrapped bodies toward pyres, a smashed storefront near the gate leaks ruined trade goods into the street, and every whispered conversation seems to end on the same pair of words: the forge. Someone finally tells you the worst of the fighting ran east, where the holy fire still burns beside the shattered temple.",
        choices: [
            { text: "Search the wrecked gate-quarter shops for context", nextScene: "SCENE_DURNHELM_MARKET_RUINS" },
            { text: "Head east toward the holy forge", nextScene: "SCENE_DURNHELM_FORGE_APPROACH" },
            { text: "Withdraw and take the Lament Hill lead instead", nextScene: "SCENE_LAMENT_HILL_APPROACH" }
        ]
    },
    "SCENE_DURNHELM_MARKET_RUINS": {
        id: "SCENE_DURNHELM_MARKET_RUINS",
        location: "durnhelm",
        background: "landscapes/near_durnhelm.png",
        text: "The gate-quarter shops tell the story the survivors are too tired to repeat twice. A general store has been half-collapsed by collateral damage from the city guard's last fight. A magic shop stands open and gutted, its shelves smashed and its keeper clearly not among the living. Even the alchemist's surviving stock has been marked up into desperation. Everyone who will still speak points you east, toward the forge and the temple ruins where the wizard demanded answers.",
        choices: [
            { text: "Follow the east-side lead to the holy forge", nextScene: "SCENE_DURNHELM_FORGE_APPROACH" },
            { text: "Return to the main thoroughfare", nextScene: "SCENE_DURNHELM_ENTRY" }
        ]
    },
    "SCENE_DURNHELM_FORGE_APPROACH": {
        id: "SCENE_DURNHELM_FORGE_APPROACH",
        location: "durnhelm",
        background: "landscapes/outside_dwarf_cave.png",
        text: "The forge quarter still glows with holy fire, but everything around it looks as though a battle broke the street and then kept striking after the victory had already become murder. The nearby temple wall has been blasted open, an anvil is lodged impossibly high in the stone, and blood has dried in black fans across the floor. Somewhere inside the rubble, you hear a cough and the scrape of someone too angry to die quietly.",
        choices: [
            {
                text: "Study the blasted stone and bloodwork before you move (Arcana)",
                type: "skillCheck",
                skill: "arcana",
                dc: 12,
                successText: "The scorch marks and torn masonry read like the work of a highly skilled wizard who never had to slow down for lesser opposition.",
                failText: "You know only that the violence here was deliberate, personal, and far beyond the scale of a common raid.",
                nextSceneSuccess: "SCENE_DURNHELM_CATHAL",
                nextSceneFail: "SCENE_DURNHELM_CATHAL"
            },
            { text: "Follow the coughing through the wreckage", nextScene: "SCENE_DURNHELM_CATHAL" },
            { text: "Fall back toward the gate quarter", nextScene: "SCENE_DURNHELM_ENTRY" }
        ]
    },
    "SCENE_DURNHELM_CATHAL": {
        id: "SCENE_DURNHELM_CATHAL",
        location: "durnhelm",
        background: "landscapes/outside_dwarf_cave.png",
        npcPortrait: "portraits/npc_male_placeholder_portrait.png",
        text: "You find the forgemaster under a spill of broken timber and cracked stone, drunk enough to slur and furious enough to stay awake through it. Cathal Ó Taidhg spits pink into the dirt, swears at the sky, at Aodhan, at kings, at relics, and only then at you for arriving late enough to ask questions. When the rage burns thin, he gives the thing its name at last: the Stone of Oblivion. Aodhan stole it after badgering him for how it might be woken. Alderic, Cathal says, took far too keen an interest in the relic long before the courts agreed to leave it in dwarven hands. If anyone living can still tell you what sort of damnation the stone invites, it may be the witch on Lament Hill. 'So go on, then,' Cathal snarls, wiping his mouth with the back of one scarred hand. 'Take your answers where the dead haven't finished with 'em yet.'",
        choices: [
            { text: "\"Then Lament Hill is next.\"", nextScene: "SCENE_LAMENT_HILL_APPROACH" },
            { text: "\"If I turn back toward Silverthorn, what meets me there?\"", nextScene: "SCENE_SILVERTHORN_QUARANTINE" },
            { text: "\"Sit tight if you can. I'll carry the warning.\"", nextScene: "SCENE_DURNHELM_ENTRY" }
        ]
    },
    "SCENE_LAMENT_HILL_APPROACH": {
        id: "SCENE_LAMENT_HILL_APPROACH",
        location: "lament_hill",
        background: "landscapes/forest_walk.png", // Placeholder
        text: "Rain begins to fall as you ascend Lament Hill. The path is torn by old magic and something much more personal: scorched earth, uprooted trees, boulders broken open from within, and scraps of debris still hanging in the air as though one instant of violence never finished happening. The ruined cottage waits near the summit, with two little graves set off to one side, and the whole hillside watches you with the patience of a wound that remembers the hand that made it.",
        choices: [
            { text: "Push higher through the wreckage", nextScene: "SCENE_LAMENT_HILL_VISION" },
            { text: "Look for the graves", nextScene: "SCENE_LAMENT_GRAVES" }
        ]
    },
    "SCENE_LAMENT_HILL_VISION": {
        id: "SCENE_LAMENT_HILL_VISION",
        location: "lament_hill",
        background: "landscapes/forest_walk.png",
        text: "The climb turns treacherous. Vines lie across the path where there should be open ground, a stretch of broken hillside seems to drop away farther than it should, and a lizard skitters lightly over a gap your eyes insist is fatal. The illusion almost holds until the rain passes straight through a wall of thorn that casts a perfect shadow anyway. A woman's voice brushes the inside of your skull, cold with warning and grief: 'You wear a brand of darkness. Leave, or burn like he burned my kin.'",
        choices: [
            { text: "Trust the breaks in the illusion and keep climbing", nextScene: "SCENE_LAMENT_COTTAGE" },
            { text: "Circle toward the graves and approach from the east", nextScene: "SCENE_LAMENT_GRAVES" }
        ]
    },
    "SCENE_LAMENT_COTTAGE": {
        id: "SCENE_LAMENT_COTTAGE",
        location: "lament_hill",
        background: "landscapes/forest_walk.png",
        text: "The cottage is half-collapsed and cold despite the storm outside. The door hangs splintered on one hinge, the rafters are blackened from fire that burned too hot and too clean, and the bedroom smells faintly of rain-soaked ash beneath the older smell of grief. The pressure in your skull sharpens again. 'You don't belong here,' the same voiceless woman says. 'No one does.' Beneath a tumble of pale cloth on the bed, something small shifts and goes still.",
        choices: [
            { text: "Pull back the cloth and confront whatever is hiding there", nextScene: "SCENE_LAMENT_CAT_DISCOVERY" },
            { text: "Study the scorch marks and shattered room first", nextScene: "SCENE_LAMENT_COTTAGE_SIGNS" },
            { text: "Step back outside and gather yourself by the graves", nextScene: "SCENE_LAMENT_GRAVES" }
        ]
    },
    "SCENE_LAMENT_GRAVES": {
        id: "SCENE_LAMENT_GRAVES",
        location: "lament_hill",
        background: "landscapes/forest_walk.png",
        text: "Two small handmade graves rest in the wet earth east of the cottage, close enough to the wall that whoever buried the children meant to keep them near home. Rain gathers in the carved names before spilling down the wood like fresh tears. Nothing on the hill feels peaceful, but here the grief is so concentrated it almost has weight.",
        choices: [
            { text: "Pay respects and listen to the hill's silence", nextScene: "SCENE_LAMENT_COTTAGE" },
            { text: "Return to the cottage", nextScene: "SCENE_LAMENT_COTTAGE" }
        ]
    },
    "SCENE_LAMENT_COTTAGE_SIGNS": {
        id: "SCENE_LAMENT_COTTAGE_SIGNS",
        location: "lament_hill",
        background: "landscapes/forest_walk.png",
        text: "The room bears too many kinds of violence at once. One wall is cratered inward as though struck by force meant for a battlefield, while the bedframe beside it is marked by smaller desperate hands and melted iron where bindings must have bitten hot. Under all of it lies a more recent disturbance: tiny pawprints in the dust, a white hair caught on a splinter, and the certain feeling that the thing watching you understands every word you do not say aloud.",
        choices: [
            { text: "Search the bed where something is still hiding", nextScene: "SCENE_LAMENT_CAT_DISCOVERY" },
            { text: "Speak into the room and swear you did not come for blood", nextScene: "SCENE_LAMENT_AINE_ACCUSATION" }
        ]
    },
    "SCENE_LAMENT_CAT_DISCOVERY": {
        id: "SCENE_LAMENT_CAT_DISCOVERY",
        location: "lament_hill",
        background: "landscapes/forest_walk.png",
        text: "You pull back the cloth and uncover a small white cat pressed into the corner of the bed. It hisses, but there is too much calculation in the sound for an ordinary animal. Rainwater beads on its fur without soaking in, and when it recoils the air around it ripples with the unmistakable strain of held magic.",
        choices: [
            { text: "\"You can stop hiding. I'm not drawing steel.\"", nextScene: "SCENE_LAMENT_AINE_ACCUSATION" },
            { text: "Step back and keep your hands well away from your weapon", nextScene: "SCENE_LAMENT_AINE_ACCUSATION" }
        ]
    },
    "SCENE_LAMENT_AINE_ACCUSATION": {
        id: "SCENE_LAMENT_AINE_ACCUSATION",
        location: "lament_hill",
        background: "landscapes/forest_walk.png",
        text: "The cat vanishes in a hard white flare. In its place stands a wood elf woman clothed all in white, beautiful only in the merciless way frost can be. Her grief shows first. Her fear catches it by the throat and turns it into anger. The moment her eyes find the mark you carry, she recoils as though you have pointed a blade at her children a second time. 'Get out,' she snaps, voice fraying on the last word. 'Whatever branded you, take it off my hill. I know what men come here for.'",
        choices: [
            { text: "\"If I knew what this mark was, I wouldn't be asking you.\"", nextScene: "SCENE_LAMENT_AINE_REVEAL" },
            { text: "\"I came after Aodhan. Not to finish what he started.\"", nextScene: "SCENE_LAMENT_AINE_REVEAL" },
            { text: "\"Then tell me what he wanted badly enough to do this.\"", nextScene: "SCENE_LAMENT_AINE_REVEAL" }
        ]
    },
    "SCENE_LAMENT_AINE_REVEAL": {
        id: "SCENE_LAMENT_AINE_REVEAL",
        location: "lament_hill",
        background: "landscapes/forest_walk.png",
        text: "Aine's stare stays fixed on the mark until anger spends itself and leaves only exhaustion behind. 'Mark of Ciara,' she says at last, like each word tastes foul. 'Blackened Queen. Depth-rot made holy.' She laughs once, without humor, and presses a shaking hand over her mouth before she can lose more of herself than she means to. What follows comes badly, in pieces she clearly wishes she could choke back down. Aodhan came to her for the Stone of Oblivion. He wanted not merely its name, but the key to waking it. When she refused him, he bound her where she stood and burned her children before her eyes so she would hear them die and still not be able to move. The telling breaks there. When she forces herself onward again, her voice is hoarse and hollow. The stone will not wake for prayer, or for common slaughter. It must drink divine blood. A god could rouse it. A demigod could suffice. She bought time by sending Aodhan toward the Forbidden Archives, but only time. 'So choose,' Aine says, looking suddenly older than the hill around her. 'Hushbriar if you mean to deny him the blood. The Archives if you mean to learn what sort of ruin he has already embraced.'",
        choices: [
            { text: "\"Then Hushbriar first. He doesn't get her blood.\"", nextScene: "SCENE_HUSHBRIAR_GUILD_ROAD" },
            { text: "\"I'll take the Archives truth before I follow him lower.\"", nextScene: "SCENE_ARCHIVES_APPROACH" }
        ]
    },
    "SCENE_ARCHIVES_APPROACH": {
        id: "SCENE_ARCHIVES_APPROACH",
        location: "lament_hill",
        background: "landscapes/forest_walk.png",
        text: "You press higher through the rain until the trees thin and the hill gives way to black stone. A cave mouth yawns between two weather-worn figures carved in mourning, and the ground before it is strewn with old bones, newer bodies, and the metallic stink of people who came seeking answers and found only the dark listening back.",
        choices: [
            { text: "Enter the cave and follow the stale breath of the mountain", nextScene: "SCENE_ARCHIVES_CAVERN" },
            {
                text: "Study the dead before you pass them (Perception)",
                type: "skillCheck",
                skill: "perception",
                dc: 12,
                successText: "The dead are not all ancient. Some still clutch lantern hooks and scholar's tools, and one trail of dragged heels ends not at the cave mouth but at stone that shimmers faintly under the rain.",
                failText: "The dead tell only the oldest truth: too many people walked here afraid, and too few walked back out.",
                nextSceneSuccess: "SCENE_ARCHIVES_CAVERN",
                nextSceneFail: "SCENE_ARCHIVES_CAVERN"
            }
        ]
    },
    "SCENE_ARCHIVES_CAVERN": {
        id: "SCENE_ARCHIVES_CAVERN",
        location: "lament_hill",
        background: "landscapes/forest_walk_alt.png",
        text: "Inside, the cave air turns wet and heavy. Bodies lie where panic or exhaustion dropped them, and farther in the tunnel opens into a cemetery that cannot possibly fit inside the hill. Lightning flashes across a sky that should not exist here. A death knight rises among the graves, sword scraping free while shapes all around it begin to stand.",
        choices: [
            {
                text: "Hold to the truth of the stone under your feet (Insight)",
                type: "skillCheck",
                skill: "insight",
                dc: 12,
                successText: "The cemetery shivers at the edges. You catch the lie in it, press through the false night, and the death knight collapses into cold mist before its blade can land.",
                failText: "The illusion swallows you for a breath too long before the wrongness of it tears open. The graves vanish, leaving only the cave, the corpses, and a doorway of black iron deeper within.",
                nextSceneSuccess: "SCENE_ARCHIVES_GATEKEEPER",
                nextSceneFail: "SCENE_ARCHIVES_GATEKEEPER"
            },
            { text: "Walk straight at the false dead and refuse them your fear", nextScene: "SCENE_ARCHIVES_GATEKEEPER" }
        ]
    },
    "SCENE_ARCHIVES_GATEKEEPER": {
        id: "SCENE_ARCHIVES_GATEKEEPER",
        location: "lament_hill",
        background: "landscapes/forest_walk_alt.png",
        npcPortrait: "portraits/npc_male_placeholder_portrait.png",
        text: "The iron door parts no wider than a coffin lid before a figure coheres out of the dark behind it: tall, gaunt, robed in ruin, with pale fire banked where living eyes once were. When he speaks, it is with the patience of a sentence already being carried out. 'I am Thalion Ebonhart, last keeper and longest penitent of these halls. Speak plain. Those who come here hungry for convenient truth are devoured by truer things.'",
        choices: [
            {
                text: "\"I seek the truth Aodhan came here to steal.\"",
                nextScene: "SCENE_ARCHIVES_TRUTH_CHAMBER"
            },
            {
                text: "\"What toll do these halls take from the people who enter them?\" (Persuasion)",
                type: "skillCheck",
                skill: "persuasion",
                dc: 11,
                successText: "Thalion studies you like a judge testing whether remorse has found the right defendant. At last he steps aside. 'A wiser question than most. Enter, then, and pay in certainty.'",
                failText: "'More than you know how to carry,' Thalion says. After a silence heavy enough to count as warning, he steps aside anyway. 'Enter. Regret is the cheapest due exacted here.'",
                nextSceneSuccess: "SCENE_ARCHIVES_TRUTH_CHAMBER",
                nextSceneFail: "SCENE_ARCHIVES_TRUTH_CHAMBER"
            }
        ]
    },
    "SCENE_ARCHIVES_TRUTH_CHAMBER": {
        id: "SCENE_ARCHIVES_TRUTH_CHAMBER",
        location: "lament_hill",
        background: "landscapes/forest_walk_alt.png",
        npcPortrait: "portraits/npc_male_placeholder_portrait.png",
        text: "The Archives are older than comfort and grander than mercy. Dark shelves climb into shadow, pale lights drift between them like captive moons, and every step sounds indecently loud, as though the dead in the walls resent being reminded of the living. Thalion leads you to a lectern where a silver-and-midnight tome lies open beside diagrams that never seem to hold still long enough to be safely understood. He does not give the answer as a scholar would. He gives it like testimony. The Stone of Oblivion does not wake for prayer, nor for ordinary slaughter. What stirs in the margins of the pages is holier and fouler than that. It must drink divinity. A god could rouse it. A demigod could suffice. Only after letting that sentence bruise the air between you does Thalion admit, with loathing that points inward, that he knows because he once committed such a sin himself and bought eternity at the price of becoming the warning now speaking to you.",
        choices: [
            { text: "\"Then answer what you still can before you close your mouth to me.\"", nextScene: "SCENE_ARCHIVES_AUDIENCE" },
            { text: "\"That is enough. Hushbriar cannot wait.\"", nextScene: "SCENE_HUSHBRIAR_GUILD_ROAD" }
        ]
    },
    "SCENE_ARCHIVES_AUDIENCE": {
        id: "SCENE_ARCHIVES_AUDIENCE",
        location: "lament_hill",
        background: "landscapes/forest_walk_alt.png",
        npcPortrait: "portraits/npc_male_placeholder_portrait.png",
        text: "Thalion's patience is not endless, but for one narrow window he permits questions. Even now he answers like a man measuring out confession by the drop: every truth weighed, every silence deliberate, every glance a reminder that some doors are merciful only once.",
        choices: [
            {
                text: "\"What name did Alderic buy for himself in the depths?\" (Persuasion)",
                type: "skillCheck",
                skill: "persuasion",
                dc: 14,
                requires: {
                    notFlag: ["archives_thalion_audience_closed", "archives_alderic_truth_learned", "archives_alderic_truth_missed"]
                },
                successText: "At last Thalion relents. Alderic's legend in the depths was a mask; the prince vanished not to survive Ciara's armies but to bargain with them. What Silverthorn remembers as heroism was the first layer of a treachery that now threatens the whole realm.",
                failText: "Thalion's mouth hardens. 'You have asked for a confession that belongs to the dead and the damned. I have given you enough to know the prince is false. The rest you failed to win.'",
                onSuccess: {
                    effects: [
                        { type: "flag", flagId: "archives_alderic_truth_learned", value: true }
                    ]
                },
                onFail: {
                    effects: [
                        { type: "flag", flagId: "archives_alderic_truth_missed", value: true }
                    ]
                },
                nextSceneSuccess: "SCENE_ARCHIVES_AUDIENCE",
                nextSceneFail: "SCENE_ARCHIVES_AUDIENCE"
            },
            {
                text: "\"What sin chained you to these halls?\" (Persuasion)",
                type: "skillCheck",
                skill: "persuasion",
                dc: 13,
                requires: {
                    notFlag: ["archives_thalion_audience_closed", "archives_thalion_confession_learned", "archives_thalion_confession_missed"]
                },
                successText: "The fire in Thalion's eyes gutters low. He admits he once harvested a trusting divine life to make a stone of his own and mistook knowledge for absolution. The Archives are not his throne. They are the sentence he earned.",
                failText: "Thalion turns his gaze aside. 'Do not ask a penitent for the part of his sin he still loves enough to protect. You had your chance, and you spent it poorly.'",
                onSuccess: {
                    effects: [
                        { type: "flag", flagId: "archives_thalion_confession_learned", value: true }
                    ]
                },
                onFail: {
                    effects: [
                        { type: "flag", flagId: "archives_thalion_confession_missed", value: true }
                    ]
                },
                nextSceneSuccess: "SCENE_ARCHIVES_AUDIENCE",
                nextSceneFail: "SCENE_ARCHIVES_AUDIENCE"
            },
            {
                text: "\"If Aodhan learns this, where does he go next?\"",
                requires: {
                    notFlag: "archives_thalion_audience_closed"
                },
                nextScene: "SCENE_ARCHIVES_AODHAN_WARNING"
            },
            {
                text: "Bow out before he decides you have already taken too much.",
                effects: [
                    { type: "flag", flagId: "archives_thalion_audience_closed", value: true }
                ],
                nextScene: "SCENE_ARCHIVES_AFTERMATH"
            }
        ]
    },
    "SCENE_ARCHIVES_AODHAN_WARNING": {
        id: "SCENE_ARCHIVES_AODHAN_WARNING",
        location: "lament_hill",
        background: "landscapes/forest_walk_alt.png",
        npcPortrait: "portraits/npc_male_placeholder_portrait.png",
        text: "'He will go where prophecy has already done half his hunting for him,' Thalion says. 'To Hushbriar. To the demigod who has spent her life dreading the day the stone would teach men her name.' He studies your face as though weighing whether this warning is mercy, or only a slower cruelty.",
        choices: [
            { text: "Risk one more question while he still permits it.", nextScene: "SCENE_ARCHIVES_AUDIENCE" },
            {
                text: "Take the warning and descend toward Hushbriar.",
                effects: [
                    { type: "flag", flagId: "archives_thalion_audience_closed", value: true }
                ],
                nextScene: "SCENE_HUSHBRIAR_GUILD_ROAD"
            }
        ]
    },
    "SCENE_ARCHIVES_AFTERMATH": {
        id: "SCENE_ARCHIVES_AFTERMATH",
        location: "lament_hill",
        background: "landscapes/forest_walk_alt.png",
        text: "Once you step away from the lectern, the Archives become colder and less welcoming, as though the place itself has agreed with Thalion that the richest truths have already been spent on you. The road back down the hill waits in storm-dark silence, with Hushbriar looming now not as rumor but as obligation.",
        choices: [
            { text: "Descend toward Hushbriar and the demigod lead", nextScene: "SCENE_HUSHBRIAR_GUILD_ROAD" },
            { text: "Climb back toward Aine's hill and reconsider", nextScene: "SCENE_LAMENT_HILL_APPROACH" }
        ]
    },
    "SCENE_HUSHBRIAR_GUILD_ROAD": {
        id: "SCENE_HUSHBRIAR_GUILD_ROAD",
        location: "hushbriar",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "By the time Hushbriar's outskirts reappear, the occupation has curdled from fear into method. Guards question anyone who looks healthy enough to carry blame, refugees disappear behind shuttered doors, and whispers move faster than patrols about contraband, hidden passengers, and a rowboat beneath the bridge that no one admits to using. Somewhere in that rot of secrecy, the guild is hiding something more valuable than coin.",
        choices: [
            { text: "Search beneath the bridge for the rowboat and the cargo trail", nextScene: "SCENE_HUSHBRIAR_DOCK" },
            {
                text: "Listen for who is moving contraband tonight (Insight)",
                type: "skillCheck",
                skill: "insight",
                dc: 12,
                successText: "You catch enough muttered fear to separate gossip from warning. Whatever the guild moved, even the frightened speak of it as cargo worth killing over.",
                failText: "The town swallows its secrets before they reach you, but every glance still bends toward the bridge as if memory cannot help betraying itself.",
                nextSceneSuccess: "SCENE_HUSHBRIAR_DOCK",
                nextSceneFail: "SCENE_HUSHBRIAR_DOCK"
            }
        ]
    },
    "SCENE_HUSHBRIAR_DOCK": {
        id: "SCENE_HUSHBRIAR_DOCK",
        location: "hushbriar",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "Beneath the bridge, river rot mingles with lamp oil and damp hemp. A small rowboat knocks softly against the pilings, half-hidden behind stacked crates. One ledger lies open beneath a weighted stone, its wet pages curling as if someone had to abandon it faster than they liked.",
        choices: [
            { text: "Read the ledger before the river takes the ink", nextScene: "SCENE_HUSHBRIAR_LEDGER" },
            { text: "Wait in the dark and see who comes back for the boat", nextScene: "SCENE_THIEVES_HIDEOUT" }
        ]
    },
    "SCENE_HUSHBRIAR_LEDGER": {
        id: "SCENE_HUSHBRIAR_LEDGER",
        location: "hushbriar",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "The handwriting is hurried, angry, and afraid. One line has been underlined so hard it nearly tears the page: 'Move our precious cargo, quickly. It's only a matter of time before that murderous bastard or the Blackened King's soldiers show up at our doorstep.' Whatever the guild is protecting, they fear Aodhan and Alderic's men in equal measure.",
        onEnter: {
            once: true,
            effects: [
                { type: "flag", flagId: "hushbriar_guild_ledger_found", value: true }
            ]
        },
        choices: [
            { text: "Follow the dock trail to whoever owns this ledger", nextScene: "SCENE_THIEVES_HIDEOUT" },
            { text: "Back away and return to the road with the clue in hand", nextScene: "SCENE_HUSHBRIAR_GUILD_ROAD" }
        ]
    },
    "SCENE_THIEVES_HIDEOUT": {
        id: "SCENE_THIEVES_HIDEOUT",
        location: "thieves_hideout",
        background: "landscapes/silverthorn_market_avenue.png",
        npcPortrait: "portraits/npc_female_placeholder_portrait.png",
        text: "The dock trail ends at a low, screened chamber built into the underside of the bridge itself. Neala steps out first with her blade already bare, anger arriving a heartbeat before the rest of her. Liobhán follows in silence so controlled it feels practiced. Neither woman looks surprised to see you. 'You nose through our bridge, touch our ledger, and come walking deeper like you think that makes you brave,' Neala says. Liobhán's gaze moves from your hands to your throat and back again. 'It only makes your next sentence expensive,' she says quietly. 'Spend it well.'",
        choices: [
            {
                text: "Hold out the ledger and say you came before Aodhan did. (Persuasion)",
                type: "skillCheck",
                skill: "persuasion",
                dc: 13,
                successText: "Neala rips the ledger from your hand, but the killing angle leaves her shoulders. Liobhán studies you another beat and gives one thin nod. 'Useful, then,' she says. 'Not trustworthy. Not safe. But useful.'",
                failText: "Neala's mouth twists with open disgust. 'That your best lie?' Liobhán does not raise her voice, but suddenly there are more knives in the room than there were shadows a breath ago.",
                onSuccess: {
                    effects: [
                        { type: "reputation", factionId: "thorne_guild", amount: 20 },
                        { type: "relationship", npcId: "neala", amount: 10 },
                        { type: "relationship", npcId: "liobhan", amount: 10 },
                        { type: "flag", flagId: "hushbriar_guild_trusted", value: true }
                    ]
                },
                onFail: {
                    effects: [
                        { type: "reputation", factionId: "thorne_guild", amount: -20 },
                        { type: "flag", flagId: "hushbriar_guild_hostile", value: true }
                    ]
                },
                nextSceneSuccess: "SCENE_GUILD_BARGAIN",
                nextSceneFail: "SCENE_GUILD_REFUSAL"
            },
            {
                text: "Tell them Silverthorn would pay well for whatever they are hiding.",
                effects: [
                    { type: "reputation", factionId: "thorne_guild", amount: -30 },
                    { type: "flag", flagId: "hushbriar_guild_hostile", value: true }
                ],
                nextScene: "SCENE_GUILD_REFUSAL"
            }
        ]
    },
    "SCENE_GUILD_BARGAIN": {
        id: "SCENE_GUILD_BARGAIN",
        location: "thieves_hideout",
        background: "landscapes/silverthorn_market_avenue.png",
        npcPortrait: "portraits/npc_female_placeholder_portrait.png",
        text: "Once they stop treating you like a body to dispose of, the truth comes in pieces and barbs. The cargo is not contraband at all but a person, and not merely a person: Elara, the prophesied demigod. Neala says the word like daring you to act shocked. The guild is not protecting her out of kindness. A demigod who lives because of them owes a debt no king, priest, or butcher can ignore. 'That's leverage,' Neala says bluntly. Liobhán's mouth hardly moves when she answers, 'That is survival with a shape ugly enough to be honest.'",
        choices: [
            { text: "\"Take me to her. I came to keep her blood unspent.\"", nextScene: "SCENE_ELARA_HIDEAWAY" },
            {
                text: "Show them the Stone and ask whether Elara knows what it will demand.",
                requires: { itemId: "stone_of_oblivion" },
                nextScene: "SCENE_ELARA_HIDEAWAY"
            },
            {
                text: "\"Aodhan still lives, and he may already be on this trail.\"",
                requires: { notFlag: "aodhan_dead" },
                nextScene: "SCENE_ELARA_HIDEAWAY"
            }
        ]
    },
    "SCENE_GUILD_REFUSAL": {
        id: "SCENE_GUILD_REFUSAL",
        location: "thieves_hideout",
        background: "landscapes/silverthorn_market_avenue.png",
        npcPortrait: "portraits/npc_female_placeholder_portrait.png",
        text: "Trust dies quickly in the hideout. Neala wants you thrown back to the river with your curiosity split open beside you. Liobhán wants to know whether your ignorance is real or merely badly performed. They offer you neither safety nor answers, yet even their refusal gives too much away: someone deeper in the hideout matters enough to kill over, and the guild fears what may happen if she lives almost as much as what happens if she does not.",
        choices: [
            {
                text: "Try to slip after their runner before the bridge swallows the chance. (Stealth)",
                type: "skillCheck",
                skill: "stealth",
                dc: 14,
                successText: "You keep to the wet stone and lantern shadow until the hideout opens into a second chamber where the real secret is being kept.",
                failText: "A knife taps stone behind you. Liobhán does not even sound winded. 'You were warned,' she says, and the only path left is the one away from her blade.",
                nextSceneSuccess: "SCENE_ELARA_HIDEAWAY",
                nextSceneFail: "SCENE_HUSHBRIAR_GUILD_ROAD"
            },
            { text: "Back away before the bridge decides to keep you.", nextScene: "SCENE_HUSHBRIAR_GUILD_ROAD" }
        ]
    },
    "SCENE_ELARA_HIDEAWAY": {
        id: "SCENE_ELARA_HIDEAWAY",
        location: "thieves_hideout",
        background: "landscapes/silverthorn_market_avenue.png",
        npcPortrait: "portraits/npc_female_placeholder_portrait.png",
        text: "Elara is hidden in the innermost chamber behind stacked crates, damp blankets, and a ward circle drawn by hands too tired to trust their own lines. She looks younger than prophecy has any right to allow and far more exhausted by fear than any holy story would ever admit. Sleep has been losing to dread for days. When her eyes catch the mark you carry, her whole body tightens around a recognition she has been waiting her life to dread. She knows what relic was found. She knows why men will come for her blood. Shame and terror chase each other across her face as she speaks the truth she has never managed to live with: she is torn between dying for the world and running until someone crueller chooses for her.",
        onEnter: {
            once: true,
            effects: [
                { type: "flag", flagId: "elara_met", value: true }
            ]
        },
        choices: [
            {
                text: "\"Then we move you before the hunters close in.\"",
                effects: [
                    { type: "flag", flagId: "elara_route_protect", value: true },
                    { type: "relationship", npcId: "elara", amount: 15 },
                    { type: "reputation", factionId: "thorne_guild", amount: 10 }
                ],
                nextScene: "SCENE_ELARA_PROTECT_ROUTE"
            },
            {
                text: "\"The Stone is already in my hands. Tell me what your death would wake.\"",
                requires: { itemId: "stone_of_oblivion" },
                effects: [
                    { type: "flag", flagId: "elara_route_stone_hunt_declared", value: true },
                    { type: "reputation", factionId: "thorne_guild", amount: -20 }
                ],
                nextScene: "SCENE_ELARA_STONE_ROUTE"
            },
            {
                text: "\"Aodhan still lives. I could bring him to you if I chose.\"",
                requires: { notFlag: "aodhan_dead" },
                effects: [
                    { type: "flag", flagId: "elara_route_aodhan_lured", value: true },
                    { type: "reputation", factionId: "thorne_guild", amount: -10 }
                ],
                nextScene: "SCENE_ELARA_BETRAY_ROUTE"
            },
            { text: "Leave before she has to say anything worse aloud.", nextScene: "SCENE_HUSHBRIAR_GUILD_ROAD" }
        ]
    },
    "SCENE_ELARA_PROTECT_ROUTE": {
        id: "SCENE_ELARA_PROTECT_ROUTE",
        location: "thieves_hideout",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "For the first time since you found her, Elara's fear cracks around something almost like relief. It is not trust. It may never become trust. But it is close enough to hurt her with it. Nobody in the hideout mistakes this for safety. Beyond the crate walls, Hushbriar still groans, patrols still move, and every loose board sounds like the prelude to discovery. Even the guild quiets after a while, as though speaking too confidently might call the future closer. If Elara lives, the world's price has only been delayed, not forgiven.",
        choices: [
            {
                text: "\"Neala, come with us. We need someone who can read your roads.\"",
                requires: { notFlag: ["neala_recruited", "neala_refused"] },
                effects: [
                    { type: "flag", flagId: "neala_recruited", value: true },
                    { type: "flag", flagId: "neala_bonded", value: true },
                    { type: "relationship", npcId: "neala", amount: 10 },
                    { type: "reputation", factionId: "thorne_guild", amount: 5 },
                    { type: "addCompanion", companionId: "neala", logText: "Neala joins the party and starts treating every road like a problem she intends to outlive." }
                ],
                nextScene: "SCENE_NEALA_RECRUITED"
            },
            {
                text: "\"Stay with the hideout. Elara still needs a bridge behind her.\"",
                requires: { notFlag: ["neala_recruited", "neala_refused"] },
                effects: [
                    { type: "flag", flagId: "neala_refused", value: true }
                ],
                nextScene: "SCENE_ELARA_PROTECT_ROUTE"
            },
            {
                text: "Sleep in shifts among the crate rows while the guild keeps outer watch.",
                action: "shortRest"
            },
            {
                text: "Sit with Elara while the others argue in whispers.",
                nextScene: "SCENE_ELARA_HOLDFAST_CONFESSION"
            },
            { text: "Listen at the outer crates for what the guild is whispering.", nextScene: "SCENE_ELARA_HOLDFAST_RUMORS" },
            { text: "Check the ward circle and the hiding place for anything that might betray her.", nextScene: "SCENE_ELARA_HOLDFAST_WARD" },
            { text: "Keep the hideout quiet and wait for the next bad knock.", nextScene: "SCENE_ELARA_PROTECT_ROUTE" }
        ]
    },
    "SCENE_NEALA_RECRUITED": {
        id: "SCENE_NEALA_RECRUITED",
        location: "thieves_hideout",
        background: "landscapes/silverthorn_market_avenue.png",
        npcPortrait: "portraits/npc_female_placeholder_portrait.png",
        text: "Neala looks at you long enough to make the arrangement feel like a threat dressed in the clothes of trust. At last she sheaths her blade with obvious reluctance. 'Fine,' she says. 'I walk with you until Elara is moved or you prove I was stupid to leave the bridge. Stay useful. Stay quick. And if I tell you to run, don't waste breath asking why.'",
        choices: [
            {
                text: "Move out while the guild route still holds.",
                nextScene: "SCENE_ELARA_PROTECT_ROUTE"
            }
        ]
    },
    "SCENE_ELARA_HOLDFAST_CONFESSION": {
        id: "SCENE_ELARA_HOLDFAST_CONFESSION",
        location: "thieves_hideout",
        background: "landscapes/silverthorn_market_avenue.png",
        npcPortrait: "portraits/npc_female_placeholder_portrait.png",
        text: "Elara sits with her back to the crates and both hands locked white around the edge of her blanket. Up close, the divine part of her does not look glorious. It looks hunted. 'I kept thinking courage would arrive all at once,' she says without looking at you. 'Like a prayer finally answered. It never did. It was only fear, and more fear after it.' When she finally raises her eyes, shame is doing as much work there as terror. 'If I run, people die for me later. If I stay, people die for me now. I do not know which part of that makes me a coward.'",
        choices: [
            { text: "\"You're still here. That's not nothing.\"", nextScene: "SCENE_ELARA_PROTECT_ROUTE" },
            { text: "\"Fear kept you alive. We deal with the rest after.\"", nextScene: "SCENE_ELARA_PROTECT_ROUTE" }
        ]
    },
    "SCENE_ELARA_HOLDFAST_RUMORS": {
        id: "SCENE_ELARA_HOLDFAST_RUMORS",
        location: "thieves_hideout",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "From the far side of the stacked crates you catch the guild in the kind of whisper that means nobody believes the wall is thick enough. One voice says the monastery bells in Solasmór have gone strange at dawn. Another swears the Soul Mill smoke has not thinned in days and stinks of sanctified blood. No one volunteers to investigate. They speak of those places the way people speak of weather moving toward them: not as choices, but as threats with names.",
        choices: [
            { text: "Let the whispers die and return to Elara's hiding place.", nextScene: "SCENE_ELARA_PROTECT_ROUTE" }
        ]
    },
    "SCENE_ELARA_HOLDFAST_WARD": {
        id: "SCENE_ELARA_HOLDFAST_WARD",
        location: "thieves_hideout",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "The ward circle has been drawn three times over in places where tired hands stopped trusting their first attempt. Salt has gone damp at the edges. Candle grease has bled into old chalk. Someone has wedged blankets into the cracks where light might leak through to the bridge above. None of it feels permanent. All of it feels desperate, which in a place like this is as close as anyone gets to honest defense.",
        choices: [
            { text: "Leave the ward as it is and keep the hideout quiet.", nextScene: "SCENE_ELARA_PROTECT_ROUTE" }
        ]
    },
    "SCENE_ELARA_STONE_ROUTE": {
        id: "SCENE_ELARA_STONE_ROUTE",
        location: "thieves_hideout",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "The room curdles around your words. Elara goes white as ash, one hand clapped over her own mouth as if she can hold the future shut by force. Neala's hand finds her weapon instantly. Even Liobhán, who usually measures lives as leverage before she measures them as people, looks at you as though she has finally decided what sort of butcher stands in front of her. No blood is spilled yet, but no one here can pretend your interest in Elara is anything but hunger now.",
        choices: [
            { text: "Back away for now and study where such a sacrifice might be forced.", nextScene: "SCENE_SOUL_MILL_APPROACH" },
            { text: "Return to Hushbriar and decide whether greed was worth naming aloud.", nextScene: "SCENE_HUSHBRIAR_GUILD_ROAD" }
        ]
    },
    "SCENE_ELARA_BETRAY_ROUTE": {
        id: "SCENE_ELARA_BETRAY_ROUTE",
        location: "thieves_hideout",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "At the mention of Aodhan, every lantern flame seems to shrink. Elara folds in on herself at once, like the name reached out and laid hands on her. Neala's disgust is immediate. Liobhán's is quieter and somehow worse; she has already begun calculating what use can still be wrung from a betrayal not yet completed. The guild does not forgive you for what you have suggested, but neither do they waste a living trail once they see it. If Aodhan still hunts the stone, then you have just turned Elara's hiding place into a future killing ground.",
        choices: [
            { text: "Watch the Soul Mill roads for whichever hunter reaches them first.", nextScene: "SCENE_SOUL_MILL_APPROACH" },
            { text: "Return to Hushbriar and keep the lie alive a little longer.", nextScene: "SCENE_HUSHBRIAR_GUILD_ROAD" }
        ]
    },
    "SCENE_SOLASMOR_APPROACH": {
        id: "SCENE_SOLASMOR_APPROACH",
        location: "solasmor",
        background: "landscapes/forest_walk.png",
        text: "The road to Solasmór climbs into a colder silence than the forest below. Rain-slick bell towers loom through the mist, but the monastery does not feel abandoned so much as withheld, as though every prayer spoken here now waits behind stone for proof that you deserve to hear it answered.",
        choices: [
            { text: "Approach the gates", nextScene: "SCENE_SOLASMOR_GATES" }
        ]
    },
    "SCENE_SOLASMOR_GATES": {
        id: "SCENE_SOLASMOR_GATES",
        location: "solasmor",
        background: "landscapes/forest_walk.png",
        text: "The gates remain barred, and the little movement you glimpse above the wall is too cautious to promise sanctuary. Whatever Solasmór still offers, it will not yield itself to strangers in a single knock while the world below is already learning to feed on miracles.",
        choices: [
            {
                text: "Leave before the watch above marks your face",
                requires: { flag: "elara_route_protect" },
                nextScene: "SCENE_ELARA_PROTECT_ROUTE"
            },
            {
                text: "Turn back and decide whether the guild is still safer than prayer",
                nextScene: "SCENE_HUSHBRIAR_GUILD_ROAD"
            }
        ]
    },
    "SCENE_SOUL_MILL_APPROACH": {
        id: "SCENE_SOUL_MILL_APPROACH",
        location: "soul_mill",
        background: "landscapes/sporefall_whisperwood_reveal.png", // Placeholder
        text: "Dark smoke rises from the Soul Mill in a steady column, carrying the smell of ash, rot, and something industrial beneath it all. Even at a distance the place feels less like a destination and more like a sentence waiting to be carried out.",
        choices: [
            {
                text: "Withdraw and carry what you learned back to the guild",
                requires: { flag: "elara_route_protect" },
                nextScene: "SCENE_ELARA_PROTECT_ROUTE"
            },
            {
                text: "Withdraw and weigh what sort of sacrifice this place was built to finish",
                requires: { flag: "elara_route_stone_hunt_declared" },
                nextScene: "SCENE_ELARA_STONE_ROUTE"
            },
            {
                text: "Withdraw and keep watch for Aodhan on the black roads below",
                requires: { flag: "elara_route_aodhan_lured" },
                nextScene: "SCENE_ELARA_BETRAY_ROUTE"
            },
            {
                text: "Back away and return to Hushbriar before the smoke changes its mind about you",
                nextScene: "SCENE_HUSHBRIAR_GUILD_ROAD"
            }
        ]
    },
    "SCENE_THIEVES_HIDEOUT_OLD": {
        id: "SCENE_THIEVES_HIDEOUT_OLD",
        location: "thieves_hideout",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "An older loading nook lies empty now, stripped of cargo and certainty alike.",
        choices: [
            { text: "Return to the living hideout route", nextScene: "SCENE_HUSHBRIAR_GUILD_ROAD" }
        ]
    }
};


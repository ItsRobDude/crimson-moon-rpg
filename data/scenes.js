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
        text: "Hushbriar has fallen to shadow. The streets are empty, save for the occasional Silverthorn patrol enforcing martial law. Strange growths cover the buildings.",
        choices: [
            {
                text: "Sneak to the Inn (Stealth)",
                type: "skillCheck",
                skill: "stealth",
                dc: 14,
                successText: "You slip past the patrols.",
                failText: "A patrol spots you!",
                nextSceneSuccess: "SCENE_BRIARWOOD_INN",
                nextSceneFail: "SCENE_HUSHBRIAR_COMBAT_GUARDS"
            },
            {
                text: "Leave the town.",
                action: "openMap"
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
        text: "Fionnlagh jerks upright from the bar as if sleep itself has become dangerous. His eyes are raw with drink, prayer, and too many hours spent listening for bad news. When he recognizes you, relief only makes him look more afraid. 'By the gods... what is it now? Tell me quickly. Every hour in this place feels like something waiting to tear open.'",
        choices: [
            {
                text: "Ask about the plague.",
                nextScene: "SCENE_FIONNLAGH_PLAGUE_INFO"
            },
            {
                text: "Ask about the clan.",
                nextScene: "SCENE_FIONNLAGH_CLAN_INFO"
            },
            {
                text: "We need to leave (Trigger Event)",
                nextScene: "SCENE_HUSHBRIAR_SCREAMS"
            },
            {
                text: "Back",
                nextScene: "SCENE_BRIARWOOD_INN"
            }
        ]
    },
    "SCENE_FIONNLAGH_PLAGUE_INFO": {
        id: "SCENE_FIONNLAGH_PLAGUE_INFO",
        location: "hushbriar",
        background: "landscapes/silverthorn_market_avenue.png",
        npcPortrait: "portraits/npc_male_placeholder_portrait.png",
        text: "'Do not call it a sickness,' Fionnlagh whispers, glancing toward the nearest guard before dropping his voice again. 'Sickness leaves a body weaker. This thing hollows people out and stuffs something hungry back inside. I've seen men foam black at the mouth, claw their own faces open, and come up from the floor looking at their kin like meat.'",
        choices: [
            { text: "Back", nextScene: "SCENE_FIONNLAGH_HUB" }
        ]
    },
    "SCENE_FIONNLAGH_CLAN_INFO": {
        id: "SCENE_FIONNLAGH_CLAN_INFO",
        location: "hushbriar",
        background: "landscapes/silverthorn_market_avenue.png",
        npcPortrait: "portraits/npc_male_placeholder_portrait.png",
        text: "'The clan did not survive this whole,' he says. 'It split along every old wound we ever pretended had healed. Some curse the humans. Some curse our own. Some ran for the monastery, some took to the woods, and some locked themselves in their homes to wait for whichever horror found them first. Broken is too gentle a word for what we are now.'",
        choices: [
            { text: "Back", nextScene: "SCENE_FIONNLAGH_HUB" }
        ]
    },
    "SCENE_HUSHBRIAR_SCREAMS": {
        id: "SCENE_HUSHBRIAR_SCREAMS",
        location: "hushbriar",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "Before he can answer, a child's scream cuts across the night outside. A heartbeat later a woman's cry follows it, higher and more terrible, the kind that turns every nearby voice to silence.",
        choices: [
            {
                text: "Run toward the screams.",
                nextScene: "SCENE_INVESTIGATION"
            },
            {
                text: "Go carefully, hand on your weapon.",
                nextScene: "SCENE_INVESTIGATION"
            }
        ]
    },
    "SCENE_INVESTIGATION": {
        id: "SCENE_INVESTIGATION",
        location: "hushbriar",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "At the edge of town, an elven woman kneels in the mud beside a door smashed inward hard enough to scatter splinters across the yard. Grief has stripped language from her; only one torn breath follows another. In the threshold lies a child's severed hand, still closed around a wooden sword. You barely have time to take it in before two women turn toward you from the shadows with steel already bared: Neala first, fierce and shaking with contained fury, and Liobhán behind her, composed in the way only dangerous people ever are.",
        choices: [
            {
                text: "Shift your weight toward steel.",
                nextScene: "SCENE_THIEVES_CONFRONTATION"
            },
            {
                text: "Ask who did this.",
                nextScene: "SCENE_THIEVES_CONFRONTATION"
            }
        ]
    },
    "SCENE_THIEVES_CONFRONTATION": {
        id: "SCENE_THIEVES_CONFRONTATION",
        location: "hushbriar",
        background: "landscapes/silverthorn_market_avenue.png",
        npcPortrait: "portraits/npc_female_placeholder_portrait.png",
        text: "Neala's weapon is at your chest before anyone can settle their footing. 'Well. Now it makes sense,' she says, voice raw with anger. She jerks her chin toward the ruined doorway. 'Choldriths. They were on your trail, and this house paid for it.' Liobhán is suddenly at your back, blade cold against the throat of whoever stood nearest. When she speaks, her voice is so calm it makes the threat worse. 'You carry darkness loudly for strangers. Explain yourselves before Neala decides to bury you in it.'",
        choices: [
            {
                text: "Explain yourselves and offer to hunt the creatures (Persuasion)",
                type: "skillCheck",
                skill: "persuasion",
                dc: 12,
                successText: "Neala does not lower her blade, but the angle changes. 'Then prove it,' she says. 'Follow the blood. Find what came here. Kill it before another door breaks open tonight.' Liobhán's knife eases away by a finger's width, no more.",
                failText: "Neala's mouth twists with disgust. 'Lies. Or worse.' Liobhán moves first, and whatever restraint was still possible dies with the motion.",
                nextSceneSuccess: "SCENE_TRACKING_CHOLDRITHS",
                nextSceneFail: "SCENE_THIEVES_COMBAT"
            },
            {
                text: "Strike before they can.",
                nextScene: "SCENE_THIEVES_COMBAT"
            }
        ]
    },
    "SCENE_THIEVES_COMBAT": {
        id: "SCENE_THIEVES_COMBAT",
        location: "hushbriar",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "Neala lunges with all the anger in her body, and Liobhán is already moving before the first shout leaves anyone's mouth. Her whistle snaps once, and hidden blades answer from the dark as if the whole town has turned against you.",
        type: "combat",
        enemies: ["fungal_beast", "fungal_beast"], // Placeholder for Rogue Enemy
        winScene: "SCENE_TRACKING_CHOLDRITHS",
        loseScene: "SCENE_DEFEAT"
    },
    "SCENE_TRACKING_CHOLDRITHS": {
        id: "SCENE_TRACKING_CHOLDRITHS",
        location: "hushbriar",
        background: "landscapes/forest_walk.png",
        text: "You follow drag marks, broken brush, and dark blood worked deep into the roots beyond town. The trail runs with ugly certainty beneath the trees until even the birds know better than to sing above it. At last it leads you into the clearing of the Moonwell.",
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
        text: "Two small bodies wrapped in spider silk hang above the Moonwell, turning slowly in the night air. Beneath them stands Aodhan, head bowed, a dark stone rising and falling in his hand as if grief has left the motion behind after everything else. Two dead choldriths lie at his feet. He does not turn when he speaks. 'There should have been time,' he says quietly. 'For them. For all of this.'",
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
        text: "Aodhan closes his hand around the Stone of Oblivion and finally faces you. Grief has hollowed him out so completely that fury seems to be the only thing still keeping him standing. 'Sad, isn't it?' he says, glancing once toward the hanging bodies. 'To die so young. To build a world for people and watch it fail them in a single night.' His gaze settles on you. 'The barrier failed moments ago. Not in some distant prophecy. Not in a scholar's warning. Now. The dark is already here, and every oath we were told to trust has gone to ash with it.'",
        choices: [
            {
                text: "Raise steel against him.",
                nextScene: "SCENE_AODHAN_COMBAT"
            },
            {
                text: "Let him walk into the dark.",
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
        text: "The chamber is dim and severe, lit by a single brazier and the red glow of wax seals melting over opened dispatches. Prince Alderic stands over a map table crowded with routes, blockades, and a red ring drawn hard around Whisperwood. He does not offer a seat. 'You have come,' he says at last. 'Good. Silverthorn has use for those who can still move before the rot reaches our walls.'",
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
                text: "Study the chamber in silence.",
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
                text: "Ask him to speak plainly.",
                nextScene: "SCENE_BRIEFING_2"
            }
        ]
    },
    "SCENE_ALDERIC_REACTION": {
        id: "SCENE_ALDERIC_REACTION",
        location: "silverthorn",
        background: "landscapes/alderics_chamber.webp",
        npcPortrait: "portraits/alderic_portrait.png",
        text: "Alderic absorbs the news without visible grief. Only the set of his mouth changes. 'Aodhan is dead? Then he has spared the world whatever weakness might still have remained in him. We move forward.'",
        choices: [
            { text: "Tell me what you need done.", nextScene: "SCENE_BRIEFING_2" }
        ]
    },
    "SCENE_BRIEFING_2": {
        id: "SCENE_BRIEFING_2",
        location: "silverthorn",
        background: "landscapes/alderics_chamber.webp",
        npcPortrait: "portraits/alderic_portrait.png",
        text: "Alderic lays two fingers on the map. 'You will go to Whisperwood. You will learn what birthed this corruption, and if there is a root to cut, you will cut it. My quartermaster has released coin for travel and what little surplus Silverthorn can still spare. Until you depart, the city is yours to use. When you are ready, take the eastern gates and follow the Shadowmire road.'",
        choices: [
            {
                text: "I will carry out the charge.",
                effects: [
                    { type: "relationship", npcId: "alderic", amount: 10 },
                    { type: "reputation", factionId: "silverthorn", amount: 5 }
                ],
                nextScene: "SCENE_BRIEFING_DISMISSAL"
            },
            {
                text: "Speak to me of Aodhan first.",
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
        text: "'Aodhan was once counted among my trusted men,' Alderic says, and for a moment the words sound rehearsed from overuse. 'Now he is grief wearing a man's shape. If you find him, do not mistake pity for mercy.'",
        choices: [
            {
                text: "Understood. I will go.",
                effects: [
                    { type: "relationship", npcId: "alderic", amount: 5 }
                ],
                nextScene: "SCENE_BRIEFING_DISMISSAL"
            },
            {
                text: "Ask for more than a writ and good intentions.",
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
        text: "Alderic slides a sealed writ across the table without breaking eye contact. 'Show that to any gate sergeant or quartermaster who thinks fear outranks duty. Do not return to me with rumors. Bring answers.' Behind you, the chamber doors stand open to the noise of a city pretending not to listen for bad news.",
        choices: [
            {
                text: "Step back into Silverthorn.",
                nextScene: "SCENE_HUB_SILVERTHORN"
            }
        ]
    },
    "SCENE_ALDERIC_CHAMBER_RETURN": {
        id: "SCENE_ALDERIC_CHAMBER_RETURN",
        location: "silverthorn",
        background: "landscapes/alderics_chamber.webp",
        npcPortrait: "portraits/alderic_portrait.png",
        text: "Alderic remains where you left him, framed by candlelight and stacks of reports gone soft at the corners from too many hands. He looks up only long enough to confirm it is you. 'You already have your orders. If there is something you require, speak it without ceremony.'",
        choices: [
            {
                text: "Ask him to restate the charge.",
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
        text: "Alderic answers as if reading from a sentence already carved in stone. 'Whisperwood. Find the source. Sever it if it can be severed. Use the city while you still have the luxury of walls, then take the eastern road through Shadowmire.'",
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
        text: "A young man steps out from behind the ruined house, half visible in the red-dark like he cannot decide whether he belongs to it. His face is pale, his clothes are ragged, and the broken spear in his hands looks more like a habit than a weapon. 'Stay back,' he says, voice shaking. 'Are you real, or another trick of the moon?'",
        choices: [
            {
                text: "Speak gently and calm him down (Persuasion)",
                type: "skillCheck",
                skill: "persuasion",
                dc: 12,
                successText: "'I am real,' you tell him. 'Silverthorn sent me.' The spear lowers by inches. 'Silverthorn?' he whispers. 'Then maybe I am not alone after all. I am Eoin. Something terrible happened here.'",
                failText: "He recoils as if the words hurt him. 'No. No, you sound too calm to be real.' He backs away into the ruin-shadow, but not far enough to vanish.",
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
                text: "Demand answers.",
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
        text: "Once Eoin believes you are real, the words spill out all at once. He says the darkness came during a ritual in the cathedral, that something huge now roams the streets, and that before all this he and his mother sheltered under a footbridge on the north side of town. He does not believe he is dead. He also cannot explain why the moonlight catches him wrong, or why his skin looks almost transparent when he stops moving.",
        choices: [
            {
                text: "Ask what happened in the cathedral",
                effects: [
                    { type: "flag", flagId: "sporefall_eoin_talked", value: true }
                ],
                nextScene: "SCENE_EOIN_RITUAL_TALK"
            },
            {
                text: "Ask about the north side and his mother",
                effects: [
                    { type: "flag", flagId: "sporefall_eoin_talked", value: true },
                    { type: "relationship", npcId: "eoin", amount: 5 }
                ],
                nextScene: "SCENE_EOIN_MOTHER_TALK"
            },
            {
                text: "Step back into the streets of Sporefall",
                effects: [
                    { type: "flag", flagId: "sporefall_eoin_talked", value: true }
                ],
                nextScene: "SCENE_HUB_SPOREFALL"
            }
        ]
    },
    "SCENE_EOIN_RITUAL_TALK": {
        id: "SCENE_EOIN_RITUAL_TALK",
        location: "whisperwood",
        background: "landscapes/sporefall_crimson_frontier.png",
        npcPortrait: "portraits/npc_male_placeholder_portrait.png",
        text: "Eoin hugs his arms tight against himself. 'The Overseer was in the cathedral before it happened. People said it was some kind of ritual. Then the dark came all at once. After that, the streets were full of things wearing people wrong. If you want answers, the cathedral is where I'd start.'",
        choices: [
            {
                text: "Ask about the north side instead",
                nextScene: "SCENE_EOIN_MOTHER_TALK"
            },
            {
                text: "Step back into the streets of Sporefall",
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
        text: "At the mention of his mother, Eoin's voice turns small. 'We stayed under the footbridge on the north side. I was looking for her when the darkness came. I keep thinking if I could just find the bridge again, I'd know what to do next.' He glances toward the northern streets, then quickly away.",
        choices: [
            {
                text: "Ask what happened in the cathedral",
                nextScene: "SCENE_EOIN_RITUAL_TALK"
            },
            {
                text: "Step back into the streets of Sporefall",
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
        text: "'You are brave, but not foolish,' Eoin says, pressing a small vial into your hand. 'Take this. It may be the only thing that sees you through. Then go back to the streets. The answers are still out there, not in some clean ending.'",
        onEnter: {
            addItem: "potion_healing"
        },
        choices: [
            {
                text: "Thank him and return to the streets of Sporefall.",
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
        text: "You find the forgemaster under a spill of broken timber and cracked stone, drunk enough to sway and furious enough to stay conscious anyway. Cathal Ó Taidhg spits blood, curses the murderous thief who tore through Durnhelm, and finally gives the relic its name: the Stone of Oblivion. He tells you Aodhan stole it after demanding to know how to use it, that Alderic showed far too much interest in the stone before the empires agreed to leave it in dwarven hands, and that if anyone still living can tell you more, it may be the witch on Lament Hill. 'If you're chasing answers,' Cathal growls, 'chase them there before every road left to this world closes behind you.'",
        choices: [
            { text: "Take Cathal's warning and follow the Lament Hill lead", nextScene: "SCENE_LAMENT_HILL_APPROACH" },
            { text: "Ask what waits if you turn back toward Silverthorn", nextScene: "SCENE_SILVERTHORN_QUARANTINE" },
            { text: "Stay in Durnhelm a while longer", nextScene: "SCENE_DURNHELM_ENTRY" }
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
            { text: "Speak into the room and promise you did not come for blood", nextScene: "SCENE_LAMENT_AINE_REVEAL" }
        ]
    },
    "SCENE_LAMENT_CAT_DISCOVERY": {
        id: "SCENE_LAMENT_CAT_DISCOVERY",
        location: "lament_hill",
        background: "landscapes/forest_walk.png",
        text: "You pull back the cloth and uncover a small white cat pressed into the corner of the bed. It hisses, but there is too much calculation in the sound for an ordinary animal. Rainwater beads on its fur without soaking in, and when it recoils the air around it ripples with the unmistakable strain of held magic.",
        choices: [
            { text: "Address the cat as if it understands you", nextScene: "SCENE_LAMENT_AINE_REVEAL" },
            { text: "Step back and keep your hands away from your weapon", nextScene: "SCENE_LAMENT_AINE_REVEAL" }
        ]
    },
    "SCENE_LAMENT_AINE_REVEAL": {
        id: "SCENE_LAMENT_AINE_REVEAL",
        location: "lament_hill",
        background: "landscapes/forest_walk.png",
        text: "The cat vanishes in a flash of pale light. In its place stands a wood elf woman clothed all in white, beautiful in the way winter can be beautiful and just as merciless. Grief has carved itself plainly into Aine's face, but fear sharpens it into anger before she speaks. 'Evil bastards,' she says, eyes fixed on the mark you carry. 'What do you want from me?' When she realizes you do not even understand what is on you, her fury falters into something more exhausted. She names it at last: the Mark of Ciara, Blackened Queen of the depths. Then, with the care of someone reopening a wound she never survived, she tells you Aodhan came here seeking the Stone of Oblivion. She would not tell him how to wield it. He answered by binding her in place and burning her children before her eyes. The words nearly fail her there, but she forces them onward anyway. If the Stone is to be used at all, it must drink divine blood. A god could wake it. A demigod could suffice. And while she bought time by sending Aodhan toward the Forbidden Archives, time is all she bought. 'If you would stop him,' Aine says, voice unsteady now, 'then choose quickly. Hushbriar may hold the blood he needs. The archives may hold the rest of what he was willing to do for it.'",
        choices: [
            { text: "Leave Lament Hill with Hushbriar in mind", nextScene: "SCENE_HUSHBRIAR_GUILD_ROAD" },
            { text: "Leave Lament Hill and follow the Forbidden Archives lead", nextScene: "SCENE_ARCHIVES_APPROACH" }
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
        text: "The iron door breathes open only a little before a figure forms from the dark beyond it: tall, gaunt, robed in ruin, with pale fire burning where living eyes should be. 'I am Thalion Ebonhart,' the apparition says. 'Keeper of the Forbidden Archives. Speak truth, or be consumed by the kind of knowledge that never leaves its seekers whole.'",
        choices: [
            {
                text: "Say you seek knowledge to stop Aodhan and the Stone of Oblivion",
                nextScene: "SCENE_ARCHIVES_TRUTH_CHAMBER"
            },
            {
                text: "Ask what price this place takes from those who enter (Persuasion)",
                type: "skillCheck",
                skill: "persuasion",
                dc: 11,
                successText: "Thalion studies you a moment longer, then steps aside. 'Curiosity is kinder than hunger. Enter, and spend it carefully.'",
                failText: "'More than you can presently afford,' Thalion says. Yet after a long silence he steps aside anyway. 'Enter. Learn enough to regret wanting more.'",
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
        text: "The Archives are older than comfort and grander than mercy. Dark shelves climb into shadow, pale lights drift between them like captive moons, and every step feels loud enough to wake the dead buried in the walls. Thalion leads you to a lectern where a silver-and-midnight tome lies open beside diagrams of the Stone of Oblivion. Here, at last, he gives the truth he will not withhold: the Stone cannot be woken by prayer or mortal sacrifice. It must drink divinity. A god could empower it. A demigod could suffice. He admits, too, that he once used such a stone himself and bought eternity at the cost of becoming this thing that now guards the knowledge.",
        choices: [
            { text: "Press him while the door is still open to questions", nextScene: "SCENE_ARCHIVES_AUDIENCE" },
            { text: "Take the core truth and head for Hushbriar at once", nextScene: "SCENE_HUSHBRIAR_GUILD_ROAD" }
        ]
    },
    "SCENE_ARCHIVES_AUDIENCE": {
        id: "SCENE_ARCHIVES_AUDIENCE",
        location: "lament_hill",
        background: "landscapes/forest_walk_alt.png",
        npcPortrait: "portraits/npc_male_placeholder_portrait.png",
        text: "Thalion's patience is not endless, but for one narrow window he permits questions. Even so, he answers like a man rationing blood: every truth measured, every silence deliberate, every glance warning that some doors only open once.",
        choices: [
            {
                text: "Force him to name how Alderic truly serves Ciara (Persuasion)",
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
                text: "Ask what crime chained Thalion to this place (Persuasion)",
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
                text: "Ask where Aodhan will turn once this knowledge reaches him",
                requires: {
                    notFlag: "archives_thalion_audience_closed"
                },
                nextScene: "SCENE_ARCHIVES_AODHAN_WARNING"
            },
            {
                text: "Leave before he decides you have already taken too much",
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
        text: "'He will look where desperation and prophecy already point,' Thalion says. 'Toward Hushbriar. Toward the demigod who has spent her whole life fearing the day the Stone would call men to her door.' He studies your face as if measuring whether warning you was mercy or merely another cruelty delayed.",
        choices: [
            { text: "Return to the questioning while he still allows it", nextScene: "SCENE_ARCHIVES_AUDIENCE" },
            {
                text: "Take the warning and descend toward Hushbriar",
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
        text: "The dock trail ends at a low, screened chamber built into the underside of the bridge itself. Neala steps out first with a blade already naked in her hand, Liobhán a heartbeat behind her and no easier to hear for it. Neither looks surprised. 'Ledger, bridge, hidden cargo,' Neala says. 'You really did follow the scent.' Liobhán's gaze drops to your hands, your belt, your face. 'Then speak carefully,' she says. 'The wrong truth gets buried here with the river.'",
        choices: [
            {
                text: "Hand over the ledger and say you want the cargo safe before Aodhan finds it (Persuasion)",
                type: "skillCheck",
                skill: "persuasion",
                dc: 13,
                successText: "Neala snatches the ledger, but the killing angle leaves her blade. Liobhán studies you another moment and then nods once. 'Useful, then. Not harmless. But useful.'",
                failText: "Neala's expression curdles into contempt. 'Too curious, too late, and still lying badly.' Liobhán does not draw blood, but the knives around you multiply all the same.",
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
                text: "Threaten to sell them all to Silverthorn",
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
        text: "Once they stop treating you like a body to dispose of, the truth comes in pieces. The cargo is not contraband at all but a person, and not just any person: Elara, the prophesied demigod. The guild is not sheltering her from kindness. A demigod who survives because of them becomes leverage no king, priest, or killer can ignore. Neala calls it good business. Liobhán, more honest, calls it the only bargain left that might keep everyone alive a little longer.",
        choices: [
            { text: "Ask to see Elara and swear you came to keep her blood unspent", nextScene: "SCENE_ELARA_HIDEAWAY" },
            {
                text: "Let them glimpse the Stone of Oblivion and ask whether Elara knows what it can do",
                requires: { itemId: "stone_of_oblivion" },
                nextScene: "SCENE_ELARA_HIDEAWAY"
            },
            {
                text: "Warn them that Aodhan still lives and may already be on this trail",
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
        text: "Trust dies quickly in the hideout. Neala wants you gone. Liobhán wants to know how much of your ignorance is genuine and how much is theater. They give you neither answers nor safety, but in the tension that follows you catch enough: there is someone deeper inside worth guarding, and the guild is frightened enough to kill for her or of her depending on which breath catches them first.",
        choices: [
            {
                text: "Shadow their runner deeper into the hideout (Stealth)",
                type: "skillCheck",
                skill: "stealth",
                dc: 14,
                successText: "You keep to the wet stone and lantern shadow until the hideout opens into a second chamber where the real secret is being kept.",
                failText: "A knife taps stone behind you. Liobhán does not even sound winded. 'You were warned,' she says, and the only path left is the one away from her blade.",
                nextSceneSuccess: "SCENE_ELARA_HIDEAWAY",
                nextSceneFail: "SCENE_HUSHBRIAR_GUILD_ROAD"
            },
            { text: "Withdraw before the bridge decides to keep you", nextScene: "SCENE_HUSHBRIAR_GUILD_ROAD" }
        ]
    },
    "SCENE_ELARA_HIDEAWAY": {
        id: "SCENE_ELARA_HIDEAWAY",
        location: "thieves_hideout",
        background: "landscapes/silverthorn_market_avenue.png",
        npcPortrait: "portraits/npc_female_placeholder_portrait.png",
        text: "Elara is hidden in the innermost chamber, behind stacked crates, blankets, and a ward circle drawn by hands too tired to trust their own lines. She looks younger than prophecy has any right to allow and more frightened than a demigod is supposed to be. Yet when her eyes find the mark you carry, all that fear hardens around a truth she has been expecting for years. She knows what relic was found. She knows why people will come for her blood. Shame and terror war across her face as she admits the part she has never found the courage to choose between: dying for the world, or running from it until someone stronger makes the choice for her.",
        onEnter: {
            once: true,
            effects: [
                { type: "flag", flagId: "elara_met", value: true }
            ]
        },
        choices: [
            {
                text: "Promise to keep her hidden and move her before the hunters arrive",
                effects: [
                    { type: "flag", flagId: "elara_route_protect", value: true },
                    { type: "relationship", npcId: "elara", amount: 15 },
                    { type: "reputation", factionId: "thorne_guild", amount: 10 }
                ],
                nextScene: "SCENE_ELARA_PROTECT_ROUTE"
            },
            {
                text: "Tell her the Stone is already in your hands and ask what her death would buy",
                requires: { itemId: "stone_of_oblivion" },
                effects: [
                    { type: "flag", flagId: "elara_route_stone_hunt_declared", value: true },
                    { type: "reputation", factionId: "thorne_guild", amount: -20 }
                ],
                nextScene: "SCENE_ELARA_STONE_ROUTE"
            },
            {
                text: "Admit Aodhan still lives and could be led here if you chose",
                requires: { notFlag: "aodhan_dead" },
                effects: [
                    { type: "flag", flagId: "elara_route_aodhan_lured", value: true },
                    { type: "reputation", factionId: "thorne_guild", amount: -10 }
                ],
                nextScene: "SCENE_ELARA_BETRAY_ROUTE"
            },
            { text: "Leave with only the knowledge that she is here", nextScene: "SCENE_HUSHBRIAR_GUILD_ROAD" }
        ]
    },
    "SCENE_ELARA_PROTECT_ROUTE": {
        id: "SCENE_ELARA_PROTECT_ROUTE",
        location: "thieves_hideout",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "For the first time since you found her, Elara's fear breaks around something like relief. It is not trust exactly, but it is close enough to wound. The guild begins talking in routes, boats, false names, and which roads must be watched for Aodhan or Silverthorn patrols. The choice is made now: if Elara lives, someone else will have to pay the world's price.",
        choices: [
            { text: "Scout Solasmór for sanctuary the guild can still use", nextScene: "SCENE_SOLASMOR_APPROACH" },
            { text: "Watch the Soul Mill smoke and learn what Alderic is preparing", nextScene: "SCENE_SOUL_MILL_APPROACH" },
            { text: "Return to the hideout and keep the route alive", nextScene: "SCENE_ELARA_PROTECT_ROUTE" }
        ]
    },
    "SCENE_ELARA_STONE_ROUTE": {
        id: "SCENE_ELARA_STONE_ROUTE",
        location: "thieves_hideout",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "The room curdles around your words. Elara goes white as ash. Neala's hand finds her weapon. Even Liobhán, who has measured every life here as leverage first and sentiment second, looks at you as though she has finally decided what sort of butcher you might become. No blood is spilled yet, but after this there is no pretending your interest in Elara is anything clean.",
        choices: [
            { text: "Back away for now and study where such a sacrifice might be forced", nextScene: "SCENE_SOUL_MILL_APPROACH" },
            { text: "Return to Hushbriar and decide whether greed was worth naming aloud", nextScene: "SCENE_HUSHBRIAR_GUILD_ROAD" }
        ]
    },
    "SCENE_ELARA_BETRAY_ROUTE": {
        id: "SCENE_ELARA_BETRAY_ROUTE",
        location: "thieves_hideout",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "At the mention of Aodhan, every lantern flame seems to shrink. Elara folds in on herself, knowing at once what sort of bargain you are entertaining. The guild does not forgive you for it, but neither do they dismiss the usefulness of a living baited trail. If Aodhan still hunts the Stone, then you have just turned Elara's hiding place into a future battlefield.",
        choices: [
            { text: "Watch the Soul Mill roads for whichever hunter reaches them first", nextScene: "SCENE_SOUL_MILL_APPROACH" },
            { text: "Return to Hushbriar and keep the lie alive a little longer", nextScene: "SCENE_HUSHBRIAR_GUILD_ROAD" }
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


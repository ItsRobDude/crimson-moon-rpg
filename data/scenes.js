export const scenes = {
    "SCENE_ARRIVAL_HUSHBRIAR": {
        id: "SCENE_ARRIVAL_HUSHBRIAR",
        location: "hushbriar",
        background: "landscapes/silverthorn_market_avenue.png", // Placeholder until hushbriar landscape exists
        text: "You arrive at Hushbriar Cove, trailing behind a squad of Silverthorn soldiers. The sun sets, and a dense fog swallows the sky. Two guards stand at the city gates, their torchlight struggling against the gloom.",
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
        text: "'Halt travelers! State your business,' the tired guard grunts. Before you can answer, the suspicious guard steps forward, squinting at you. 'Wait. That look...'",
        choices: [
            {
                text: "Show respect and compliance.",
                type: "skillCheck",
                skill: "persuasion",
                dc: 10,
                successText: "You explain you are seeking refuge like everyone else. The tired guard waves you through. 'The emperor is conducting a search. Keep your heads low.'",
                failText: "The suspicious guard isn't convinced. 'I've seen your face before...' He reaches for his weapon.",
                nextSceneSuccess: "SCENE_HUSHBRIAR_TOWN",
                nextSceneFail: "SCENE_HUSHBRIAR_COMBAT_GUARDS"
            },
            {
                text: "Slip past while they argue (Stealth)",
                type: "skillCheck",
                skill: "stealth",
                dc: 14,
                successText: "You blend into the crowd of refugees entering the gate, leaving the guards bickering.",
                failText: "Your cloak catches on a crate. 'Hey! You there!' The guards surround you.",
                nextSceneSuccess: "SCENE_HUSHBRIAR_TOWN",
                nextSceneFail: "SCENE_HUSHBRIAR_COMBAT_GUARDS"
            }
        ]
    },
    "SCENE_HUSHBRIAR_COMBAT_GUARDS": {
        id: "SCENE_HUSHBRIAR_COMBAT_GUARDS",
        location: "hushbriar",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "'Traitors! Seize them!' The guards attack. You have no choice but to defend yourself.",
        type: "combat",
        enemies: ["dwarven_captain", "neala"],
        winScene: "SCENE_HUSHBRIAR_TOWN",
        loseScene: "SCENE_PRISON_CAPTURE"
    },
    "SCENE_PRISON_CAPTURE": {
        id: "SCENE_PRISON_CAPTURE",
        location: "hushbriar",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "You are overwhelmed by the guards. Blows rain down, and darkness takes you.",
        choices: [
            { text: "Wake up...", nextScene: "SCENE_PRISON_CELL" }
        ]
    },
    "SCENE_PRISON_CELL": {
        id: "SCENE_PRISON_CELL",
        location: "hushbriar",
        background: "landscapes/alderics_chamber.webp", // Placeholder for cell
        text: "You wake in a cold, damp cell. A guard passes by. 'You have 24 hours before execution, traitor.' Your gear is piled on a table just out of reach.",
        choices: [
            {
                text: "Attempt to pick the lock (DEX/Thieves' Tools)",
                type: "skillCheck",
                skill: "sleight_of_hand", // Mapping to DEX
                dc: 14,
                successText: "Click. The mechanism yields. You slip out quietly, retrieving your gear.",
                failText: "The lock is rusted shut. You make too much noise. The guard returns!",
                nextSceneSuccess: "SCENE_PRISON_ESCAPE",
                nextSceneFail: "SCENE_DEFEAT" // Or combat with guard?
            },
            {
                text: "Bribe the guard (50g)",
                action: "shortRest", // Using as a placeholder action trigger or just custom choice?
                // Standard handleChoice doesn't support custom logic easily without `type`?
                // I'll implement a custom effect or check manually?
                // Actually, let's use a cost check.
                cost: 50,
                nextScene: "SCENE_PRISON_ESCAPE" // Assuming success if you have gold.
                // Note: Standard handleChoice checks cost but might default to nextScene if type is not specified.
                // game.js: `if (spendGold(choice.cost)) ...` logic needed for generic choices?
                // Currently handleChoice only checks cost for rest.
            },
            {
                text: "Wait for an opportunity.",
                nextScene: "SCENE_DEFEAT"
            }
        ]
    },
    "SCENE_PRISON_ESCAPE": {
        id: "SCENE_PRISON_ESCAPE",
        location: "hushbriar",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "You have escaped the cell. You must move quickly before the alarm is raised.",
        choices: [
            { text: "Sneak into the town shadows", nextScene: "SCENE_HUSHBRIAR_TOWN" }
        ]
    },
    "SCENE_HUSHBRIAR_TOWN": {
        id: "SCENE_HUSHBRIAR_TOWN",
        location: "hushbriar",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "Inside, the town is quiet and fearful. Few elves roam the streets. The Briarwood Inn stands ahead, bustling with refugees.",
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
                successText: "You find a hidden cache of supplies left by a fleeing family.",
                failText: "You find nothing but refuse and despair.",
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
        text: "A few run-down shops are open: an herbalist tent, a library, and a provisioner.",
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
        text: "The inn is crowded.",
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
        text: "Fionnlagh looks weary. 'What is it, my son?'",
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
        text: "'It's not just a sickness. It's a corruption of the soul. I've seen men turn into beasts.'",
        choices: [
            { text: "Back", nextScene: "SCENE_FIONNLAGH_HUB" }
        ]
    },
    "SCENE_FIONNLAGH_CLAN_INFO": {
        id: "SCENE_FIONNLAGH_CLAN_INFO",
        location: "hushbriar",
        background: "landscapes/silverthorn_market_avenue.png",
        npcPortrait: "portraits/npc_male_placeholder_portrait.png",
        text: "'The clan has scattered. Some blame the humans, some blame the elves. We are broken.'",
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
                nextScene: "SCENE_SHADOWMIRE_ROADSIDE_CORPSE"
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
                failText: "The plants are gross and slimy. Your fingers come away sticky—and something stirs nearby.",
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
        text: "The oppressive gloom of Shadowmire Forest surrounds you.",
        choices: []
    },
    "SCENE_DURNHELM_GATES": {
        id: "SCENE_DURNHELM_GATES",
        location: "durnhelm",
        background: "landscapes/forest_walk_alt.png", // Placeholder
        text: "Durnhelm rises from the mountain like a fortress-temple, but the approach is choked with broken wagons, dwarven dead, and the scorched aftermath of arcane violence. The great gates still stand, yet the city beyond carries the hush of a place that survived only by inches.",
        choices: [
            { text: "Speak to the guards", nextScene: "SCENE_DURNHELM_ENTRY" },
            { text: "Leave", action: "openMap" }
        ]
    },
    "SCENE_DURNHELM_ENTRY": {
        id: "SCENE_DURNHELM_ENTRY",
        location: "durnhelm",
        background: "landscapes/forest_walk_alt.png",
        text: "The surviving guards wave you inside with visible reluctance. Every face in Durnhelm looks drawn tight with grief. They speak of a murderous wizard, a stolen relic, and a city still counting its dead.",
        choices: [
            { text: "Search for the forge master", action: "openMap" },
            { text: "Withdraw and reconsider your route", action: "openMap" }
        ]
    },
    "SCENE_LAMENT_HILL_APPROACH": {
        id: "SCENE_LAMENT_HILL_APPROACH",
        location: "lament_hill",
        background: "landscapes/forest_walk.png", // Placeholder
        text: "Rain begins to fall as you ascend Lament Hill. The path is scarred by old magic, splintered trees, and fresh landslides. By the time the ruined cottage comes into view, the whole hillside feels watched.",
        choices: [
            { text: "Investigate the cottage", nextScene: "SCENE_LAMENT_COTTAGE" },
            { text: "Look for the graves", nextScene: "SCENE_LAMENT_GRAVES" }
        ]
    },
    "SCENE_LAMENT_COTTAGE": {
        id: "SCENE_LAMENT_COTTAGE",
        location: "lament_hill",
        background: "landscapes/forest_walk.png",
        text: "The cottage is half-collapsed and cold despite the storm outside. A pressure builds in your skull before a woman's voice reaches you without sound: 'You don't belong here... no one does.' Somewhere inside, something small shifts beneath a pile of old cloth.",
        choices: [
            { text: "Search for the hidden presence", action: "openMap" },
            { text: "Study the ruin and the signs of battle", action: "openMap" },
            { text: "Retreat and follow another lead", action: "openMap" }
        ]
    },
    "SCENE_LAMENT_GRAVES": {
        id: "SCENE_LAMENT_GRAVES",
        location: "lament_hill",
        background: "landscapes/forest_walk.png",
        text: "Two small handmade graves rest in the wet earth east of the cottage. Rain collects in the carved names, and the silence around them feels less peaceful than guarded.",
        choices: [
            { text: "Pay respects", action: "openMap" },
            { text: "Return to the cottage", nextScene: "SCENE_LAMENT_COTTAGE" }
        ]
    },
    "SCENE_SOLASMOR_APPROACH": {
        id: "SCENE_SOLASMOR_APPROACH",
        location: "solasmor",
        background: "landscapes/forest_walk.png",
        text: "The monastery of Solasmór stands silent in the hills.",
        choices: [
            { text: "Approach the gates", nextScene: "SCENE_SOLASMOR_GATES" }
        ]
    },
    "SCENE_SOLASMOR_GATES": {
        id: "SCENE_SOLASMOR_GATES",
        location: "solasmor",
        background: "landscapes/forest_walk.png",
        text: "The gates are barred. It seems the monks are not welcoming visitors.",
        choices: [
            { text: "Knock", action: "openMap" }
        ]
    },
    "SCENE_SOUL_MILL_APPROACH": {
        id: "SCENE_SOUL_MILL_APPROACH",
        location: "soul_mill",
        background: "landscapes/sporefall_whisperwood_reveal.png", // Placeholder
        text: "Dark smoke rises from the Soul Mill in a steady column, carrying the smell of ash, rot, and something industrial beneath it all. Even at a distance the place feels less like a destination and more like a sentence waiting to be carried out.",
        choices: [
            { text: "Observe from distance", action: "openMap" }
        ]
    },
    "SCENE_THIEVES_HIDEOUT": {
        id: "SCENE_THIEVES_HIDEOUT",
        location: "thieves_hideout",
        background: "landscapes/silverthorn_market_avenue.png", // Placeholder
        text: "Beneath the bridge, behind stacked crates and river rot, you find the hidden loading dock the guild uses to move people and contraband. The rowboat is gone, but the place still feels recently used.",
        choices: [
            { text: "Enter", action: "openMap" }
        ]
    }
};


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
                nextScene: "SCENE_SPOREFALL_WAKE"
            }
        ]
    },
    "SCENE_SPOREFALL_WAKE": {
        id: "SCENE_SPOREFALL_WAKE",
        location: "whisperwood",
        background: "landscapes/sporefall_crimson_frontier.png",
        text: "When your eyes snap open, the sky above you is black and a swollen crimson moon hangs where daylight should be. Dead birds and small animals lie scattered around the road. Otherworldly plants glow blue and violet through the drifting spores, and the memory of healthy Shadowmire already feels impossibly far away.",
        onEnter: {
            once: true
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
        text: "You rise and push through low branches into Whisperwood proper. The trees sag beneath crimson spore-growth, the ground glistens like wet embers, and the haze ahead shifts around shapes too large to be deer. Shadowmire is gone. Sporefall has taken its place.",
        choices: [
            {
                text: "Investigate the glowing plants.",
                type: "skillCheck",
                skill: "investigation",
                dc: 13,
                successText: "You find a strange residue on the leaves. It's not natural; it's magical corruption. A low growl rumbles behind you as you disturb the patch.",
                failText: "The plants are gross and slimy. Your fingers come away sticky—and something stirs nearby.",
                nextScene: "SCENE_COMBAT_ENCOUNTER"
            },
            {
                text: "Move cautiously deeper.",
                nextScene: "SCENE_COMBAT_ENCOUNTER"
            },
            {
                text: "Circle around the movement (Stealth)",
                type: "skillCheck",
                skill: "stealth",
                dc: 13,
                successText: "You slip between roots and climb a fallen log, keeping the rustling to your left.",
                failText: "A twig snaps underfoot. The rustling becomes a charge.",
                nextSceneSuccess: "SCENE_SKIRT_BEAST",
                nextSceneFail: "SCENE_COMBAT_ENCOUNTER"
            },
            {
                text: "Scout the area (Perception)",
                type: "skillCheck",
                skill: "perception",
                dc: 12,
                successText: "You spot tracks leading away from the beast's path, suggesting a safer route.",
                failText: "The haze plays tricks on your eyes. You see nothing.",
                nextSceneSuccess: "SCENE_SKIRT_BEAST",
                nextSceneFail: "SCENE_COMBAT_ENCOUNTER"
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
        text: "A ragged man stumbles from the treeline. He is covered in scratches and spore-dust. 'Stay back!' he warns, brandishing a broken spear. 'Are you real, or another trick of the moon?'",
        choices: [
            {
                text: "Calm him down (Persuasion Check).",
                type: "skillCheck",
                skill: "persuasion",
                dc: 12,
                successText: "'I am real,' you say softly. 'I was sent by Alderic.' The man lowers his weapon. 'Alderic? Then there is hope. I am Eoin. We were ambushed...'",
                failText: "He doesn't trust you. 'Get back!' he shouts, backing away into the shadows before you can stop him.",
                onSuccess: {
                    effects: [
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
        text: "Eoin explains that a massive creature, a 'Spore Walker', is raising the dead further in. 'It guards the old ruins. If you go there, you go to your grave.'",
        choices: [
            {
                text: "Ask for help (Requires 20 Eoin Relationship)",
                requires: {
                    relationship: { npcId: "eoin", min: 20 }
                },
                nextScene: "SCENE_EOIN_ASSISTANCE"
            },
            {
                text: "I must face it.",
                effects: [
                    { type: "relationship", npcId: "eoin", amount: 5 }
                ],
                nextScene: "SCENE_RUINS_APPROACH"
            }
        ]
    },
    "SCENE_EOIN_ASSISTANCE": {
        id: "SCENE_EOIN_ASSISTANCE",
        location: "whisperwood",
        background: "landscapes/sporefall_crimson_frontier.png",
        npcPortrait: "portraits/npc_male_placeholder_portrait.png",
        text: "'You are brave, but not foolish,' Eoin says, pressing a small vial into your hand. 'Take this. It may be the only thing that sees you through.'",
        onEnter: {
            addItem: "potion_healing"
        },
        choices: [
            {
                text: "Thank him and proceed to the ruins.",
                nextScene: "SCENE_RUINS_APPROACH"
            }
        ]
    },
    "SCENE_ALONE_AGAIN": {
        id: "SCENE_ALONE_AGAIN",
        location: "whisperwood",
        background: "landscapes/sporefall_crimson_frontier.png",
        text: "The survivor vanishes into the gloom. You are alone again, but you see tracks leading deeper into the woods towards some ruins.",
        choices: [
            {
                text: "Follow the tracks.",
                nextScene: "SCENE_RUINS_APPROACH"
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


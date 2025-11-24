export const scenes = {
    "SCENE_ARRIVAL_HUSHBRIAR": {
        id: "SCENE_ARRIVAL_HUSHBRIAR",
        location: "hushbriar",
        background: "landscapes/heart_of_silverthorn.png", // Placeholder until hushbriar landscape exists
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
        background: "landscapes/heart_of_silverthorn.png", // Placeholder
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
        background: "landscapes/heart_of_silverthorn.png",
        text: "'Traitors! Seize them!' The guards attack. You have no choice but to defend yourself.",
        type: "combat",
        enemies: ["fungal_beast", "fungal_beast"], // Placeholder for Guard Enemy
        winScene: "SCENE_HUSHBRIAR_TOWN",
        loseScene: "SCENE_PRISON_CAPTURE"
    },
    "SCENE_PRISON_CAPTURE": {
        id: "SCENE_PRISON_CAPTURE",
        location: "hushbriar",
        background: "landscapes/heart_of_silverthorn.png",
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
        background: "landscapes/heart_of_silverthorn.png",
        text: "You have escaped the cell. You must move quickly before the alarm is raised.",
        choices: [
            { text: "Sneak into the town shadows", nextScene: "SCENE_HUSHBRIAR_TOWN" }
        ]
    },
    "SCENE_HUSHBRIAR_TOWN": {
        id: "SCENE_HUSHBRIAR_TOWN",
        location: "hushbriar",
        background: "landscapes/heart_of_silverthorn.png",
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
        background: "landscapes/heart_of_silverthorn.png",
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
        background: "landscapes/heart_of_silverthorn.png", // Placeholder: needs corrupted variant
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
        background: "landscapes/heart_of_silverthorn.png", // Placeholder
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
        background: "landscapes/heart_of_silverthorn.png",
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
        background: "landscapes/heart_of_silverthorn.png",
        npcPortrait: "portraits/npc_male_placeholder_portrait.png",
        text: "'It's not just a sickness. It's a corruption of the soul. I've seen men turn into beasts.'",
        choices: [
            { text: "Back", nextScene: "SCENE_FIONNLAGH_HUB" }
        ]
    },
    "SCENE_FIONNLAGH_CLAN_INFO": {
        id: "SCENE_FIONNLAGH_CLAN_INFO",
        location: "hushbriar",
        background: "landscapes/heart_of_silverthorn.png",
        npcPortrait: "portraits/npc_male_placeholder_portrait.png",
        text: "'The clan has scattered. Some blame the humans, some blame the elves. We are broken.'",
        choices: [
            { text: "Back", nextScene: "SCENE_FIONNLAGH_HUB" }
        ]
    },
    "SCENE_HUSHBRIAR_SCREAMS": {
        id: "SCENE_HUSHBRIAR_SCREAMS",
        location: "hushbriar",
        background: "landscapes/heart_of_silverthorn.png",
        text: "Before he can explain, a child's scream pierces the air outside. Moments later, a woman's frantic cry joins it.",
        choices: [
            {
                text: "Run outside to investigate.",
                nextScene: "SCENE_INVESTIGATION"
            },
            {
                text: "Stay cautious.",
                nextScene: "SCENE_INVESTIGATION"
            }
        ]
    },
    "SCENE_INVESTIGATION": {
        id: "SCENE_INVESTIGATION",
        location: "hushbriar",
        background: "landscapes/heart_of_silverthorn.png",
        text: "At the edge of town, an elven woman weeps by a smashed door. A severed hand clutching a wooden sword lies on the ground. Suddenly, two figures emerge from the shadows: Neala and Liobhán.",
        choices: [
            {
                text: "Draw weapons.",
                nextScene: "SCENE_THIEVES_CONFRONTATION"
            },
            {
                text: "Ask what happened.",
                nextScene: "SCENE_THIEVES_CONFRONTATION"
            }
        ]
    },
    "SCENE_THIEVES_CONFRONTATION": {
        id: "SCENE_THIEVES_CONFRONTATION",
        location: "hushbriar",
        background: "landscapes/heart_of_silverthorn.png",
        npcPortrait: "portraits/npc_female_placeholder_portrait.png",
        text: "Neala points her weapon at you. 'Choldriths. They followed you here. Explain yourselves or die.' Liobhán appears behind you, dagger at your throat.",
        choices: [
            {
                text: "Explain and offer to help (Persuasion)",
                type: "skillCheck",
                skill: "persuasion",
                dc: 12,
                successText: "Neala lowers her blade. 'Fine. We have a common enemy then. Track them. Kill them.'",
                failText: "'Lies!' Neala shouts. Combat is inevitable.",
                nextSceneSuccess: "SCENE_TRACKING_CHOLDRITHS",
                nextSceneFail: "SCENE_THIEVES_COMBAT"
            },
            {
                text: "Attack them.",
                nextScene: "SCENE_THIEVES_COMBAT"
            }
        ]
    },
    "SCENE_THIEVES_COMBAT": {
        id: "SCENE_THIEVES_COMBAT",
        location: "hushbriar",
        background: "landscapes/heart_of_silverthorn.png",
        text: "The guild members attack with deadly precision!",
        type: "combat",
        enemies: ["fungal_beast", "fungal_beast"], // Placeholder for Rogue Enemy
        winScene: "SCENE_TRACKING_CHOLDRITHS",
        loseScene: "SCENE_DEFEAT"
    },
    "SCENE_TRACKING_CHOLDRITHS": {
        id: "SCENE_TRACKING_CHOLDRITHS",
        location: "hushbriar",
        background: "landscapes/forest_walk.png",
        text: "You follow the drag marks and blood spatter out of the city and into the forest. The trail ends at the Moonwell.",
        choices: [
            {
                text: "Approach the Moonwell.",
                nextScene: "SCENE_MOONWELL"
            }
        ]
    },
    "SCENE_MOONWELL": {
        id: "SCENE_MOONWELL",
        location: "hushbriar",
        background: "landscapes/forest_walk_alt.png",
        text: "Two small bodies hang above the well. A man stands below, tossing a stone. It is Aodhan. 'Sad, isn't it?' he says, not turning around. 'To die so young.'",
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
        text: "Aodhan pockets the Stone of Oblivion. 'The barrier I created failed moments ago. The darkness is coming.' He looks at you with hollow eyes.",
        choices: [
            {
                text: "Attack him.",
                nextScene: "SCENE_AODHAN_COMBAT"
            },
            {
                text: "Let him go.",
                nextScene: "SCENE_AFTERMATH"
            }
        ]
    },
    "SCENE_AODHAN_COMBAT": {
        id: "SCENE_AODHAN_COMBAT",
        location: "hushbriar",
        background: "landscapes/forest_walk_alt.png",
        text: "Aodhan unleashes dark magic!",
        type: "combat",
        enemies: ["spore_zombie"], // Placeholder for Aodhan
        winScene: "SCENE_AODHAN_DEFEAT",
        loseScene: "SCENE_DEFEAT"
    },
    "SCENE_AODHAN_DEFEAT": {
        id: "SCENE_AODHAN_DEFEAT",
        location: "hushbriar",
        background: "landscapes/forest_walk_alt.png",
        text: "Aodhan falls. You retrieve the Stone of Oblivion from his body. As he dies, the ground shakes.",
        onEnter: {
            addItem: "stone_of_oblivion",
            setFlag: "aodhan_dead" // Using generic flag system, but ideally we want explicit status logic
        },
        choices: [
            {
                text: "Watch the sky.",
                nextScene: "SCENE_AFTERMATH"
            }
        ]
    },
    "SCENE_AFTERMATH": {
        id: "SCENE_AFTERMATH",
        location: "hushbriar",
        background: "landscapes/forest_walk.png",
        text: "The following morning never arrives. The moon turns crimson red. The Underdark begins to consume the earth. The prophecy has begun.",
        choices: [
            {
                text: "Travel to Silverthorn (Report to Alderic)",
                nextScene: "SCENE_BRIEFING"
            },
            {
                text: "Head towards Lament Hill (Follow rumors)",
                nextScene: "SCENE_LAMENT_HILL_APPROACH"
            },
            {
                text: "Seek Durnhelm (Dwarven Allies)",
                nextScene: "SCENE_DURNHELM_GATES"
            }
        ]
    },
    "SCENE_BRIEFING": {
        id: "SCENE_BRIEFING",
        location: "silverthorn",
        background: "landscapes/alderics_chamber.webp",
        npcPortrait: "portraits/alderic_portrait.png",
        text: "The chamber is dim. Prince Alderic stands by the window. 'You have come,' he says. 'The situation in Whisperwood grows dire.'",
        onEnter: {
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
                text: "Look around the room.",
                type: "skillCheck",
                skill: "perception",
                dc: 12,
                successText: "You notice the room is devoid of personal touches, cold and sterile. A map on the desk has a red circle around Whisperwood.",
                failText: "The shadows make it hard to see details, but the Prince's tension is palpable.",
                onSuccess: {
                    effects: [
                        { type: "relationship", npcId: "alderic", amount: 5 }
                    ]
                },
                nextSceneSuccess: "SCENE_BRIEFING_2", // Loop back or continue
                nextSceneFail: "SCENE_BRIEFING_2"
            },
            {
                text: "Ask about the mission.",
                nextScene: "SCENE_BRIEFING_2"
            }
        ]
    },
    "SCENE_ALDERIC_REACTION": {
        id: "SCENE_ALDERIC_REACTION",
        location: "silverthorn",
        background: "landscapes/alderics_chamber.webp",
        npcPortrait: "portraits/alderic_portrait.png",
        text: "Alderic's face hardens. 'Aodhan is dead? A pity. He was a useful tool, but weak. We must move forward.'",
        choices: [
            { text: "Ask about the mission.", nextScene: "SCENE_BRIEFING_2" }
        ]
    },
    "SCENE_BRIEFING_2": {
        id: "SCENE_BRIEFING_2",
        location: "silverthorn",
        background: "landscapes/alderics_chamber.webp",
        npcPortrait: "portraits/alderic_portrait.png",
        text: "Alderic turns. 'I need you to travel to Whisperwood. Find the source of the corruption and destroy it. I have provided gold for your journey. Will you accept?'",
        choices: [
            {
                text: "I accept.",
                effects: [
                    { type: "relationship", npcId: "alderic", amount: 10 },
                    { type: "reputation", factionId: "silverthorn", amount: 5 }
                ],
                nextScene: "SCENE_TRAVEL_SHADOWMIRE"
            },
            {
                text: "I need more information about Aodhan.",
                effects: [
                    { type: "relationship", npcId: "alderic", amount: 5 }
                ],
                nextScene: "SCENE_BRIEFING_INFO"
            },
            {
                text: "Visit the market before leaving.",
                nextScene: "SCENE_SILVERTHORN_MARKET"
            }
        ]
    },
    "SCENE_BRIEFING_INFO": {
        id: "SCENE_BRIEFING_INFO",
        location: "silverthorn",
        background: "landscapes/alderics_chamber.webp",
        npcPortrait: "portraits/alderic_portrait.png",
        text: "'Aodhan... he was once a friend. Now he is lost to the spores. Do not hesitate if you see him.'",
        choices: [
            {
                text: "Understood. I will go.",
                effects: [
                    { type: "relationship", npcId: "alderic", amount: 5 }
                ],
                nextScene: "SCENE_TRAVEL_SHADOWMIRE"
            },
            {
                text: "Request extra supplies (Requires 5 Alderic Relationship)",
                requires: {
                    relationship: { npcId: "alderic", min: 5 }
                },
                effects: [
                    { type: "addItem", itemId: "potion_healing" } // Logic needs to handle this in game.js handleChoice too
                ],
                onSuccess: { addGold: 50 }, // Alternative way if logic supports it
                nextScene: "SCENE_TRAVEL_SHADOWMIRE"
            }
        ]
    },
    "SCENE_SILVERTHORN_MARKET": {
        id: "SCENE_SILVERTHORN_MARKET",
        location: "silverthorn",
        background: "landscapes/heart_of_silverthorn.png",
        text: "Stalls line the square, merchants hawking wares beneath the crimson-tinted sky. An inn, 'The Rusty Blade', stands nearby.",
        type: "shop",
        shopId: "silverthorn_market",
        choices: [
            { text: "Take a short rest (10 gold).", action: "shortRest", cost: 10 },
            { text: "Take a long rest (25 gold).", action: "longRest", cost: 25 },
            { text: "Leave the market.", nextScene: "SCENE_BRIEFING_2" }
        ]
    },
    "SCENE_TRAVEL_SHADOWMIRE": {
        id: "SCENE_TRAVEL_SHADOWMIRE",
        location: "shadowmire",
        background: "landscapes/forest_walk.png",
        text: "You leave the city gates and enter Shadowmire Forest. The air grows thick and heavy. Strange spores drift on the wind.",
        onEnter: {
            questUpdate: { id: "investigate_whisperwood", stage: 2 }
        },
        choices: [
            {
                text: "Press on through the fog (CON Save)",
                type: "save",
                ability: "CON",
                dc: 12,
                successText: "You hold your breath and cover your face, resisting the sickening vapors.",
                failText: "The spores fill your lungs. You cough violently and feel the sickness taking hold.",
                failEffect: { type: "status", id: "spore_sickness" },
                nextScene: "SCENE_SPOREFALL_WAKE"
            }
        ]
    },
    "SCENE_SPOREFALL_WAKE": {
        id: "SCENE_SPOREFALL_WAKE",
        location: "whisperwood",
        background: "landscapes/sporefall_outskirts.png",
        text: "Your eyes snap open to a soft red haze. Spores drift like snowflakes around you, clinging to your eyelashes. The memory of Silverthorn feels distant in this muffled world.",
        onEnter: {
            once: true
        },
        choices: [
            {
                text: "Steady your breathing (WIS Check)",
                type: "skillCheck",
                skill: "insight",
                dc: 11,
                successText: "You center yourself, matching your breath to the rhythm of the forest. The panic fades.",
                failText: "The spores sting your throat, making you cough loudly before you can quiet down.",
                nextSceneSuccess: "SCENE_ARRIVAL_WHISPERWOOD",
                nextSceneFail: "SCENE_ARRIVAL_WHISPERWOOD"
            },
            {
                text: "Lie still and listen (Perception)",
                type: "skillCheck",
                skill: "perception",
                dc: 12,
                successText: "Something heavy is pacing nearby. Its breathing is wet, wrong. You chart a path away from it in your mind before you move.",
                failText: "You hear only the wind and the whisper of spores, offering no guidance.",
                nextSceneSuccess: "SCENE_ARRIVAL_WHISPERWOOD",
                nextSceneFail: "SCENE_ARRIVAL_WHISPERWOOD"
            }
        ]
    },
    "SCENE_ARRIVAL_WHISPERWOOD": {
        id: "SCENE_ARRIVAL_WHISPERWOOD",
        location: "whisperwood",
        background: "landscapes/sporefall_outskirts.png",
        text: "You push through low-hanging branches into Whisperwood proper. The trees bend under the weight of crimson spores, and the ground glistens like wet embers. Shapes move in the haze—too large to be deer.",
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
        background: "landscapes/sporefall_outskirts.png",
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
        background: "landscapes/sporefall_outskirts.png",
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
        background: "landscapes/sporefall_outskirts.png",
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
        background: "landscapes/sporefall_outskirts.png",
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
        background: "landscapes/sporefall_outskirts.png",
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
        background: "landscapes/sporefall_outskirts.png",
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
        background: "landscapes/heart_of_silverthorn.png",
        text: "You stand in the heart of Silverthorn. The city bustle continues around you. The market is busy today.",
        choices: [
            {
                text: "Visit Alderic",
                nextScene: "SCENE_BRIEFING"
            },
            {
                text: "Visit Market",
                nextScene: "SCENE_SILVERTHORN_MARKET"
            }
        ]
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
        text: "The massive stone gates of Durnhelm loom before you, carved with runes of endurance.",
        choices: [
            { text: "Speak to the guards", nextScene: "SCENE_DURNHELM_ENTRY" },
            { text: "Leave", action: "openMap" }
        ]
    },
    "SCENE_DURNHELM_ENTRY": {
        id: "SCENE_DURNHELM_ENTRY",
        location: "durnhelm",
        background: "landscapes/forest_walk_alt.png",
        text: "The guards eye you suspiciously but allow you entry.",
        choices: [
            { text: "Explore the city", action: "openMap" } // Placeholder
        ]
    },
    "SCENE_LAMENT_HILL_APPROACH": {
        id: "SCENE_LAMENT_HILL_APPROACH",
        location: "lament_hill",
        background: "landscapes/forest_walk.png", // Placeholder
        text: "Rain begins to fall as you ascend. The air smells of ozone and old sorrow. A broken cottage sits at the summit.",
        choices: [
            { text: "Investigate the cottage", nextScene: "SCENE_LAMENT_COTTAGE" },
            { text: "Look for the graves", nextScene: "SCENE_LAMENT_GRAVES" }
        ]
    },
    "SCENE_LAMENT_COTTAGE": {
        id: "SCENE_LAMENT_COTTAGE",
        location: "lament_hill",
        background: "landscapes/forest_walk.png",
        text: "The roof is collapsed. You hear a voice in your head: 'You don't belong here...'",
        choices: [
            { text: "Leave", action: "openMap" }
        ]
    },
    "SCENE_LAMENT_GRAVES": {
        id: "SCENE_LAMENT_GRAVES",
        location: "lament_hill",
        background: "landscapes/forest_walk.png",
        text: "Two small handmade graves lie to the east.",
        choices: [
            { text: "Pay respects", action: "openMap" }
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
        text: "Dark smoke rises from the Soul Mill. The screams of the damned echo faintly.",
        choices: [
            { text: "Observe from distance", action: "openMap" }
        ]
    },
    "SCENE_THIEVES_HIDEOUT": {
        id: "SCENE_THIEVES_HIDEOUT",
        location: "thieves_hideout",
        background: "landscapes/heart_of_silverthorn.png", // Placeholder
        text: "You find the hidden entrance under the bridge.",
        choices: [
            { text: "Enter", action: "openMap" }
        ]
    }
};

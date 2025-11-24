export const scenes = {
    "SCENE_BRIEFING": {
        id: "SCENE_BRIEFING",
        location: "silverthorn",
        background: "landscapes/alderics_chamber.webp",
        npcPortrait: "portraits/alderic_portrait.png",
        text: "The chamber is dim, lit only by the flickering hearth. Prince Alderic stands by the window, his back to you. 'You have come,' he says, his voice low. 'The situation in Whisperwood grows dire. The Sporefall spreads.'",
        onEnter: {
            questUpdate: { id: "investigate_whisperwood", stage: 1 },
            addGold: 150
        },
        choices: [
            {
                text: "Look around the room.",
                type: "skillCheck",
                skill: "perception",
                dc: 12,
                successText: "You notice the room is devoid of personal touches, cold and sterile. A map on the desk has a red circle around Whisperwood.",
                failText: "The shadows make it hard to see details, but the Prince's tension is palpable.",
                nextSceneSuccess: "SCENE_BRIEFING_2", // Loop back or continue
                nextSceneFail: "SCENE_BRIEFING_2"
            },
            {
                text: "Ask about the mission.",
                nextScene: "SCENE_BRIEFING_2"
            }
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
                text: "Request extra supplies (Requires 20 Alderic Relationship)",
                requires: {
                    relationship: { npcId: "alderic", min: 20 }
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
                dc: 10,
                successText: "You hold your breath and cover your face, resisting the sickening vapors.",
                failText: "The spores fill your lungs. You cough violently and feel weakened.",
                failEffect: { type: "damage", amount: "1d4" },
                nextScene: "SCENE_ARRIVAL_WHISPERWOOD"
            }
        ]
    },
    "SCENE_ARRIVAL_WHISPERWOOD": {
        id: "SCENE_ARRIVAL_WHISPERWOOD",
        location: "whisperwood",
        background: "landscapes/sporefall_outskirts.png",
        text: "You arrive at the edge of Whisperwood. The flora here is twisted, glowing with a sickly violet light. The crimson moon hangs low overhead.",
        choices: [
            {
                text: "Investigate the glowing plants.",
                type: "skillCheck",
                skill: "investigation",
                dc: 13,
                successText: "You find a strange residue on the leaves. It's not natural; it's magical corruption.",
                failText: "The plants are gross and slimy. You learn nothing.",
                nextScene: "SCENE_COMBAT_ENCOUNTER"
            },
            {
                text: "Move cautiously deeper.",
                nextScene: "SCENE_COMBAT_ENCOUNTER"
            }
        ]
    },
    "SCENE_COMBAT_ENCOUNTER": {
        id: "SCENE_COMBAT_ENCOUNTER",
        location: "whisperwood",
        background: "landscapes/sporefall_outskirt_encounter.png",
        text: "A rustling in the bushes turns into a roar! A Fungal Beast charges at you!",
        type: "combat",
        enemyId: "fungal_beast",
        winScene: "SCENE_VICTORY",
        loseScene: "SCENE_DEFEAT"
    },
    "SCENE_VICTORY": {
        id: "SCENE_VICTORY",
        location: "whisperwood",
        background: "landscapes/sporefall_outskirts.png",
        text: "The beast collapses into a pile of sludge. You have survived your first encounter in the Whisperwood.",
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
                text: "I must face it.",
                effects: [
                    { type: "relationship", npcId: "eoin", amount: 5 }
                ],
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
        enemyId: "spore_zombie",
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
    }
};

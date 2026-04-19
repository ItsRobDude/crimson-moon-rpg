export const scenes = {
    "SCENE_ARRIVAL_HUSHBRIAR": {
        id: "SCENE_ARRIVAL_HUSHBRIAR",
        location: "hushbriar",
        background: "landscapes/aodhan_house.png",
        text: "You arrive at Hushbriar Cove a careful distance behind a Silverthorn patrol column. The road shoulders have been hacked clear, footprints press deep into the mud, and the sweet-rot smell from the corpse-choked creek still clings to your clothes. By the time the gates come into view, dusk has collapsed into cold fog and two soldiers stand watch beside a torch too weak for the work being asked of it.",
        onEnter: {
            once: true,
            questUpdate: { id: "investigate_whisperwood", stage: 8 },
            addGold: 10 // Starting cash or adjustment
        },
        choices: [
            {
                text: "Approach the gates calmly.",
                buttonText: "Approach the Gates",
                nextScene: "SCENE_HUSHBRIAR_GATES"
            },
            {
                text: "Observe the guards first (Perception)",
                buttonText: "Read the Guards (Perception)",
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
        background: "landscapes/aodhan_house.png",
        text: "'Halt, travelers. State your business, and be quick about it,' the older guard says. He looks tired enough to sway where he stands, but the younger one circles closer, eyes narrowing as he studies your gear, your faces, and anything that might tie you to Silverthorn's failed business in the east.",
        choices: [
            {
                text: "Say you only seek shelter and keep your heads low (Persuasion)",
                buttonText: "Ask for Shelter (Persuasion)",
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
                buttonText: "Slip in with the Refugees (Stealth)",
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
                buttonText: "Go for Your Weapons",
                nextScene: "SCENE_HUSHBRIAR_COMBAT_GUARDS"
            }
        ]
    },
    "SCENE_HUSHBRIAR_COMBAT_GUARDS": {
        id: "SCENE_HUSHBRIAR_COMBAT_GUARDS",
        location: "hushbriar",
        background: "landscapes/aodhan_house.png",
        text: "Silverthorn soldiers close in through fog, torchlight, and shouted orders. Steel clears leather as you lunge for the only opening before the press of bodies turns into chains.",
        type: "combat",
        enemies: ["silverthorn_guard", "silverthorn_guard"],
        winScene: "SCENE_HUSHBRIAR_TOWN",
        loseScene: "SCENE_PRISON_CAPTURE"
    },
    "SCENE_PRISON_CAPTURE": {
        id: "SCENE_PRISON_CAPTURE",
        location: "hushbriar",
        background: "landscapes/hallway_fiona.png",
        text: "The gate watch does not kill you. It binds you, marches you through a city trying not to meet your eyes, and throws you into a holding cell with the promise that traitors do not leave Hushbriar by the front gate.",
        choices: [
            { text: "Wake to the scrape of boots beyond the bars...", buttonText: "Wake in the Cell", nextScene: "SCENE_PRISON_CELL" }
        ]
    },
    "SCENE_PRISON_CELL": {
        id: "SCENE_PRISON_CELL",
        location: "hushbriar",
        background: "landscapes/hallway_fiona.png",
        text: "You wake in a cold stone cell with your wrists rubbed raw and your gear piled on a table just beyond the bars. A guard paces the corridor in uneven intervals. 'Twenty-four hours,' he mutters without looking at you. 'Then the scaffold can decide whether the King still remembers your names.'",
        choices: [
            {
                text: "Work the lock with whatever scrap and wire you can reach (Sleight of Hand)",
                buttonText: "Work the Lock (Sleight of Hand)",
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
                buttonText: "Bribe the Guard",
                cost: 50,
                nextScene: "SCENE_PRISON_ESCAPE"
            },
            {
                text: "Wait for the next change of watch",
                buttonText: "Wait for the Next Watch",
                nextScene: "SCENE_PRISON_GUARD_RETURN"
            }
        ]
    },
    "SCENE_PRISON_GUARD_RETURN": {
        id: "SCENE_PRISON_GUARD_RETURN",
        location: "hushbriar",
        background: "landscapes/hallway_fiona.png",
        text: "The guard stalks back to your cell, listening to the bars and lock with the bitter patience of a man who has heard too many desperate ideas in one night. He does not open the door, but he does lean close enough to make quiet bargains possible.",
        choices: [
            {
                text: "Press 50 gold through the bars and buy one loose latch",
                buttonText: "Buy a Loose Latch",
                cost: 50,
                nextScene: "SCENE_PRISON_ESCAPE"
            },
            {
                text: "Lure him close and rush him when he unlocks the bars",
                buttonText: "Rush the Guard",
                nextScene: "SCENE_HUSHBRIAR_COMBAT_GUARDS"
            },
            {
                text: "Stay still until the corridor settles again",
                buttonText: "Stay Still",
                nextScene: "SCENE_PRISON_CELL"
            }
        ]
    },
    "SCENE_PRISON_ESCAPE": {
        id: "SCENE_PRISON_ESCAPE",
        location: "hushbriar",
        background: "landscapes/hallway_fiona.png",
        text: "Whether by a loosened latch or bought silence, the cell no longer holds you. You reclaim your gear, duck past the watch before the corridor changes hands, and slip back toward Hushbriar's darkened streets.",
        choices: [
            { text: "Sneak into the town shadows", buttonText: "Slip Back into Town", nextScene: "SCENE_HUSHBRIAR_TOWN" }
        ]
    },
    "SCENE_HUSHBRIAR_TOWN": {
        id: "SCENE_HUSHBRIAR_TOWN",
        location: "hushbriar",
        background: "landscapes/aodhan_house.png",
        text: "Inside the walls, Hushbriar feels occupied more than governed. Wood elves move in short, careful bursts between doorways, never lingering long enough for a patrol to question them, and the whole town smells of wet ash, horse sweat, and the sweet-rot stink drifting in from the corpse-clogged creek. Silverthorn tack fills the inn stables, but every shuttered home around it looks as if grief is holding the door from the other side. The Briarwood Inn still burns with enough light to gather refugees, pilgrims, and anyone too frightened to sleep alone.",
        choices: [
            {
                text: "Enter the Briarwood Inn.",
                buttonText: "Enter the Briarwood Inn",
                nextScene: "SCENE_BRIARWOOD_INN"
            },
            {
                text: "Visit the shops.",
                buttonText: "Visit the Market",
                nextScene: "SCENE_HUSHBRIAR_MARKET"
            },
            {
                text: "Scout the area (Survival)",
                buttonText: "Scout the Area (Survival)",
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
        background: "landscapes/aodhan_house.png",
        text: "The market survives in the way a wound survives: poorly covered and never clean. A sagging herbalist tent trades in bitter roots and fever draughts, a soot-stained provisioner measures food as if every handful might start a fight, and even the little library keeps its door half-shut, as though books have become something a person might be punished for wanting.",
        type: "shop",
        shopId: "silverthorn_market", // Reuse for now
        choices: [
            { text: "Return to town center.", buttonText: "Back to Town Center", nextScene: "SCENE_HUSHBRIAR_TOWN" }
        ]
    },
    "SCENE_HUSHBRIAR_CORRUPTED": {
        id: "SCENE_HUSHBRIAR_CORRUPTED",
        location: "hushbriar",
        background: "landscapes/aodhan_house.png",
        text: "If you reach this quarter after the town has already started sealing itself against the worst of the night, Hushbriar feels less conquered than abandoned in place. Patrols still pass, but between them the streets are all wet ash, shuttered grief, and red fungal creep climbing the woodwork where the creek-mist settles thickest.",
        choices: [
            {
                text: "Make for the Briarwood Inn while the patrol turns the corner.",
                buttonText: "Make for the Inn",
                nextScene: "SCENE_BRIARWOOD_INN"
            },
            {
                text: "Slip back toward the town center.",
                buttonText: "Back to Town Center",
                nextScene: "SCENE_HUSHBRIAR_TOWN"
            }
        ]
    },
    "SCENE_BRIARWOOD_INN": {
        id: "SCENE_BRIARWOOD_INN",
        location: "hushbriar",
        background: "landscapes/aodhan_study.png",
        text: "Heat, damp wool, and low-voiced fear hit you at once. The Briarwood Inn is crowded with refugees sleeping upright over untouched bowls, pilgrims clutching prayer charms hard enough to leave marks in their palms, and locals who only dare speak once they have checked where the Silverthorn guards are standing. Even with the room full, nobody sounds safe. They sound like people trying not to be the loudest thing in a town that has started listening for weakness.",
        onEnter: {
            questUpdate: { id: "investigate_whisperwood", stage: 0 }
        },
        choices: [
            {
                text: "Pay for hearthspace and let the room watch over your rest",
                buttonText: "Pay for Hearthspace",
                cost: 2,
                action: "shortRest"
            },
            {
                text: "Sit with the refugees and listen for which roads are still swallowing people (Insight)",
                buttonText: "Listen to the Refugees (Insight)",
                type: "skillCheck",
                skill: "insight",
                dc: 12,
                companionAid: {
                    companionId: "neala",
                    bonus: 2,
                    logText: "Neala separates real fear from planted rumor before the lies settle in."
                },
                successText: "Between the refugees, dock hands, and hollow-eyed pilgrims, a pattern emerges: the east lanes are watched hardest, the creek paths are full of bodies, and anyone who starts to name who the soldiers are hunting remembers fear and swallows it.",
                failText: "The room gives you fragments only: screams by the creek, patrols choking the east lanes, and too many silences every time the town edges near the name behind the panic.",
                nextSceneSuccess: "SCENE_BRIARWOOD_INN",
                nextSceneFail: "SCENE_BRIARWOOD_INN"
            },
            {
                text: "Talk to Fionnlagh (if alive)",
                buttonText: "Talk to Fionnlagh",
                requires: { npcState: { id: "fionnlagh", status: "alive" } }, // Logic needed in game.js
                nextScene: "SCENE_FIONNLAGH_HUB"
            },
            {
                text: "Leave the Inn",
                buttonText: "Leave the Inn",
                nextScene: "SCENE_HUSHBRIAR_TOWN"
            }
        ]
    },
    "SCENE_FIONNLAGH_HUB": {
        id: "SCENE_FIONNLAGH_HUB",
        location: "hushbriar",
        background: "landscapes/aodhan_study.png",
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
                buttonText: "Ask About the Plague",
                nextScene: "SCENE_FIONNLAGH_PLAGUE_INFO"
            },
            {
                text: "\"What became of the clan when all this started?\"",
                buttonText: "Ask About the Clan",
                nextScene: "SCENE_FIONNLAGH_CLAN_INFO"
            },
            {
                text: "\"You keep looking at the door. What are you waiting to hear?\"",
                buttonText: "Ask What He's Hearing",
                nextScene: "SCENE_HUSHBRIAR_SCREAMS"
            },
            {
                text: "Leave him to his drink and his dread.",
                buttonText: "Leave Him to It",
                nextScene: "SCENE_BRIARWOOD_INN"
            }
        ]
    },
    "SCENE_FIONNLAGH_PLAGUE_INFO": {
        id: "SCENE_FIONNLAGH_PLAGUE_INFO",
        location: "hushbriar",
        background: "landscapes/aodhan_study.png",
        text: "Fionnlagh drags both hands down his face. 'Do not insult the dead by calling it sickness,' he whispers. He checks the nearest guard before leaning close enough for his voice to fray against your cheek. 'Sickness wastes a body. This thing empties one out and leaves something starving where the soul should be. I have seen men foam black at the mouth, tear at their own faces, and get back up looking at their wives like butcher's stock.'",
        choices: [
            { text: "\"Tell me the rest.\"", buttonText: "Back to Fionnlagh", nextScene: "SCENE_FIONNLAGH_HUB" }
        ]
    },
    "SCENE_FIONNLAGH_CLAN_INFO": {
        id: "SCENE_FIONNLAGH_CLAN_INFO",
        location: "hushbriar",
        background: "landscapes/aodhan_study.png",
        text: "Fionnlagh stares into his cup as if he expects to find an omen there. 'The clan did not break clean,' he says at last. 'It split along every old wound we were proud enough to call healed. Some blame the humans. Some blame our own. Some ran uphill to pray. Some took to the woods. Some shut their doors and waited for whichever mercy came last. Broken is too soft a word for what is left of us.'",
        choices: [
            { text: "\"Go on.\"", buttonText: "Back to Fionnlagh", nextScene: "SCENE_FIONNLAGH_HUB" }
        ]
    },
    "SCENE_HUSHBRIAR_SCREAMS": {
        id: "SCENE_HUSHBRIAR_SCREAMS",
        location: "hushbriar",
        background: "landscapes/aodhan_house.png",
        text: "Before Fionnlagh can answer, a child's scream cuts across the night outside. A heartbeat later a woman's cry follows it, higher and more terrible, then several doors slam in panicked sequence as the whole lane tries to pretend it heard nothing. By the time you reach the street, the screaming has stopped. In its place comes the wet drag of something being hauled over mud, and a strand of spider silk glimmering between two fence posts where no web should be.",
        choices: [
            {
                text: "Run toward the lane before the silence settles.",
                buttonText: "Run Toward the Lane",
                nextScene: "SCENE_INVESTIGATION"
            },
            {
                text: "Go carefully, hand low and ready for steel.",
                buttonText: "Go Carefully",
                nextScene: "SCENE_INVESTIGATION"
            }
        ]
    },
    "SCENE_INVESTIGATION": {
        id: "SCENE_INVESTIGATION",
        location: "hushbriar",
        background: "landscapes/aodhan_house.png",
        text: "The lane ends in a yard churned to black mud. One cottage door hangs half-off its hinges, and the threshold is glazed with blood already stringing dark in the night air. No one living remains in the yard, only the evidence of panic: dropped prayer charms, a wooden sword snapped in two, and long silken bands caught on the fence where something climbed out with weight enough to bend the posts. Beyond the yard, broken brush and drag-marks lead east toward the treeline.",
        choices: [
            {
                text: "Follow the drag-marks before the dark swallows them.",
                buttonText: "Follow the Drag-Marks",
                nextScene: "SCENE_TRACKING_CHOLDRITHS"
            },
            {
                text: "Back away and return to the inn with what you saw.",
                buttonText: "Back to the Inn",
                nextScene: "SCENE_BRIARWOOD_INN"
            }
        ]
    },
    "SCENE_THIEVES_CONFRONTATION": {
        id: "SCENE_THIEVES_CONFRONTATION",
        location: "hushbriar",
        background: "landscapes/aodhan_house.png",
        npcPortrait: "portraits/npc_female_placeholder_portrait.png",
        text: "If you come here from an older save, the accusation-path is gone. The yard lies empty now but for blood, silk, and the same east-running trail toward the trees. Whatever did the killing has already left the lane behind.",
        choices: [
            {
                text: "Take the eastern trail toward the Moonwell.",
                buttonText: "Take the Eastern Trail",
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
            { text: "Take the eastern trail toward the Moonwell.", buttonText: "Take the Eastern Trail", nextScene: "SCENE_TRACKING_CHOLDRITHS" }
        ]
    },
    "SCENE_TRACKING_CHOLDRITHS": {
        id: "SCENE_TRACKING_CHOLDRITHS",
        location: "hushbriar",
        background: "landscapes/aodhan_at_moonwell.png",
        text: "You follow dark blood, torn silk, and broken brush beyond the last houses of Hushbriar. The trail runs with ugly certainty beneath the trees until even the birds know better than to sing above it. The farther east you go, the colder the air grows, as though some wider darkness has finally remembered the road. At last the trail spills into the clearing of the Moonwell.",
        choices: [
            {
                text: "Approach the Moonwell in silence.",
                buttonText: "Approach the Moonwell",
                nextScene: "SCENE_MOONWELL"
            }
        ]
    },
    "SCENE_MOONWELL": {
        id: "SCENE_MOONWELL",
        location: "hushbriar",
        background: "landscapes/aodhan_at_moonwell.png",
        displayPages: [
            "The Moonwell should be a place of still water and prayer. Tonight it looks flayed open. Black ripples keep disturbing the surface from below, though nothing breaks it. Two small bodies wrapped in spider silk hang above the well, turning slowly in the wind like accusations no god has answered.",
            "Beneath them stands Aodhan, head bowed, the Stone of Oblivion rising and falling in his hand as if grief has left the motion behind after everything else. Around the clearing the air feels wrong, stretched thin and tearing. Somewhere far beyond the trees, the world is darkening in earnest. He does not turn when he speaks. 'There should have been time,' he says quietly. 'For them. For all of this.'"
        ],
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
                buttonText: "Confront Aodhan",
                nextScene: "SCENE_AODHAN_TALK"
            }
        ]
    },
    "SCENE_AODHAN_TALK": {
        id: "SCENE_AODHAN_TALK",
        location: "hushbriar",
        background: "landscapes/aodhan_at_moonwell.png",
        npcPortrait: "portraits/aodhan_portrait.png",
        displayPages: [
            "Aodhan closes his hand around the Stone of Oblivion and turns at last. Moonlight catches the ruin in his face before anger can hide it. 'Sad, isn't it?' he says quietly, glancing once at the silk-wrapped bodies above the well. 'To die that young. To spend years praying the world kinder, then watch it bare its teeth in one night. Liam should have had more than this.'",
            "His eyes settle on you, fever-bright with exhaustion and fury. 'I held Sporefall shut for as long as I could. Do you feel it? The last ring of the spell is gone. The barrier around the borough has broken. The Underdark is spilling through at full strength now, and the plague is running with it. This is the moment it stops being contained. This is the moment the dark wins ground.'"
        ],
        text: "Aodhan closes his hand around the Stone of Oblivion and turns at last. Moonlight catches the ruin in his face before anger can hide it. 'Sad, isn't it?' he says quietly, glancing once at the silk-wrapped bodies above the well. 'To die that young. To spend years praying the world kinder, then watch it bare its teeth in one night. Liam should have had more than this.' His eyes settle on you, fever-bright with exhaustion and fury. 'I held Sporefall shut for as long as I could. Do you feel it? The last ring of the spell is gone. The barrier around the borough has broken. The Underdark is spilling through at full strength now, and the plague is running with it. This is the moment it stops being contained. This is the moment the dark wins ground.'",
        choices: [
            {
                text: "\"Then this ends here, Aodhan.\"",
                buttonText: "Tell Him It Ends Here",
                nextScene: "SCENE_AODHAN_COMBAT"
            },
            {
                text: "Say nothing and let him pass into the dark.",
                buttonText: "Let Him Walk",
                nextScene: "SCENE_AFTERMATH"
            }
        ]
    },
    "SCENE_AODHAN_COMBAT": {
        id: "SCENE_AODHAN_COMBAT",
        location: "hushbriar",
        background: "landscapes/aodhan_at_moonwell.png",
        text: "Something inside Aodhan gives way. Grief breaks open into violence, and dark power gathers around his arm like smoke learning how to bite.",
        type: "combat",
        enemies: ["aodhan"],
        winScene: "SCENE_AODHAN_DEFEAT",
        loseScene: "SCENE_DEFEAT"
    },
    "SCENE_AODHAN_DEFEAT": {
        id: "SCENE_AODHAN_DEFEAT",
        location: "hushbriar",
        background: "landscapes/aodhan_at_moonwell.png",
        text: "Aodhan falls to his knees first, as though his body has only now remembered how tired it has always been. When he finally hits the earth, the Stone of Oblivion slips from his hand into the grass. The moment you take it, the ground answers with a low shudder, as if something far beneath the roots has felt the change and turned in its sleep.",
        onEnter: {
            addItem: "stone_of_oblivion",
            setFlag: "aodhan_dead" // Using generic flag system, but ideally we want explicit status logic
        },
        choices: [
            {
                text: "Lift your eyes to the sky.",
                buttonText: "Lift Your Eyes",
                nextScene: "SCENE_AFTERMATH"
            }
        ]
    },
    "SCENE_AFTERMATH": {
        id: "SCENE_AFTERMATH",
        location: "hushbriar",
        background: "landscapes/aodhan_house.png",
        displayPages: [
            "Morning does not come. The darkness above the trees deepens until the moon bleeds red enough to stain the clouds around it, and Hushbriar answers the broken night with bells, steel, and screams too small to matter against what has already slipped loose.",
            "Whether Aodhan lives or dies, Sporefall is open now. Whatever had been buried beneath old stories and older prayers is buried no longer. It is here, and the world has already begun changing around that fact. Back in town, somebody is still being hunted hard enough to turn the streets into a battlefield."
        ],
        text: "Morning does not come. The darkness above the trees deepens until the moon bleeds red enough to stain the clouds around it, and Hushbriar answers the broken night with bells, steel, and screams too small to matter against what has already slipped loose. Whether Aodhan lives or dies, Sporefall is open now. Whatever had been buried beneath old stories and older prayers is buried no longer. It is here, and the world has already begun changing around that fact. Back in town, somebody is still being hunted hard enough to turn the streets into a battlefield.",
        choices: [
            {
                text: "Go back into Hushbriar and learn who the broken night was hunting.",
                buttonText: "Go Back into Hushbriar",
                nextScene: "SCENE_HUSHBRIAR_AFTERMATH_HUNT"
            }
        ]
    },
    "SCENE_HUSHBRIAR_AFTERMATH_HUNT": {
        id: "SCENE_HUSHBRIAR_AFTERMATH_HUNT",
        location: "hushbriar",
        background: "landscapes/foggy_forest.png",
        onEnter: {
            questUpdate: { id: "investigate_whisperwood", stage: 9 }
        },
        displayPages: [
            "The road back into Hushbriar looks worse in false dawn than it did by torchlight. Townsfolk run in bursts between shuttered doors while Silverthorn soldiers drag the stubborn, the wounded, and the merely unlucky into separate lines with all the tenderness of men sorting livestock.",
            "Near the square, a rag-wrapped doomsayer keeps shouting about prophecy, blood, and the girl the town failed to hide. Nobody stops to argue. Too many faces keep cutting toward the bridge, the river docks, and the trail of smashed doors leading that way."
        ],
        text: "The road back into Hushbriar looks worse in false dawn than it did by torchlight. Townsfolk run in bursts between shuttered doors while Silverthorn soldiers drag the stubborn, the wounded, and the merely unlucky into separate lines with all the tenderness of men sorting livestock. Near the square, a rag-wrapped doomsayer keeps shouting about prophecy, blood, and the girl the town failed to hide. Nobody stops to argue. Too many faces keep cutting toward the bridge, the river docks, and the trail of smashed doors leading that way.",
        choices: [
            {
                text: "Follow the smashed-door trail toward the bridge before the soldiers close it off.",
                buttonText: "Follow the Smashed-Door Trail",
                nextScene: "SCENE_HUSHBRIAR_DOCK"
            },
            {
                text: "Listen to the panic and separate prophecy from useful fear (Insight)",
                buttonText: "Read the Panic (Insight)",
                type: "skillCheck",
                skill: "insight",
                dc: 12,
                successText: "The fear in the square points one way once you strip the prophecy out of it: the bridge, the rowboat, and the cargo no one dares name above a whisper.",
                failText: "The square gives you only fragments: a hunted girl, guild runners, and the bridge everyone keeps glancing toward when they think fear is not watching them.",
                nextSceneSuccess: "SCENE_HUSHBRIAR_DOCK",
                nextSceneFail: "SCENE_HUSHBRIAR_DOCK"
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
                buttonText: "Demand an Audience",
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
                buttonText: "Hear the Rumors",
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
                buttonText: "Back to Silverthorn",
                action: "openMap"
            }
        ]
    },
    "SCENE_BRIEFING": {
        id: "SCENE_BRIEFING",
        location: "silverthorn",
        background: "landscapes/alderics_chamber.webp",
        npcPortrait: "portraits/alderic_portrait.png",
        text: "The chamber is dim and severe, lit by a single brazier and the red glow of wax seals melting over opened dispatches. Prince Alderic stands over a map table crowded with routes, blockades, and a red ring drawn hard around Whisperwood. He does not offer a seat. 'You are here,' he says at last, as if confirming a detail in a report. 'Good. Whisperwood has gone silent. Liam's party should have returned by now and has not. Not a raven. Not a scrap. Silverthorn still has use for those who can move before panic learns to outrank duty.'",
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
                buttonText: "Read the room",
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
                continueTextSuccess: "Hear the rest of Alderic's charge.",
                continueTextFail: "Hear the rest of Alderic's charge.",
                nextSceneSuccess: "SCENE_BRIEFING_2", // Loop back or continue
                nextSceneFail: "SCENE_BRIEFING_2"
            },
            {
                text: "\"Enough ceremony. Tell me what matters.\"",
                buttonText: "Press Alderic",
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
        text: "Alderic lays two fingers on the map as if pinning the borough in place. 'Travelers speak of black spores choking the eastern road. Those who went after Liam vanished in turn. One name keeps surfacing through the sickness and the fear: Aodhan O Duibh. Find Liam if there is anything left to find. Judge Aodhan if he stands at the root of this, and end the threat if that is what the road demands.' He withdraws his hand from the map only to beckon each of you closer in turn. Retainer coin changes hands. Then his index finger touches your forehead, cold enough to make you flinch, and draws one invisible line while he murmurs a prayer too low to trust. 'Until you depart, the city is yours to use. When you are ready, take the eastern gate and follow the Shadowmire road.'",
        choices: [
            {
                text: "\"I hear the order. I will see it done.\"",
                buttonText: "Accept the charge",
                effects: [
                    { type: "relationship", npcId: "alderic", amount: 10 },
                    { type: "reputation", factionId: "silverthorn", amount: 5 }
                ],
                nextScene: "SCENE_BRIEFING_DISMISSAL"
            },
            {
                text: "\"Before I go, tell me what sort of man Aodhan is now.\"",
                buttonText: "Ask about Aodhan",
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
                buttonText: "Leave with the writ",
                effects: [
                    { type: "relationship", npcId: "alderic", amount: 5 }
                ],
                nextScene: "SCENE_BRIEFING_DISMISSAL"
            },
            {
                text: "\"A writ and a warning are thin armor. Send me better than that.\"",
                buttonText: "Ask for better aid",
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
        text: "Alderic slides a sealed writ across the table without breaking eye contact. 'Show that to any gate sergeant or quartermaster who thinks fear outranks duty. If Liam lives, you bring him home. If he does not, you bring me the truth of him. Do not bring me rumors. Bring me answers.' Behind you, the chamber doors stand open to the noise of a city pretending not to listen for bad news.",
        choices: [
            {
                text: "Take the writ and step back into Silverthorn.",
                buttonText: "Exit Alderic's Chamber",
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
                buttonText: "Hear the charge again",
                nextScene: "SCENE_ALDERIC_MISSION_REMINDER"
            },
            {
                text: "Leave him to his dispatches.",
                buttonText: "Leave the chamber",
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
                buttonText: "Back to Silverthorn",
                nextScene: "SCENE_HUB_SILVERTHORN"
            }
        ]
    },
    "SCENE_SILVERTHORN_MARKET": {
        id: "SCENE_SILVERTHORN_MARKET",
        location: "silverthorn",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "The market district is loud in the way anxious places are loud: too many voices working too hard to prove the city still functions. Traders bark prices over the clatter of wagon wheels, drovers keep skittish animals moving with short tempers, and every third stall seems to be selling the same shrinking comforts to people suddenly afraid of leaving walls without them. A weathered sign for The Rusty Blade swings above a nearby lane while shoppers and quartermasters alike keep one ear turned toward any mention of the eastern road.",
        choices: [
            { text: "Browse the General Store", buttonText: "General Store", nextScene: "SCENE_SILVERTHORN_GENERAL_STORE" },
            { text: "Visit the blacksmith", buttonText: "Blacksmith", nextScene: "SCENE_SILVERTHORN_BLACKSMITH" },
            { text: "Step into The Rusty Blade", buttonText: "Step Inside the Rusty Blade", nextScene: "SCENE_RUSTY_BLADE_INN" },
            { text: "Return to City Center", buttonText: "Back to City Center", nextScene: "SCENE_HUB_SILVERTHORN" }
        ]
    },
    "SCENE_SILVERTHORN_GENERAL_STORE": {
        id: "SCENE_SILVERTHORN_GENERAL_STORE",
        location: "silverthorn",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "The general store smells of lamp oil, damp wool, and the nervous haste of people buying as if shortages can be outrun. Shelves still hold dried meat, blankets, clean cloth, bandages, and travel staples, but the gaps between them look recent and argumentative. A slate by the till lists ration limits in chalk, and every customer ahead of you seems to be choosing which fear deserves their last handful of coin.",
        type: "shop",
        shopId: "silverthorn_general_store",
        choices: [
            { text: "Step back into the market district", buttonText: "Back to Market", nextScene: "SCENE_SILVERTHORN_MARKET" },
            { text: "Return to City Center", buttonText: "Back to City Center", nextScene: "SCENE_HUB_SILVERTHORN" }
        ]
    },
    "SCENE_SILVERTHORN_BLACKSMITH": {
        id: "SCENE_SILVERTHORN_BLACKSMITH",
        location: "silverthorn",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "The forge glows like a wound worked too hard to close. Sparks keep lifting through the rafters while apprentices haul iron, pump bellows, and drag fresh commissions into a queue that already looks longer than daylight. Racks of blades, helms, bows, and half-finished mail line the walls, but the real mood here is triage: road steel, replacement buckles, patched armor, anything that might buy one more safe mile outside the gates.",
        type: "shop",
        shopId: "silverthorn_armorer",
        choices: [
            { text: "Return to the market district", buttonText: "Back to Market", nextScene: "SCENE_SILVERTHORN_MARKET" },
            { text: "Head back to City Center", buttonText: "Back to City Center", nextScene: "SCENE_HUB_SILVERTHORN" }
        ]
    },
    "SCENE_RUSTY_BLADE_INN": {
        id: "SCENE_RUSTY_BLADE_INN",
        location: "silverthorn",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "The Rusty Blade is half tavern, half barracks overflow, and all of it feels one bad rumor away from turning into a war room. Couriers, sellswords, caravan hands, and merchants crowd the common room in damp wool and travel dust, drinking low and watching one another over their cups. Behind the bar, the barkeep polishes tankards with the steady calm of someone who has learned that dangerous news arrives disguised as conversation.",
        choices: [
            { text: "Take a room and rest", buttonText: "Take a Room", action: "longRest" },
            { text: "Listen for rumors about Whisperwood", buttonText: "Hear the Rumors", nextScene: "SCENE_RUSTY_BLADE_RUMORS" },
            { text: "Return to the market district", buttonText: "Back to Market", nextScene: "SCENE_SILVERTHORN_MARKET" }
        ]
    },
    "SCENE_RUSTY_BLADE_RUMORS": {
        id: "SCENE_RUSTY_BLADE_RUMORS",
        location: "silverthorn",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "Most of what you hear is frightened speculation, but the useful thread repeats itself often enough: caravans from the east have stopped arriving, patrols vanish on the road, and the few people who stagger back do so feverish, breathless, and in no shape to explain what found them under the trees.",
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
            { text: "Speak with the healers about the road ahead", buttonText: "Speak with the Healers", nextScene: "SCENE_SILVERTHORN_TEMPLE_COUNSEL" },
            { text: "Offer a quiet prayer before you depart", buttonText: "Offer a Prayer", nextScene: "SCENE_SILVERTHORN_TEMPLE_PRAYER" },
            { text: "Return to City Center", buttonText: "Back to City Center", nextScene: "SCENE_HUB_SILVERTHORN" }
        ]
    },
    "SCENE_SILVERTHORN_TEMPLE_COUNSEL": {
        id: "SCENE_SILVERTHORN_TEMPLE_COUNSEL",
        location: "silverthorn",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "The healers warn that anything tied to Whisperwood should be treated with suspicion. They tell travelers to keep distance from the fevered, carry clean cloth and bitter draughts, and turn back from any road where the air itself starts tasting wrong.",
        choices: [
            { text: "Remain in the temple a while longer", buttonText: "Stay in the Temple", nextScene: "SCENE_SILVERTHORN_TEMPLE" },
            { text: "Return to City Center", buttonText: "Back to City Center", nextScene: "SCENE_HUB_SILVERTHORN" }
        ]
    },
    "SCENE_SILVERTHORN_TEMPLE_PRAYER": {
        id: "SCENE_SILVERTHORN_TEMPLE_PRAYER",
        location: "silverthorn",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "You kneel beneath the stained glass and let the city's noise recede to candle-pop, distant footfall, and the soft labor of people praying because they have run out of cleaner defenses. The stillness helps, but only honestly: not by making the road kinder, only by giving your fear a smaller room to echo in for a few breaths before you have to stand back up.",
        choices: [
            { text: "Step back into the temple hall", buttonText: "Back to the Temple", nextScene: "SCENE_SILVERTHORN_TEMPLE" },
            { text: "Return to City Center", buttonText: "Back to City Center", nextScene: "SCENE_HUB_SILVERTHORN" }
        ]
    },
    "SCENE_SILVERTHORN_NOTICE_BOARD": {
        id: "SCENE_SILVERTHORN_NOTICE_BOARD",
        location: "silverthorn",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "A broad notice board stands near the square, layered with militia summons, missing-person sketches, merchant warnings, and handwritten pleas from families with kin somewhere beyond the eastern road.",
        choices: [
            { text: "Read the Whisperwood notices", buttonText: "Read Whisperwood Notices", nextScene: "SCENE_SILVERTHORN_NOTICE_WHISPERWOOD" },
            { text: "Read the city contracts and bounties", buttonText: "Read Contracts and Bounties", nextScene: "SCENE_SILVERTHORN_NOTICE_CONTRACTS" },
            { text: "Return to City Center", buttonText: "Back to City Center", nextScene: "SCENE_HUB_SILVERTHORN" }
        ]
    },
    "SCENE_SILVERTHORN_NOTICE_WHISPERWOOD": {
        id: "SCENE_SILVERTHORN_NOTICE_WHISPERWOOD",
        location: "silverthorn",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "Several notices mention the same pattern: scouts vanish near Whisperwood's edge, hunters return feverish and confused, and an entire patrol failed to report back after entering the treeline under Alderic's banner.",
        choices: [
            { text: "Keep reading the board", buttonText: "Back to the Board", nextScene: "SCENE_SILVERTHORN_NOTICE_BOARD" },
            { text: "Head for the city gates", buttonText: "Head for the Gates", nextScene: "SCENE_SILVERTHORN_GATES" }
        ]
    },
    "SCENE_SILVERTHORN_NOTICE_CONTRACTS": {
        id: "SCENE_SILVERTHORN_NOTICE_CONTRACTS",
        location: "silverthorn",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "Most postings are the ordinary labor of a strained city: escort work, cellar pests, and warehouse watches. But newer notices speak in harsher terms of curfew enforcement, vanished smugglers, suspicious alchemists, and sealed inspections no one is meant to ask about twice.",
        choices: [
            { text: "Return to the notice board", buttonText: "Back to the Board", nextScene: "SCENE_SILVERTHORN_NOTICE_BOARD" },
            { text: "Return to City Center", buttonText: "Back to City Center", nextScene: "SCENE_HUB_SILVERTHORN" }
        ]
    },
    "SCENE_SILVERTHORN_GATES": {
        id: "SCENE_SILVERTHORN_GATES",
        location: "silverthorn",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "Silverthorn's eastern gate rises above the road like a fortress wall. Wagons are being inspected before departure, and a tired gate captain keeps one hand on a ledger and the other on the pommel of his sword.",
        choices: [
            { text: "Ask the gate captain about the road", buttonText: "Ask the Gate Captain", nextScene: "SCENE_SILVERTHORN_GATE_CAPTAIN" },
            { text: "Leave Silverthorn for Shadowmire", buttonText: "Leave for Shadowmire", nextScene: "SCENE_TRAVEL_SHADOWMIRE" },
            { text: "Return to City Center", buttonText: "Back to City Center", nextScene: "SCENE_HUB_SILVERTHORN" }
        ]
    },
    "SCENE_SILVERTHORN_GATE_CAPTAIN": {
        id: "SCENE_SILVERTHORN_GATE_CAPTAIN",
        location: "silverthorn",
        background: "landscapes/silverthorn_market_avenue.png",
        text: "The captain taps the route on your writ. 'Stay on the road until the fog thickens, then trust your footing more than your eyes. If the air turns foul, cover your mouth and keep moving. No patrol we sent past the old mile-stone has returned unchanged.'",
        choices: [
            { text: "Leave Silverthorn now", buttonText: "Leave for Shadowmire", nextScene: "SCENE_TRAVEL_SHADOWMIRE" },
            { text: "Return to the gate plaza", buttonText: "Back to the Gate Plaza", nextScene: "SCENE_SILVERTHORN_GATES" }
        ]
    },
    "SCENE_TRAVEL_SHADOWMIRE": {
        id: "SCENE_TRAVEL_SHADOWMIRE",
        location: "shadowmire",
        background: "landscapes/foggy_forest.png",
        text: "You leave Silverthorn behind and follow the eastern road beneath the living canopy of Shadowmire Forest. Pine and damp earth fill the air, but the quiet never settles cleanly. Even before the road begins to climb, the birdsong comes thin and scattered, as though the forest has already started holding its breath around you.",
        onEnter: {
            questUpdate: { id: "investigate_whisperwood", stage: 2 }
        },
        choices: [
            {
                text: "Keep to the road and press deeper into Shadowmire",
                buttonText: "Take the Eastern Road",
                nextScene: "SCENE_SHADOWMIRE_HAZE"
            }
        ]
    },
    "SCENE_SHADOWMIRE_HAZE": {
        id: "SCENE_SHADOWMIRE_HAZE",
        location: "shadowmire",
        background: "landscapes/foggy_forest.png",
        text: "Hours later the light begins to flatten. A chill breeze slides through the trees, and a dust begins gathering low between the trunks, so dark purple it reads black until stray light catches it. The birds go quiet one by one. Then a whole flock bursts upward at once, beating the air in panic over the road ahead.",
        choices: [
            {
                text: "Watch the treetops and listen for what scared them",
                buttonText: "Watch the Treetops",
                nextScene: "SCENE_SHADOWMIRE_DYING_BIRDS"
            },
            {
                text: "Cover your mouth and hurry forward",
                buttonText: "Cover Your Mouth",
                nextScene: "SCENE_SHADOWMIRE_DYING_BIRDS"
            }
        ]
    },
    "SCENE_SHADOWMIRE_DYING_BIRDS": {
        id: "SCENE_SHADOWMIRE_DYING_BIRDS",
        location: "shadowmire",
        background: "landscapes/dying_bird_scene.png",
        text: "Before anyone can speak, the flock drops through the black-purple dust like stones. Birds strike branch and earth alike, dead before they land. The air suddenly tastes wrong, sweet and rotten at once, and the first full breath scorches your throat while your eyes begin to sting as the drifting plague thickens around the road.",
        choices: [
            {
                text: "Fight for one clean breath (CON Save)",
                buttonText: "Fight for One Breath (CON)",
                type: "save",
                ability: "CON",
                dc: 12,
                successText: "You clamp a sleeve over your face and stay on your feet a little longer, but the world is already starting to tilt.",
                failText: "Your lungs seize on the first full breath you take. You cough violently, and something thick drags up into your spit as the black-purple dust floods your senses and the world folds into darkness.",
                failEffect: { type: "status", id: "spore_sickness" },
                nextScene: "SCENE_SHADOWMIRE_ROADSIDE_CORPSE"
            }
        ]
    },
    "SCENE_SHADOWMIRE_ROADSIDE_CORPSE": {
        id: "SCENE_SHADOWMIRE_ROADSIDE_CORPSE",
        location: "shadowmire",
        background: "landscapes/foggy_forest.png",
        text: "The road carries you a little farther only because fear has not yet decided which direction to flee. Near sunset you find a body in the middle of the road, black sludge dried around the eyes, nose, and mouth where the infection has already pushed its way back out. Rot has split the flesh beneath it. Then something living tries to answer from the brush. A man lurches half into view, wheezing through black filth at his lips, one hand clawed into his own throat as if he could drag the sickness back inside by force. He manages only the shape of a warning before the coughing folds him and the black-purple dust rolls over everything at once.",
        choices: [
            {
                text: "Examine the body before the haze closes in (Medicine)",
                buttonText: "Examine the Body (Medicine)",
                type: "skillCheck",
                skill: "medicine",
                dc: 11,
                successText: "There are no wounds, no sign of struggle. Whatever took him started in the lungs, then forced its way outward until black sludge crusted every place breath once passed. The coughing stranger is already too far gone to follow for long.",
                failText: "Your stomach turns before you can learn much beyond the rot, the black seep at the face, and the wrong sweetness in the air. The coughing in the brush is turning wet and weak by the second.",
                nextSceneSuccess: "SCENE_SPOREFALL_WAKE",
                nextSceneFail: "SCENE_SPOREFALL_WAKE",
                continueTextSuccess: "Turn toward the coughing in the haze.",
                continueTextFail: "Turn toward the coughing in the haze."
            },
            {
                text: "Reach the coughing stranger before the haze swallows him",
                buttonText: "Reach the Coughing Stranger",
                nextScene: "SCENE_SPOREFALL_WAKE"
            }
        ]
    },
    "SCENE_SPOREFALL_WAKE": {
        id: "SCENE_SPOREFALL_WAKE",
        location: "whisperwood",
        background: "landscapes/sporefall_crimson_frontier.png",
        text: "When your eyes snap open, the sky above you is black and a swollen crimson moon hangs where daylight should be. Dead birds and small animals lie scattered around the road. Black-purple dust drifts through the street, dull as soot until it catches the moon. Strange plants shine through it in sickly color, and the memory of healthy Shadowmire already feels impossibly far away.",
        onEnter: {
            once: true,
            questUpdate: { id: "investigate_whisperwood", stage: 2 }
        },
        choices: [
            {
                text: "Steady your breathing and take stock (WIS Check)",
                buttonText: "Steady Yourself (Insight)",
                type: "skillCheck",
                skill: "insight",
                dc: 11,
                successText: "You force yourself to count breaths and details instead of fear. The panic eases just enough for you to think.",
                failText: "The black dust catches in your throat, and each breath feels thick enough to drown on. The sight of the dead things around you makes your stomach lurch before you can steady yourself.",
                nextSceneSuccess: "SCENE_ARRIVAL_WHISPERWOOD",
                nextSceneFail: "SCENE_ARRIVAL_WHISPERWOOD",
                continueTextSuccess: "Rise and take in what remains of the borough.",
                continueTextFail: "Rise and take in what remains of the borough."
            },
            {
                text: "Lie still and listen to the new forest (Perception)",
                buttonText: "Listen to the Woods (Perception)",
                type: "skillCheck",
                skill: "perception",
                dc: 12,
                successText: "Somewhere beyond the haze, something large moves with a wet, dragging rhythm. You mark the sound and plan your first steps carefully.",
                failText: "The woods answer only with the dry hiss of black dust moving over stone and a silence that feels too attentive.",
                nextSceneSuccess: "SCENE_ARRIVAL_WHISPERWOOD",
                nextSceneFail: "SCENE_ARRIVAL_WHISPERWOOD",
                continueTextSuccess: "Move deeper into the ruined streets.",
                continueTextFail: "Move deeper into the ruined streets."
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
                buttonText: "Search for Survivors (Perception)",
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
                nextSceneFail: "SCENE_SPOREFALL_STREET_SEARCH",
                continueTextSuccess: "Follow the pale figure behind the house.",
                continueTextFail: "Push deeper into the silent street."
            },
            {
                text: "Move between the ruined homes",
                buttonText: "Move Between the Homes",
                nextScene: "SCENE_SPOREFALL_STREET_SEARCH"
            },
            {
                text: "Pause and listen for anyone still alive",
                buttonText: "Listen for the Living",
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
                buttonText: "Follow the Coughing",
                nextScene: "SCENE_MEET_EOIN"
            },
            {
                text: "Circle wide and cut off whoever is hiding",
                buttonText: "Circle the Ruin",
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
                nextSceneFail: "SCENE_FUNGAL_AMBUSH",
                continueTextSuccess: "Slip past before it catches your scent.",
                continueTextFail: "Brace for the charge."
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
        text: "The Fungal Beast erupts from the haze, black-purple dust and wet fungal slurry streaming from its matted hide as it barrels toward you!",
        type: "combat",
        enemies: ["fungal_beast"],
        winScene: "SCENE_VICTORY",
        loseScene: "SCENE_DEFEAT"
    },
    "SCENE_SKIRT_BEAST": {
        id: "SCENE_SKIRT_BEAST",
        location: "whisperwood",
        background: "landscapes/sporefall_crimson_frontier.png",
        text: "You give the creature a wide berth, easing between the trees while it snorts and tears at the moss with blind, furious weight. Wet black residue clings to your cloak and wrists, cold as breath from an opened grave, and every step away feels less like escape than permission borrowed a heartbeat at a time. The beast does fall behind, but the road ahead does not let you forget what nearly touched you.",
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
        background: "landscapes/eoin_sighted.png",
        text: "A boy no older than his early teens edges out from behind the ruined house, one shoulder still tucked behind the wall as if he might snatch himself back out of sight if you blink wrong. He is pale enough for the red moon to make a ghost of him. His clothes hang in filthy strips, and the broken spear in his hands shakes so badly it looks borrowed from someone braver. 'Stay back,' he whispers, then louder, because fear makes him try again. 'Stay back. Are you real, or is the moon doing it again?'",
        choices: [
            {
                text: "\"Easy. I'm real. I'm not here to hurt you.\" (Persuasion)",
                buttonText: "Calm Him (Persuasion)",
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
                nextSceneFail: "SCENE_ALONE_AGAIN",
                continueTextSuccess: "Let Eoin find the words.",
                continueTextFail: "Watch him retreat into the ruin-shadow."
            },
            {
                text: "\"Stop shaking and tell me what happened here.\"",
                buttonText: "Demand Answers",
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
        background: "landscapes/eoin_sighted.png",
        text: "Once Eoin believes you are real, the words come in frightened bursts that trip over one another. The cathedral. Bells that never rang right. Something huge in the streets. The north side, where he and his mum slept under a bridge when the weather turned cruel. He keeps stopping to look at his own hands as if they belong to someone just out of sight. He does not say he is dead. He does not seem able to think it. But every time he goes still, the moonlight finds too much of the wall through him.",
        choices: [
            {
                text: "\"Slow down. Start with the cathedral.\"",
                buttonText: "Ask About the Cathedral",
                effects: [
                    { type: "flag", flagId: "sporefall_eoin_talked", value: true }
                ],
                nextScene: "SCENE_EOIN_RITUAL_TALK"
            },
            {
                text: "\"You keep saying north. Is your mum there?\"",
                buttonText: "Ask About the North Side",
                effects: [
                    { type: "flag", flagId: "sporefall_eoin_talked", value: true },
                    { type: "relationship", npcId: "eoin", amount: 5 }
                ],
                nextScene: "SCENE_EOIN_MOTHER_TALK"
            },
            {
                text: "\"Stay down. I need to look around first.\"",
                buttonText: "Tell Him to Stay Down",
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
        text: "By what should be morning, the sky only pales enough to show how much worse the night became. Hushbriar is breaking in three directions at once: Silverthorn guards locking down the square, guild blades answering from the alleys, and Aodhan burning through both whenever either line stands between him and the woman he thinks the town is hiding. Nobody says Elara's name aloud, but the panic does not need it. From somewhere just east of the square comes a fresh burst of screaming, spelllight, and steel striking steel. If you mean to stop anything before it turns into slaughter, that is where your feet have to go.",
        choices: [
            {
                text: "Run toward the commotion before Aodhan reaches his quarry.",
                buttonText: "Run Toward the Commotion",
                nextScene: "SCENE_MOONWELL"
            },
            {
                text: "Cut through the side lanes and come in from the flank (Stealth)",
                buttonText: "Cut Through the Side Lanes",
                type: "skillCheck",
                skill: "stealth",
                dc: 12,
                successText: "You slip around the square while guards, guild blades, and townsfolk all waste their fear on one another. By the time the shouting thins into one clear trail of violence, you are close enough to follow it cleanly.",
                failText: "The alleys cost you time. Twice you have to flatten yourself against wet timber while panicked men rush past with steel half-drawn. When the route finally clears, the violence has already pulled east toward the Moonwell.",
                nextSceneSuccess: "SCENE_MOONWELL",
                nextSceneFail: "SCENE_MOONWELL"
            }
        ]
    },
    "SCENE_EOIN_RECRUITED": {
        id: "SCENE_EOIN_RECRUITED",
        location: "whisperwood",
        background: "landscapes/eoin_sighted.png",
        text: "Eoin looks past you toward the street and goes gray with the thought of being left in it. His fingers knot white around the broken spear. 'Don't leave me here,' he says too fast, then winces like he said too much. 'I can be quiet. I know some bits. Not all of it. Just... some. The bridge. The little lanes. Places Mum used to say were safer.' He drags in a thin breath. 'If I stay by myself, I keep hearing the town think.'",
        choices: [
            {
                text: "Let him come with you.",
                buttonText: "Let Him Come",
                nextScene: "SCENE_HUB_SPOREFALL"
            }
        ]
    },
    "SCENE_EOIN_RITUAL_TALK": {
        id: "SCENE_EOIN_RITUAL_TALK",
        location: "whisperwood",
        background: "landscapes/eoin_sighted.png",
        text: "Eoin folds his arms over himself so tightly it looks like he is trying to keep from spilling apart. 'The Overseer was there before it all went wrong. Folk said it was some rite. Something important.' He shakes his head hard. 'Then the dark came down all at once, like it had been waiting above us. After that there were people in the streets, only not right. Bent. Wrong. Like the town kept the shape and took the person out.' He glances west and almost hides behind the spear again. 'If anywhere remembers first, it'd be the cathedral.'",
        choices: [
            {
                text: "\"Tell me about the north side instead.\"",
                buttonText: "Ask About the North Side",
                nextScene: "SCENE_EOIN_MOTHER_TALK"
            },
            {
                text: "\"All right. Keep your head down.\"",
                buttonText: "Tell Him to Keep Low",
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
        background: "landscapes/eoin_sighted.png",
        text: "At the mention of his mother, Eoin's voice shrinks to something you have to lean in to catch. 'We slept under the footbridge on the north side when we had nowhere else. Mum said the stone kept the wind off if you tucked close enough.' He rubs at one eye with a dirty wrist. 'I was looking for her when it happened. I keep thinking if I could just see the bridge proper, I'd remember where she went. Or what I was meant to do.' He looks north, then snaps his gaze away like the street looked back.",
        choices: [
            {
                text: "\"Start again. What happened in the cathedral?\"",
                buttonText: "Ask About the Cathedral",
                nextScene: "SCENE_EOIN_RITUAL_TALK"
            },
            {
                text: "\"Stay hidden a little longer.\"",
                buttonText: "Tell Him to Hide",
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
        text: "Eoin keeps glancing over his shoulder as he presses a small vial into your hand, like he expects the street to punish him for helping. 'Take it,' he says. 'Please. Mum always said if you've only got one good thing left, you use it before the bad thing gets to choose for you.' He swallows. 'Don't be gone long. The streets get worse when they think they're alone.'",
        onEnter: {
            addItem: "potion_healing"
        },
        choices: [
            {
                text: "Take the vial and head back into Sporefall.",
                buttonText: "Take the Vial",
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
                buttonText: "Follow Him",
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
                buttonText: "Cathedral Quarter",
                nextScene: "SCENE_SPOREFALL_CATHEDRAL_APPROACH"
            },
            {
                text: "Head east toward the overseer's row",
                buttonText: "Overseer's Row",
                nextScene: "SCENE_SPOREFALL_OVERSEER_APPROACH"
            },
            {
                text: "Head north through the broken market road",
                buttonText: "North Road",
                nextScene: "SCENE_SPOREFALL_NORTH_APPROACH"
            },
            {
                text: "Return to Eoin's hiding place",
                buttonText: "Back to Eoin",
                nextScene: "SCENE_EOIN_TALK"
            }
        ]
    },
    "SCENE_SPOREFALL_CATHEDRAL_APPROACH": {
        id: "SCENE_SPOREFALL_CATHEDRAL_APPROACH",
        location: "whisperwood",
        background: "landscapes/sporefall_whisperwood_reveal.png",
        text: "The western avenue climbs toward the Cathedral of Bone. Before the stairs, a blackened corpse lies slumped beside a torn courier's bag, its contents scattered across stone dust and black fungal rot.",
        choices: [
            {
                text: "Search the courier's bag",
                buttonText: "Search the Courier's Bag",
                nextScene: "SCENE_SPOREFALL_CATHEDRAL_APPROACH"
            },
            {
                text: "Climb toward the cathedral doors",
                buttonText: "Climb to the Doors",
                nextScene: "SCENE_SPOREFALL_CATHEDRAL_ENTRY"
            },
            {
                text: "Return to the central street",
                buttonText: "Back to the Street",
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
                buttonText: "Listen to the Dead (Perception)",
                type: "skillCheck",
                skill: "perception",
                dc: 12,
                successText: "The whispers do not mourn you. They warn someone deeper inside that you have arrived.",
                failText: "The whispering overlaps until grief itself becomes a language you cannot quite understand.",
                nextSceneSuccess: "SCENE_SPOREFALL_CATHEDRAL_VISION",
                nextSceneFail: "SCENE_SPOREFALL_CATHEDRAL_VISION",
                continueTextSuccess: "Follow the warning deeper inside.",
                continueTextFail: "Endure the sound and press inward."
            },
            {
                text: "Withdraw to the cathedral steps",
                buttonText: "Back to the Steps",
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
                buttonText: "Carry the Omen Back",
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
                buttonText: "Inspect the Door",
                nextScene: "SCENE_SPOREFALL_OVERSEER_DOOR"
            },
            {
                text: "Return to the central street",
                buttonText: "Back to the Street",
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
                buttonText: "Study the Runes (Arcana)",
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
                nextSceneFail: "SCENE_SPOREFALL_OVERSEER_DOOR",
                continueTextSuccess: "Look again with the pattern in mind.",
                continueTextFail: "Look again before you trust your hands."
            },
            {
                text: "Trace the carved grooves (Investigation)",
                buttonText: "Trace the Grooves (Investigation)",
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
                nextSceneFail: "SCENE_SPOREFALL_OVERSEER_DOOR",
                continueTextSuccess: "Trace the pattern once more.",
                continueTextFail: "Step back and study the door again."
            },
            {
                text: "Scratch out the Wolf and Serpent runes",
                buttonText: "Break Wolf and Serpent",
                nextScene: "SCENE_SPOREFALL_OVERSEER_STUDY"
            },
            {
                text: "Force the door and risk the trap",
                buttonText: "Force the Door",
                nextScene: "SCENE_SPOREFALL_OVERSEER_DOOR"
            },
            {
                text: "Return to overseer's row",
                buttonText: "Back to the Row",
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
                buttonText: "Read the Journal",
                nextScene: "SCENE_SPOREFALL_OVERSEER_JOURNAL"
            },
            {
                text: "Search the scattered correspondence",
                buttonText: "Search the Letters",
                nextScene: "SCENE_SPOREFALL_OVERSEER_CORRESPONDENCE"
            },
            {
                text: "Open the desk drawer",
                buttonText: "Open the Drawer",
                nextScene: "SCENE_SPOREFALL_OVERSEER_DRAWER"
            },
            {
                text: "Leave the house for the central street",
                buttonText: "Back to the Street",
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
                buttonText: "Back to the Study",
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
                buttonText: "Back to the Study",
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
                buttonText: "Back to the Study",
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
                buttonText: "Cross the Street (Perception)",
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
                buttonText: "Check the Footbridge",
                nextScene: "SCENE_SPOREFALL_NORTH_BRIDGE"
            },
            {
                text: "Return to the central street",
                buttonText: "Back to the Street",
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
                buttonText: "Take the North Road",
                nextScene: "SCENE_SPOREFALL_NORTH_ROUTE_DISCOVERED"
            },
            {
                text: "Return to the central street",
                buttonText: "Back to the Street",
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
                buttonText: "Mark the Route",
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
        text: "Your vision fades as the black dust chokes the last clean breath out of you...",
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
                buttonText: "Alderic's Chamber",
                nextScene: "SCENE_ALDERIC_CHAMBER_RETURN"
            },
            {
                text: "Walk to the market district",
                buttonText: "Market District",
                nextScene: "SCENE_SILVERTHORN_MARKET"
            },
            {
                text: "Visit the General Store",
                buttonText: "General Store",
                nextScene: "SCENE_SILVERTHORN_GENERAL_STORE"
            },
            {
                text: "Enter The Rusty Blade",
                buttonText: "Step Inside the Rusty Blade",
                nextScene: "SCENE_RUSTY_BLADE_INN"
            },
            {
                text: "Stop at the Temple of Dawn",
                buttonText: "Temple of Dawn",
                nextScene: "SCENE_SILVERTHORN_TEMPLE"
            },
            {
                text: "Read the notice board",
                buttonText: "Notice Board",
                nextScene: "SCENE_SILVERTHORN_NOTICE_BOARD"
            },
            {
                text: "Head for the city gates",
                buttonText: "Eastern Gate",
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
        background: "landscapes/forbidden_archive.png",
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
        onEnter: {
            questUpdate: { id: "investigate_whisperwood", stage: 5 }
        },
        text: "Durnhelm rises from the mountain like a fortress-temple, but the beauty of the approach dies in the last mile. Broken wagons, splintered trees, and dwarven dead choke the road beneath the gates. One perimeter guard lies where he tried to turn the last wagon back, hand still locked around a warning horn he never had breath left to sound. Some bodies are burned to charcoal, some hacked apart, and some look as though the fight simply tore the shape of them apart mid-breath. The road into the city reads less like an invasion than one terrible man forcing his way through anyone who tried to slow him.",
        choices: [
            {
                text: "Read the slaughter outside the gates before you enter (Perception)",
                buttonText: "Read the Slaughter (Perception)",
                type: "skillCheck",
                skill: "perception",
                dc: 12,
                successText: "The dead are not arranged like a last stand. Their wounds and positions suggest pursuit, panic, and something powerful forcing its way out of the city rather than into it.",
                failText: "You can count the dead, but not the shape of what happened to them. All the scene offers cleanly is ruin, smoke, and a fight far beyond ordinary soldiers.",
                nextSceneSuccess: "SCENE_DURNHELM_ENTRY",
                nextSceneFail: "SCENE_DURNHELM_ENTRY"
            },
            { text: "Push through the broken gatehouse", buttonText: "Push Through the Gatehouse", nextScene: "SCENE_DURNHELM_ENTRY" },
            { text: "Turn away and follow the Lament Hill road instead", buttonText: "Take the Lament Hill Road", nextScene: "SCENE_LAMENT_HILL_APPROACH" }
        ]
    },
    "SCENE_DURNHELM_ENTRY": {
        id: "SCENE_DURNHELM_ENTRY",
        location: "durnhelm",
        background: "landscapes/near_durnhelm.png",
        text: "Inside the walls, Durnhelm is not empty. It is worse: alive enough to bury its dead. Survivors drag wrapped bodies toward pyres, a smashed storefront near the gate leaks ruined trade goods into the street, and every whispered conversation seems to end on the same pair of words: the forge. The first useful account comes in fragments from the gate quarter. An amber-eyed stranger was seen on the road first. The dark-haired wizard followed him like the second blow after the first warning. Then came fire, screaming, and a relic no one believes should have been unearthed at all. The first man still angry enough to make the sequence hold together is a soot-caked smith named Sven. He jerks his chin east and tells you Aodhan tore answers out of the forge quarter, left Cathal buried under the wreckage, and rode on before the dead had finished falling. It is the closest thing to a living road witness Durnhelm has left, and it points you straight toward the holy fire still burning beside the shattered temple.",
        choices: [
            { text: "Search the wrecked gate-quarter shops for context", buttonText: "Search the Gate Quarter", nextScene: "SCENE_DURNHELM_MARKET_RUINS" },
            { text: "Head east toward the holy forge", buttonText: "Head for the Holy Forge", nextScene: "SCENE_DURNHELM_FORGE_APPROACH" },
            { text: "Withdraw and take the Lament Hill lead instead", buttonText: "Take the Lament Hill Lead", nextScene: "SCENE_LAMENT_HILL_APPROACH" }
        ]
    },
    "SCENE_DURNHELM_MARKET_RUINS": {
        id: "SCENE_DURNHELM_MARKET_RUINS",
        location: "durnhelm",
        background: "landscapes/near_durnhelm.png",
        text: "The gate-quarter shops tell the story the survivors are too tired to repeat twice. A general store has been half-collapsed by collateral damage from the city guard's last fight. A magic shop stands open and gutted, its shelves smashed and its keeper clearly not among the living. Even the alchemist's surviving stock has been marked up into desperation. Everyone who will still speak points you east, toward the forge and the temple ruins where the wizard demanded answers.",
        choices: [
            { text: "Follow the east-side lead to the holy forge", buttonText: "Follow the East-Side Lead", nextScene: "SCENE_DURNHELM_FORGE_APPROACH" },
            { text: "Return to the main thoroughfare", buttonText: "Back to the Thoroughfare", nextScene: "SCENE_DURNHELM_ENTRY" }
        ]
    },
    "SCENE_DURNHELM_FORGE_APPROACH": {
        id: "SCENE_DURNHELM_FORGE_APPROACH",
        location: "durnhelm",
        background: "landscapes/outside_dwarf_cave.png",
        text: "The forge quarter still glows with holy fire, but everything around it looks as though a battle broke the street and then kept striking long after victory had curdled into murder. The nearby temple wall has been blasted open, an anvil is lodged impossibly high in the stone, and blood has dried in black fans across the floor where people tried to keep fighting after the answer was already no. Sven's witness trail still holds together here: scorched drag marks, boot gouges running toward the shattered nave, and one furious cough somewhere under the rubble where Cathal has evidently decided spite is stronger than dying quietly.",
        choices: [
            {
                text: "Study the blasted stone and bloodwork before you move (Arcana)",
                buttonText: "Read the Stonework (Arcana)",
                type: "skillCheck",
                skill: "arcana",
                dc: 12,
                successText: "The scorch marks and torn masonry read like the work of a highly skilled wizard who never had to slow down for lesser opposition.",
                failText: "You know only that the violence here was deliberate, personal, and far beyond the scale of a common raid.",
                nextSceneSuccess: "SCENE_DURNHELM_CATHAL",
                nextSceneFail: "SCENE_DURNHELM_CATHAL"
            },
            { text: "Follow the coughing through the wreckage", buttonText: "Follow the Coughing", nextScene: "SCENE_DURNHELM_CATHAL" },
            { text: "Fall back toward the gate quarter", buttonText: "Back to the Gate Quarter", nextScene: "SCENE_DURNHELM_ENTRY" }
        ]
    },
    "SCENE_DURNHELM_CATHAL": {
        id: "SCENE_DURNHELM_CATHAL",
        location: "durnhelm",
        background: "landscapes/outside_dwarf_cave.png",
        text: "You find the forgemaster under a spill of broken timber and cracked stone, drunk enough to slur and furious enough to stay awake through it. Cathal Ó Taidhg spits pink into the dirt, swears at the sky, at Aodhan, at kings, at relics, and only then at you for arriving late enough to ask questions. Sven gave you the trail into Durnhelm. Cathal gives you the wound itself. Aodhan did not come begging for shelter or rumor. He came hunting the Stone of Oblivion, demanding to know how it might be woken, and he tore the answer he could not win cleanly out of a city already too slow to stop him. When Cathal finally forces the name of the relic into the open, the quarter around you seems to darken with it. Alderic, he says, took far too keen an interest in the stone long before the courts agreed to leave it in dwarven hands. If anyone living can still tell you what kind of damnation the thing invites, it may be the witch on Lament Hill. 'So go on, then,' Cathal snarls, wiping his mouth with the back of one scarred hand. 'Take your answers where the dead haven't finished with 'em yet.'",
        choices: [
            { text: "\"Then Lament Hill is next.\"", buttonText: "Take the Lament Hill Lead", nextScene: "SCENE_LAMENT_HILL_APPROACH" },
            { text: "\"If I turn back toward Silverthorn, what meets me there?\"", buttonText: "Ask About Silverthorn", nextScene: "SCENE_SILVERTHORN_QUARANTINE" },
            { text: "\"Sit tight if you can. I'll carry the warning.\"", buttonText: "Leave Cathal Behind", nextScene: "SCENE_DURNHELM_ENTRY" }
        ]
    },
    "SCENE_LAMENT_HILL_APPROACH": {
        id: "SCENE_LAMENT_HILL_APPROACH",
        location: "lament_hill",
        background: "landscapes/foggy_forest.png",
        onEnter: {
            questUpdate: { id: "investigate_whisperwood", stage: 6 }
        },
        text: "Rain begins to fall as you ascend Lament Hill. The path is torn by old magic and something much more personal: scorched earth, uprooted trees, boulders broken open from within, and scraps of a ruined household still hanging in branches as though one instant of violence never finished happening. The cottage waits near the summit with two little graves set off to one side, and the whole hillside watches you with the patience of a wound that remembers the hand that made it.",
        choices: [
            { text: "Push higher through the wreckage", buttonText: "Push Higher", nextScene: "SCENE_LAMENT_HILL_VISION" },
            { text: "Look for the graves", buttonText: "Look for the Graves", nextScene: "SCENE_LAMENT_GRAVES" }
        ]
    },
    "SCENE_LAMENT_HILL_VISION": {
        id: "SCENE_LAMENT_HILL_VISION",
        location: "lament_hill",
        background: "landscapes/foggy_forest.png",
        text: "The climb turns treacherous. Vines lie across the path where there should be open ground, a stretch of broken hillside seems to drop away farther than it should, and a lizard skitters lightly over a gap your eyes insist is fatal. The illusion almost holds until the rain passes straight through a wall of thorn that casts a perfect shadow anyway. A woman's voice brushes the inside of your skull, cold with warning and grief: 'You wear a brand of darkness. Leave, or burn like he burned my kin.'",
        choices: [
            { text: "Trust the breaks in the illusion and keep climbing", buttonText: "Trust the Breaks", nextScene: "SCENE_LAMENT_COTTAGE" },
            { text: "Circle toward the graves and approach from the east", buttonText: "Circle Toward the Graves", nextScene: "SCENE_LAMENT_GRAVES" }
        ]
    },
    "SCENE_LAMENT_COTTAGE": {
        id: "SCENE_LAMENT_COTTAGE",
        location: "lament_hill",
        background: "landscapes/foggy_forest.png",
        text: "The cottage is half-collapsed and cold despite the storm outside. The door hangs splintered on one hinge, the rafters are blackened from fire that burned too hot and too clean, and the bedroom smells faintly of rain-soaked ash beneath the older smell of grief. The pressure in your skull sharpens again. 'You don't belong here,' the same voiceless woman says. 'No one does.' Beneath a tumble of pale cloth on the bed, something small shifts and goes still.",
        choices: [
            { text: "Pull back the cloth and confront whatever is hiding there", buttonText: "Pull Back the Cloth", nextScene: "SCENE_LAMENT_CAT_DISCOVERY" },
            { text: "Study the scorch marks and shattered room first", buttonText: "Study the Room", nextScene: "SCENE_LAMENT_COTTAGE_SIGNS" },
            { text: "Step back outside and gather yourself by the graves", buttonText: "Back to the Graves", nextScene: "SCENE_LAMENT_GRAVES" }
        ]
    },
    "SCENE_LAMENT_GRAVES": {
        id: "SCENE_LAMENT_GRAVES",
        location: "lament_hill",
        background: "landscapes/graveyard.png",
        text: "Two small handmade graves rest in the wet earth east of the cottage, close enough to the wall that whoever buried the children meant to keep them near home. Rain gathers in the carved names before spilling down the wood like fresh tears. Nothing on the hill feels peaceful, but here the grief is so concentrated it almost has weight.",
        choices: [
            { text: "Pay respects and listen to the hill's silence", buttonText: "Pay Respects", nextScene: "SCENE_LAMENT_COTTAGE" },
            { text: "Return to the cottage", buttonText: "Return to the Cottage", nextScene: "SCENE_LAMENT_COTTAGE" }
        ]
    },
    "SCENE_LAMENT_COTTAGE_SIGNS": {
        id: "SCENE_LAMENT_COTTAGE_SIGNS",
        location: "lament_hill",
        background: "landscapes/foggy_forest.png",
        text: "The room bears too many kinds of violence at once. One wall is cratered inward as though struck by force meant for a battlefield, while the bedframe beside it is marked by smaller desperate hands and melted iron where bindings must have bitten hot. Under all of it lies a more recent disturbance: tiny pawprints in the dust, a white hair caught on a splinter, and the certain feeling that the thing watching you understands every word you do not say aloud.",
        choices: [
            { text: "Search the bed where something is still hiding", buttonText: "Search the Bed", nextScene: "SCENE_LAMENT_CAT_DISCOVERY" },
            { text: "Speak into the room and swear you did not come for blood", buttonText: "Swear You Didn't Come for Blood", nextScene: "SCENE_LAMENT_AINE_ACCUSATION" }
        ]
    },
    "SCENE_LAMENT_CAT_DISCOVERY": {
        id: "SCENE_LAMENT_CAT_DISCOVERY",
        location: "lament_hill",
        background: "landscapes/foggy_forest.png",
        text: "You pull back the cloth and uncover a small white cat pressed into the corner of the bed. It hisses, but there is too much calculation in the sound for an ordinary animal. Rainwater beads on its fur without soaking in, and when it recoils the air around it ripples with the unmistakable strain of held magic.",
        choices: [
            { text: "\"You can stop hiding. I'm not drawing steel.\"", buttonText: "Tell Her You're Unarmed", nextScene: "SCENE_LAMENT_AINE_ACCUSATION" },
            { text: "Step back and keep your hands well away from your weapon", buttonText: "Step Back from Your Weapon", nextScene: "SCENE_LAMENT_AINE_ACCUSATION" }
        ]
    },
    "SCENE_LAMENT_AINE_ACCUSATION": {
        id: "SCENE_LAMENT_AINE_ACCUSATION",
        location: "lament_hill",
        background: "landscapes/foggy_forest.png",
        text: "The cat vanishes in a hard white flare. In its place stands a wood elf woman clothed all in white, beautiful only in the merciless way frost can be. Her grief shows first. Her fear catches it by the throat and turns it into anger. The moment her eyes find the mark you carry, she recoils as though you have pointed a blade at her children a second time. 'Get out,' she snaps, voice fraying on the last word. 'Whatever branded you, take it off my hill. I know what men come here for.'",
        choices: [
            { text: "\"If I knew what this mark was, I wouldn't be asking you.\"", buttonText: "Ask About the Mark", nextScene: "SCENE_LAMENT_AINE_REVEAL" },
            { text: "\"I came after Aodhan. Not to finish what he started.\"", buttonText: "Tell Her You Hunt Aodhan", nextScene: "SCENE_LAMENT_AINE_REVEAL" },
            { text: "\"Then tell me what he wanted badly enough to do this.\"", buttonText: "Ask What Aodhan Wanted", nextScene: "SCENE_LAMENT_AINE_REVEAL" }
        ]
    },
    "SCENE_LAMENT_AINE_REVEAL": {
        id: "SCENE_LAMENT_AINE_REVEAL",
        location: "lament_hill",
        background: "landscapes/foggy_forest.png",
        text: "Aine's stare stays fixed on the mark until anger spends itself and leaves only exhaustion behind. 'Mark of Ciara,' she says at last, like each word tastes foul. 'Blackened Queen. Depth-rot made holy.' She laughs once, without humor, and presses a shaking hand over her mouth before she can lose more of herself than she means to. What follows comes badly, in pieces she clearly wishes she could choke back down. Aodhan came to her for the Stone of Oblivion. He wanted not merely its name, but the key to waking it. When she refused him, he bound her where she stood and burned her children before her eyes so she would hear them die and still not be able to move. The telling breaks there. When she forces herself onward again, her voice is hoarse and hollow. The stone will not wake for prayer, or for common slaughter. It must drink divine blood. A god could rouse it. A demigod could suffice. She bought time by sending Aodhan toward the Forbidden Archives, but only time. 'So choose,' Aine says, looking suddenly older than the hill around her. 'Hushbriar if you mean to deny him the blood. The Archives if you mean to learn what sort of ruin he has already embraced.'",
        choices: [
            { text: "\"Then Hushbriar first. He doesn't get her blood.\"", buttonText: "Go to Hushbriar", nextScene: "SCENE_ARRIVAL_HUSHBRIAR" },
            { text: "\"I'll take the Archives truth before I follow him lower.\"", buttonText: "Seek the Archives", nextScene: "SCENE_ARCHIVES_APPROACH" }
        ]
    },
    "SCENE_ARCHIVES_APPROACH": {
        id: "SCENE_ARCHIVES_APPROACH",
        location: "lament_hill",
        background: "landscapes/cave_before_archive.png",
        onEnter: {
            questUpdate: { id: "investigate_whisperwood", stage: 7 }
        },
        text: "You press higher through the rain until the trees thin and the hill gives way to black stone. A cave mouth yawns between two weather-worn figures carved in mourning, and the ground before it is strewn with old bones, newer bodies, and the metallic stink of people who came seeking answers and found only the dark listening back.",
        choices: [
            { text: "Enter the cave and follow the stale breath of the mountain", buttonText: "Enter the Cave", nextScene: "SCENE_ARCHIVES_CAVERN" },
            {
                text: "Study the dead before you pass them (Perception)",
                buttonText: "Study the Dead (Perception)",
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
        background: "landscapes/forbidden_archive.png",
        text: "Inside, the cave air turns wet and heavy. Bodies lie where panic or exhaustion dropped them, and farther in the tunnel opens into a cemetery that cannot possibly fit inside the hill. Lightning flashes across a sky that should not exist here. A death knight rises among the graves, sword scraping free while shapes all around it begin to stand.",
        choices: [
            {
                text: "Hold to the truth of the stone under your feet (Insight)",
                buttonText: "Hold to the Truth (Insight)",
                type: "skillCheck",
                skill: "insight",
                dc: 12,
                successText: "The cemetery shivers at the edges. You catch the lie in it, press through the false night, and the death knight collapses into cold mist before its blade can land.",
                failText: "The illusion swallows you for a breath too long before the wrongness of it tears open. The graves vanish, leaving only the cave, the corpses, and a doorway of black iron deeper within.",
                nextSceneSuccess: "SCENE_ARCHIVES_GATEKEEPER",
                nextSceneFail: "SCENE_ARCHIVES_GATEKEEPER"
            },
            { text: "Walk straight at the false dead and refuse them your fear", buttonText: "Walk Through the False Dead", nextScene: "SCENE_ARCHIVES_GATEKEEPER" }
        ]
    },
    "SCENE_ARCHIVES_GATEKEEPER": {
        id: "SCENE_ARCHIVES_GATEKEEPER",
        location: "lament_hill",
        background: "landscapes/forbidden_archive.png",
        npcPortrait: "portraits/thalion_portrait.png",
        text: "The iron door parts no wider than a coffin lid before a figure coheres out of the dark behind it: tall, gaunt, robed in ruin, with pale fire banked where living eyes once were. When he speaks, it is with the patience of a sentence already being carried out. 'I am Thalion Ebonhart, last keeper and longest penitent of these halls. Speak plain. Those who come here hungry for convenient truth are devoured by truer things.'",
        choices: [
            {
                text: "\"I seek the truth Aodhan came here to steal.\"",
                buttonText: "Ask for Aodhan's Truth",
                nextScene: "SCENE_ARCHIVES_TRUTH_CHAMBER"
            },
            {
                text: "\"What toll do these halls take from the people who enter them?\" (Persuasion)",
                buttonText: "Ask the Cost (Persuasion)",
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
        background: "landscapes/forbidden_archive.png",
        npcPortrait: "portraits/thalion_portrait.png",
        text: "The Archives are older than comfort and grander than mercy. Dark shelves climb into shadow, pale lights drift between them like captive moons, and every step sounds indecently loud, as though the dead in the walls resent being reminded of the living. Thalion leads you to a lectern where a silver-and-midnight tome lies open beside diagrams that never seem to hold still long enough to be safely understood. He does not give the answer as a scholar would. He gives it like testimony. The Stone of Oblivion does not wake for prayer, nor for ordinary slaughter. What stirs in the margins of the pages is holier and fouler than that. It must drink divinity. A god could rouse it. A demigod could suffice. Only after letting that sentence bruise the air between you does Thalion admit, with loathing that points inward, that he knows because he once helped profane a divine life and bought eternity at the price of becoming the warning now speaking to you.",
        choices: [
            { text: "\"Then answer what you still can before you close your mouth to me.\"", buttonText: "Ask for More Truth", nextScene: "SCENE_ARCHIVES_AUDIENCE" },
            { text: "\"That is enough. Hushbriar cannot wait.\"", buttonText: "Leave for Hushbriar", nextScene: "SCENE_ARRIVAL_HUSHBRIAR" }
        ]
    },
    "SCENE_ARCHIVES_AUDIENCE": {
        id: "SCENE_ARCHIVES_AUDIENCE",
        location: "lament_hill",
        background: "landscapes/forbidden_archive.png",
        npcPortrait: "portraits/thalion_portrait.png",
        text: "Thalion's patience is not endless, but for one narrow window he permits questions. Even now he answers like a man measuring out confession by the drop: every truth weighed, every silence deliberate, every glance a reminder that some doors are merciful only once.",
        choices: [
            {
                text: "\"How long has Alderic been keeping forbidden counsel?\" (Persuasion)",
                buttonText: "Ask About Alderic (Persuasion)",
                type: "skillCheck",
                skill: "persuasion",
                dc: 14,
                requires: {
                    notFlag: ["archives_thalion_audience_closed", "archives_alderic_truth_learned", "archives_alderic_truth_missed"]
                },
                successText: "At last Thalion relents. Alderic sought forbidden counsel long before Silverthorn learned to mistake discipline for innocence. The prince went below, came back changed, and has kept too calm a hand on profane matters ever since. 'If you need a cleaner absolution than that,' Thalion says, 'seek it from someone less honest or less damned.'",
                failText: "Thalion's mouth hardens. 'I have given you enough to know the prince is not clean. The rest would be confession, not guidance, and you have not earned that much of me.'",
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
                buttonText: "Ask About Thalion's Sin",
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
                buttonText: "Ask Where Aodhan Goes",
                requires: {
                    notFlag: "archives_thalion_audience_closed"
                },
                nextScene: "SCENE_ARCHIVES_AODHAN_WARNING"
            },
            {
                text: "Bow out before he decides you have already taken too much.",
                buttonText: "Leave the Audience",
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
        background: "landscapes/forbidden_archive.png",
        npcPortrait: "portraits/thalion_portrait.png",
        text: "'He will go where prophecy has already done half his hunting for him,' Thalion says. 'To Hushbriar. To the demigod who has spent her life dreading the day the stone would teach men her name.' He studies your face as though weighing whether this warning is mercy, or only a slower cruelty.",
        choices: [
            { text: "Risk one more question while he still permits it.", buttonText: "Ask One More Question", nextScene: "SCENE_ARCHIVES_AUDIENCE" },
            {
                text: "Take the warning and descend toward Hushbriar.",
                buttonText: "Descend to Hushbriar",
                effects: [
                    { type: "flag", flagId: "archives_thalion_audience_closed", value: true }
                ],
                nextScene: "SCENE_ARRIVAL_HUSHBRIAR"
            }
        ]
    },
    "SCENE_ARCHIVES_AFTERMATH": {
        id: "SCENE_ARCHIVES_AFTERMATH",
        location: "lament_hill",
        background: "landscapes/forbidden_archive.png",
        text: "Once you step away from the lectern, the Archives become colder and less welcoming, as though the place itself has agreed with Thalion that the richest truths have already been spent on you. The road back down the hill waits in storm-dark silence, with Hushbriar looming now not as rumor but as obligation.",
        choices: [
            { text: "Descend toward Hushbriar and the demigod lead", buttonText: "Descend to Hushbriar", nextScene: "SCENE_ARRIVAL_HUSHBRIAR" },
            { text: "Climb back toward Aine's hill and reconsider", buttonText: "Back to Aine's Hill", nextScene: "SCENE_LAMENT_HILL_APPROACH" }
        ]
    },
    "SCENE_HUSHBRIAR_DOCK": {
        id: "SCENE_HUSHBRIAR_DOCK",
        location: "hushbriar",
        background: "landscapes/aodhan_house.png",
        text: "Beneath the bridge, river rot mingles with lamp oil and damp hemp. A small rowboat knocks softly against the pilings, half-hidden behind stacked crates, boot-scuffs, and the kind of hurried drag marks panic leaves when it has to move something alive. One ledger lies open beneath a weighted stone, its wet pages curling as if someone had to abandon it faster than they liked.",
        choices: [
            { text: "Read the ledger before the river takes the ink", buttonText: "Read the Ledger", nextScene: "SCENE_HUSHBRIAR_LEDGER" },
            { text: "Wait in the dark and see who comes back for the boat", buttonText: "Wait by the Boat", nextScene: "SCENE_THIEVES_HIDEOUT" }
        ]
    },
    "SCENE_HUSHBRIAR_LEDGER": {
        id: "SCENE_HUSHBRIAR_LEDGER",
        location: "hushbriar",
        background: "landscapes/aodhan_house.png",
        text: "The handwriting is hurried, angry, and afraid. One line has been underlined so hard it nearly tears the page: 'Move our precious cargo, quickly. It's only a matter of time before that murderous bastard or the Blackened King's soldiers show up at our doorstep.' Whatever the guild is protecting, they fear Aodhan and Alderic's men in equal measure, and the word cargo has been forced hard enough to sound like blasphemy.",
        onEnter: {
            once: true,
            effects: [
                { type: "flag", flagId: "hushbriar_guild_ledger_found", value: true }
            ]
        },
        choices: [
            { text: "Follow the dock trail to whoever owns this ledger", buttonText: "Follow the Dock Trail", nextScene: "SCENE_THIEVES_HIDEOUT" },
            { text: "Back away and return to the square with the clue in hand", buttonText: "Back to the Square", nextScene: "SCENE_HUSHBRIAR_AFTERMATH_HUNT" }
        ]
    },
    "SCENE_THIEVES_HIDEOUT": {
        id: "SCENE_THIEVES_HIDEOUT",
        location: "hushbriar",
        background: "landscapes/aodhan_study.png",
        npcPortrait: "portraits/neala_portrait.png",
        text: "The dock trail ends at a low, screened chamber built into the underside of the bridge itself. Neala steps out first with her blade already bare, anger arriving a heartbeat before the rest of her. Liobhán follows in silence so controlled it feels practiced. Neither woman looks surprised to see you. 'You nose through our bridge, touch our ledger, and come walking deeper like you think that makes you brave,' Neala says. Liobhán's gaze moves from your hands to your throat and back again. 'It only makes your next sentence expensive,' she says quietly. 'Spend it well.'",
        choices: [
            {
                text: "Hold out the ledger and say you came before Aodhan did. (Persuasion)",
                buttonText: "Offer the Ledger (Persuasion)",
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
                buttonText: "Offer Silverthorn's Gold",
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
        location: "hushbriar",
        background: "landscapes/aodhan_study.png",
        npcPortrait: "portraits/neala_portrait.png",
        text: "Once they stop treating you like a body to dispose of, the truth comes in pieces and barbs. The cargo is not contraband at all but a person, and not merely a person: Elara, the prophesied demigod. Neala says the word like daring you to act shocked. The guild is not protecting her out of kindness. A demigod who lives because of them owes a debt no king, priest, or butcher can ignore. 'That's leverage,' Neala says bluntly. Liobhán's mouth hardly moves when she answers, 'That is survival with a shape ugly enough to be honest.'",
        choices: [
            { text: "\"Take me to her. The broken night already points straight here.\"", buttonText: "Take Me to Her", nextScene: "SCENE_ELARA_HIDEAWAY" },
            {
                text: "Show them the Stone and say the choice it demands cannot stay rumor any longer.",
                buttonText: "Show Them the Stone",
                requires: { itemId: "stone_of_oblivion" },
                nextScene: "SCENE_ELARA_HIDEAWAY"
            }
        ]
    },
    "SCENE_GUILD_REFUSAL": {
        id: "SCENE_GUILD_REFUSAL",
        location: "hushbriar",
        background: "landscapes/aodhan_study.png",
        npcPortrait: "portraits/liobhan_portrait.png",
        text: "Trust dies quickly in the hideout. Neala wants you thrown back to the river with your curiosity split open beside you. Liobhán wants to know whether your ignorance is real or merely badly performed. Then another shout rises out in town, followed by the crack of something magical striking timber hard enough to shake dust from the bridge overhead. Liobhán's eyes sharpen at once. 'Fine,' she says. 'You do not deserve the truth. But if Aodhan or the King's men are already tearing the lanes apart for her, we no longer have time to keep you ignorant.'",
        choices: [
            {
                text: "Go with them before the hunt above turns into a massacre.",
                buttonText: "Go with Them",
                nextScene: "SCENE_ELARA_HIDEAWAY"
            },
            { text: "Swear you came to keep Silverthorn's hands off her blood.", buttonText: "Swear for Elara", nextScene: "SCENE_ELARA_HIDEAWAY" }
        ]
    },
    "SCENE_ELARA_HIDEAWAY": {
        id: "SCENE_ELARA_HIDEAWAY",
        location: "hushbriar",
        background: "landscapes/aodhan_study.png",
        npcPortrait: "portraits/elara_portrait.png",
        displayPages: [
            "Elara is hidden in the innermost chamber behind stacked crates, damp blankets, and a ward circle drawn by hands too tired to trust their own lines. She looks younger than prophecy has any right to allow and far more exhausted by fear than any holy story would ever admit.",
            "Sleep has been losing to dread for days. When her eyes catch the mark you carry, her whole body tightens around a recognition she has been waiting her life to dread. She knows what relic was found. She knows why men will come for her blood. Shame and terror chase each other across her face as she speaks the truth she has never managed to live with: she is torn between dying for the world and running until someone crueller chooses for her."
        ],
        text: "Elara is hidden in the innermost chamber behind stacked crates, damp blankets, and a ward circle drawn by hands too tired to trust their own lines. She looks younger than prophecy has any right to allow and far more exhausted by fear than any holy story would ever admit. Sleep has been losing to dread for days. When her eyes catch the mark you carry, her whole body tightens around a recognition she has been waiting her life to dread. She knows what relic was found. She knows why men will come for her blood. Shame and terror chase each other across her face as she speaks the truth she has never managed to live with: she is torn between dying for the world and running until someone crueller chooses for her.",
        onEnter: {
            once: true,
            effects: [
                { type: "flag", flagId: "elara_met", value: true }
            ]
        },
        choices: [
            {
                text: "\"I have the Stone. Before the blood dries, we decide what it will cost.\"",
                buttonText: "Show Elara the Stone",
                requires: { itemId: "stone_of_oblivion" },
                nextScene: "SCENE_ELARA_COUNSEL"
            },
            {
                text: "\"Aodhan still carries the Stone. Tell me how close his hunt runs behind us.\"",
                buttonText: "Ask About Aodhan",
                requires: { notFlag: "aodhan_dead" },
                nextScene: "SCENE_ELARA_AODHAN_WARNING"
            }
        ]
    },
    "SCENE_ELARA_COUNSEL": {
        id: "SCENE_ELARA_COUNSEL",
        location: "hushbriar",
        background: "landscapes/aodhan_study.png",
        npcPortrait: "portraits/elara_portrait.png",
        text: "For one frail minute no one reaches for the choice itself. Neala turns away first and plants both hands on the nearest crate like the wood is the only thing in the room she trusts not to beg. Liobhán watches Elara instead, not with pity but with the flinty patience of someone forcing herself to count every cost before she names one aloud. Elara says nothing. Her breathing alone makes the room feel smaller. The Stone between you has already made the air sound like judgment.",
        choices: [
            {
                text: "Make them say the cost plainly before the room loses its nerve.",
                buttonText: "Make Them Name the Cost",
                nextScene: "SCENE_ELARA_STONE_DECISION"
            }
        ]
    },
    "SCENE_ELARA_STONE_DECISION": {
        id: "SCENE_ELARA_STONE_DECISION",
        location: "hushbriar",
        background: "landscapes/aodhan_study.png",
        npcPortrait: "portraits/elara_portrait.png",
        displayPages: [
            "The Stone of Oblivion feels heavier in the hideout than it ever did under the moon. Elara watches it the way condemned people watch an executioner testing the edge. Even Neala's anger has gone still around it.",
            "Liobhán looks from the Stone to Elara and back again, doing the arithmetic no decent person should ever have to say aloud. 'If there is a choice worth the name,' she says quietly, 'it lives here. Now. Before the blood dries and the world chooses for us.'"
        ],
        text: "The Stone of Oblivion feels heavier in the hideout than it ever did under the moon. Elara watches it the way condemned people watch an executioner testing the edge. Even Neala's anger has gone still around it. Liobhán looks from the Stone to Elara and back again, doing the arithmetic no decent person should ever have to say aloud. 'If there is a choice worth the name,' she says quietly, 'it lives here. Now. Before the blood dries and the world chooses for us.'",
        choices: [
            {
                text: "\"Your blood stays unspent. We keep you breathing and damn the cost for now.\"",
                buttonText: "Spare Elara",
                effects: [
                    { type: "flag", flagId: "elara_choice_spared", value: true },
                    { type: "relationship", npcId: "elara", amount: 15 },
                    { type: "reputation", factionId: "thorne_guild", amount: 10 }
                ],
                nextScene: "SCENE_HUSHBRIAR_PROCESSING_REVELATION"
            },
            {
                text: "\"If the Stone can only wake through your divinity, then say what saving the world would ask of you.\"",
                buttonText: "Ask the Cost of Sacrifice",
                effects: [
                    { type: "flag", flagId: "elara_choice_sacrifice_declared", value: true },
                    { type: "reputation", factionId: "thorne_guild", amount: -10 }
                ],
                nextScene: "SCENE_HUSHBRIAR_PROCESSING_REVELATION"
            }
        ]
    },
    "SCENE_ELARA_AODHAN_WARNING": {
        id: "SCENE_ELARA_AODHAN_WARNING",
        location: "hushbriar",
        background: "landscapes/aodhan_study.png",
        npcPortrait: "portraits/elara_portrait.png",
        text: "At Aodhan's name, every lantern in the hideout seems to shrink. Elara folds in on herself at once. Neala curses under her breath. Liobhán says nothing for a long time, then finally answers with the bleak clarity of someone who has no use left for false comfort. 'Then the Stone is still in motion, and the choice it forces is not ours tonight,' she says. 'That does not save her. It only means the blood and the bargain are both still hunting us.'",
        choices: [
            {
                text: "\"Then we keep her breathing until a real choice still belongs to us.\"",
                buttonText: "Keep Her Breathing",
                effects: [
                    { type: "flag", flagId: "elara_choice_deferred_by_aodhan", value: true },
                    { type: "flag", flagId: "elara_choice_spared", value: true },
                    { type: "relationship", npcId: "elara", amount: 10 }
                ],
                nextScene: "SCENE_HUSHBRIAR_PROCESSING_REVELATION"
            }
        ]
    },
    "SCENE_HUSHBRIAR_PROCESSING_REVELATION": {
        id: "SCENE_HUSHBRIAR_PROCESSING_REVELATION",
        location: "hushbriar",
        background: "landscapes/aodhan_study.png",
        npcPortrait: "portraits/elara_portrait.png",
        displayPages: [
            "The silence after the choice is worse than the argument before it. At last Liobhán breaks it. 'You think the King means to hold Hushbriar?' she asks. 'He means to empty it.'",
            "Neala answers this part like spitting poison. The strong and healthy are being marched toward Silverthorn for processing. The sick, the weak, and anyone too contaminated to be useful are being sent to the Soul Mill instead. Whatever mercy Hushbriar still hoped for has already been sorted into carts, columns, and smoke."
        ],
        text: "The silence after the choice is worse than the argument before it. At last Liobhán breaks it. 'You think the King means to hold Hushbriar?' she asks. 'He means to empty it.' Neala answers this part like spitting poison. The strong and healthy are being marched toward Silverthorn for processing. The sick, the weak, and anyone too contaminated to be useful are being sent to the Soul Mill instead. Whatever mercy Hushbriar still hoped for has already been sorted into carts, columns, and smoke.",
        onEnter: {
            once: true,
            questUpdate: { id: "investigate_whisperwood", stage: 10 },
            effects: [
                { type: "flag", flagId: "processing_truth_learned", value: true }
            ]
        },
        choices: [
            {
                text: "Carry the knowledge into the next dark.",
                buttonText: "Carry the Knowledge Forward",
                action: "showStartMenu"
            }
        ]
    }
};


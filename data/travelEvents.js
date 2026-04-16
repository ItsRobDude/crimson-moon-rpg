export const travelEvents = [
    {
        id: 'shadowmire_patrol_sweep',
        destinations: ['shadowmire'],
        text: 'Halfway through Shadowmire you find the dregs of a Silverthorn patrol: boot prints, horse dung gone cold, and a search line cut hard enough through the fern to prove they were hunting more than beasts.',
        type: 'skillCheck',
        skill: 'stealth',
        dc: 11,
        successText: 'You let the road go and slip through rain-heavy pine until the patrol signs pass behind you. In the mud they left, you also recover a dropped ration satchel.',
        failText: 'You avoid the patrol itself, but not its aftermath. The road stays tense for miles after, and every snapped twig sounds like a second search line catching up.',
        onSuccess: {
            effects: [
                { type: 'addItem', itemId: 'rations', quantity: 1, logText: 'You salvage a ration from the patrol trail.' },
                { type: 'threat', amount: -5, logText: 'Keeping low buys you a little breathing room on the road.' }
            ]
        },
        onFail: {
            effects: [
                { type: 'threat', amount: 5, logText: 'The near miss leaves the road a little louder around you.' }
            ]
        }
    },
    {
        id: 'shadowmire_spoiled_camp',
        destinations: ['shadowmire'],
        text: 'An old camp sags beside the road under mildew and black rain. Whoever fled did it with enough haste to leave a bedroll soaking in the mud and a torch bundle sealed in wax.',
        type: 'discovery',
        effects: [
            { type: 'addItem', itemId: 'bedroll', quantity: 1, logText: 'You recover a bedroll that can still be dried by a fire.' },
            { type: 'addItem', itemId: 'torch', quantity: 2, logText: 'The wax-sealed torches still burn true enough to keep.' }
        ]
    },
    {
        id: 'whisperwood_refugee_trace',
        destinations: ['whisperwood'],
        partyOnly: true,
        text: 'The road into Sporefall is littered with what the fleeing could not bear to keep carrying: a child\'s shoe, a prayer strip stiff with old blood, and the wheel-rut where someone dragged the weak until they no longer could.',
        type: 'discovery',
        effects: [
            { type: 'threat', amount: 5, logText: 'The ruin ahead feels closer after walking through the refugee trail.' }
        ]
    },
    {
        id: 'whisperwood_fungal_lunge',
        destinations: ['whisperwood'],
        minThreat: 5,
        text: 'Something fungus-swollen tears free of a hedgerow at the edge of the borough, moving with the blind speed of hunger that has forgotten pain.',
        type: 'combat',
        enemyId: 'fungal_beast'
    },
    {
        id: 'archives_black_road_dead',
        destinations: ['lament_hill', 'durnhelm', 'solasmor'],
        requiresFlag: ['lament_hill_thread'],
        text: 'The road down from Lament Hill is not empty. It is merely finished with the living. A wagon lies split beside the ditch, its oxen carved open and left for the crows, while the travelers who owned it have already been taken elsewhere by whatever needed them more.',
        type: 'skillCheck',
        skill: 'investigation',
        dc: 12,
        successText: 'You search the wreck without lingering too long and find a wrapped torch bundle, a little dry food, and proof that armed riders passed here after the killing.',
        failText: 'The longer you stay among the dead, the less the road feels willing to forget you.',
        onSuccess: {
            effects: [
                { type: 'addItem', itemId: 'torch', quantity: 1, logText: 'You take an unbroken torch from the shattered cart.' },
                { type: 'addItem', itemId: 'rations', quantity: 1, logText: 'You recover food the crows had not yet opened.' }
            ]
        },
        onFail: {
            effects: [
                { type: 'threat', amount: 5, logText: 'Lingering over the bodies leaves you easier to track.' }
            ]
        }
    },
    {
        id: 'hushbriar_search_party',
        destinations: ['hushbriar', 'thieves_hideout'],
        text: 'Well before Hushbriar comes into view, you find the latest proof that the roads are being hunted: boot prints fanning out from a dead fire, a snapped spearshaft, and interrogation blood darkening the grass beside a milestone.',
        type: 'skillCheck',
        skill: 'survival',
        dc: 13,
        successText: 'You read the sign fast enough to cut away from the search lane and let the patrol pass without ever seeing the whites of their eyes.',
        failText: 'You avoid the patrol, but only after losing time and leaving enough sign behind to trouble you later.',
        onSuccess: {
            effects: [
                { type: 'threat', amount: -5, logText: 'You leave the search lane before it closes around you.' }
            ]
        },
        onFail: {
            effects: [
                { type: 'threat', amount: 10, logText: 'The road remembers the noise you made avoiding the patrol.' }
            ]
        }
    },
    {
        id: 'hushbriar_burned_shelter',
        destinations: ['hushbriar', 'thieves_hideout'],
        text: 'A shelter of driftwood and sailcloth has been burned down to wet black ribs. In the ash you find prayer beads fused to glass and the stink of medicine boiled far past usefulness.',
        type: 'discovery',
        effects: [
            { type: 'addGold', amount: 6, logText: 'You recover a few coins that melted together in the ash and can still be broken apart.' }
        ]
    },
    {
        id: 'elara_route_guild_marks',
        destinations: ['hushbriar', 'thieves_hideout', 'solasmor', 'soul_mill'],
        requiresFlag: ['elara_route_protect'],
        text: 'Thorne Guild chalk marks start appearing where only smugglers or mourners would ever think to look: under culverts, inside shrine niches, and on the blind side of abandoned ferries. Someone is moving Elara\'s route ahead of you even when you cannot see them.',
        type: 'discovery',
        effects: [
            { type: 'threat', amount: -5, logText: 'The guild\'s hidden signs shave some danger off the road ahead.' }
        ]
    },
    {
        id: 'stone_hunters_on_the_road',
        destinations: ['hushbriar', 'thieves_hideout', 'soul_mill'],
        requiresFlag: ['elara_route_stone_hunt_declared'],
        text: 'The black roads are busier now. Not with refugees, but with the sort of armed quiet that means word of a relic has spread faster than mercy.',
        type: 'combat',
        enemyId: 'silverthorn_guard'
    }
];

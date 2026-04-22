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
        id: 'shadowmire_rot_bloom',
        destinations: ['shadowmire'],
        text: 'A whole stand of ferns has collapsed into a wet ring of black growth beside the track, as if something breathed on the roadside and every green thing there gave up at once. The smell underneath it is not swamp rot but opened flesh left out in rain.',
        type: 'discovery',
        effects: [
            { type: 'threat', amount: 5, logText: 'The road feels narrower after passing the blighted ring.' }
        ]
    },
    {
        id: 'shadowmire_ditch_wolves',
        destinations: ['shadowmire'],
        minThreat: 4,
        text: 'Low movement paces you from the ditch line until two hunger-thin wolves finally break cover, bold enough to test whether the road is already done teaching you fear.',
        type: 'combat',
        enemyId: 'wolf'
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
        id: 'whisperwood_sickroom_threshold',
        destinations: ['whisperwood'],
        text: 'At the lip of Sporefall you pass a house someone tried to turn into a sickroom. Cots have been dragged out beneath the eaves, bowls of ash sit under each bed, and the door is tied shut from the outside as if mercy ran out before duty did.',
        type: 'skillCheck',
        skill: 'medicine',
        dc: 12,
        successText: 'You read the little rites and the stained cloth for what they are: desperate attempts to slow a fever nobody understood. The care in it hurts, but it also sharpens the shape of how fast the borough broke.',
        failText: 'You linger too long trying to sort mercy from panic and leave with the stink of the place still caught in your throat.',
        onSuccess: {
            effects: [
                { type: 'threat', amount: -5, logText: 'The sickroom traces give you a clearer read on how Sporefall fell apart.' }
            ]
        },
        onFail: {
            effects: [
                { type: 'threat', amount: 5, logText: 'The sickroom threshold leaves the road heavier on your nerves.' }
            ]
        }
    },
    {
        id: 'whisperwood_lark_birdsign',
        destinations: ['whisperwood'],
        requiresCompanion: 'lark',
        text: 'Lark stops without warning beneath a line of gutted nest-boxes nailed to a parish fence. He says the birds left before the people did, then kneels to show you where claw-scatter, feather-ash, and spore dust turned the warning into something almost readable.',
        type: 'discovery',
        effects: [
            { type: 'threat', amount: -5, logText: 'Lark reads enough of the ruined birdsign to keep the party from walking blind into the borough.' }
        ]
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
        destinations: ['hushbriar'],
        text: 'Well before Hushbriar comes into view, you find the latest proof that the roads are being hunted: boot prints fanning out from a dead fire, a snapped spearshaft, interrogation blood darkening the grass beside a milestone, and the armed quiet that only comes when men mean to take prisoners rather than corpses.',
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
        destinations: ['hushbriar'],
        text: 'A shelter of driftwood and sailcloth has been burned down to wet black ribs. In the ash you find prayer beads fused to glass, the stink of medicine boiled far past usefulness, and enough dock rope to suggest the dead here were judged smugglers or mourners by whichever search party struck the match.',
        type: 'discovery',
        effects: [
            { type: 'addGold', amount: 6, logText: 'You recover a few coins that melted together in the ash and can still be broken apart.' }
        ]
    },
    {
        id: 'hushbriar_quayside_dead',
        destinations: ['hushbriar'],
        minThreat: 7,
        text: 'Near the coast road you find two dockhands tied to a milestone with militia cord and left for the dark, both of them dead of beatings rather than plague. Someone wanted the next travelers to understand what questions cost here.',
        type: 'discovery',
        effects: [
            { type: 'threat', amount: 5, logText: 'The coast makes its warning plain before Hushbriar is even in sight.' }
        ]
    },
    {
        id: 'hushbriar_kieran_mercy',
        destinations: ['hushbriar'],
        requiresCompanion: 'kieran_brogan',
        text: 'Kieran drops to one knee beside a roadside corpse wrapped in sailcloth and says the sort of prayer Ilmater gets when the law has already finished being ashamed of itself. When he rises, he only mutters that someone needs to remember these people as mourned before the town learns to count them as necessary.',
        type: 'discovery',
        effects: [
            { type: 'threat', amount: -5, logText: 'Kieran\'s roadside prayer steadies the party against the coast\'s cruelty.' }
        ]
    },
];

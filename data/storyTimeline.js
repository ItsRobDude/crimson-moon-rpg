import { SCENE_FALLBACK_MODES } from './narrativeSafety.js';

export const CANONICAL_START_SCENE = 'SCENE_BRIEFING';

export const STORY_EVENT_STATUS = {
    LOCKED: 'locked',
    AVAILABLE: 'available',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    MISSED: 'missed'
};

export const storyActs = [
    {
        id: 'act_1_briefing_and_departure',
        title: 'Act I - Briefing and Departure',
        summary: 'Character creation ends in Silverthorn, where Alderic sends the party toward Whisperwood.'
    },
    {
        id: 'act_2_sporefall_revelations',
        title: 'Act II - Sporefall Revelations',
        summary: 'Whisperwood falls into Sporefall, Eoin reveals the cost of the disaster, and the party traces Aodhan.'
    },
    {
        id: 'act_3_shattered_routes',
        title: 'Act III - Shattered Routes',
        summary: 'Sporefall clues push the party north into Durnhelm, where Aodhan\'s trail and the relic\'s cost become clearer.'
    },
    {
        id: 'act_4_lament_hill_truth',
        title: 'Act IV - Lament Hill Truth',
        summary: 'Aine and the Forbidden Archives reveal the mark, the Stone of Oblivion, and the danger pressing toward Hushbriar.'
    },
    {
        id: 'act_5_hushbriar_endgame',
        title: 'Act V - Hushbriar Endgame',
        summary: 'Hushbriar, Moonwell, and the demigod pressure become the late Part I sandbox once the draft route reaches the coast.'
    }
];

export const storyEvents = {
    alderic_briefing: {
        id: 'alderic_briefing',
        actId: 'act_1_briefing_and_departure',
        title: 'Alderic Briefing',
        summary: 'The canonical opening: character creation ends in Alderic\'s chamber in Silverthorn.'
    },
    silverthorn_departure: {
        id: 'silverthorn_departure',
        actId: 'act_1_briefing_and_departure',
        title: 'Leave Silverthorn',
        summary: 'The party chooses to leave the city and begin the road into Shadowmire.'
    },
    sporefall_arrival: {
        id: 'sporefall_arrival',
        actId: 'act_2_sporefall_revelations',
        title: 'Arrival in Sporefall',
        summary: 'The Whisperwood mission turns into a survival scene when the party wakes beneath the crimson moon.'
    },
    eoin_thread: {
        id: 'eoin_thread',
        actId: 'act_2_sporefall_revelations',
        title: 'Find Eoin',
        summary: 'Eoin becomes the first strong witness to what happened in Whisperwood.'
    },
    sporefall_investigation: {
        id: 'sporefall_investigation',
        actId: 'act_2_sporefall_revelations',
        title: 'Survey Sporefall',
        summary: 'After finding Eoin, the party begins investigating Sporefall through its cathedral quarter, overseer\'s row, and northern streets.'
    },
    aodhan_thread: {
        id: 'aodhan_thread',
        actId: 'act_3_shattered_routes',
        title: 'Trace Aodhan',
        summary: 'Sporefall clues, Durnhelm, and Hushbriar all advance the hunt for Aodhan and the Stone of Oblivion.'
    },
    durnhelm_thread: {
        id: 'durnhelm_thread',
        actId: 'act_3_shattered_routes',
        title: 'Durnhelm Lead',
        summary: 'The dwarven route confirms the Stone of Oblivion, Durnhelm\'s fall, and the road that leads on toward Lament Hill.'
    },
    lament_hill_thread: {
        id: 'lament_hill_thread',
        actId: 'act_4_lament_hill_truth',
        title: 'Lament Hill Lead',
        summary: 'Aine and the hilltop cottage reveal the mark, the cost of the stone, and the next branching leads.'
    },
    archives_truth: {
        id: 'archives_truth',
        actId: 'act_4_lament_hill_truth',
        title: 'Forbidden Archives Truth',
        summary: 'The archives confirm how the Stone of Oblivion works and expose Alderic\'s alliance with Ciara.'
    },
    hushbriar_demigod_thread: {
        id: 'hushbriar_demigod_thread',
        actId: 'act_5_hushbriar_endgame',
        title: 'Hushbriar Demigod Hunt',
        summary: 'The late Hushbriar route centers on the occupied town, Moonwell, and the demigod pressure opened by Aine\'s warning.'
    }
};

export const locationStoryRequirements = {
    silverthorn: null,
    shadowmire: { id: 'silverthorn_departure', oneOf: [STORY_EVENT_STATUS.AVAILABLE, STORY_EVENT_STATUS.ACTIVE, STORY_EVENT_STATUS.COMPLETED] },
    whisperwood: { id: 'sporefall_arrival', oneOf: [STORY_EVENT_STATUS.AVAILABLE, STORY_EVENT_STATUS.ACTIVE, STORY_EVENT_STATUS.COMPLETED] },
    durnhelm: { id: 'durnhelm_thread', oneOf: [STORY_EVENT_STATUS.AVAILABLE, STORY_EVENT_STATUS.ACTIVE, STORY_EVENT_STATUS.COMPLETED] },
    lament_hill: { id: 'lament_hill_thread', oneOf: [STORY_EVENT_STATUS.AVAILABLE, STORY_EVENT_STATUS.ACTIVE, STORY_EVENT_STATUS.COMPLETED] },
    hushbriar: { id: 'hushbriar_demigod_thread', oneOf: [STORY_EVENT_STATUS.AVAILABLE, STORY_EVENT_STATUS.ACTIVE, STORY_EVENT_STATUS.COMPLETED] },
    thieves_hideout: { id: 'hushbriar_demigod_thread', oneOf: [STORY_EVENT_STATUS.AVAILABLE, STORY_EVENT_STATUS.ACTIVE, STORY_EVENT_STATUS.COMPLETED] },
    soul_mill: { id: 'hushbriar_demigod_thread', oneOf: [STORY_EVENT_STATUS.AVAILABLE, STORY_EVENT_STATUS.ACTIVE, STORY_EVENT_STATUS.COMPLETED] },
    solasmor: { id: 'hushbriar_demigod_thread', oneOf: [STORY_EVENT_STATUS.AVAILABLE, STORY_EVENT_STATUS.ACTIVE, STORY_EVENT_STATUS.COMPLETED] }
};

export const locationUnlockHints = {
    shadowmire: 'Leave Silverthorn after Alderic briefs you.',
    whisperwood: 'Push the Whisperwood investigation past the road into Sporefall.',
    durnhelm: 'Push the Sporefall investigation far enough to confirm Aodhan as the next lead.',
    lament_hill: 'Finish Cathal\'s Durnhelm lead to open the witch on Lament Hill.',
    hushbriar: 'Advance Lament Hill until Aine opens the Hushbriar demigod lead.',
    thieves_hideout: 'This route is retired until it is rewritten to fit the draft-first Hushbriar order.',
    soul_mill: 'This route is dormant until it is rewritten into a draft-aligned late Hushbriar branch.',
    solasmor: 'This route is dormant until it is rewritten into a draft-aligned late Hushbriar branch.'
};

export const storySceneTriggers = {
    SCENE_BRIEFING: {
        activate: ['alderic_briefing'],
        actId: 'act_1_briefing_and_departure'
    },
    SCENE_BRIEFING_2: {
        activate: ['alderic_briefing'],
        actId: 'act_1_briefing_and_departure'
    },
    SCENE_BRIEFING_INFO: {
        activate: ['alderic_briefing'],
        actId: 'act_1_briefing_and_departure'
    },
    SCENE_HUB_SILVERTHORN: {
        complete: ['alderic_briefing'],
        unlock: ['silverthorn_departure'],
        actId: 'act_1_briefing_and_departure'
    },
    SCENE_SILVERTHORN_MARKET: {
        complete: ['alderic_briefing'],
        unlock: ['silverthorn_departure'],
        actId: 'act_1_briefing_and_departure'
    },
    SCENE_SHADOWMIRE_ROAD: {
        activate: ['silverthorn_departure'],
        complete: ['silverthorn_departure'],
        unlock: ['sporefall_arrival'],
        advance: { travel: 1 },
        actId: 'act_2_sporefall_revelations'
    },
    SCENE_TRAVEL_SHADOWMIRE: {
        activate: ['silverthorn_departure'],
        complete: ['silverthorn_departure'],
        unlock: ['sporefall_arrival'],
        advance: { travel: 1 },
        actId: 'act_2_sporefall_revelations'
    },
    SCENE_SPOREFALL_WAKE: {
        activate: ['sporefall_arrival'],
        actId: 'act_2_sporefall_revelations'
    },
    SCENE_ARRIVAL_WHISPERWOOD: {
        complete: ['sporefall_arrival'],
        actId: 'act_2_sporefall_revelations'
    },
    SCENE_MEET_EOIN: {
        activate: ['eoin_thread'],
        actId: 'act_2_sporefall_revelations'
    },
    SCENE_EOIN_TALK: {
        complete: ['eoin_thread'],
        unlock: ['sporefall_investigation'],
        actId: 'act_2_sporefall_revelations'
    },
    SCENE_ALONE_AGAIN: {
        activate: ['eoin_thread'],
        actId: 'act_2_sporefall_revelations'
    },
    SCENE_HUB_SPOREFALL: {
        activate: ['sporefall_investigation'],
        actId: 'act_2_sporefall_revelations'
    },
    SCENE_SPOREFALL_CATHEDRAL_VISION: {
        complete: ['sporefall_investigation'],
        unlock: ['aodhan_thread', 'durnhelm_thread'],
        actId: 'act_3_shattered_routes'
    },
    SCENE_SPOREFALL_OVERSEER_JOURNAL: {
        complete: ['sporefall_investigation'],
        unlock: ['aodhan_thread', 'durnhelm_thread'],
        actId: 'act_3_shattered_routes'
    },
    SCENE_SPOREFALL_OVERSEER_CORRESPONDENCE: {
        complete: ['sporefall_investigation'],
        unlock: ['aodhan_thread', 'durnhelm_thread'],
        actId: 'act_3_shattered_routes'
    },
    SCENE_SPOREFALL_NORTH_ROUTE_DISCOVERED: {
        complete: ['sporefall_investigation'],
        unlock: ['aodhan_thread', 'durnhelm_thread'],
        actId: 'act_3_shattered_routes'
    },
    SCENE_AODHAN_TALK: {
        complete: ['aodhan_thread'],
        actId: 'act_5_hushbriar_endgame'
    },
    SCENE_AODHAN_DEFEAT: {
        complete: ['aodhan_thread'],
        actId: 'act_5_hushbriar_endgame'
    },
    SCENE_AFTERMATH: {
        complete: ['aodhan_thread'],
        actId: 'act_5_hushbriar_endgame'
    },
    SCENE_DURNHELM_GATES: {
        activate: ['durnhelm_thread'],
        actId: 'act_3_shattered_routes'
    },
    SCENE_DURNHELM_ENTRY: {
        activate: ['durnhelm_thread'],
        actId: 'act_3_shattered_routes'
    },
    SCENE_DURNHELM_CATHAL: {
        complete: ['durnhelm_thread'],
        unlock: ['lament_hill_thread'],
        actId: 'act_3_shattered_routes'
    },
    SCENE_LAMENT_HILL_APPROACH: {
        activate: ['lament_hill_thread'],
        actId: 'act_4_lament_hill_truth'
    },
    SCENE_LAMENT_COTTAGE: {
        activate: ['lament_hill_thread'],
        actId: 'act_4_lament_hill_truth'
    },
    SCENE_LAMENT_GRAVES: {
        activate: ['lament_hill_thread'],
        actId: 'act_4_lament_hill_truth'
    },
    SCENE_LAMENT_AINE_REVEAL: {
        complete: ['lament_hill_thread'],
        unlock: ['archives_truth', 'hushbriar_demigod_thread'],
        actId: 'act_4_lament_hill_truth'
    },
    SCENE_ARCHIVES_APPROACH: {
        activate: ['archives_truth'],
        actId: 'act_4_lament_hill_truth'
    },
    SCENE_ARCHIVES_TRUTH_CHAMBER: {
        complete: ['archives_truth'],
        actId: 'act_4_lament_hill_truth'
    },
    SCENE_ARRIVAL_HUSHBRIAR: {
        activate: ['hushbriar_demigod_thread'],
        actId: 'act_5_hushbriar_endgame'
    },
    SCENE_HUSHBRIAR_TOWN: {
        activate: ['hushbriar_demigod_thread'],
        actId: 'act_5_hushbriar_endgame'
    },
    SCENE_BRIARWOOD_INN: {
        activate: ['hushbriar_demigod_thread'],
        actId: 'act_5_hushbriar_endgame'
    },
    SCENE_FIONNLAGH_HUB: {
        activate: ['hushbriar_demigod_thread'],
        actId: 'act_5_hushbriar_endgame'
    },
    SCENE_HUSHBRIAR_SCREAMS: {
        activate: ['hushbriar_demigod_thread'],
        actId: 'act_5_hushbriar_endgame'
    },
    SCENE_INVESTIGATION: {
        activate: ['hushbriar_demigod_thread'],
        actId: 'act_5_hushbriar_endgame'
    },
    SCENE_TRACKING_CHOLDRITHS: {
        activate: ['hushbriar_demigod_thread'],
        actId: 'act_5_hushbriar_endgame'
    },
    SCENE_HUSHBRIAR_MORNING_SETUP: {
        activate: ['hushbriar_demigod_thread'],
        actId: 'act_5_hushbriar_endgame'
    },
    SCENE_MOONWELL: {
        activate: ['hushbriar_demigod_thread'],
        actId: 'act_5_hushbriar_endgame'
    },
    SCENE_HUSHBRIAR_GUILD_ROAD: {
        activate: ['hushbriar_demigod_thread'],
        actId: 'act_5_hushbriar_endgame'
    },
    SCENE_SOUL_MILL_APPROACH: {
        activate: ['hushbriar_demigod_thread'],
        actId: 'act_5_hushbriar_endgame'
    },
    SCENE_THIEVES_HIDEOUT: {
        activate: ['hushbriar_demigod_thread'],
        actId: 'act_5_hushbriar_endgame'
    },
    SCENE_ELARA_HIDEAWAY: {
        activate: ['hushbriar_demigod_thread'],
        actId: 'act_5_hushbriar_endgame'
    },
    SCENE_SOLASMOR_APPROACH: {
        activate: ['hushbriar_demigod_thread'],
        actId: 'act_5_hushbriar_endgame'
    }
};

export const sceneSafetyPolicies = {
    SCENE_HUB_SILVERTHORN: {
        thread: 'silverthorn_prep',
        prerequisites: {
            storyEvents: ['alderic_briefing']
        },
        fallbackMode: SCENE_FALLBACK_MODES.DEGRADE,
        ifReachedTooEarly: 'Keep the player in Silverthorn-facing prep content and never skip directly past Alderic.',
        ifPartiallyInformed: 'Allow rumor, prep, and civic-pressure surfaces without escalating into hidden ritual truth.',
        onRevisit: 'Vary by time, scene memory, and one-time prep rewards without removing the city-center next step.',
        neverReveal: ['ciara', 'underdark', 'portal', 'liam', 'stasis']
    },
    SCENE_RUSTY_BLADE_RUMORS: {
        thread: 'silverthorn_prep',
        prerequisites: {
            storyEvents: ['alderic_briefing']
        },
        fallbackMode: SCENE_FALLBACK_MODES.SHOW_RUMOR_ONLY_VERSION,
        ifReachedTooEarly: 'Keep rumors at the level of relic anxiety, vanished Whisperwood, and fear of the eastern road.',
        ifPartiallyInformed: 'Let repeat visits sharpen the room’s dread without confirming hidden causes.',
        onRevisit: 'Use harsher repeat text, not new spoiler exposition.',
        neverReveal: ['ciara', 'underdark', 'portal', 'liam', 'stasis']
    },
    SCENE_SILVERTHORN_NOTICE_WHISPERWOOD: {
        thread: 'silverthorn_prep',
        prerequisites: {
            storyEvents: ['alderic_briefing']
        },
        fallbackMode: SCENE_FALLBACK_MODES.SHOW_RUMOR_ONLY_VERSION,
        ifReachedTooEarly: 'Present civic panic and disappearance language, not the hidden cause.',
        ifPartiallyInformed: 'Allow language about the borough being taken or unreachable, never the buried truth behind it.',
        onRevisit: 'Remain a clue surface rather than a reward surface.',
        neverReveal: ['ciara', 'underdark', 'portal', 'liam', 'stasis']
    },
    SCENE_SILVERTHORN_GATE_CAPTAIN: {
        thread: 'silverthorn_prep',
        prerequisites: {
            storyEvents: ['silverthorn_departure']
        },
        fallbackMode: SCENE_FALLBACK_MODES.DEGRADE,
        ifReachedTooEarly: 'Keep the captain in road-warning and route-mark mode rather than letting him reveal hidden knowledge.',
        ifPartiallyInformed: 'He may react to rumors, patrol losses, and relic tension, but not the hidden ritual truth.',
        onRevisit: 'Reinforce route knowledge and patrol fatigue without duplicating the route-study reward.',
        neverReveal: ['ciara', 'underdark', 'portal', 'liam', 'stasis']
    },
    SCENE_TRAVEL_SHADOWMIRE: {
        thread: 'shadowmire_blackout',
        prerequisites: {
            storyEvents: ['silverthorn_departure']
        },
        fallbackMode: SCENE_FALLBACK_MODES.REDIRECT,
        ifReachedTooEarly: 'Players who have not left Silverthorn should be redirected back into the canonical departure flow.',
        ifPartiallyInformed: 'Keep the route healthy at first, then let dread rise through haze and omens before blackout.',
        onRevisit: 'Treat this as a committed transition rather than a repeatable free-roam branch.',
        neverReveal: ['ciara', 'underdark', 'portal', 'liam', 'stasis']
    },
    SCENE_SPOREFALL_WAKE: {
        thread: 'sporefall_arrival',
        prerequisites: {
            storyEvents: ['sporefall_arrival']
        },
        fallbackMode: SCENE_FALLBACK_MODES.DELAY,
        ifReachedTooEarly: 'Do not expose broad free-roam; use the wake-up shock to narrow the route into first-contact survival.',
        ifPartiallyInformed: 'Let the borough read as Sporefall in the present while older names remain in memory-facing surfaces only.',
        onRevisit: 'This should not be replayed as a lootable or repeatable scene.',
        neverReveal: ['ciara', 'underdark', 'portal', 'liam', 'stasis']
    },
    SCENE_ARRIVAL_WHISPERWOOD: {
        thread: 'sporefall_arrival',
        prerequisites: {
            storyEvents: ['sporefall_arrival']
        },
        fallbackMode: SCENE_FALLBACK_MODES.DELAY,
        ifReachedTooEarly: 'The first major survivor contact should remain close and immediate, not be skipped into broad wandering.',
        ifPartiallyInformed: 'Failure may delay Eoin by one nearby step, but should not let the player miss him entirely.',
        onRevisit: 'After Eoin is met, degrade into directional hub access instead of replaying first-arrival beats.',
        neverReveal: ['ciara', 'underdark', 'portal', 'liam', 'stasis']
    },
    SCENE_MEET_EOIN: {
        thread: 'eoin_thread',
        prerequisites: {
            storyEvents: ['sporefall_arrival']
        },
        fallbackMode: SCENE_FALLBACK_MODES.DELAY,
        ifReachedTooEarly: 'Let the player circle once, then route back into Eoin rather than losing the thread.',
        ifPartiallyInformed: 'Eoin should feel frightened and incomplete, not suddenly omniscient.',
        onRevisit: 'Keep him as an anchor and survivor surface, not a repeatable clue fountain.',
        neverReveal: ['ciara', 'underdark', 'portal', 'liam', 'stasis']
    },
    SCENE_EOIN_TALK: {
        thread: 'eoin_thread',
        prerequisites: {
            storyEvents: ['eoin_thread']
        },
        fallbackMode: SCENE_FALLBACK_MODES.DEGRADE,
        ifReachedTooEarly: 'If the player knows less, Eoin should speak in fragments and local grief rather than hidden truth.',
        ifPartiallyInformed: 'Bridge and cathedral clues may sharpen his responses without making him explain the ritual.',
        onRevisit: 'Preserve his emotional state while acknowledging discovered clues and aid already given.',
        neverReveal: ['ciara', 'underdark', 'portal', 'liam', 'stasis']
    },
    SCENE_EOIN_MOTHER_TALK: {
        thread: 'north_bridge',
        prerequisites: {
            storyEvents: ['eoin_thread']
        },
        fallbackMode: SCENE_FALLBACK_MODES.DEGRADE,
        ifReachedTooEarly: 'Before the bridge body is found, this should stay in grief, absence, and uncertainty.',
        ifPartiallyInformed: 'After the bridge is seen but before the body is found, keep the scene suggestive rather than confirmatory.',
        onRevisit: 'Once the body is found, let the dialogue confirm loss without expanding into hidden ritual explanation.',
        neverReveal: ['ciara', 'underdark', 'portal', 'liam', 'stasis']
    },
    SCENE_HUB_SPOREFALL: {
        thread: 'sporefall_investigation',
        prerequisites: {
            storyEvents: ['sporefall_investigation']
        },
        fallbackMode: SCENE_FALLBACK_MODES.DEGRADE,
        ifReachedTooEarly: 'Keep the first borough sandbox small and directional rather than broad and unguided.',
        ifPartiallyInformed: 'Surface only the routes supported by current clues, flags, and one-time discoveries.',
        onRevisit: 'Use found-clue memory to shorten text while preserving west/east/north meaningfully.',
        neverReveal: ['ciara', 'underdark', 'portal', 'liam', 'stasis']
    },
    SCENE_SPOREFALL_CATHEDRAL_APPROACH: {
        thread: 'sporefall_investigation',
        prerequisites: {
            storyEvents: ['sporefall_investigation']
        },
        fallbackMode: SCENE_FALLBACK_MODES.HIDE_CHOICE,
        ifReachedTooEarly: 'Let the area feel foreboding, but do not expose late clue surfaces until the investigation thread is live.',
        ifPartiallyInformed: 'Allow masonry and bag clues to layer in without confirming the hidden ritual truth.',
        onRevisit: 'Do not re-award the courier bag clue after it has been taken.',
        neverReveal: ['ciara', 'underdark', 'portal', 'liam', 'stasis']
    },
    SCENE_SPOREFALL_OVERSEER_JOURNAL: {
        thread: 'aodhan_thread',
        prerequisites: {
            storyEvents: ['sporefall_investigation']
        },
        fallbackMode: SCENE_FALLBACK_MODES.HIDE_CHOICE,
        ifReachedTooEarly: 'The overseer-house clue sequence should wait behind its trap and investigation beats.',
        ifPartiallyInformed: 'Let the documents imply desperation and collapse without dumping the hidden mechanism outright.',
        onRevisit: 'Do not re-award the journal once found.',
        neverReveal: ['ciara', 'underdark', 'portal', 'liam', 'stasis']
    },
    SCENE_SPOREFALL_OVERSEER_CORRESPONDENCE: {
        thread: 'aodhan_thread',
        prerequisites: {
            storyEvents: ['sporefall_investigation']
        },
        fallbackMode: SCENE_FALLBACK_MODES.HIDE_CHOICE,
        ifReachedTooEarly: 'Keep this behind the normal investigation sequence.',
        ifPartiallyInformed: 'Allow correspondence to sharpen suspicion without resolving it.',
        onRevisit: 'Do not re-award the correspondence clue once found.',
        neverReveal: ['ciara', 'underdark', 'portal', 'liam', 'stasis']
    },
    SCENE_SPOREFALL_NORTH_APPROACH: {
        thread: 'north_skip_route',
        prerequisites: {
            storyEvents: ['sporefall_investigation']
        },
        fallbackMode: SCENE_FALLBACK_MODES.DEGRADE,
        ifReachedTooEarly: 'Keep the north viable but clue-light, not a sequence breaker.',
        ifPartiallyInformed: 'Allow stonework reading, bridge checking, and route-opening without spoiling the cathedral truth.',
        onRevisit: 'Preserve the route as a hard bargain between speed and certainty.',
        neverReveal: ['ciara', 'underdark', 'portal', 'liam', 'stasis']
    },
    SCENE_SPOREFALL_NORTH_BRIDGE: {
        thread: 'north_bridge',
        prerequisites: {
            storyEvents: ['sporefall_investigation']
        },
        fallbackMode: SCENE_FALLBACK_MODES.DEGRADE,
        ifReachedTooEarly: 'The bridge should read as survival traces and unease before it becomes explicit grief.',
        ifPartiallyInformed: 'Allow shelter-reading and environmental dread before the body is confirmed.',
        onRevisit: 'Once the body is found, degrade into aftermath rather than re-running the discovery beat.',
        neverReveal: ['ciara', 'underdark', 'portal', 'liam', 'stasis']
    },
    SCENE_SPOREFALL_NORTH_ROUTE_DISCOVERED: {
        thread: 'north_skip_route',
        prerequisites: {
            storyEvents: ['sporefall_investigation']
        },
        fallbackMode: SCENE_FALLBACK_MODES.DEGRADE,
        ifReachedTooEarly: 'The skip route may stay viable, but should not collapse the larger clue structure.',
        ifPartiallyInformed: 'Treat it as a speed-over-certainty branch rather than a hidden-truth shortcut.',
        onRevisit: 'Keep the route open without repeating its discovery reward.',
        neverReveal: ['ciara', 'underdark', 'portal', 'liam', 'stasis']
    },
    SCENE_ARRIVAL_HUSHBRIAR: {
        thread: 'hushbriar_demigod_thread',
        prerequisites: {
            storyEvents: ['hushbriar_demigod_thread']
        },
        fallbackMode: SCENE_FALLBACK_MODES.REDIRECT,
        ifReachedTooEarly: 'Keep Hushbriar closed until the draft route opens it through Aine or the Archives.',
        ifPartiallyInformed: 'Use occupation pressure, guard suspicion, and civic dread before Moonwell or guild stakes surface.',
        onRevisit: 'Treat first arrival as a committed late-route handoff rather than a reusable travel beat.',
        neverReveal: ['ciara', 'underdark', 'portal', 'liam', 'stasis']
    },
    SCENE_HUSHBRIAR_TOWN: {
        thread: 'hushbriar_demigod_thread',
        prerequisites: {
            storyEvents: ['hushbriar_demigod_thread']
        },
        fallbackMode: SCENE_FALLBACK_MODES.DEGRADE,
        ifReachedTooEarly: 'Do not surface Hushbriar before the Lament Hill truth opens the demigod route.',
        ifPartiallyInformed: 'Keep the town focused on occupation, fear, and the pressure leading toward Fionnlagh and Moonwell.',
        onRevisit: 'Maintain town pressure without replacing the Moonwell hinge with guild-first detours.',
        neverReveal: ['ciara', 'underdark', 'portal', 'liam', 'stasis']
    },
    SCENE_BRIARWOOD_INN: {
        thread: 'hushbriar_demigod_thread',
        prerequisites: {
            storyEvents: ['hushbriar_demigod_thread']
        },
        fallbackMode: SCENE_FALLBACK_MODES.DEGRADE,
        ifReachedTooEarly: 'Keep the inn unavailable until Hushbriar itself is legitimately open.',
        ifPartiallyInformed: 'Center refugees, pilgrim fear, Fionnlagh, and the missable Moonwell night pressure.',
        onRevisit: 'Revisit text may adapt, but the inn should not become a generic services node.',
        neverReveal: ['ciara', 'underdark', 'portal', 'liam', 'stasis']
    },
    SCENE_HUSHBRIAR_SCREAMS: {
        thread: 'hushbriar_demigod_thread',
        prerequisites: {
            storyEvents: ['hushbriar_demigod_thread']
        },
        fallbackMode: SCENE_FALLBACK_MODES.DELAY,
        ifReachedTooEarly: 'Keep the Moonwell hinge gated behind the late Hushbriar route, not available from older drifted branches.',
        ifPartiallyInformed: 'Let the lane violence point toward choldriths and Moonwell without skipping the town pressure that earns it.',
        onRevisit: 'Once resolved, do not turn the scream path back into a repeatable action surface.',
        neverReveal: ['ciara', 'underdark', 'portal', 'liam', 'stasis']
    },
    SCENE_MOONWELL: {
        thread: 'hushbriar_demigod_thread',
        prerequisites: {
            storyEvents: ['hushbriar_demigod_thread']
        },
        fallbackMode: SCENE_FALLBACK_MODES.DEGRADE,
        ifReachedTooEarly: 'Do not surface Moonwell before the late Hushbriar spine earns it through town pressure and the night event.',
        ifPartiallyInformed: 'Keep Moonwell as a protected emotional hinge, not a bypass to earlier route knowledge.',
        onRevisit: 'Preserve the weight of the set piece and avoid flattening it into a generic boss room.',
        neverReveal: ['ciara', 'underdark', 'portal', 'liam', 'stasis']
    },
    SCENE_HUSHBRIAR_GUILD_ROAD: {
        thread: 'retired_hushbriar_guild_branch',
        prerequisites: {
            storyEvents: ['hushbriar_demigod_thread']
        },
        fallbackMode: SCENE_FALLBACK_MODES.REDIRECT,
        ifReachedTooEarly: 'Retire this guild-first route until it is rewritten to fit the draft-first Hushbriar order.',
        ifPartiallyInformed: 'Do not let this branch replace the canonical town, inn, Fionnlagh, and Moonwell spine.',
        onRevisit: 'Redirect interest back toward canonical Hushbriar until the branch is formally realigned.',
        neverReveal: ['ciara', 'underdark', 'portal', 'liam', 'stasis']
    },
    SCENE_THIEVES_HIDEOUT: {
        thread: 'retired_hushbriar_guild_branch',
        prerequisites: {
            storyEvents: ['hushbriar_demigod_thread']
        },
        fallbackMode: SCENE_FALLBACK_MODES.REDIRECT,
        ifReachedTooEarly: 'Keep the retired hideout branch off the active route.',
        ifPartiallyInformed: 'Do not surface it as the default late-route destination until rewritten and documented as aligned.',
        onRevisit: 'Redirect to canonical Hushbriar rather than treating this as a live hub.',
        neverReveal: ['ciara', 'underdark', 'portal', 'liam', 'stasis']
    },
    SCENE_ELARA_HIDEAWAY: {
        thread: 'retired_hushbriar_guild_branch',
        prerequisites: {
            storyEvents: ['hushbriar_demigod_thread']
        },
        fallbackMode: SCENE_FALLBACK_MODES.REDIRECT,
        ifReachedTooEarly: 'Retire the holdfast-management branch until it is rewritten into draft-first order.',
        ifPartiallyInformed: 'Keep Elara out of the active route until her branch is canon-aligned and documented.',
        onRevisit: 'Do not route normal hub travel here.',
        neverReveal: ['ciara', 'underdark', 'portal', 'liam', 'stasis']
    },
    SCENE_SOUL_MILL_APPROACH: {
        thread: 'dormant_hushbriar_future_route',
        prerequisites: {
            storyEvents: ['hushbriar_demigod_thread']
        },
        fallbackMode: SCENE_FALLBACK_MODES.REDIRECT,
        ifReachedTooEarly: 'Keep the Soul Mill dormant until its late Hushbriar role is draft-aligned and documented.',
        ifPartiallyInformed: 'Do not let teaser surfaces behave like active destinations.',
        onRevisit: 'Redirect to canonical Hushbriar until the route is promoted out of dormant status.',
        neverReveal: ['ciara', 'underdark', 'portal', 'liam', 'stasis']
    },
    SCENE_SOLASMOR_APPROACH: {
        thread: 'dormant_hushbriar_future_route',
        prerequisites: {
            storyEvents: ['hushbriar_demigod_thread']
        },
        fallbackMode: SCENE_FALLBACK_MODES.REDIRECT,
        ifReachedTooEarly: 'Keep Solasmor dormant until its late Hushbriar role is draft-aligned and documented.',
        ifPartiallyInformed: 'Do not let a teaser monastery route compete with the canonical Moonwell pressure.',
        onRevisit: 'Redirect to canonical Hushbriar until the route is promoted out of dormant status.',
        neverReveal: ['ciara', 'underdark', 'portal', 'liam', 'stasis']
    }
};

const STORY_EVENT_IDS = Object.keys(storyEvents);

function createDefaultEventStatus() {
    const eventStatus = {};

    STORY_EVENT_IDS.forEach((eventId) => {
        eventStatus[eventId] = {
            status: STORY_EVENT_STATUS.LOCKED,
            firstSeenSceneId: null,
            completedSceneId: null
        };
    });

    eventStatus.alderic_briefing.status = STORY_EVENT_STATUS.AVAILABLE;

    return eventStatus;
}

export function createDefaultStoryState() {
    return {
        canonicalStartScene: CANONICAL_START_SCENE,
        currentActId: storyActs[0].id,
        currentEventId: 'alderic_briefing',
        eventStatus: createDefaultEventStatus(),
        travelCount: 0,
        restCount: 0,
        dayCount: 0,
        lastSceneId: null,
        sceneVisitCounts: {}
    };
}

export function ensureStoryState(rawState) {
    const base = createDefaultStoryState();
    if (!rawState || typeof rawState !== 'object') {
        return base;
    }

    const normalized = {
        ...base,
        ...rawState,
        eventStatus: createDefaultEventStatus(),
        sceneVisitCounts: { ...base.sceneVisitCounts, ...(rawState.sceneVisitCounts || {}) }
    };

    STORY_EVENT_IDS.forEach((eventId) => {
        const existing = rawState.eventStatus && rawState.eventStatus[eventId]
            ? rawState.eventStatus[eventId]
            : {};

        normalized.eventStatus[eventId] = {
            ...base.eventStatus[eventId],
            ...existing
        };

        if (!Object.values(STORY_EVENT_STATUS).includes(normalized.eventStatus[eventId].status)) {
            normalized.eventStatus[eventId].status = base.eventStatus[eventId].status;
        }
    });

    if (!storyActs.some((act) => act.id === normalized.currentActId)) {
        normalized.currentActId = base.currentActId;
    }

    if (!storyEvents[normalized.currentEventId]) {
        normalized.currentEventId = base.currentEventId;
    }

    return normalized;
}

export function getStoryEventStatus(storyState, eventId) {
    return storyState?.eventStatus?.[eventId]?.status || STORY_EVENT_STATUS.LOCKED;
}

export function isStoryEventCompleted(storyState, eventId) {
    return getStoryEventStatus(storyState, eventId) === STORY_EVENT_STATUS.COMPLETED;
}

export function unlockStoryEvent(storyState, eventId) {
    if (!storyEvents[eventId] || !storyState?.eventStatus?.[eventId]) {
        return false;
    }

    const current = storyState.eventStatus[eventId];
    if (current.status !== STORY_EVENT_STATUS.LOCKED && current.status !== STORY_EVENT_STATUS.MISSED) {
        return false;
    }

    current.status = STORY_EVENT_STATUS.AVAILABLE;
    return true;
}

export function activateStoryEvent(storyState, eventId, sceneId = null) {
    if (!storyEvents[eventId] || !storyState?.eventStatus?.[eventId]) {
        return false;
    }

    const current = storyState.eventStatus[eventId];
    if (current.status === STORY_EVENT_STATUS.COMPLETED) {
        return false;
    }

    if (current.status === STORY_EVENT_STATUS.LOCKED || current.status === STORY_EVENT_STATUS.MISSED) {
        current.status = STORY_EVENT_STATUS.AVAILABLE;
    }

    current.status = STORY_EVENT_STATUS.ACTIVE;
    if (!current.firstSeenSceneId) {
        current.firstSeenSceneId = sceneId;
    }

    return true;
}

export function completeStoryEvent(storyState, eventId, sceneId = null) {
    if (!storyEvents[eventId] || !storyState?.eventStatus?.[eventId]) {
        return false;
    }

    const current = storyState.eventStatus[eventId];
    if (current.status === STORY_EVENT_STATUS.COMPLETED) {
        return false;
    }

    if (!current.firstSeenSceneId) {
        current.firstSeenSceneId = sceneId;
    }

    current.status = STORY_EVENT_STATUS.COMPLETED;
    current.completedSceneId = sceneId;
    return true;
}

export function advanceStoryClock(storyState, delta = {}) {
    if (!storyState) return;

    storyState.travelCount += delta.travel || 0;
    storyState.restCount += delta.rest || 0;
    storyState.dayCount += delta.days || 0;
}

function updateCurrentEvent(storyState) {
    const activeEventId = STORY_EVENT_IDS.find((eventId) => getStoryEventStatus(storyState, eventId) === STORY_EVENT_STATUS.ACTIVE);
    if (activeEventId) {
        storyState.currentEventId = activeEventId;
        return;
    }

    const availableEventId = STORY_EVENT_IDS.find((eventId) => getStoryEventStatus(storyState, eventId) === STORY_EVENT_STATUS.AVAILABLE);
    if (availableEventId) {
        storyState.currentEventId = availableEventId;
    }
}

export function syncStoryStateForScene(storyState, sceneId) {
    if (!storyState) {
        return { activated: [], completed: [], unlocked: [], actChanged: false };
    }

    storyState.sceneVisitCounts[sceneId] = (storyState.sceneVisitCounts[sceneId] || 0) + 1;
    storyState.lastSceneId = sceneId;

    const trigger = storySceneTriggers[sceneId];
    if (!trigger) {
        updateCurrentEvent(storyState);
        return { activated: [], completed: [], unlocked: [], actChanged: false };
    }

    const changes = {
        activated: [],
        completed: [],
        unlocked: [],
        actChanged: false
    };

    (trigger.unlock || []).forEach((eventId) => {
        if (unlockStoryEvent(storyState, eventId)) {
            changes.unlocked.push(eventId);
        }
    });

    (trigger.activate || []).forEach((eventId) => {
        if (activateStoryEvent(storyState, eventId, sceneId)) {
            changes.activated.push(eventId);
        }
    });

    (trigger.complete || []).forEach((eventId) => {
        if (completeStoryEvent(storyState, eventId, sceneId)) {
            changes.completed.push(eventId);
        }
    });

    if (trigger.advance) {
        advanceStoryClock(storyState, trigger.advance);
    }

    if (trigger.actId && storyState.currentActId !== trigger.actId) {
        storyState.currentActId = trigger.actId;
        changes.actChanged = true;
    }

    updateCurrentEvent(storyState);

    return changes;
}

export function meetsStoryRequirement(storyState, requirement) {
    if (!requirement) return true;

    if (typeof requirement === 'string') {
        return isStoryEventCompleted(storyState, requirement);
    }

    if (requirement.id) {
        const status = getStoryEventStatus(storyState, requirement.id);
        if (requirement.status) {
            return status === requirement.status;
        }
        if (requirement.oneOf) {
            return requirement.oneOf.includes(status);
        }
        return status === STORY_EVENT_STATUS.COMPLETED;
    }

    if (requirement.actId) {
        return storyState?.currentActId === requirement.actId;
    }

    return true;
}

export function getLocationStoryRequirement(locationId) {
    return locationStoryRequirements[locationId] || null;
}

export function getLocationUnlockHint(locationId) {
    return locationUnlockHints[locationId] || null;
}

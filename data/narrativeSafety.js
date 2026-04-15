export const SCENE_FALLBACK_MODES = {
    REDIRECT: 'redirect',
    DEGRADE: 'degrade',
    DELAY: 'delay',
    HIDE_CHOICE: 'hide_choice',
    SHOW_RUMOR_ONLY_VERSION: 'show_rumor_only_version'
};

export const EARLY_ROUTE_SPOILER_TERMS = [
    'ciara',
    'underdark',
    'portal',
    'liam',
    'stasis'
];

export const SCENE_STATE_SCHEMA = {
    requires: [
        'storyEvent',
        'flag',
        'sceneMemory',
        'item',
        'tool',
        'status',
        'trait'
    ],
    revisitStates: [
        'first_visit',
        'revisit',
        'partially_informed',
        'fully_informed'
    ],
    fallbackModes: Object.values(SCENE_FALLBACK_MODES),
    spoilerSensitivity: [
        'public',
        'rumor_only',
        'spoiler_sensitive'
    ],
    rewardSemantics: [
        'story_progression',
        'optional_clue',
        'revisit_memory',
        'one_time_outcome'
    ]
};

export const narrativeStateRegistry = {
    flags: {
        silverthorn_temple_ward_taken: {
            owner: 'SCENE_SILVERTHORN_TEMPLE_COUNSEL',
            thread: 'silverthorn_prep',
            meaning: 'The player already received the temple road ward outcome and should not be offered it again.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'one_time_outcome'
        },
        silverthorn_gate_route_briefed: {
            owner: 'SCENE_SILVERTHORN_GATE_CAPTAIN',
            thread: 'silverthorn_prep',
            meaning: 'The player already completed the gate route study and should not repeat the route-mark reward.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'one_time_outcome'
        },
        sporefall_eoin_glimpsed: {
            owner: 'SCENE_ARRIVAL_WHISPERWOOD',
            thread: 'eoin_thread',
            meaning: 'The player sensed Eoin nearby but has not fully met him yet.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'story_progression'
        },
        sporefall_eoin_met: {
            owner: 'SCENE_MEET_EOIN',
            thread: 'eoin_thread',
            meaning: 'The first direct Eoin encounter has occurred.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'story_progression'
        },
        sporefall_eoin_talked: {
            owner: 'SCENE_EOIN_TALK',
            thread: 'eoin_thread',
            meaning: 'The player completed Eoin’s first major conversation and unlocked the first borough sandbox slice.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'story_progression'
        },
        sporefall_eoin_fed: {
            owner: 'SCENE_MEET_EOIN / SCENE_EOIN_TALK',
            thread: 'eoin_thread',
            meaning: 'The player gave Eoin food, changing later text and survivor tone.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'optional_clue'
        },
        sporefall_eoin_treated: {
            owner: 'SCENE_MEET_EOIN / SCENE_EOIN_TALK',
            thread: 'eoin_thread',
            meaning: 'The player treated Eoin, changing later text and survivor tone.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'optional_clue'
        },
        sporefall_cathedral_letter_found: {
            owner: 'SCENE_SPOREFALL_CATHEDRAL_APPROACH',
            thread: 'sporefall_investigation',
            meaning: 'The cathedral courier bag clue has already been claimed.',
            allowedValues: [true],
            revealSensitivity: 'rumor_only',
            semantics: 'one_time_outcome'
        },
        sporefall_cathedral_vision_seen: {
            owner: 'SCENE_SPOREFALL_CATHEDRAL_VISION',
            thread: 'aodhan_thread',
            meaning: 'The cathedral vision clue has been seen and may color later dialogue.',
            allowedValues: [true],
            revealSensitivity: 'spoiler_sensitive',
            semantics: 'story_progression'
        },
        sporefall_cathedral_masonry_read: {
            owner: 'SCENE_SPOREFALL_CATHEDRAL_APPROACH',
            thread: 'sporefall_investigation',
            meaning: 'The player interpreted the cathedral stone damage with stonework-aware reading.',
            allowedValues: [true],
            revealSensitivity: 'rumor_only',
            semantics: 'optional_clue'
        },
        sporefall_home_trap_hint: {
            owner: 'SCENE_SPOREFALL_OVERSEER_APPROACH',
            thread: 'sporefall_investigation',
            meaning: 'The player learned enough to attempt the safe overseer-door rune choice.',
            allowedValues: [true],
            revealSensitivity: 'rumor_only',
            semantics: 'optional_clue'
        },
        sporefall_home_unlocked: {
            owner: 'SCENE_SPOREFALL_OVERSEER_DOOR',
            thread: 'sporefall_investigation',
            meaning: 'The overseer house is open and should remain traversable on revisit.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'story_progression'
        },
        sporefall_journal_found: {
            owner: 'SCENE_SPOREFALL_OVERSEER_STUDY',
            thread: 'aodhan_thread',
            meaning: 'The surviving journal leaves were already collected.',
            allowedValues: [true],
            revealSensitivity: 'spoiler_sensitive',
            semantics: 'one_time_outcome'
        },
        sporefall_letter_found: {
            owner: 'SCENE_SPOREFALL_OVERSEER_STUDY',
            thread: 'aodhan_thread',
            meaning: 'The correspondence clue was already collected.',
            allowedValues: [true],
            revealSensitivity: 'spoiler_sensitive',
            semantics: 'one_time_outcome'
        },
        sporefall_compass_found: {
            owner: 'SCENE_SPOREFALL_OVERSEER_STUDY',
            thread: 'aodhan_thread',
            meaning: 'The false-north compass clue was already collected.',
            allowedValues: [true],
            revealSensitivity: 'spoiler_sensitive',
            semantics: 'one_time_outcome'
        },
        sporefall_bridge_seen: {
            owner: 'SCENE_SPOREFALL_NORTH_BRIDGE',
            thread: 'north_bridge',
            meaning: 'The player investigated the north bridge shelter and later Eoin dialogue may acknowledge it.',
            allowedValues: [true],
            revealSensitivity: 'rumor_only',
            semantics: 'optional_clue'
        },
        sporefall_bridge_body_seen: {
            owner: 'SCENE_SPOREFALL_NORTH_BRIDGE',
            thread: 'north_bridge',
            meaning: 'The player found Eoin’s mother under the bridge; later dialogue may confirm the loss.',
            allowedValues: [true],
            revealSensitivity: 'spoiler_sensitive',
            semantics: 'optional_clue'
        },
        sporefall_north_route_open: {
            owner: 'SCENE_SPOREFALL_NORTH_ROUTE_DISCOVERED',
            thread: 'north_skip_route',
            meaning: 'The player opened the viable but clue-light northern route.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'story_progression'
        }
    },
    sceneMemory: {
        silverthorn_general_store_seen: {
            owner: 'SCENE_SILVERTHORN_GENERAL_STORE',
            thread: 'silverthorn_prep',
            meaning: 'Controls the one-time store introduction text.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'revisit_memory'
        },
        silverthorn_blacksmith_seen: {
            owner: 'SCENE_SILVERTHORN_BLACKSMITH',
            thread: 'silverthorn_prep',
            meaning: 'Controls the one-time blacksmith introduction text.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'revisit_memory'
        },
        silverthorn_rumors_heard: {
            owner: 'SCENE_RUSTY_BLADE_RUMORS',
            thread: 'silverthorn_prep',
            meaning: 'Switches first-pass rumor text into a harsher repeat version.',
            allowedValues: [true],
            revealSensitivity: 'rumor_only',
            semantics: 'revisit_memory'
        },
        silverthorn_temple_counsel: {
            owner: 'SCENE_SILVERTHORN_TEMPLE_COUNSEL',
            thread: 'silverthorn_prep',
            meaning: 'Records that the temple counsel scene has been visited.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'revisit_memory'
        },
        silverthorn_notice_whisperwood: {
            owner: 'SCENE_SILVERTHORN_NOTICE_WHISPERWOOD',
            thread: 'silverthorn_prep',
            meaning: 'Records that the vanished-borough notice board was read.',
            allowedValues: [true],
            revealSensitivity: 'rumor_only',
            semantics: 'revisit_memory'
        },
        silverthorn_gate_captain_seen: {
            owner: 'SCENE_SILVERTHORN_GATE_CAPTAIN',
            thread: 'silverthorn_prep',
            meaning: 'Controls the captain’s revisit text and keeps his route-warning voice consistent.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'revisit_memory'
        },
        sporefall_street_search_seen: {
            owner: 'SCENE_SPOREFALL_STREET_SEARCH',
            thread: 'eoin_thread',
            meaning: 'Turns the delayed search beat into a revisit version instead of replaying first-search text.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'revisit_memory'
        }
    }
};

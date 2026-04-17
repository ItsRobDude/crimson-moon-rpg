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
        'companionId',
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
        eoin_recruited: {
            owner: 'SCENE_EOIN_TALK',
            thread: 'eoin_thread',
            meaning: 'Eoin has joined the active party and should appear in travel, combat, and Sporefall route text.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'story_progression'
        },
        eoin_refused: {
            owner: 'SCENE_EOIN_TALK',
            thread: 'eoin_thread',
            meaning: 'The player declined to bring Eoin along, leaving him hidden in Sporefall for now.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'one_time_outcome'
        },
        eoin_locked_out: {
            owner: 'SCENE_EOIN_TALK',
            thread: 'eoin_thread',
            meaning: 'The player handled Eoin harshly enough that he will no longer trust a recruitment offer.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'one_time_outcome'
        },
        eoin_bonded: {
            owner: 'SCENE_EOIN_TALK',
            thread: 'eoin_thread',
            meaning: 'Eoin now trusts the party enough to offer route-specific survival help.',
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
        },
        sporefall_north_route_avoided_fight: {
            owner: 'SCENE_SPOREFALL_NORTH_ROUTE_DISCOVERED',
            thread: 'north_skip_route',
            meaning: 'The player reached the northern route through the quieter evasive branch instead of the ambush fight.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'optional_clue'
        },
        hushbriar_fionnlagh_met: {
            owner: 'SCENE_FIONNLAGH_HUB',
            thread: 'aodhan_thread',
            meaning: 'The player reached Fionnlagh and opened the missable Moonwell night window.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'story_progression'
        },
        moonwell_night_available: {
            owner: 'SCENE_FIONNLAGH_HUB',
            thread: 'aodhan_thread',
            meaning: 'The Moonwell night event is currently available if the player investigates Hushbriar before dawn.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'story_progression'
        },
        moonwell_seen: {
            owner: 'SCENE_MOONWELL',
            thread: 'aodhan_thread',
            meaning: 'The player reached the Moonwell and saw the containment collapse in person.',
            allowedValues: [true],
            revealSensitivity: 'spoiler_sensitive',
            semantics: 'story_progression'
        },
        moonwell_missed: {
            owner: 'SCENE_HUSHBRIAR_MORNING_SETUP',
            thread: 'aodhan_thread',
            meaning: 'The player missed the first Moonwell night encounter and instead hit the morning-after consequence setup.',
            allowedValues: [true],
            revealSensitivity: 'spoiler_sensitive',
            semantics: 'one_time_outcome'
        },
        moonwell_morning_setup_seen: {
            owner: 'SCENE_HUSHBRIAR_MORNING_SETUP',
            thread: 'aodhan_thread',
            meaning: 'The player has seen the morning-after Hushbriar commotion that sets up the deferred three-way conflict.',
            allowedValues: [true],
            revealSensitivity: 'spoiler_sensitive',
            semantics: 'story_progression'
        },
        archives_thalion_audience_closed: {
            owner: 'SCENE_ARCHIVES_AUDIENCE',
            thread: 'archives_truth',
            meaning: 'The first decisive Thalion interrogation has ended and the richest version should not repeat.',
            allowedValues: [true],
            revealSensitivity: 'spoiler_sensitive',
            semantics: 'one_time_outcome'
        },
        archives_alderic_truth_learned: {
            owner: 'SCENE_ARCHIVES_ALDERIC_TRUTH',
            thread: 'archives_truth',
            meaning: 'The player extracted the higher-value Alderic and Ciara alliance details from Thalion.',
            allowedValues: [true],
            revealSensitivity: 'spoiler_sensitive',
            semantics: 'optional_clue'
        },
        archives_alderic_truth_missed: {
            owner: 'SCENE_ARCHIVES_ALDERIC_REBUFF',
            thread: 'archives_truth',
            meaning: 'The player failed to win the deeper Alderic/Ciara truth during the one-pass Thalion audience.',
            allowedValues: [true],
            revealSensitivity: 'spoiler_sensitive',
            semantics: 'one_time_outcome'
        },
        archives_thalion_confession_learned: {
            owner: 'SCENE_ARCHIVES_THALION_CONFESSION',
            thread: 'archives_truth',
            meaning: 'The player won Thalion\'s personal confession about his own divine crime and guilt.',
            allowedValues: [true],
            revealSensitivity: 'spoiler_sensitive',
            semantics: 'optional_clue'
        },
        archives_thalion_confession_missed: {
            owner: 'SCENE_ARCHIVES_THALION_REBUFF',
            thread: 'archives_truth',
            meaning: 'The player failed to draw out Thalion\'s deeper confession during the one-pass audience.',
            allowedValues: [true],
            revealSensitivity: 'spoiler_sensitive',
            semantics: 'one_time_outcome'
        },
        hushbriar_guild_ledger_found: {
            owner: 'SCENE_HUSHBRIAR_LEDGER',
            thread: 'hushbriar_demigod_thread',
            meaning: 'The player found the loading-dock ledger pointing toward the guild\'s hidden cargo.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'optional_clue'
        },
        hushbriar_guild_trusted: {
            owner: 'SCENE_THIEVES_HIDEOUT',
            thread: 'hushbriar_demigod_thread',
            meaning: 'The guild has accepted the party as useful enough to risk showing them Elara.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'story_progression'
        },
        hushbriar_guild_hostile: {
            owner: 'SCENE_THIEVES_HIDEOUT',
            thread: 'hushbriar_demigod_thread',
            meaning: 'The party has lost the guild\'s trust and future contact should stay hostile or coercive.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'story_progression'
        },
        elara_met: {
            owner: 'SCENE_ELARA_HIDEAWAY',
            thread: 'hushbriar_demigod_thread',
            meaning: 'The party reached Elara\'s hiding place and the demigod route is now personal rather than rumor-level.',
            allowedValues: [true],
            revealSensitivity: 'spoiler_sensitive',
            semantics: 'story_progression'
        },
        elara_route_protect: {
            owner: 'SCENE_ELARA_PROTECT_ROUTE',
            thread: 'hushbriar_demigod_thread',
            meaning: 'The party committed to keeping Elara hidden and resisting those who would spend her life.',
            allowedValues: [true],
            revealSensitivity: 'spoiler_sensitive',
            semantics: 'story_progression'
        },
        neala_recruited: {
            owner: 'SCENE_ELARA_PROTECT_ROUTE',
            thread: 'hushbriar_demigod_thread',
            meaning: 'Neala has joined the active party to guide the Elara protection route through guild ground.',
            allowedValues: [true],
            revealSensitivity: 'spoiler_sensitive',
            semantics: 'story_progression'
        },
        neala_refused: {
            owner: 'SCENE_ELARA_PROTECT_ROUTE',
            thread: 'hushbriar_demigod_thread',
            meaning: 'The player chose to leave Neala at the hideout instead of bringing her into the field.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'one_time_outcome'
        },
        neala_bonded: {
            owner: 'SCENE_ELARA_PROTECT_ROUTE',
            thread: 'hushbriar_demigod_thread',
            meaning: 'Neala trusts the party enough to share route knowledge and patrol reads on the road.',
            allowedValues: [true],
            revealSensitivity: 'spoiler_sensitive',
            semantics: 'optional_clue'
        },
        elara_route_stone_hunt_declared: {
            owner: 'SCENE_ELARA_STONE_ROUTE',
            thread: 'hushbriar_demigod_thread',
            meaning: 'The party revealed an intent to use Elara\'s blood to empower the Stone of Oblivion.',
            allowedValues: [true],
            revealSensitivity: 'spoiler_sensitive',
            semantics: 'story_progression'
        },
        elara_route_aodhan_lured: {
            owner: 'SCENE_ELARA_BETRAY_ROUTE',
            thread: 'hushbriar_demigod_thread',
            meaning: 'The party chose to bring or bait the living Aodhan toward Elara\'s hiding place.',
            allowedValues: [true],
            revealSensitivity: 'spoiler_sensitive',
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

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
        silverthorn_watch_hostile: {
            owner: 'SCENE_SILVERTHORN_WATCH_CRACKDOWN',
            thread: 'silverthorn_prep',
            meaning: 'The player turned the eastern gate watch hostile and was forced out onto the road, closing the safer Silverthorn departure loop.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'route_lock'
        },
        silverthorn_lark_recruited: {
            owner: 'SCENE_LARK_RECRUIT',
            thread: 'silverthorn_prep',
            meaning: 'Lark agreed to join the road party and Silverthorn runtime should treat him as already recruited.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'story_progression'
        },
        silverthorn_kieran_recruited: {
            owner: 'SCENE_KIERAN_RECRUIT',
            thread: 'silverthorn_prep',
            meaning: 'Kieran agreed to join the road party and Silverthorn runtime should treat him as already recruited.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'story_progression'
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
        sporefall_eoin_key_info_heard: {
            owner: 'SCENE_EOIN_TALK',
            thread: 'eoin_thread',
            meaning: 'The player heard the first essential directional information from Eoin, regardless of which initial question path they chose.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'story_progression'
        },
        sporefall_eoin_choice_made: {
            owner: 'SCENE_EOIN_TALK / SCENE_EOIN_RITUAL_TALK',
            thread: 'eoin_thread',
            meaning: 'The player finished Eoin’s first urgent dialogue branch and committed to the next borough-facing action.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'story_progression'
        },
        sporefall_eoin_comforted: {
            owner: 'SCENE_MEET_EOIN / SCENE_EOIN_TALK',
            thread: 'eoin_thread',
            meaning: 'The player offered Eoin a small symbolic kindness, changing later text and survivor tone.',
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
        sporefall_dreadcap_triggered: {
            owner: 'SCENE_HUB_SPOREFALL',
            thread: 'north_skip_route',
            meaning: 'The player lingered in Sporefall long enough after Eoin to trigger the Dreadcap escalation.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'story_progression'
        },
        sporefall_dreadcap_defeated: {
            owner: 'SCENE_DREADCAP_AFTERMATH',
            thread: 'north_skip_route',
            meaning: 'The Dreadcap escalation has already been resolved and should not trigger again.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'one_time_outcome'
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
            thread: 'hushbriar_demigod_thread',
            meaning: 'The player reached Fionnlagh and opened the missable Moonwell night window.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'story_progression'
        },
        moonwell_night_available: {
            owner: 'SCENE_FIONNLAGH_HUB',
            thread: 'hushbriar_demigod_thread',
            meaning: 'The Moonwell night event is currently available if the player investigates Hushbriar before dawn.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'story_progression'
        },
        moonwell_seen: {
            owner: 'SCENE_MOONWELL',
            thread: 'hushbriar_demigod_thread',
            meaning: 'The player reached the Moonwell and saw the containment collapse in person.',
            allowedValues: [true],
            revealSensitivity: 'spoiler_sensitive',
            semantics: 'story_progression'
        },
        moonwell_missed: {
            owner: 'SCENE_HUSHBRIAR_MORNING_SETUP',
            thread: 'hushbriar_demigod_thread',
            meaning: 'The player missed the first Moonwell night encounter and instead hit the morning-after consequence setup.',
            allowedValues: [true],
            revealSensitivity: 'spoiler_sensitive',
            semantics: 'one_time_outcome'
        },
        moonwell_morning_setup_seen: {
            owner: 'SCENE_HUSHBRIAR_MORNING_SETUP',
            thread: 'hushbriar_demigod_thread',
            meaning: 'The player has seen the morning-after Hushbriar commotion that sets up the deferred three-way conflict.',
            allowedValues: [true],
            revealSensitivity: 'spoiler_sensitive',
            semantics: 'story_progression'
        },
        aodhan_dead: {
            owner: 'SCENE_AODHAN_DEFEAT',
            thread: 'hushbriar_demigod_thread',
            meaning: 'Aodhan died at Moonwell, so later scenes may acknowledge his death instead of treating him as an active threat.',
            allowedValues: [true],
            revealSensitivity: 'spoiler_sensitive',
            semantics: 'one_time_outcome'
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
            meaning: 'The player extracted the deeper Alderic truth that the Archives allow at this stage.',
            allowedValues: [true],
            revealSensitivity: 'spoiler_sensitive',
            semantics: 'optional_clue'
        },
        archives_alderic_truth_missed: {
            owner: 'SCENE_ARCHIVES_ALDERIC_REBUFF',
            thread: 'archives_truth',
            meaning: 'The player failed to win the deeper Alderic truth during the one-pass Thalion audience.',
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
            thread: 'hushbriar_elara_resolution',
            meaning: 'The player found the loading-dock ledger pointing toward the guild\'s hidden cargo.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'optional_clue'
        },
        hushbriar_guild_trusted: {
            owner: 'SCENE_THIEVES_HIDEOUT',
            thread: 'hushbriar_elara_resolution',
            meaning: 'The guild has accepted the party as useful enough to risk showing them Elara.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'story_progression'
        },
        hushbriar_guild_hostile: {
            owner: 'SCENE_THIEVES_HIDEOUT',
            thread: 'hushbriar_elara_resolution',
            meaning: 'The party has lost the guild\'s trust and future contact should stay hostile or coercive.',
            allowedValues: [true],
            revealSensitivity: 'public',
            semantics: 'story_progression'
        },
        elara_met: {
            owner: 'SCENE_ELARA_HIDEAWAY',
            thread: 'hushbriar_elara_resolution',
            meaning: 'The party reached Elara\'s hiding place and the demigod route is now personal rather than rumor-level.',
            allowedValues: [true],
            revealSensitivity: 'spoiler_sensitive',
            semantics: 'story_progression'
        },
        elara_choice_spared: {
            owner: 'SCENE_ELARA_STONE_DECISION',
            thread: 'hushbriar_elara_resolution',
            meaning: 'The party committed to keeping Elara alive rather than spending her blood immediately.',
            allowedValues: [true],
            revealSensitivity: 'spoiler_sensitive',
            semantics: 'story_progression'
        },
        elara_choice_sacrifice_declared: {
            owner: 'SCENE_ELARA_STONE_DECISION',
            thread: 'hushbriar_elara_resolution',
            meaning: 'The party declared that Elara\'s divinity may need to be spent to wake the Stone.',
            allowedValues: [true],
            revealSensitivity: 'spoiler_sensitive',
            semantics: 'story_progression'
        },
        elara_choice_deferred_by_aodhan: {
            owner: 'SCENE_ELARA_AODHAN_WARNING',
            thread: 'hushbriar_elara_resolution',
            meaning: 'Aodhan still controls the Stone, so the Elara choice is delayed under direct pursuit pressure.',
            allowedValues: [true],
            revealSensitivity: 'spoiler_sensitive',
            semantics: 'one_time_outcome'
        },
        processing_truth_learned: {
            owner: 'SCENE_HUSHBRIAR_PROCESSING_REVELATION',
            thread: 'hushbriar_elara_resolution',
            meaning: 'The party learned that Alderic is emptying Hushbriar through processing and the Soul Mill.',
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

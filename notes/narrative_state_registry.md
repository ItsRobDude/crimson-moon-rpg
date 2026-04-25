# Narrative State Registry

This note documents the story-critical flags and scene-memory keys that currently drive fragile early Act I runtime behavior.

Machine-readable mirror:

- `data/narrativeSafety.js`

If you add a new story-critical key, update both this note and the JS registry in the same change.

## Classification Vocabulary

- `story_progression`
  Moves the route forward or opens a new branch.
- `optional_clue`
  Adds information or emotional context without being strictly required.
- `revisit_memory`
  Changes revisit text or one-time intro framing.
- `one_time_outcome`
  Prevents a reward, clue, or ritualized benefit from being claimed repeatedly.
- `route_lock`
  Closes or redirects a branch because of a meaningful player action.

## Flags

| Key | Owner | Thread | Meaning | Sensitivity | Semantics |
| --- | --- | --- | --- | --- | --- |
| `silverthorn_temple_ward_taken` | `SCENE_SILVERTHORN_TEMPLE_COUNSEL` | `silverthorn_prep` | Temple ward already resolved. | public | one_time_outcome |
| `silverthorn_gate_route_briefed` | `SCENE_SILVERTHORN_GATE_CAPTAIN` | `silverthorn_prep` | Route-study reward already resolved. | public | one_time_outcome |
| `silverthorn_watch_hostile` | `SCENE_SILVERTHORN_WATCH_CRACKDOWN` | `silverthorn_prep` | Gate watch turned hostile and forced the player onto the eastern road. | public | route_lock |
| `silverthorn_lark_recruited` | `SCENE_LARK_RECRUIT` | `silverthorn_prep` | Lark has already joined the road party. | public | story_progression |
| `silverthorn_kieran_recruited` | `SCENE_KIERAN_RECRUIT` | `silverthorn_prep` | Kieran has already joined the road party. | public | story_progression |
| `aodhan_dead` | `SCENE_AODHAN_DEFEAT` | `aodhan_thread` | Aodhan has been killed and later branches should not treat him as still carrying the Stone. | spoiler_sensitive | story_progression |
| `sporefall_eoin_glimpsed` | `SCENE_ARRIVAL_WHISPERWOOD` | `eoin_thread` | Eoin sensed nearby before full meeting. | public | story_progression |
| `sporefall_eoin_delayed` | `SCENE_ARRIVAL_WHISPERWOOD` | `eoin_thread` | First survivor search failed and Eoin discovery moved into the street-search beat. | public | story_progression |
| `sporefall_eoin_met` | `SCENE_MEET_EOIN` | `eoin_thread` | First direct Eoin encounter happened. | public | story_progression |
| `sporefall_eoin_talked` | `SCENE_EOIN_TALK` | `eoin_thread` | Eoin's first major conversation is complete. | public | story_progression |
| `sporefall_eoin_key_info_heard` | `SCENE_EOIN_TALK` | `eoin_thread` | Eoin's first major directional clue was heard. | public | story_progression |
| `sporefall_eoin_choice_made` | `SCENE_EOIN_TALK` / `SCENE_EOIN_RITUAL_TALK` | `eoin_thread` | Eoin's first urgent branch has been resolved into a next action. | public | story_progression |
| `sporefall_eoin_comforted` | `SCENE_MEET_EOIN` / `SCENE_EOIN_TALK` | `eoin_thread` | Player offered Eoin a symbolic kindness. | public | optional_clue |
| `sporefall_cathedral_letter_found` | `SCENE_SPOREFALL_CATHEDRAL_APPROACH` | `sporefall_investigation` | Courier bag clue already claimed. | rumor_only | one_time_outcome |
| `sporefall_cathedral_vision_seen` | `SCENE_SPOREFALL_CATHEDRAL_VISION` | `aodhan_thread` | Cathedral vision was seen. | spoiler_sensitive | story_progression |
| `sporefall_cathedral_masonry_read` | `SCENE_SPOREFALL_CATHEDRAL_APPROACH` | `sporefall_investigation` | Stonework clue interpreted. | rumor_only | optional_clue |
| `sporefall_home_trap_hint` | `SCENE_SPOREFALL_OVERSEER_APPROACH` | `sporefall_investigation` | Safe door-rune clue learned. | rumor_only | optional_clue |
| `sporefall_home_unlocked` | `SCENE_SPOREFALL_OVERSEER_DOOR` | `sporefall_investigation` | Overseer house opened. | public | story_progression |
| `sporefall_journal_found` | `SCENE_SPOREFALL_OVERSEER_STUDY` | `aodhan_thread` | Journal clue already claimed. | spoiler_sensitive | one_time_outcome |
| `sporefall_letter_found` | `SCENE_SPOREFALL_OVERSEER_STUDY` | `aodhan_thread` | Correspondence clue already claimed. | spoiler_sensitive | one_time_outcome |
| `sporefall_compass_found` | `SCENE_SPOREFALL_OVERSEER_STUDY` | `aodhan_thread` | Compass clue already claimed. | spoiler_sensitive | one_time_outcome |
| `sporefall_bridge_seen` | `SCENE_SPOREFALL_NORTH_BRIDGE` | `north_bridge` | Bridge shelter investigated. | rumor_only | optional_clue |
| `sporefall_bridge_body_seen` | `SCENE_SPOREFALL_NORTH_BRIDGE` | `north_bridge` | Eoin's mother found under the bridge. | spoiler_sensitive | optional_clue |
| `sporefall_bridge_marker_read` | `SCENE_SPOREFALL_NORTH_APPROACH` | `north_bridge` | Older bridge marker was read and its civic history understood beneath the corruption. | rumor_only | optional_clue |
| `sporefall_north_route_open` | `SCENE_SPOREFALL_NORTH_ROUTE_DISCOVERED` | `north_skip_route` | Northern skip route opened. | public | story_progression |
| `sporefall_dreadcap_triggered` | `SCENE_HUB_SPOREFALL` | `north_skip_route` | Sporefall lingered long enough to trigger the Dreadcap escalation. | public | story_progression |
| `sporefall_dreadcap_defeated` | `SCENE_DREADCAP_AFTERMATH` | `north_skip_route` | Dreadcap escalation already resolved. | public | one_time_outcome |
| `sporefall_north_route_avoided_fight` | `SCENE_SPOREFALL_NORTH_ROUTE_DISCOVERED` | `north_skip_route` | Northern route was reached through the evasive branch rather than the ambush. | public | optional_clue |
| `hushbriar_fionnlagh_met` | `SCENE_FIONNLAGH_HUB` | `hushbriar_demigod_thread` | Fionnlagh meeting completed and Moonwell night window opened. | public | story_progression |
| `moonwell_night_available` | `SCENE_FIONNLAGH_HUB` | `hushbriar_demigod_thread` | Moonwell night event is available before dawn. | public | story_progression |
| `moonwell_seen` | `SCENE_MOONWELL` | `hushbriar_demigod_thread` | Moonwell catastrophe witnessed directly. | spoiler_sensitive | story_progression |
| `moonwell_missed` | `SCENE_HUSHBRIAR_MORNING_SETUP` | `hushbriar_demigod_thread` | Player missed the night Moonwell encounter and hit the morning-after setup instead. | spoiler_sensitive | one_time_outcome |
| `moonwell_morning_setup_seen` | `SCENE_HUSHBRIAR_MORNING_SETUP` | `hushbriar_demigod_thread` | Morning-after Hushbriar commotion and three-way conflict setup seen. | spoiler_sensitive | story_progression |
| `archives_thalion_audience_closed` | `SCENE_ARCHIVES_AUDIENCE` | `archives_truth` | First decisive Thalion audience exhausted. | spoiler_sensitive | one_time_outcome |
| `archives_alderic_truth_learned` | `SCENE_ARCHIVES_ALDERIC_TRUTH` | `archives_truth` | Deeper Alderic truth extracted without frontloading later lore. | spoiler_sensitive | optional_clue |
| `archives_alderic_truth_missed` | `SCENE_ARCHIVES_ALDERIC_REBUFF` | `archives_truth` | Deeper Alderic truth permanently missed. | spoiler_sensitive | one_time_outcome |
| `archives_thalion_confession_learned` | `SCENE_ARCHIVES_THALION_CONFESSION` | `archives_truth` | Thalion's personal confession learned. | spoiler_sensitive | optional_clue |
| `archives_thalion_confession_missed` | `SCENE_ARCHIVES_THALION_REBUFF` | `archives_truth` | Thalion's personal confession permanently missed. | spoiler_sensitive | one_time_outcome |
| `hushbriar_guild_ledger_found` | `SCENE_HUSHBRIAR_LEDGER` | `hushbriar_elara_resolution` | Loading-dock ledger clue found. | public | optional_clue |
| `hushbriar_guild_trusted` | `SCENE_THIEVES_HIDEOUT` | `hushbriar_elara_resolution` | Guild trust earned enough to reach Elara cooperatively. | public | story_progression |
| `hushbriar_guild_hostile` | `SCENE_THIEVES_HIDEOUT` | `hushbriar_elara_resolution` | Guild relationship turned openly hostile and future Elara access must come through breach or coercion, not cooperation. | public | story_progression |
| `elara_met` | `SCENE_ELARA_HIDEAWAY` | `hushbriar_elara_resolution` | Elara personally encountered. | spoiler_sensitive | story_progression |
| `elara_choice_spared` | `SCENE_ELARA_STONE_DECISION` | `hushbriar_elara_resolution` | Party committed to keeping Elara alive rather than spending her blood immediately. | spoiler_sensitive | story_progression |
| `elara_choice_sacrifice_declared` | `SCENE_ELARA_STONE_DECISION` | `hushbriar_elara_resolution` | Party declared that Elara's divinity may need to be spent to wake the Stone. | spoiler_sensitive | story_progression |
| `elara_choice_deferred_by_aodhan` | `SCENE_ELARA_AODHAN_WARNING` | `hushbriar_elara_resolution` | Aodhan still holds the Stone, delaying the choice under direct pursuit pressure. | spoiler_sensitive | one_time_outcome |
| `processing_truth_learned` | `SCENE_HUSHBRIAR_PROCESSING_REVELATION` | `hushbriar_elara_resolution` | Alderic's Hushbriar processing plan and Soul Mill sorting were learned from the guild. | spoiler_sensitive | story_progression |

## Scene Memory

| Key | Owner | Thread | Meaning | Sensitivity | Semantics |
| --- | --- | --- | --- | --- | --- |
| `silverthorn_general_store_seen` | `SCENE_SILVERTHORN_GENERAL_STORE` | `silverthorn_prep` | One-time general store intro played. | public | revisit_memory |
| `silverthorn_blacksmith_seen` | `SCENE_SILVERTHORN_BLACKSMITH` | `silverthorn_prep` | One-time blacksmith intro played. | public | revisit_memory |
| `silverthorn_rumors_heard` | `SCENE_RUSTY_BLADE_RUMORS` | `silverthorn_prep` | Rumor scene shifts to harsher repeat text. | rumor_only | revisit_memory |
| `silverthorn_temple_counsel` | `SCENE_SILVERTHORN_TEMPLE_COUNSEL` | `silverthorn_prep` | Temple counsel has been visited. | public | revisit_memory |
| `silverthorn_notice_whisperwood` | `SCENE_SILVERTHORN_NOTICE_WHISPERWOOD` | `silverthorn_prep` | Whisperwood panic notice was read. | rumor_only | revisit_memory |
| `silverthorn_gate_captain_seen` | `SCENE_SILVERTHORN_GATE_CAPTAIN` | `silverthorn_prep` | Gate captain revisit text is now active. | public | revisit_memory |
| `sporefall_street_search_seen` | `SCENE_SPOREFALL_STREET_SEARCH` | `eoin_thread` | Delayed street-search beat shifts to revisit text. | public | revisit_memory |

## Guardrails

- Do not create a second key for an already-documented meaning.
- Do not use `sceneMemory` for major route advancement when a flag is more explicit.
- Do not use a public-sounding clue key to carry hidden-truth meaning.
- If a key changes what the player can know, its sensitivity must be documented.
- UI-only `sceneMemory` keys may stay outside this registry only if they do not affect story availability, rewards, lore, or route state.

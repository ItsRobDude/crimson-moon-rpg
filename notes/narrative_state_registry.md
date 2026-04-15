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

## Flags

| Key | Owner | Thread | Meaning | Sensitivity | Semantics |
| --- | --- | --- | --- | --- | --- |
| `silverthorn_temple_ward_taken` | `SCENE_SILVERTHORN_TEMPLE_COUNSEL` | `silverthorn_prep` | Temple ward already resolved. | public | one_time_outcome |
| `silverthorn_gate_route_briefed` | `SCENE_SILVERTHORN_GATE_CAPTAIN` | `silverthorn_prep` | Route-study reward already resolved. | public | one_time_outcome |
| `sporefall_eoin_glimpsed` | `SCENE_ARRIVAL_WHISPERWOOD` | `eoin_thread` | Eoin sensed nearby before full meeting. | public | story_progression |
| `sporefall_eoin_met` | `SCENE_MEET_EOIN` | `eoin_thread` | First direct Eoin encounter happened. | public | story_progression |
| `sporefall_eoin_talked` | `SCENE_EOIN_TALK` | `eoin_thread` | Eoin's first major conversation is complete. | public | story_progression |
| `sporefall_eoin_fed` | `SCENE_MEET_EOIN` / `SCENE_EOIN_TALK` | `eoin_thread` | Player fed Eoin. | public | optional_clue |
| `sporefall_eoin_treated` | `SCENE_MEET_EOIN` / `SCENE_EOIN_TALK` | `eoin_thread` | Player treated Eoin. | public | optional_clue |
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
| `sporefall_north_route_open` | `SCENE_SPOREFALL_NORTH_ROUTE_DISCOVERED` | `north_skip_route` | Northern skip route opened. | public | story_progression |

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

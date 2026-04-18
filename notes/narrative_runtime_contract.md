# Narrative Runtime Contract

This note is for contributors and coding agents working on story flow, runtime-authored scene variants, and spoiler-sensitive Act I content.

Use this contract together with:

- `dnd-original-campaign-draft`
- `notes/act1_canon_internal.md`
- `notes/story_timeline_model.md`
- `notes/campaign_route_status.md`
- `notes/narrative_state_registry.md`
- `data/narrativeSafety.js`
- `data/storyTimeline.js`

## Source Of Truth Layers

Use these layers in this order:

1. `dnd-original-campaign-draft`
   Route order, character purpose, city usage, and mission spine.
2. `notes/act1_canon_internal.md`
   Contributor-only hidden truth, spoiler boundaries, and identity guardrails.
3. `notes/story_timeline_model.md` and `notes/campaign_route_status.md`
   Approved route ordering, route class, and playable-vs-dormant status.
4. `data/scenes.js`
   Stable player-facing authored prose, scene ids, and baseline choice structure.
5. `data/storyTimeline.js`
   Event availability, act progression, and scene safety policy metadata.
6. `game.js`
   Runtime variation, soft-gating, fallback selection, and systemic choice assembly.

Do not let `game.js` become the only place where a scene's meaning, prerequisite, or spoiler boundary exists.

If these sources conflict, tighten back toward the campaign draft and route-status note unless Rob has explicitly overruled them.

## Route Governance

Before adding, restoring, or expanding a route, check `notes/campaign_route_status.md`.

Only these route classes are valid:

- `canonical`
- `alternate_aligned`
- `dormant`
- `retired`

Rules:

- `canonical` routes are the draft-backed main path and must remain playable.
- `alternate_aligned` routes may be playable, but only if they preserve draft order, named locations, and NPC identity/goals.
- `dormant` and `retired` routes must not be normal hub destinations or default location returns.
- if a branch is incomplete or not yet canon-aligned, it must be documented as `dormant` or `retired` before any further runtime expansion.

Any new side quest or alternate route must:

- start from a canonical mission beat
- stay inside named locations already established by draft or canon notes
- use only canon-named NPCs in ways consistent with their identity and goals
- be added to `notes/campaign_route_status.md` before it becomes reachable

## NPC Identity Safety

NPC identity is a canon safety issue, not a flavor suggestion.

Contributors must not:

- change an established NPC's core personality
- change an established NPC's long-term goals
- rewrite an NPC into a different route role than the draft assigns
- use alternate routes as an excuse to soften, flatten, or repurpose an NPC into a generic helper

## Where Player-Facing Text Should Live

Prefer `data/scenes.js` for:

- stable prose
- canonical baseline scene text
- stable choice ids and labels
- repeatable scene structure

Use runtime mutation in `game.js` only for:

- time-of-day variants
- revisit shortening
- item / trait / status dependent variants
- soft-gating or route degradation
- one-time clue removal after rewards are claimed
- assembling systemic choices from existing state

If a runtime branch adds new stable lore paragraphs or becomes the only readable version of a scene, mark it as a migration candidate and move the stable prose back toward `data/scenes.js` in a later pass.

## Tone Safety

Tone is a narrative safety issue, not just a style preference.

Before shipping authored prose changes or large runtime variants, check them against `notes/narrative_tone_guide.md`.

Important expectations:

- runtime variants may adapt or shorten a scene, but should preserve its dread, grief, bodily stakes, and social fear
- do not let runtime-authored text sand off death, rot, injury, panic, or occupied pressure that the authored baseline establishes
- do not let a runtime branch become cleaner, tidier, or more generic than the baseline scene just because it is state-aware
- if a scene class depends on a specific register such as Sporefall body horror or Archives penitential severity, keep that register intact across variants

## Spoiler Discipline

`notes/act1_canon_internal.md` is internal only.

Before a canonical reveal point, player-facing Act I text must not directly explain:

- Ciara's role in the hidden mechanism
- the forming Underdark portal
- Liam's tainted ritual role
- Aodhan's full containment/stasis action

Before reveal, scenes may only imply hidden truth through:

- rumor
- grief
- missing people
- failed ritual aftermath
- body horror
- contradictory survivor testimony
- records that stop short of explanation

If a player reaches a scene in unusual order, prefer reduced-information variants over explicit explanation.

## Soft-Gating Vocabulary

Use only these fallback terms when documenting or implementing out-of-order behavior:

- `redirect`
  Send the player back toward the canonical next meaningful scene.
- `degrade`
  Allow the scene, but with reduced information, reduced reward surface, or shorter revisit text.
- `delay`
  Let the player miss something for one beat, then route them back into it quickly.
- `hide_choice`
  Keep the scene visible, but remove the choice that would reveal or re-award too much.
- `show_rumor_only_version`
  Allow the scene text, but keep it at rumor / panic / implication level.

## Required Scene-State Inputs

When adding or revising runtime-authored scene logic, document and think in this shape:

- story event requirements
- flag requirements
- scene memory requirements
- revisit states
- fallback mode
- spoiler sensitivity
- one-time reward / clue semantics

This does not require a new engine yet. It does require contributors to stop encoding those decisions only in prose branches.

## Story-Critical State Rules

Any new story-critical `gameState.flags.*` key or `sceneMemory` key must:

1. use a narrow, thread-owned name
2. be added to `notes/narrative_state_registry.md`
3. be added to `data/narrativeSafety.js`
4. avoid overlapping with an existing key that means the same thing

Use:

- `story_progression` for route advancement
- `optional_clue` for non-mandatory informational beats
- `revisit_memory` for flavor / revisit variation
- `one_time_outcome` for rewards or consumed clue surfaces

## Migration Rule

This repo is in a docs-first stabilization pass, not a large runtime rewrite.

From this point forward:

- new stable authored prose should prefer `data/scenes.js`
- runtime mutation should stay limited to state-aware variation and fallback selection
- branches that carry too much stable story text should be marked as migration candidates

Current migration candidates:

- Silverthorn rumor and prep variants
- early Sporefall hub variants
- Eoin branch state handling
- retired Hushbriar guild-first and Elara holdfast branches

## Validation Expectations

Any narrative safety work should preserve:

- no dead-end critical scenes
- no duplicate clue rewards on revisit
- no early-route Neala / Liobhan appearances
- no hidden-truth spoiler terms in early Silverthorn or early Sporefall runtime text
- no story-critical flag or memory key outside the registry
- no tonal drift that replaces concrete horror with generic mood language in protected scenes
- no runtime variant that strips physical aftermath, social fear, or grief from the authored baseline
- no protected NPC voice drifting into polished exposition, modern helper phrasing, or emotionally detached summary
- no dormant or retired route becoming the active hub/default destination
- no new side route becoming playable without a matching `notes/campaign_route_status.md` entry

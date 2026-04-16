# AGENTS Guide

## Purpose

This file is for coding agents and contributors working in this repo.

The goal is to help you:

- understand the intended game quickly
- make focused changes without unnecessary edits
- avoid narrative, pacing, and systems drift
- preserve the project's current direction as a sandbox visual novel with RPG elements

## Project Identity

`Prophecies: Crimson Moon` is not a generic RPG hub crawler.

Treat it as:

- a sandbox visual novel first
- a time- and event-sensitive narrative game
- a deep 5e-inspired RPG with near-tabletop ambitions
- a true positional combat game during battle scenes

That means the runtime should prioritize:

- scene flow
- dialogue/state changes
- time progression
- event windows and story gating
- smooth transitions into combat when events demand it
- systemic consistency between narrative play and combat rules

Do not optimize the game toward map-first exploration, filler traversal, or static town menus unless explicitly asked.

Do not assume "VN-first" means "rules-light." The intended direction is:

- narrative-first structure
- but as close to tabletop 5e mechanics as is reasonably practical in implementation
- with battle scenes eventually using a battlegrid and positional logic rather than abstract menu combat

## Canonical Opening

The canonical start flow is:

1. Main menu
2. Character creation
3. `SCENE_BRIEFING`
4. Alderic's briefing in Silverthorn
5. Preparation in Silverthorn
6. Departure through the eastern gate into Shadowmire / Whisperwood

Do not casually change this sequence.

If you edit the opening, preserve:

- Alderic as the narrative anchor
- Silverthorn as the preparation sandbox
- a clear sense of "what happens next"
- no abrupt scene skipping

## Core Narrative Rule

When a player goes somewhere, they should immediately receive the next meaningful options unless a dialogue beat, event, or combat interrupts them.

Avoid:

- dead-end locations
- bare placeholder scenes with no follow-up choice
- jumps that imply time or travel without handling them in-state
- reusable scenes that accidentally re-award relationship, gold, or quest progress

## Time and Event Sensitivity

This repo now includes lightweight timeline support in `data/gameState.js`.

Current expectations:

- Silverthorn actions can advance time
- time of day matters
- event/stateful variants are preferred over static repeated text
- revisits should adapt based on prior choices and timing

When adding or editing story content:

- ask whether the action should consume time
- ask whether the scene should vary by time-of-day
- ask whether the scene should be one-time, repeatable, or degrade into a shorter revisit version
- ask whether missing the scene should adapt the story instead of dead-ending it
- ask whether statuses, injuries, blessings, curses, intoxication, fear, or fatigue should affect non-combat rolls in the scene

## Lore Sources To Read First

Before changing major story flow, timing, or city content, check:

- `dnd-original-campaign-draft`
- `notes/story_timeline_model.md`
- `readme.txt`
- `notes/narrative_tone_guide.md` for prose-tone guardrails and anti-drift rules
- `notes/act1_canon_internal.md` for contributor-only canon truths and spoiler boundaries
- `notes/narrative_runtime_contract.md` for runtime-authoring and spoiler-discipline rules
- `notes/narrative_state_registry.md` for story-critical flags and scene-memory ownership

Use `dnd-original-campaign-draft` as the best current reference for:

- a typical campaign route
- intended story rhythm
- likely event ordering
- how major choices might affect progression

Do not invent contradictory lore if an existing source already answers it.

## Internal Canon And Spoiler Discipline

`notes/act1_canon_internal.md` exists so contributors and coding agents do not accidentally flatten or contradict the hidden truth of Act I.

Use it for:

- place-identity clarity such as `Whisperwood` vs `Sporefall`
- what Silverthorn does and does not know at the opening
- character guardrails for `Aodhan`, `Eoin`, `Neala`, and `Liobhan`
- protected emotional set pieces that should not be reduced to quest utility

Do not:

- expose those truths in player-facing codex text, UI copy, early rumors, or scene narration before the story has earned them
- let internal canon notes override the intended discovery pacing
- move `Neala` or `Liobhan` into the normal early route

Current naming rule:

- present-tense horror scenes can use `Sporefall`
- memory fragments, older records, and pre-ritual references should usually use `Whisperwood`

## Tone Preservation

Before changing player-facing prose, dialogue, or choice labels, read `notes/narrative_tone_guide.md`.

The intended register is hybrid grim realism:

- grounded, desperate, and physically concrete
- death-haunted rather than merely "dark"
- explicit about bodily aftermath when the story earns it
- willing to keep brief wonder, but only as contrast inside an ugly world

Do:

- keep death visible in scene dressing where the campaign draft establishes it
- keep body horror concrete rather than coy, vague, or euphemistic
- preserve dread in quiet scenes instead of flattening them into neutral transit beats
- let grief, exhaustion, suspicion, prayer, hunger, injury, and social fear shape the prose
- prefer concrete physical cues over repeated abstract dread words
- keep choice labels diegetic and emotionally situated rather than menu-flat

Do not:

- sanitize ugliness that the draft treats as part of the world's lived texture
- replace specific horror with generic epic-fantasy mood language
- let NPCs sound like modern, clever assistants or emotionally polished lore dispensers
- overuse abstract filler such as "ominous," "mysterious," or "dark presence" where physical evidence would be stronger
- turn grim scenes into generic labels like `Continue`, `Proceed`, `Investigate Area`, or other gamey fallback wording

When adapting material from `dnd-original-campaign-draft`, translate it into authored prose rather than copying its table-facing structure, but do not flatten its brutality, bodily stakes, or emotional weight.

This rule applies to secondary surfaces too:

- shops, notice boards, prayer beats, inn common rooms, quarantine returns, clue rooms, and route-support scenes are not exempt from tone discipline
- optional scenes may run quieter than set pieces, but they should still carry strain, fear, aftermath, scarcity, or hunted pressure
- do not let low-combat or service-oriented scenes read like neutral RPG nodes dropped into a more serious game

## Narrative Runtime Safety

Use `notes/narrative_runtime_contract.md` before adding or revising large runtime-authored scene branches.

Important rules:

- stable authored prose belongs in `data/scenes.js` whenever practical
- runtime mutation in `game.js` should stay limited to state-based variation, fallback selection, and systemic choice assembly
- spoiler-sensitive lore should not be introduced only in runtime prose branches
- every new story-critical flag or scene-memory key must be documented in `notes/narrative_state_registry.md` and mirrored in `data/narrativeSafety.js`
- use the documented fallback vocabulary: `redirect`, `degrade`, `delay`, `hide_choice`, `show_rumor_only_version`

## Key Files

Start here before editing:

- `game.js`
  - UI wiring
  - scene runtime
  - menu/options flow
  - Silverthorn runtime scene variants
- `combat.js`
  - turn flow
  - battle action resolution
  - grid-backed combat state
- `data/gameState.js`
  - persistent state
  - save/load
  - timeline
  - scene memory
- `data/mechanics.js`
  - unified effect/modifier engine
  - layered stats
  - derived combat and narrative values
- `battlegrid.js`
  - positional combat model
  - targeting, adjacency, and movement helpers
- `data/scenes.js`
  - authored scene definitions
  - canonical story text and choices
- `data/backgrounds.js`
  - background packages for skills, tools, and languages
- `data/storyTimeline.js`
  - act/event progression model
  - scene-triggered story advancement
- `data/narrativeSafety.js`
  - machine-readable narrative safety vocabulary
  - spoiler-term list
  - story-critical flag and scene-memory registry mirror
- `notes/combat_grid_model.md`
  - current positional combat assumptions
  - battlegrid guardrails
- `data/shops.js`
  - city store inventories
- `index.html`
  - HUD/modals/menu structure
- `styles.css`
  - UI presentation
- `e2e/*.test.js` and `__tests__/*.test.js`
  - current behavior expectations

## Editing Guardrails

Make the smallest change that fully solves the task.

Do:

- preserve existing systems unless they directly conflict with the task
- prefer extending current data/state patterns over adding parallel systems
- keep Silverthorn content event-aware
- keep scene transitions readable and explicit
- preserve save compatibility where practical
- add tests or validations when changing narrative gating, critical flags, or spoiler-sensitive route logic

Do not:

- rewrite large unrelated areas "while you're here"
- replace authored scene text with generic fantasy filler
- add rewards or relationship gains to repeatable revisit loops unless intentional
- add locations that exist only as flavor with no meaningful next step
- flatten VN-style pacing into pure RPG exploration logic
- create undocumented one-off story flags or scene-memory keys
- let runtime branches become the only place a scene's prerequisite or spoiler boundary is expressed

## Silverthorn-Specific Rules

Silverthorn is a story hub, not just a shopping hub.

When editing Silverthorn:

- locations should feel like event surfaces
- common destinations should exist, but they must support pacing
- repeated visits should acknowledge time and prior activity
- departure from the city should feel like a commitment, not a random teleport
- early rumor surfaces should stay focused on relic anxiety, missing Whisperwood, political distrust, and looming war pressure without dumping hidden ritual truth

Good additions:

- places that reveal information
- places that prepare the player
- places that reflect time pressure
- scenes that hint at future threads without derailing the current act

Weak additions:

- generic "go here / go back" branches with no consequence
- shops with no narrative framing
- flavor scenes that do not update state, time, or knowledge

## Sporefall Guardrails

After the blackout, the game should settle into its grim long-form register.

When editing early Sporefall:

- preserve revelation pacing; implication should arrive before explanation
- let body horror be explicit, but do not blurt hidden cause/mechanism before canonical discovery points
- keep `Eoin`, `Moonwell / Aodhan by the bodies`, and `Lament Hill / the witch` emotionally heavy and carefully authored
- treat scene, item, status, and trait checks as one shared systemic layer rather than separate "story mode" logic

## Combat and RPG Elements

Combat matters, but it should serve local stakes.

Prefer:

- combat as consequence, interruption, or payoff
- story/event state deciding global progression
- battle scenes that honor 5e logic as closely as practical
- one shared effect/status model for combat and narrative rolls
- true positional combat direction, not permanently abstract combat

Current intended combat direction:

- battle screens will use a battlegrid
- avatar placeholders are acceptable early while art is incomplete
- assume flat ground by default unless a scene explicitly introduces terrain
- positioning, movement, reach, adjacency, and targeting should eventually be real mechanics
- tile size should remain authoritative at 5 feet unless a battle scene explicitly overrides it
- tile hazards/effects should be implemented through the shared grid/effect systems, not one-off combat hacks

Avoid:

- adding combat just to make a scene feel game-like
- letting combat logic replace narrative gating
- treating combat as permanently abstract if the change would block battlegrid goals
- implementing combat-only buffs/debuffs that cannot also function in dialogue, travel, or social checks

## Rules Fidelity

The project is not targeting a vague "5e flavor."

Target:

- as close to tabletop 5e as reasonably possible for a digital VN/RPG hybrid

That means future work should generally move toward:

- proper temporary vs permanent stat handling
- reusable effect and condition systems
- action, bonus action, reaction, and movement support
- class/race features with real mechanical impact
- spell and condition logic that works both in battle and outside it

## Testing and Verification

If you change:

- menus or bootstrap flow, check `e2e/bootstrap_resilience.test.js`
- character creation or save/load flow, check `e2e/character_creation.test.js` and `e2e/load_game.test.js`
- timeline/state logic, add or update unit tests in `__tests__`
- authored narrative tone, dialogue voice, or grim-scene choice wording, check and update the targeted narrative tests in `__tests__/narrative_tone.test.js` and related narrative suites

When tests cannot be run, say so clearly and summarize what was verified by source inspection instead.

## When Unsure

Ask:

1. Does this support the sandbox VN goal?
2. Does this preserve the canonical Silverthorn opening?
3. Does this create unnecessary drift from the campaign draft or timeline notes?
4. Does this scene give the player a clear next step?
5. Does this introduce repeatable exploits or contradictory pacing?

If the answer to any of those is unclear, stop and tighten the change before expanding scope.

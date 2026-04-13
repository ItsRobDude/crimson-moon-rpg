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
- a tactical RPG second

That means the runtime should prioritize:

- scene flow
- dialogue/state changes
- time progression
- event windows and story gating
- smooth transitions into combat when events demand it

Do not optimize the game toward map-first exploration, filler traversal, or static town menus unless explicitly asked.

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

## Lore Sources To Read First

Before changing major story flow, timing, or city content, check:

- `dnd-original-campaign-draft`
- `notes/story_timeline_model.md`
- `readme.txt`

Use `dnd-original-campaign-draft` as the best current reference for:

- a typical campaign route
- intended story rhythm
- likely event ordering
- how major choices might affect progression

Do not invent contradictory lore if an existing source already answers it.

## Key Files

Start here before editing:

- `game.js`
  - UI wiring
  - scene runtime
  - menu/options flow
  - Silverthorn runtime scene variants
- `data/gameState.js`
  - persistent state
  - save/load
  - timeline
  - scene memory
- `data/scenes.js`
  - authored scene definitions
  - canonical story text and choices
- `data/storyTimeline.js`
  - act/event progression model
  - scene-triggered story advancement
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

Do not:

- rewrite large unrelated areas "while you're here"
- replace authored scene text with generic fantasy filler
- add rewards or relationship gains to repeatable revisit loops unless intentional
- add locations that exist only as flavor with no meaningful next step
- flatten VN-style pacing into pure RPG exploration logic

## Silverthorn-Specific Rules

Silverthorn is a story hub, not just a shopping hub.

When editing Silverthorn:

- locations should feel like event surfaces
- common destinations should exist, but they must support pacing
- repeated visits should acknowledge time and prior activity
- departure from the city should feel like a commitment, not a random teleport

Good additions:

- places that reveal information
- places that prepare the player
- places that reflect time pressure
- scenes that hint at future threads without derailing the current act

Weak additions:

- generic "go here / go back" branches with no consequence
- shops with no narrative framing
- flavor scenes that do not update state, time, or knowledge

## Combat and RPG Elements

Combat matters, but it should serve local stakes.

Prefer:

- combat as consequence, interruption, or payoff
- story/event state deciding global progression

Avoid:

- adding combat just to make a scene feel game-like
- letting combat logic replace narrative gating

## Testing and Verification

If you change:

- menus or bootstrap flow, check `e2e/bootstrap_resilience.test.js`
- character creation or save/load flow, check `e2e/character_creation.test.js` and `e2e/load_game.test.js`
- timeline/state logic, add or update unit tests in `__tests__`

When tests cannot be run, say so clearly and summarize what was verified by source inspection instead.

## When Unsure

Ask:

1. Does this support the sandbox VN goal?
2. Does this preserve the canonical Silverthorn opening?
3. Does this create unnecessary drift from the campaign draft or timeline notes?
4. Does this scene give the player a clear next step?
5. Does this introduce repeatable exploits or contradictory pacing?

If the answer to any of those is unclear, stop and tighten the change before expanding scope.

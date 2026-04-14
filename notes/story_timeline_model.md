# Crimson Moon Story Timeline Model

This repo now treats the Silverthorn opening as canon:

1. `New Game`
2. Character creation
3. `SCENE_BRIEFING` in Alderic's chamber

The project goal is a sandbox visual novel first, with deep 5e combat and rules support as an important secondary mode. That means the runtime should prioritize:

* Scene presentation and dialogue choices
* Story-event availability and timing
* Smooth transitions into combat
* Lightweight travel/map support rather than map-first exploration
* Rules consistency between combat and non-combat scenes

## Canonical Route

### Act I - Briefing and Departure
* Alderic briefs the party in Silverthorn.
* The player can inspect him, ask follow-up questions, and prepare before leaving.
* The mission thread becomes active once the party departs Silverthorn.

### Act II - Sporefall Revelations
* The road through Shadowmire should tighten into a specific sequence:
  Shadowmire approach -> dying birds -> roadside corpse / coughing survivor beat -> spore blackout -> Sporefall arrival.
* Player-facing narration after the blackout should call the borough `Sporefall`, while still acknowledging it was once Whisperwood Borough.
* Early Sporefall should stay small and oppressive rather than opening into broad free-roam immediately.
* Eoin is the first major emotional reveal and should trigger very early on arrival through a low-DC Perception beat.
* Failing that first Perception check should delay Eoin by only one nearby exploration step, not let the player miss him entirely.
* After meeting Eoin, the first sandbox slice should open directionally:
  west toward the Cathedral of Bone, east toward Aodhan's home, and north toward the viable-but-costly skip route.
* Cathedral / manor / north-route investigation should point toward Aodhan and the Stone of Oblivion without softlocking players who push north first.

### Act III - Shattered Routes
* The Aodhan confrontation is the major hinge point.
* After that moment, the world opens toward Durnhelm and Lament Hill.
* This is where the sandbox should feel wider without losing the central timeline.

### Act IV - Lament Hill Truth
* Aine clarifies the Mark of Ciara, the cost of the stone, and the danger of Alderic.
* The Forbidden Archives expose the Alderic/Ciara alliance and the divinity requirement.

### Act V - Hushbriar Endgame
* Hushbriar becomes the demigod and guild-focused sandbox.
* The final pressure is no longer "where do we go?" but "what do we do with the stone before the world collapses further?"

## Event Gating Rules

Use story events as the main gate, not the map:

* A location can be visible before its critical event is available.
* Important scenes should check story-event availability or completion before exposing the next branch.
* Missing a beat should usually adapt the route rather than dead-end the story.
* Combat should resolve local stakes, while the timeline system decides when global stakes move forward.
* Status effects, injuries, blessings, curses, and other modifiers should eventually be able to influence dialogue and skill scenes, not just combat.

## Combat Direction

The intended combat destination is:

* true positional combat
* battlegrid scenes rather than permanently abstract menu combat
* avatar placeholders are acceptable until final art exists
* flat ground can be assumed by default unless a scene introduces terrain deliberately
* the rules layer should move toward near-tabletop 5e fidelity where practical

## Current Runtime Direction

The new `data/storyTimeline.js` module is a lightweight source of truth for:

* Canonical start scene
* Major acts
* Event status (`locked`, `available`, `active`, `completed`, `missed`)
* Scene-triggered event progression

This is groundwork, not a full narrative rewrite. The intent is to make future scene cleanup safer by giving the repo one clear model for "what story state are we in right now?"

The current Act II target is the `first Sporefall sandbox slice`, not the entire borough. Future additions should preserve:

* runtime-authored borough variants
* directional hubs as event surfaces
* one-time clue discovery flags
* fair-but-costly skip routes
* Eoin as the early witness/anchor before deeper branching

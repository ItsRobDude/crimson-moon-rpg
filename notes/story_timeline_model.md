# Crimson Moon Story Timeline Model

This repo now treats the Silverthorn opening as canon:

1. `New Game`
2. Character creation
3. `SCENE_BRIEFING` in Alderic's chamber

The project goal is a sandbox visual novel first, with tactical 5e-style battles as an important secondary mode. That means the runtime should prioritize:

* Scene presentation and dialogue choices
* Story-event availability and timing
* Smooth transitions into combat
* Lightweight travel/map support rather than map-first exploration

## Canonical Route

### Act I - Briefing and Departure
* Alderic briefs the party in Silverthorn.
* The player can inspect him, ask follow-up questions, and prepare before leaving.
* The mission thread becomes active once the party departs Silverthorn.

### Act II - Sporefall Revelations
* The road through Shadowmire turns into the Sporefall transition.
* Whisperwood becomes a horror-space under the crimson moon.
* Eoin is the first major emotional reveal.
* Cathedral / manor investigation points toward Aodhan and the Stone of Oblivion.

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

## Current Runtime Direction

The new `data/storyTimeline.js` module is a lightweight source of truth for:

* Canonical start scene
* Major acts
* Event status (`locked`, `available`, `active`, `completed`, `missed`)
* Scene-triggered event progression

This is groundwork, not a full narrative rewrite. The intent is to make future scene cleanup safer by giving the repo one clear model for "what story state are we in right now?"

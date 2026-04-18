# Crimson Moon Story Timeline Model

This repo treats the campaign draft as the hard authority for route order unless Rob explicitly overrides it.

The Silverthorn opening remains canon:

1. `New Game`
2. Character creation
3. `SCENE_BRIEFING` in Alderic's chamber

The project goal is a sandbox visual novel first, with deep 5e combat and rules support as an important secondary mode. That means the runtime should prioritize:

* Scene presentation and dialogue choices
* Story-event availability and timing
* Smooth transitions into combat
* Lightweight travel/map support rather than map-first exploration
* Rules consistency between combat and non-combat scenes

Use this note together with:

- `dnd-original-campaign-draft`
- `notes/act1_canon_internal.md`
- `notes/narrative_runtime_contract.md`
- `notes/campaign_route_status.md`
- `notes/route_packets/`

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
* Finishing a strong Sporefall clue should open the Durnhelm lead, not jump directly into Hushbriar.

### Act III - Shattered Routes
* The next canonical push is north toward Durnhelm.
* Durnhelm confirms the Stone of Oblivion, Aodhan's passage, and the need to seek the witch on Lament Hill.
* This is where the route widens without abandoning the draft-backed pursuit of Aodhan.

### Act IV - Lament Hill Truth
* Aine clarifies the Mark of Ciara, the cost of the stone, and the danger of Alderic.
* Aine opens two draft-safe late leads: Hushbriar and the Forbidden Archives.
* The Forbidden Archives are a truth branch, not the only path forward.
* The archives confirm the divinity requirement and may sharpen the Alderic/Ciara truth, but they do not replace Hushbriar's role.

### Act V - Hushbriar Endgame
* Hushbriar becomes the late occupied-town route: gates, inn, Fionnlagh, screams, Moonwell, and Aodhan's set piece.
* Neala and Liobhán belong to this late Hushbriar route, not to early Sporefall or Silverthorn content.
* Elara, processing, Soul Mill, Solasmór, and similar extensions may exist only as documented later routes that do not displace the canonical Hushbriar/Moonwell spine.
* The final pressure is no longer "where do we go?" but "what do we do with the stone and the demigod pressure before the world collapses further?"

## Route Governance

Route status and completion live in `notes/campaign_route_status.md`.

Use only these route classes:

* `canonical`
  Draft-backed main path.
* `alternate_aligned`
  Optional branch that stays inside draft order, named locations, and NPC identity.
* `dormant`
  Documented but incomplete or intentionally unreachable until aligned.
* `retired`
  Intentionally off-route until rewritten or deleted.

Any new side quest or alternate route must:

* start from a canonical mission beat
* stay inside named world locations already established by draft or canon notes
* use only canon-named NPCs in ways that preserve their existing identity and goals
* be documented in `notes/campaign_route_status.md` before it becomes playable
* include or update a matching design packet in `notes/route_packets/` if it is dormant, retired, or otherwise not yet fully implemented
* avoid conflicting with the campaign draft's suggested route order or outcome logic

## Event Gating Rules

Use story events as the main gate, not the map:

* A location can be visible before its critical event is available.
* Important scenes should check story-event availability or completion before exposing the next branch.
* Missing a beat should usually adapt the route rather than dead-end the story.
* Retired or dormant late-route branches must not become the normal hub/default destination.
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

This is route-governance groundwork, not permission to improvise new macro order.

Future additions should preserve:

* Eoin as the early witness/anchor
* Durnhelm before Lament Hill
* Aine as the hinge that opens Hushbriar and Archives
* Hushbriar / Moonwell as the canonical late-route town pressure set piece
* documented alternates only when they remain draft-safe and NPC-safe

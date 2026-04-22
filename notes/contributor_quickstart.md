# Contributor Quickstart

This note is a fast orientation guide for coding agents and contributors.

Use it when you need to get productive quickly without turning `AGENTS.md` into a catch-all.

This is not the lore bible. It is the shortest safe path to the right deeper docs.

## Start Here

Read these in order before making story, route, or tone-sensitive changes:

1. `AGENTS.md`
2. `readme.txt`
3. `notes/campaign_route_status.md`
4. `notes/act1_canon_internal.md`
5. `notes/narrative_runtime_contract.md`
6. `notes/story_timeline_model.md`
7. `notes/narrative_tone_guide.md`

If the change is mostly mechanics/combat-facing, also read:

- `notes/implementation_matrix.md`
- `notes/combat_grid_model.md`
- `notes/trustworthy_5e_lite_status.md`

## Current Slice Truths

These are the current implementation truths most likely to prevent drift:

- The canonical opening still begins with briefing and Silverthorn preparation. Do not replace that opening.
- `Silverthorn` is a pressured prep funnel. It may look open, but it should keep pushing the player toward preparation and the eastern road rather than toward city completionism.
- The current intended early road-party shape is `player + Lark + Kieran` before Shadowmire.
- `Eoin` is a shelter-bound, ghostlike survivor in Sporefall. He is not a recruitable companion, travel companion, or combat party member.
- If the gate-watch crackdown triggers, Silverthorn is hard-closed for the current stretch and the player is forced back toward the eastern road.
- After the player leaves `Silverthorn`, return attempts should be punished and redirected, not treated as a normal safe-town loop.
- `Alderic`'s opening briefing should stay practical: disappearances, `Whisperwood`, `Aodhan`, and civic fear. Do not leak `Ciara`, the deeper `Alderic` bargain, or late-route truth into early rumor surfaces.
- The quest log is mainly a memory aid. The map may show currently reachable travel, but neither surface should turn into a "next best move" planner.
- The `Forbidden Archives` stay hidden until `Aine` reveals them through trust or the player finds `Aodhan`'s compass.
- Use `Sporefall` for present-tense horror scenes and `Whisperwood` for older/pre-ritual references.
- Use the existing doc spelling `Viridian Forest`.

## Open These Files First By Task

- Story flow, scene routing, state-aware variants:
  - `data/scenes.js`
  - `game.js`
  - `data/storyTimeline.js`
  - `data/narrativeSafety.js`
- Combat and battlegrid work:
  - `combat.js`
  - `battlegrid.js`
  - `data/mechanics.js`
  - `notes/combat_grid_model.md`
- Character / companion / rules surfaces:
  - `data/companions.js`
  - `data/races.js`
  - `data/feats.js`
  - `notes/implementation_matrix.md`
- UI / onboarding / honesty work:
  - `index.html`
  - `styles.css`
  - `notes/ui_surface_audit.md`

## Common Failure Modes

Avoid these unless Rob explicitly asks for them:

- turning Silverthorn into a neutral shop hub instead of a pressured story hub
- making Silverthorn feel like a route-clearance checklist instead of a place the player is meant to leave
- turning Sporefall into broad free-roam too early
- turning the quest log, map, or helper copy into a route picker or "best move" adviser
- moving stable story meaning into `game.js` runtime text only
- softening grim scenes into generic fantasy mood writing
- treating partial mechanics as if they are fully supported
- restoring dormant or retired event routes as if they were full canon branches without a safe ambient entry and documented gating
- making companions feel like exposition tools instead of stressed people in-scene
- exposing `Ciara`, late `Alderic` truth, or the `Forbidden Archives` before the earned discovery window

## Quick Self-Check

Before shipping a change, ask:

1. Does this preserve the canonical opening and current route spine?
2. Does this keep tone grounded, concrete, and grim instead of gamey or generic?
3. Did I put stable prose and route meaning in the right place instead of hiding it in runtime logic?
4. Did I accidentally imply a broader mechanic, route, or companion role than the build really supports?
5. If this touches canon-sensitive content, did I check the internal canon and route-status notes first?

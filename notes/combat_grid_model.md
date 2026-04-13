# Combat Grid Model

This project now has an explicit positional combat foundation in `battlegrid.js` and `combat.js`.

## Current Assumptions

- 1 tile = 5 feet
- flat ground is the default
- combatants occupy a single tile
- Manhattan distance is the current distance metric
- line of sight can be blocked by terrain flags
- movement, adjacency, and opportunity attacks are tracked in combat state

## Current Runtime Shape

- `data/mechanics.js`
  - layered stats and effect resolution
- `battlegrid.js`
  - tiles, occupancy, line of sight, adjacency, movement cost, opportunity-attack hooks
- `combat.js`
  - initiative
  - turn flow
  - range checks
  - auto-closing for melee/touch actions when movement allows
  - grid-backed sneak attack adjacency checks

## Design Direction

The intended direction remains:

- near-tabletop 5e fidelity where practical
- true positional combat, not permanently abstract menu combat
- one effect/status system shared by combat and narrative play

## Guardrails

When extending combat:

- do not introduce a second parallel buff/debuff system
- keep battlegrid state authoritative for adjacency, range, and movement
- treat touch/melee actions differently from ranged targeting
- preserve compatibility with story-state and VN pacing rather than building an isolated tactics layer

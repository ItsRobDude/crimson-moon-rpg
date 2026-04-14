# Combat Grid Model

This project now has an explicit positional combat foundation in `battlegrid.js` and `combat.js`.

## Current Assumptions

- 1 tile = 5 feet
- flat ground is the default
- combatants occupy a single tile
- Manhattan distance is the current distance metric
- line of sight can be blocked by terrain flags
- movement, adjacency, and opportunity attacks are tracked in combat state
- tile size is authoritative for movement, spell range, and reach conversion
- tiles can carry hazards and persistent occupancy effects

## Current Runtime Shape

- `data/mechanics.js`
  - layered stats and effect resolution
- `battlegrid.js`
  - tiles, occupancy, line of sight, adjacency, movement cost, opportunity-attack hooks
  - tile effects and hazards
- `combat.js`
  - initiative
  - turn flow
  - range checks
  - auto-closing for melee/touch actions when movement allows
  - grid-backed sneak attack adjacency checks
  - tile hazard reconciliation on movement and turn boundaries

## Tile Effects

Tiles can now define hazards/effects such as:

- burning ground
- poison clouds
- sacred or cursed zones
- difficult terrain plus an attached status effect

Supported trigger timing:

- `enter`
- `turn_start`
- `turn_end`

Tile effects can:

- deal damage
- apply a normal status effect
- apply a custom modifier payload while occupied
- automatically remove tile-bound effects after leaving the tile

Example battlefield scene payload:

```js
battlefield: {
  width: 8,
  height: 6,
  tileSize: 5,
  terrain: [
    { x: 3, y: 2, difficult: true }
  ],
  effects: [
    {
      x: 4,
      y: 2,
      id: 'burning_ground',
      name: 'Burning Ground',
      triggers: ['enter', 'turn_start'],
      damage: '1d6',
      damageType: 'fire',
      statusEffectId: 'burning'
    }
  ]
}
```

## Design Direction

The intended direction remains:

- near-tabletop 5e fidelity where practical
- true positional combat, not permanently abstract menu combat
- one effect/status system shared by combat and narrative play

## Non-Visual Spell Assumptions

Until the battlegrid UI exposes facing and area templates directly, current combat uses two temporary authored approximations:

- `Burning Hands`
  - the chosen target anchors the cone
  - the spell affects that target plus nearby hostiles clustered within 5 feet of it, so long as they remain within the caster's 15-foot reach
- `Sleep`
  - the chosen target anchors the point of origin
  - the spell then affects creatures in that 20-foot local cluster in ascending current-HP order

These are temporary implementation assumptions, not the long-term substitute for true template targeting.

## Guardrails

When extending combat:

- do not introduce a second parallel buff/debuff system
- keep battlegrid state authoritative for adjacency, range, and movement
- treat touch/melee actions differently from ranged targeting
- preserve compatibility with story-state and VN pacing rather than building an isolated tactics layer

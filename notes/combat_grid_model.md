# Combat Grid Model

This project now has an explicit positional combat foundation in `battlegrid.js` and `combat.js`.

## Current Assumptions

- 1 tile = 5 feet
- flat ground is the default
- combatants occupy a single tile
- movement still uses simple square-grid pathing
- attack range, adjacency, and template resolution now use square-grid reach/template math instead of Manhattan-only checks
- line of sight can be blocked by terrain flags
- movement, adjacency, and opportunity attacks are tracked in combat state
- tile size is authoritative for movement, spell range, and reach conversion
- tiles can carry hazards and persistent occupancy effects

## Current Runtime Shape

- `data/mechanics.js`
  - layered stats and effect resolution
- `battlegrid.js`
  - tiles, occupancy, line of sight, adjacency, movement cost, opportunity-attack hooks
  - template builders for radius, cone, line, and cube effects
  - tile effects, zone effects, and cover hooks
- `combat.js`
  - initiative
  - turn flow
  - declarative spell targeting resolution
  - range checks
  - auto-closing for melee/touch actions when movement allows
  - grid-backed sneak attack adjacency checks
  - tile hazard reconciliation on movement and turn boundaries

## Tile And Zone Effects

Tiles and zones can now define hazards/effects such as:

- burning ground
- poison clouds
- sacred or cursed zones
- difficult terrain plus an attached status effect

Supported trigger timing:

- `enter`
- `turn_start`
- `turn_end`

Tile and zone effects can:

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
- tabletop-faithful rules as the baseline, with digital readability and target preview inspired by games like Baldur's Gate when literal tabletop procedure would slow the experience down
- combat presentation staying immersive and tonally consistent with the grim VN framing instead of becoming a detached tactics minigame
- serialization choices preserving a path toward trustworthy mid-combat saves later, even if that support is not fully exposed yet

## Current Template UI

Until the battle screen grows into a fuller visual grid widget, the current battle UI uses a lightweight preview contract:

- line/cone spells require facing selection before confirmation
- point/radius spells choose a center tile through the existing position-driven battle menu
- previews show affected tiles and caught creatures before confirmation
- movement now exposes reachable tiles with cost, threat, cover, and immediate melee-angle summaries before commitment

This is still a temporary UI layer, but the underlying spell resolution now uses real template geometry instead of spell-specific cluster approximations.

## Guardrails

When extending combat:

- do not introduce a second parallel buff/debuff system
- keep battlegrid state authoritative for adjacency, range, and movement
- treat touch/melee actions differently from ranged targeting
- preserve compatibility with story-state and VN pacing rather than building an isolated tactics layer
- prefer optional or choice-driven encounters over mandatory filler combat when authoring battle hooks

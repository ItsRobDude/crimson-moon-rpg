# Art Asset Backlog

This note tracks missing art risk, intentional placeholder usage, and the naming rules to follow before any future asset cleanup pass.

## Portrait References

Active code and data should not reference missing portrait files after this pass.

Legacy missing portrait targets replaced with the shared fallback:

- `portraits/fungal_beast_portrait.png`
- `portraits/spore_zombie_portrait.png`
- `portraits/choldrith_portrait.png`
- `portraits/wolf_portrait.png`
- `portraits/placeholder.png`

Current shared fallback target:

- `portraits/npc_male_placeholder_portrait.png`

## Intentional Placeholder Backgrounds

These scenes still use placeholder or reused backgrounds on purpose and need dedicated art later:

- Early `Hushbriar` scenes currently reuse `landscapes/silverthorn_market_avenue.png`
  - arrival
  - gates
  - prison capture / escape
  - town
  - inn
  - market
  - corrupted-town revisit
- `Lament Hill` currently reuses forest fallback art for the approach, cottage, and graves
- `Solasmor`, `Soul Mill`, and `Thieves Hideout` still use fallback backgrounds and remain future content passes

## Deferred Art Needs By Route

### Durnhelm

- Dedicated gate-approach art showing dead dwarven soldiers and ruined siege road
- Holy forge / shattered temple scene art for Cathal's reveal
- Optional market-ruin art for the damaged gate quarter

### Hushbriar

- Night gate checkpoint under occupation
- Prison corridor / cell interior
- Occupied town center with Silverthorn presence
- Briarwood Inn exterior / interior
- Corrupted Hushbriar late-state variant

### Later Branches

- Lament Hill cottage and graves
- Solasmor gates
- Soul Mill approach
- Thieves' guild hideout
- Real monster portraits for current combatants

## Naming Convention

Use these names for new assets. Do not rename current files in this pass.

- Portraits: `portraits/<character_or_enemy_slug>_portrait.<ext>`
- Landscapes: `landscapes/<location_or_scene_slug>.<ext>`
- Portrait placeholders: `portraits/placeholder_<type>.<ext>`
- Landscape placeholders: `landscapes/placeholder_<purpose>.<ext>`

Examples:

- `portraits/cathal_o_taidhg_portrait.png`
- `portraits/fungal_beast_portrait.webp`
- `landscapes/hushbriar_gate_night.png`
- `landscapes/durnhelm_holy_forge_ruins.png`
- `portraits/placeholder_humanoid.png`
- `landscapes/placeholder_town_night.png`

## Deferred Cleanup

The full rename pass is intentionally deferred.

Before any large-scale asset rename:

1. finish the missing-art backlog for critical path scenes
2. stabilize fallback targets
3. update references in one coordinated sweep
4. rerun automated reference validation after the rename

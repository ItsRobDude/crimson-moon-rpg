# 5e-Lite Implementation Matrix

This note is the practical source of truth for the currently shipped 5e-lite surface.

Statuses:

- `implemented`
- `partial`
- `data-only`
- `incorrect`
- `missing tests`

## Races

| Area | Status | Notes |
| --- | --- | --- |
| Human `versatile` | implemented | Bonus skill choice is wired into character creation and derived state. |
| Elf `darkvision` | implemented | Derived senses expose darkvision. |
| Elf `keen_senses` | implemented | Perception proficiency is granted through trait handling. |
| Elf `fey_ancestry` | partial | Charm-save advantage and magical-sleep immunity are wired; broader charm logic is still limited. |
| Elf `trance` | data-only | Present as lore/trait identity, not rest-behavior logic yet. |
| Dwarf `darkvision` | implemented | Derived senses expose darkvision. |
| Dwarf `dwarven_resilience` | partial | Poison resistance and poison-save advantage are wired; broader poison ecosystem is still narrow. |
| Dwarf `dwarven_combat_training` | implemented | Weapon proficiencies are granted through derived trait handling. |
| Dwarf `stonecunning` | partial | Tool choice hook exists in creation; no deeper stonework scene hooks yet. |

## Classes and Subclasses

| Area | Status | Notes |
| --- | --- | --- |
| Fighter base shell | implemented | Hit die, proficiencies, creation, level-up, and combat loop are present. |
| Fighter fighting styles | partial | Defense, Dueling, and Archery modifiers exist; broader weapon-state nuance is still light. |
| Fighter `Second Wind` | implemented | Resource, rest refresh, and healing action are wired. |
| Fighter `Action Surge` | implemented | Resource and extra-action grant are wired. |
| Champion `Improved Critical` | implemented | Crit range check uses 19-20 for champion weapon attacks. |
| Rogue base shell | implemented | Hit die, proficiencies, creation, and combat shell are present. |
| Rogue `Expertise` | implemented | Doubled proficiency multipliers are stored and used in rules math. |
| Rogue `Sneak Attack` | partial | Per-attacker turn gating, adjacency, finesse/ranged checks, and hidden/advantage support exist; fuller 5e edge cases are still incomplete. |
| Rogue `Cunning Action` | partial | Dash, disengage, and hide hooks exist; broader hide/object interaction depth is still incomplete. |
| Thief `Fast Hands` | data-only | Feature exists in data but object-use bonus-action depth is not complete. |
| Thief `Second-Story Work` | data-only | Defined in data only. |
| Wizard base shell | implemented | Spellbook/prepared flow, slots, and Arcane Recovery shell are present. |
| Wizard `Arcane Recovery` | implemented | Short-rest slot recovery is wired once per long rest. |
| Evocation `Sculpt Spells` | data-only | Defined in data only. |
| Cleric base shell | implemented | Prepared casting, slots, default subclass, and combat shell are present. |
| Cleric `Channel Divinity` | partial | Preserve Life style heal is wired; domain breadth is still narrow. |
| Life `Disciple of Life` | implemented | Healing bonus is applied to qualifying healing spells. |

## Spells

| Spell | Status | Notes |
| --- | --- | --- |
| `firebolt` | implemented | Attack-roll spell, range, and damage are wired. |
| `ray_of_frost` | implemented | Attack-roll damage and the temporary speed rider are wired. |
| `guidance` | partial | Buff effect exists; combat-disabled and scene use depends on authored hooks. |
| `sacred_flame` | implemented | Save-for-no-damage spell path is wired. |
| `cure_wounds` | implemented | Healing spell path is wired with Life bonus support. |
| `guiding_bolt` | implemented | Attack-roll damage and the next-hit advantage mark are wired. |
| `bless` | implemented | Concentration buff and current multi-target ally application are wired. |
| `shield_of_faith` | implemented | Concentration AC buff and recast concentration handoff are wired. |
| `magic_missile` | implemented | Auto-hit damage is wired and `Shield` now blocks it. |
| `burning_hands` | implemented | Save-based damage now resolves through a forward cone template with preview-before-confirm targeting. |
| `shield` | implemented | Reaction-only, AC boost, and `Magic Missile` block are wired. |
| `mage_armor` | implemented | Unarmored AC formula and long-rest duration are wired. |
| `sleep` | implemented | Auto-status, magical-sleep immunity, and HP-ordered radius-template targeting are wired. |

## Conditions and Statuses

| Area | Status | Notes |
| --- | --- | --- |
| `poisoned` | implemented | Attack/ability-check disadvantage is shared across combat and narrative rules. |
| `blessed` | implemented | Dice bonuses to attacks and saves are wired through the effect engine. |
| `spore_sickness` | implemented | CON-check and social penalties are wired through the shared effect engine. |
| `frightened` | partial | Shared attack/check penalties exist and source-aware “do not move closer” hooks are wired; fuller visibility/escape nuance is still incomplete. |
| `charmed` | partial | Shared penalties exist and hostile-targeting against the charmer is now blocked; broader social-scene source handling is still incomplete. |
| `burning` | partial | Tile/status integration exists; ongoing fire ecosystem is still small. |
| `prone` | partial | Own attacks, movement lock, and incoming melee/ranged attack modifiers are wired; standing and fuller battlefield nuance are still incomplete. |
| `incapacitated` | implemented | Effect exists, drops concentration, and locks actions/reactions in combat. |
| `restrained` | partial | Attack lock, speed zero, incoming-attack advantage, and DEX-save disadvantage are wired; escape flow is still incomplete. |
| `grappled` | partial | Speed-zero effect and source-maintained cleanup hooks exist; escape contest flow is not implemented. |
| `blinded` | partial | Attack, awareness, and sight-adjacent skill penalties plus incoming-attack advantage are wired; wider perception/targeting nuance is incomplete. |
| `deafened` | partial | Awareness penalty exists; broader spell/audio interactions are not implemented. |
| `unconscious` | partial | Applied/removed in combat and sleep flow, locks actions/reactions, and grants incoming advantage/melee crits; full death-save/downed-state model is not implemented. |
| Exhaustion 1-3 | partial | Current tiers exist, including attack/save penalties at tier 3; full 5e exhaustion ladder is not complete. |
| `antitoxin_guard` | implemented | Rest-of-day poison-save advantage is wired. |

## Reactions

| Area | Status | Notes |
| --- | --- | --- |
| Opportunity attacks | implemented | Grid-backed triggers and reaction consumption are wired. |
| `Shield` spell reaction | implemented | Weapon attacks, spell attacks, and `Magic Missile` are covered. |
| General reaction framework | partial | One shared reaction slot exists, but broader reaction content is still sparse. |

## Verification Notes

- Unit suites that matter most for this matrix:
  - `__tests__/mechanics.test.js`
  - `__tests__/combat.test.js`
  - `__tests__/game.test.js`
  - `__tests__/silverthorn_runtime.test.js`
  - `__tests__/sporefall_runtime.test.js`
  - `__tests__/timeline.test.js`
  - `__tests__/storyTimeline.test.js`
- E2E suites that matter most for bootstrap/canonical opening:
  - `e2e/bootstrap_resilience.test.js`
  - `e2e/character_creation.test.js`
  - `e2e/load_game.test.js`

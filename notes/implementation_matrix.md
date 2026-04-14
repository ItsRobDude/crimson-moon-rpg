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
| Rogue `Sneak Attack` | partial | Turn gating and adjacency/finesse checks exist; full 5e edge-case coverage is not complete. |
| Rogue `Cunning Action` | partial | Dash/disengage hooks exist; hide/object interactions are not fully realized. |
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
| `ray_of_frost` | partial | Attack-roll damage is wired; movement rider is not yet implemented. |
| `guidance` | partial | Buff effect exists; combat-disabled and scene use depends on authored hooks. |
| `sacred_flame` | implemented | Save-for-no-damage spell path is wired. |
| `cure_wounds` | implemented | Healing spell path is wired with Life bonus support. |
| `guiding_bolt` | partial | Attack-roll damage is wired; next-attack advantage rider is missing. |
| `bless` | partial | Concentration buff works for attacks/saves; multi-target breadth is not implemented. |
| `shield_of_faith` | partial | Concentration AC buff works; broader concentration edge-case coverage still limited. |
| `magic_missile` | implemented | Auto-hit damage is wired and `Shield` now blocks it. |
| `burning_hands` | partial | Save-based damage works; cone/template targeting is still abstracted. |
| `shield` | implemented | Reaction-only, AC boost, and `Magic Missile` block are wired. |
| `mage_armor` | implemented | Unarmored AC formula and long-rest duration are wired. |
| `sleep` | partial | Auto-status and magical-sleep immunity work; multi-target ordering is still simplified. |

## Conditions and Statuses

| Area | Status | Notes |
| --- | --- | --- |
| `poisoned` | implemented | Attack/ability-check disadvantage is shared across combat and narrative rules. |
| `blessed` | implemented | Dice bonuses to attacks and saves are wired through the effect engine. |
| `spore_sickness` | implemented | CON-check and social penalties are wired through the shared effect engine. |
| `frightened` | partial | Attack/social penalties exist; full position-based fear behavior is not implemented. |
| `charmed` | partial | Social penalty exists; broader hostile-targeting behavior is not implemented. |
| `burning` | partial | Tile/status integration exists; ongoing fire ecosystem is still small. |
| `prone` | partial | Ranged-attack penalty exists; melee advantage/disadvantage depth is incomplete. |
| `incapacitated` | partial | Effect exists and drops concentration; full action-lock enforcement is incomplete. |
| `restrained` | partial | Attack/speed penalties exist; attacker advantage/save interactions are incomplete. |
| `grappled` | partial | Speed-zero effect exists; escape contest flow is not implemented. |
| `blinded` | partial | Attack/awareness penalties exist; wider combat targeting implications are incomplete. |
| `deafened` | partial | Awareness penalty exists; broader spell/audio interactions are not implemented. |
| `unconscious` | partial | Applied/removed in combat and sleep flow; full death-save/downed-state model is not implemented. |
| Exhaustion 1-3 | partial | Current tiers exist; full 5e exhaustion ladder is not complete. |
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

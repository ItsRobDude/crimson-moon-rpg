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
| Elf `fey_ancestry` | partial | Charm-save advantage, magical-sleep immunity, and source-aware charmer targeting lockouts are wired; broader charm logic is still limited. |
| Elf `trance` | partial | Present in trait handling and now softens long-rest ambush risk in narrative rest flow, but it is still a conservative identity pass rather than full sleep/rest differentiation. |
| Dwarf `darkvision` | implemented | Derived senses expose darkvision. |
| Dwarf `dwarven_resilience` | partial | Poison resistance and poison-save advantage are wired; broader poison ecosystem is still narrow. |
| Dwarf `dwarven_combat_training` | implemented | Weapon proficiencies are granted through derived trait handling. |
| Dwarf `stonecunning` | partial | Tool choice hook exists in creation, and early Sporefall stone-reading checks now recognize the trait; broader stonework coverage is still narrow. |

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
| Rogue `Cunning Action` | partial | Dash, disengage, and contested hide hooks exist; broader hide/stealth encounter nuance is still incomplete. |
| Thief `Fast Hands` | implemented | Consumable and gear use now prefers bonus-action object use in combat for thief rogues. |
| Thief `Second-Story Work` | data-only | Defined in data, but intentionally hidden from surfaced player feature copy until a real runtime implementation path exists. |
| Wizard base shell | implemented | Spellbook/prepared flow, slots, and Arcane Recovery shell are present. |
| Wizard `Arcane Recovery` | implemented | Short-rest slot recovery is wired once per long rest. |
| Evocation `Sculpt Spells` | implemented | Template evocation save spells now spare allied targets caught in the area. |
| Cleric base shell | implemented | Prepared casting, slots, default subclass, and combat shell are present. |
| Cleric `Channel Divinity` | partial | Preserve Life now distributes healing across nearby wounded allies up to half HP; domain breadth is still narrow. |
| Life `Disciple of Life` | implemented | Healing bonus is applied to qualifying healing spells. |

## Progression and Feats

| Area | Status | Notes |
| --- | --- | --- |
| Level 1-4 progression shell | implemented | The current four-class playable slice supports level thresholds, HP growth, resource unlocks, subclass timing, and save-stable actor sync. |
| Ability Score Improvement | implemented | Level 4 now supports +2 to one ability or +1/+1 across two abilities through the shared progression path. |
| Curated feat support | implemented | `Alert`, `Mobile`, `Resilient`, and `Tough` are wired through shared feat definitions, save/load state, and derived mechanics. |
| `Alert` | implemented | Initiative gains a shared +5 bonus through the feat layer. |
| `Mobile` | partial | Bonus speed and post-melee-attack opportunity-attack protection are wired; fuller dash/terrain/action-expression nuance is still future work. |
| `Resilient` | implemented | Chosen ability +1 and matching save proficiency are applied through shared feat handling. |
| `Tough` | implemented | Retroactive and save-stable max HP bonuses are applied through actor sync. |
| Hidden unsupported surfaced features | implemented | `Thieves' Cant` and `Second-Story Work` stay off the exposed feature surface until they have genuine runtime support. |

## Inventory, Tools, and Sheet Scaffolding

| Area | Status | Notes |
| --- | --- | --- |
| Tool and language sheet display honesty | implemented | Character creation now labels tools and languages as on-sheet metadata rather than implying a general live subsystem. |
| Scene-level tool/item integrity hooks | partial | Early authored checks such as `mason_tools`, `thieves_tools`, and `rope_hempen` are wired and test-covered, but broader tool ecosystem depth remains narrow. |
| Unsupported background proficiencies | data-only | Items such as `gaming_set` and `vehicles_land` remain sheet data only and should not be surfaced as active gameplay systems. |

## Enemy and NPC Combat Support

| Area | Status | Notes |
| --- | --- | --- |
| Shared enemy actor normalization | partial | Combat-capable NPCs now infer shared class flags, resources, supported spells, and combat actions from authored kits, but only supported runtime actions are promoted. |
| Shared enemy turn priorities | partial | Enemy AI now checks self-preservation, offensive spells, supported class features, and then attack or reposition; deeper bespoke boss logic remains intentionally out of scope. |
| Honest named-enemy ability surfacing | implemented | Authored NPC abilities that lack shared runtime support remain descriptive data rather than falsely surfaced combat actions. |

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
| `prone` | partial | Own attacks, reduced movement, standing, and incoming melee/ranged attack modifiers are wired; fuller battlefield nuance is still incomplete. |
| `incapacitated` | implemented | Effect exists, drops concentration, and locks actions/reactions in combat. |
| `restrained` | partial | Attack lock, speed zero, incoming-attack advantage, DEX-save disadvantage, and a shared action-based escape flow are wired; fuller contest nuance is still incomplete. |
| `grappled` | partial | Speed-zero effect, source-maintained cleanup hooks, and a shared action-based escape flow are wired; fuller contest nuance is still incomplete. |
| `blinded` | partial | Attack, awareness, and sight-adjacent skill penalties plus incoming-attack advantage are wired; wider perception/targeting nuance is incomplete. |
| `deafened` | partial | Awareness penalty exists; broader spell/audio interactions are not implemented. |
| `unconscious` | partial | Applied/removed in combat and sleep flow, locks actions/reactions, and grants incoming advantage/melee crits; full death-save/downed-state model is not implemented. |
| Exhaustion 1-6 | partial | All six tiers now exist in shared derived-state handling, including speed collapse and near-incapacitation at the highest tiers; the wider encounter ecosystem still needs more authored use and recovery pressure. |
| `antitoxin_guard` | implemented | Rest-of-day poison-save advantage is wired. |

## Reactions

| Area | Status | Notes |
| --- | --- | --- |
| Opportunity attacks | implemented | Grid-backed triggers and reaction consumption are wired. |
| `Shield` spell reaction | implemented | Weapon attacks, spell attacks, and `Magic Missile` are covered. |
| General reaction framework | partial | One shared reaction slot exists, but broader reaction content is still sparse. |

## Combat UX And Save Foundations

| Area | Status | Notes |
| --- | --- | --- |
| Movement previews | partial | Reachable tiles, cost, threat, cover, and melee-angle previews are now surfaced in battle UI, but the presentation is still text-first rather than a true visual grid widget. |
| Mid-combat save foundation | partial | Combat save data preserves stable UI state, strips transient previews, and now sanitizes invalid saved submenu payloads before restoring back into battle mode; broader runtime verification across more exotic combat states is still needed. |

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

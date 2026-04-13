# Deep 5e Mechanics Roadmap

## Goal

Evolve `Prophecies: Crimson Moon` from a 5e-flavored prototype into a deeper `5e-lite to near-full-5e` rules implementation without losing the project's core identity as a sandbox visual novel with RPG elements.

This roadmap assumes:

- narrative pacing stays primary
- event/timeline flow remains the main progression driver
- combat depth is increased for players who want real system mastery
- rules improvements should be systemic, not one-off patches

## Design Principle

Do not bolt more exceptions onto the current codebase.

Instead:

1. centralize rules math
2. centralize effect application
3. centralize temporary vs permanent stat changes
4. keep scenes declarative and let the rules engine interpret mechanics

The long-term target should feel like:

- authored VN scenes
- tactical 5e-lite or deep 5e combat layer
- reusable status/effect engine
- save-stable character state

## Current State Summary

The repo currently has:

- basic races/classes
- a partial level progression model
- a partial spell list
- basic attacks/checks/saves
- simple equipment
- limited named conditions
- no general modifier engine
- no general duration/concentration engine
- no real distinction between "base stats", "permanent changes", and "temporary effects" at a systemic level

## Roadmap Phases

## Phase 1: Rules Foundation

Priority: highest

Build the systems that every later mechanic depends on.

### 1. Character Stat Layers

Introduce a layered stat model for each actor:

- `base`
  - original ability scores
  - class/race defaults
  - base movement
  - base AC assumptions
- `permanent`
  - ASIs
  - feat-granted bonuses
  - permanent boons/injuries
  - equipment-derived persistent changes if you want these separated
- `temporary`
  - spell buffs
  - conditions
  - temporary penalties
  - encounter-only or scene-only effects
- `derived`
  - final computed AC
  - attack bonus
  - save DC
  - initiative modifier
  - speed
  - passive perception

Target outcome:

- the game always knows what a stat is, where it came from, and whether it expires

### 2. Generic Effect Engine

Replace ad hoc status checks with a generic effect model.

Suggested effect shape:

- `id`
- `source`
- `name`
- `durationType`
  - rounds
  - turns
  - scenes
  - rests
  - permanent
- `remaining`
- `stacking`
- `concentration`
- `modifiers`
  - stat changes
  - advantage/disadvantage flags
  - granted resistances
  - granted immunities
  - movement changes
  - damage bonuses
  - AC bonuses
  - save bonuses
- `behaviors`
  - onApply
  - onTurnStart
  - onTurnEnd
  - onHit
  - onDamaged
  - onExpire

Target outcome:

- `Bless`, `Poisoned`, `Slow`, `Haste`, `Bane`, temporary AC buffs, and story-driven curses all use the same infrastructure

### 3. Turn and Duration Ticking

Standardize timing:

- at start of actor turn
- at end of actor turn
- at round end
- on scene change
- on short rest
- on long rest

Target outcome:

- temporary effects actually expire when expected
- concentration can be broken cleanly
- combat and VN scenes can both consume effect duration in a predictable way

## Phase 2: 5e Core Combat Accuracy

Priority: very high

### 4. Action Economy

Make the engine track:

- action
- bonus action
- reaction
- movement
- free interactions

Needed for:

- opportunity attacks
- shield-like reactions later
- rogue gameplay
- tactical identity of classes

### 5. Conditions

Implement condition logic beyond a few named effects.

High-priority conditions:

- blinded
- charmed
- deafened
- frightened
- grappled
- incapacitated
- invisible
- paralyzed
- petrified
- poisoned
- prone
- restrained
- stunned
- unconscious
- exhaustion

Target outcome:

- conditions are defined once and consumed everywhere

### 6. Attack and Damage Rules

Upgrade attack resolution:

- advantage/disadvantage from many sources
- correct crit handling
- sneak attack gating
- attack roll vs save spell split
- auto-hit effects like `Magic Missile`
- damage resistances, immunities, vulnerabilities
- temporary HP
- on-hit riders

Target outcome:

- martial and caster damage feel mechanically distinct and trustworthy

### 7. Saving Throws and DCs

Support:

- class-based spellcasting ability
- correct save DC calculation
- save proficiencies
- condition-based save modifiers
- concentration saves

Target outcome:

- spells and status effects stop feeling approximated

## Phase 3: Character System Depth

Priority: high

### 8. Races

Expand races from stat bonuses into actual mechanics.

Examples:

- darkvision
- dwarf poison resilience
- elf sleep/charm protections
- movement or weapon familiarity if used

Target outcome:

- race choice matters in play, not just on the sheet

### 9. Classes and Features

Audit every feature in `data/classes.js` into:

- implemented
- partially implemented
- data-only
- not implemented

Then build feature handlers.

High-priority implementations:

- Fighter
  - Second Wind
  - Action Surge
  - Champion crit range
- Rogue
  - Sneak Attack
  - Cunning Action
  - Fast Hands
- Wizard
  - Arcane Recovery
  - school features
- Cleric
  - Channel Divinity
  - domain support
  - healing bonuses

Target outcome:

- classes feel asymmetrical and mechanically expressive

### 10. Feats and ASIs

Current ASI is basic.

Needed:

- proper ASI choices
- feat definitions
- feat passive/active effect hooks

Target outcome:

- level-up becomes a real build system

## Phase 4: Spell System Expansion

Priority: high

### 11. Spell Taxonomy

Split spells into clear runtime categories:

- attack roll
- save-for-half
- save-or-suck
- heal
- summon
- zone
- concentration buff
- concentration debuff
- reaction
- utility / exploration

### 12. Spell Metadata

Each spell should eventually know:

- level
- school
- casting time
- range
- target type
- save type
- concentration
- duration
- components if relevant
- scaling behavior
- upcast behavior

### 13. Concentration

Concentration is one of the biggest "deep 5e" differentiators.

Implement:

- one concentration effect at a time
- concentration checks on damage
- automatic drop on incapacitation/unconsciousness

Target outcome:

- buff/debuff spell play becomes meaningful and legible

## Phase 5: Tactical Layer Upgrades

Priority: medium-high

### 14. Positioning and Range

Decide how deep tactical combat should go:

- abstract front/back/ranged lanes
- or gridless distance bands
- or true grid later

A lane/band model is probably the best fit for this project because it preserves VN flow while still supporting:

- melee lock
- ranged penalties
- disengage
- movement decisions
- opportunity attacks

### 15. Cover and Terrain

Support simple terrain tags:

- light cover
- heavy cover
- difficult terrain
- hazardous terrain

Target outcome:

- scene-authored combat spaces can matter without requiring a full tactics map editor

## Phase 6: Narrative-System Integration

Priority: critical, ongoing

Deep 5e mechanics must still work in a VN-first game.

### 16. Scene Authoring Hooks

Scene choices should be able to apply:

- temporary conditions
- permanent boons
- injuries
- relationship-driven buffs
- timed ritual effects
- spell-like scene effects

Without hand-writing custom logic every time.

### 17. Story-Time vs Combat-Time

Some effects should expire by:

- rounds
- scenes
- time-of-day changes
- rests

The engine should understand the difference.

Examples:

- `Blessed until next combat`
- `Fatigued for the rest of the day`
- `Curse persists until cleansed`
- `Temple ward lasts 3 scenes`

Target outcome:

- mechanics and narrative state stop fighting each other

## Recommended Implementation Order

If doing this incrementally, the best order is:

1. stat-layer refactor
2. generic modifier/effect engine
3. duration ticking
4. save DC and spellcasting ability cleanup
5. action economy and reactions
6. conditions overhaul
7. class feature audit and implementation
8. spell taxonomy expansion
9. temporary HP, concentration, and resource polish
10. tactical range/positioning improvements

## Suggested Milestones

## Milestone A: "Trustworthy 5e-Lite"

Definition:

- generic effect engine exists
- temporary vs permanent changes are correct
- major conditions work
- spell DCs and attacks are reliable
- basic class fantasy works

This is the best near-term target.

## Milestone B: "System-Deep VN Combat"

Definition:

- concentration works
- reactions work
- feat/ASI support improves builds
- more races/classes/subclasses behave distinctly
- scene-authored mechanical effects are easy to add

## Milestone C: "Nerd-Grade 5e Support"

Definition:

- most common 5e conditions and combat interactions behave correctly
- major class features are implemented
- build choices matter
- buffs/debuffs, temporary HP, and persistent injuries all coexist cleanly

## Risks To Avoid

- scattering one-off logic into scenes
- adding feature flags without central rules ownership
- storing modified stats directly without source tracking
- mixing narrative timers and combat timers without a shared model
- implementing dozens of spells before the effect engine exists

## Practical Next Task

The best next implementation step is:

`Build a generic modifier/effect engine and refactor existing statuses into it.`

Why:

- it unlocks deep buffs/debuffs
- it creates the temporary/permanent distinction you want
- it makes future 5e feature work much safer
- it benefits both combat and narrative scenes immediately

## Success Criteria

You know this roadmap is working when:

- adding a new buff does not require editing five different files
- the game can explain why a stat is what it is
- temporary effects expire correctly
- class/race choices noticeably affect gameplay
- combat depth increases without breaking VN pacing

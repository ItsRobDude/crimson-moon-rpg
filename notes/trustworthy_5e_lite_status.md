# Trustworthy 5e-Lite Status

This note tracks the current near-term milestone target for the repo.

## Current Target

The active milestone target is `Trustworthy 5e-Lite`.

That means the near-term priority is:

- trustworthy rules behavior for the currently shipped 5e-lite surface
- shared mechanics across combat and narrative scenes
- save-stable actor, effect, and timeline state
- targeted tests and audit coverage for exposed content

That does **not** mean the near-term priority is:

- battlegrid UI polish
- broad content expansion
- adding many more races, classes, subclasses, or spells before the current surface is trustworthy
- later-act sandbox expansion before early-route rules/state behavior is stable

## Source Of Truth

Use these notes together:

- `AGENTS.md`
- `notes/implementation_matrix.md`
- `notes/5e_mechanics_roadmap.md`
- `notes/story_timeline_model.md`

Roles:

- `AGENTS.md`
  - project identity, pacing guardrails, and anti-drift rules
- `notes/implementation_matrix.md`
  - practical shipped-state audit for current races, classes, spells, conditions, and reactions
- `notes/5e_mechanics_roadmap.md`
  - medium- and long-term rules depth plan
- `notes/story_timeline_model.md`
  - canonical opening and timeline-sensitive narrative expectations

## Guardrails For New Work

New mechanics or authored content should not land unless they have:

- implementation-matrix coverage when they expand exposed rules surface
- targeted unit tests when they change mechanics, combat, effects, saves, spell logic, or save/load state
- explicit alignment with the sandbox-VN-first flow in `AGENTS.md`

If a change improves visuals or breadth but weakens verification or rules trust, it is probably landing too early for this milestone.

## Near-Term Acceptance Criteria

This milestone is in good shape when:

- the current shipped 5e-lite surface has a maintained implementation matrix
- exposed rules behavior has targeted unit coverage
- known incorrect behavior in the exposed races/classes/spells/conditions set is closed or explicitly documented
- save/load is trustworthy for current mechanics-heavy actor state
- early-route VN scenes visibly benefit from the shared rules engine without adding a second narrative-only mechanics path

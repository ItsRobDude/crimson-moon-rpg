Prophecies: Crimson Moon — Salvage Notes
=======================================

This project is a sandbox visual novel with deep RPG ambitions, set in the infected forests and outposts around Silverthorn. The codebase already includes data for races, classes, combat rules, and scene scripting; these notes outline how to reshape the current material into a cohesive experience instead of a disconnected vignette.

* **Core Fantasy:** survive a spreading spore apocalypse, choose which factions to trust, and decide whether to aid or confront the Blackened King and his pact with the drow Queen Ciara.
* **Tone:** grounded, desperate, with brief sparks of wonder (ancient lunar magic, druidic rituals) so every encounter hints at a larger mystery behind the Crimson Moon.
* **Gameplay Direction:** story and event flow come first, but the combat/rules layer should move as close to tabletop 5e as is reasonably practical. Battle scenes are expected to evolve toward true positional battlegrid combat rather than staying permanently abstract.
* **Current Components:**
  * Narrative and battle UI (index.html, styles.css).
  * Character creation, combat rules, and game state management (game.js, rules.js, data/*).
  * World references: Silverthorn, Shadowmire, Sporefall (formerly Whisperwood Borough), Viridian Forest, Thorne Guild, the Druids, the Blackened King, Ciara.

For narrative pacing, event windows, and "what a typical campaign route looks like if certain choices are made," check `dnd-original-campaign-draft`. Treat that file as the best current lore reference when adjusting story timing, Silverthorn sandbox beats, or major event flow.

Statuses and mechanical effects should not be treated as combat-only. Long-term direction is one shared effect model for battle, dialogue, social rolls, travel, and other non-combat scenes.

See `notes/salvage_pitch.md` for a concrete gameplay loop and story structure that ties these pieces together.
See `notes/story_timeline_model.md` for the canonical Silverthorn opening and the new event-driven timeline model.
The current Act II recovery slice assumes: Alderic briefing -> Silverthorn prep -> Shadowmire road -> blackout -> early Sporefall -> early Eoin -> directional borough investigation.
See `notes/5e_mechanics_roadmap.md` for the rules-depth plan.
See `notes/trustworthy_5e_lite_status.md` for the current near-term milestone target.
See `notes/implementation_matrix.md` for the current shipped-state audit of exposed 5e-lite mechanics.
See `notes/act1_canon_internal.md` for contributor-only Act I canon truths and spoiler boundaries. Do not surface that note directly in player-facing text.
See `notes/narrative_runtime_contract.md` for runtime-authoring guardrails and fallback vocabulary.
See `notes/narrative_state_registry.md` for story-critical flags and scene-memory ownership.
See `notes/test_run_tonight_checklist.md` for the recommended Node/Jest/Playwright verification order.
See `AGENTS.md` for repo-specific guardrails before making major changes.

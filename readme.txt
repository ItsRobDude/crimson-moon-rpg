Prophecies: Crimson Moon — Salvage Notes
=======================================

This demo is a narrative-forward tactical RPG set in the infected forests and outposts around Silverthorn. The codebase already includes data for races, classes, combat rules, and scene scripting; these notes outline how to reshape the current material into a cohesive experience instead of a disconnected vignette.

* **Core Fantasy:** survive a spreading spore apocalypse, choose which factions to trust, and decide whether to aid or confront the Blackened King and his pact with the drow Queen Ciara.
* **Tone:** grounded, desperate, with brief sparks of wonder (ancient lunar magic, druidic rituals) so every encounter hints at a larger mystery behind the Crimson Moon.
* **Current Components:**
  * Narrative and battle UI (index.html, styles.css).
  * Character creation, combat rules, and game state management (game.js, rules.js, data/*).
  * World references: Silverthorn, Whisperwood, Viridian Forest, Thorne Guild, the Druids, the Blackened King, Ciara.

For narrative pacing, event windows, and "what a typical campaign route looks like if certain choices are made," check `dnd-original-campaign-draft`. Treat that file as the best current lore reference when adjusting story timing, Silverthorn sandbox beats, or major event flow.

See `notes/salvage_pitch.md` for a concrete gameplay loop and story structure that ties these pieces together.
See `notes/story_timeline_model.md` for the canonical Silverthorn opening and the new event-driven timeline model.

# Future Development Roadmap

Use the following structured prompts to continue development. Each prompt is standalone and includes the context needed to guide the assistant.

1.  **Encounter Pacing and Randomness**
    *   Add a lightweight encounter budget system that can trigger or skip ambient events (e.g., harmless wildlife, whispered warnings) as the player moves scene-to-scene so not every traversal repeats the same beats.
    *   The `threat_meter` has been added to `gameState`. Now, future encounters should reference it to decide surprise/advantage.
    *   Expose the current ambient danger in the log or UI in a diegetic way (e.g., "the spores pulse faster") instead of raw numbers.

2.  **Combat Feel and Feedback**
    *   Add short combat log banners or overlays in `#center-stage` that summarize turn results (hit/miss, damage, status) without relying solely on the sidebar log.
    *   Extend attack selection to include class resource tracking (e.g., limited-use maneuvers or spell slots) and disable options when exhausted.
    *   Implement enemy intent hints ("the beast lowers its head to charge") to give players a chance to counter or defend.

3.  **Stateful NPC Interactions**
    *   Persist relationship states for allies like Eoin; choices should unlock different follow-up dialogue, aid in combat, or shortcuts on repeat visits.
    *   Add a small reputation-driven merchant or healer in Silverthorn whose inventory or prices change based on prior aid to survivors.
    *   Make certain one-off dialogue branches truly single-use by tagging choices with flags and filtering them once selected.

4.  **Exploration Affordances**
    *   The `mapPins` feature has been added to `gameState`. The UI should now allow players to place and manage them.
    *   Create a lightweight camp/rest scene that can trigger between encounters, offering limited healing or prep but advancing time/threat.
    *   Introduce more environmental hazards (spore clouds, crumbling logs) that pull saving throws from `rules.js` and can be mitigated with items.

5.  **Technical Debt and Polish**
    *   Automated testing has been re-established with Jest. Continue to add unit tests for new features to guard against regressions in `game.js` and data modules.
    *   Normalize data definitions (items, enemies, scenes) to share common typings/shape and reduce hard-coded stat lookups.
    *   Capture screenshots for UI changes, and add a gallery/readme section documenting the core UI flows.

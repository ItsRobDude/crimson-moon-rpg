# Fix log and next-phase prompt handoff

## Fixes completed in this pass
- Added class-aware attack selection with once-per-combat options (fighter power strike, rogue sneak attack, cleric guided strike, wizard arcane pulse) so the Attack button now opens a menu instead of auto-resolving.
- Prevented repeated on-enter effects by tracking visited scenes and adding `once` support for scene hooks and quest updates.
- Smoothed the Sporefall/Whisperwood entry with new wake-up context, navigation choices, and an avoidable first beast encounter.
- Hardened combat UI by addressing the poison application bug and adding mobile click/zoom guards to the viewport meta tag and buttons.

## Next-phase prompt set for jules.google.com
Use the following structured prompts to continue development. Each prompt is standalone and includes the context needed to guide the assistant.

1. **Encounter pacing and randomness**
   - Add a lightweight encounter budget system that can trigger or skip ambient events (e.g., harmless wildlife, whispered warnings) as the player moves scene-to-scene so not every traversal repeats the same beats.
   - Introduce a `threat_meter` or similar flag in `gameState` that increases on noisy actions and decreases on stealthy/restful choices; future encounters should reference it to decide surprise/advantage.
   - Expose the current ambient danger in the log or UI in a diegetic way (e.g., "the spores pulse faster") instead of raw numbers.

2. **Combat feel and feedback**
   - Add short combat log banners or overlays in `#center-stage` that summarize turn results (hit/miss, damage, status) without relying solely on the sidebar log.
   - Extend attack selection to include class resource tracking (e.g., limited-use maneuvers or spell slots) and disable options when exhausted.
   - Implement enemy intent hints ("the beast lowers its head to charge") to give players a chance to counter or defend.

3. **Stateful NPC interactions**
   - Persist relationship states for allies like Eoin; choices should unlock different follow-up dialogue, aid in combat, or shortcuts on repeat visits.
   - Add a small reputation-driven merchant or healer in Silverthorn whose inventory or prices change based on prior aid to survivors.
   - Make certain one-off dialogue branches truly single-use by tagging choices with flags and filtering them once selected.

4. **Exploration affordances**
   - Add temporary map pins or breadcrumbs the player can place to mark safe routes past the Sporefall beast and other hazards.
   - Create a lightweight camp/rest scene that can trigger between encounters, offering limited healing or prep but advancing time/threat.
   - Introduce environmental hazards (spore clouds, crumbling logs) that pull saving throws from `rules.js` and can be mitigated with items.

5. **Technical debt and polish**
   - Add automated lint/unit checks (even minimal) that can be run in CI to guard against regressions in `game.js` and data modules.
   - Normalize data definitions (items, enemies, scenes) to share common typings/shape and reduce hard-coded stat lookups.
   - Capture screenshots for UI changes, and add a gallery/readme section documenting the core UI flows.

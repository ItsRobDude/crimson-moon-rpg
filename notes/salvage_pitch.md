# Salvaging the Crimson Moon Demo

The existing assets hint at a strong premise—surviving a spore-ridden frontier while nobles and drow weaponize the chaos—but the story beats are scattered. This salvage plan stitches them into a clear player promise, a repeatable loop, and a three-act spine you can script with the current data structures.

## Player Promise
* **Agency:** choose whether to enforce the Blackened King's quarantine, expose his alliance with Ciara, or side with survivalist factions like the Thorne Guild and Druids.
* **Pressure:** the spore threat meter (already in `gameState`) and map pins keep travel tense; resting raises threat but unlocks minor heals or crafting.
* **Tactical Flavor:** each scene can fall back to the combat UI; status effects and saving throws from `rules.js` keep fights readable.

## Core Loop
1. **Travel & Tension:** move between Silverthorn, Whisperwood, and Viridian Forest. Each hop rolls ambient events (wildlife, spore surges, whispering obelisks) keyed off the threat meter.
2. **Decision Point:** short dialogues offer risk/reward choices—press deeper for intel, bypass with stealth, or call in help if a companion bond is high.
3. **Resolution:** resolve via combat, a saving throw, or a faction favor check. Log outcomes diegetically ("the spores pulse faster" instead of numbers).
4. **Recovery & Setup:** at safe nodes (camp, Thorne hideout, druid groves) trade, rest, or slot a map pin that highlights unlocked shortcuts.

## Act Structure (Minimal Rewrite)
* **Act I – Fractured Orders:**
  * Briefing in Silverthorn with Prince Alderic (quest start: `investigate_whisperwood`).
  * Travel to Whisperwood; reveal Alderic staged victories and is suppressing survivors to hide Ciara's influence.
  * Early ally choice: Eoin the scout (trust the crown) vs. a Thorne Guild contact (smuggling survivors).
* **Act II – The Underdark Leak:**
  * Viridian Forest overrun by Choldriths; Druids blame Silverthorn's burning tactics.
  * Secure druid aid by sparing wildlife encounters or returning stolen focus stones (use status effects to showcase nature magic).
  * Discover Ciara's statue and the Stone of Oblivion; learn Alderic is delivering captives for sacrifices.
* **Act III – Lunar Reckoning:**
  * Assault Silverthorn or infiltrate via Thorne tunnels (map pins mark chosen route).
  * Dual finale branches: confront Alderic and sever his pact, or strike a temporary bargain with Ciara to redirect the corruption beyond the valley.
  * Epilogue flags set reputation for future episodes.

## Scene & System Quick Wins
* **Ambient Events:** implement small travelEvents that modify `gameState.threat_meter` and log sensory cues instead of numbers.
* **Companion Flags:** add boolean tags (e.g., `companion:eoin_bonded`) to dialogue choices so repeat visits unlock aid or shortcuts.
* **Merchant/Healer:** drop a Silverthorn vendor whose prices depend on `reputation.survivors`; mirrored in a Thorne fence who trades stolen gear for favor.
* **Battle Feedback:** surface a single-line banner in `#center-stage` after each turn summarizing hit/miss and status so players aren't hunting in the log.

## How to Use This Outline
* Map the Act I/II/III beats to the `scenes` data and gate them behind quest stages instead of ad-hoc triggers.
* Tie every travel hop to `travelEvents` that either raise/clear threat or seed a rumor, ensuring each journey advances tone.
* When adding dialogue branches, always set/consume a flag so choices feel permanent and reduce narrative drift.

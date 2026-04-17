# UI Surface Audit

This document is the current source of truth for exposed player-facing UI surfaces in `Prophecies: Crimson Moon`.

Statuses:

- `complete`: clear and honest for the current scope
- `partial`: usable, but still missing clarity, depth, or polish
- `placeholder`: visibly standing in for future art/content/system work
- `unfinished`: exposed but still lacking enough implementation to feel final

## Surface Inventory

| Surface | Entry Point | Player Purpose | Status | Current Friction | Missing / Misleading Info | Placeholder / Dependency | Recommended Next Action | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Start menu | Boot screen, `#start-menu` | Begin, continue, change options, or exit | `partial` | Reads clearly now, but `Exit` still depends on browser/app window behavior instead of a guaranteed in-game quit flow. | Players can still read a failed `window.close()` as odd rather than expected browser behavior. | Browser support for `window.close()` is inconsistent. | Keep the current fallback status copy and later swap `Exit` to app-aware handling when a native shell path is available. | `P2` |
| Options | Start menu and menu modal, `#options-modal` | Adjust readability and display comfort | `partial` | Clearer grouping helps, but fullscreen still depends on browser permission and the surface only covers a narrow settings slice. | The modal does not yet explain which settings persist immediately versus only affect the current session. | Fullscreen permission depends on browser support. | Add one compact persistence note and keep broad settings expansion out of scope until more input/audio systems exist. | `P3` |
| Character creation | Start menu -> `#char-creation-modal` | Build a first character and begin the campaign | `partial` | Much better than before, but it is still the densest single screen in the opening and can feel more like a sheet builder than a scene transition. | Advanced picks are clearer now, but later class-specific complexity still stacks up fast. | None beyond future class-feature growth. | Keep using quick starts and collapses; next pass should focus on tighter section rhythm and later-level selection reuse. | `P1` |
| Objective strip and bearings helper | Main HUD, `#objective-strip` | Keep the current aim and next sensible move visible | `partial` | Strong in the opening hour, but the best guidance is still concentrated in Silverthorn and the earliest road scenes. | Outside the polished opening path, some later beats still rely more on the log than the strip. | Depends on quest-stage and scene metadata coverage. | Extend the same clarity pattern to the first major travel branches and early Sporefall route forks. | `P1` |
| Narrative choice panel | `#choice-container` in scene flow | Show meaningful next actions in story scenes | `partial` | Grouped leads help in Silverthorn, but most later scenes still render all choices with flatter weight. | Priority/hint metadata is still unevenly authored across the campaign. | Depends on scene data coverage in `data/scenes.js`. | Continue adding `hint`, `priority`, `timeCostLabel`, and contextual continue labels to high-traffic scenes only. | `P1` |
| Game log | Right-side HUD panel, `#game-log-panel` | Preserve recent rolls, rewards, warnings, and scene/system feedback | `partial` | It is more secondary now, but can still feel noisy once multiple systems fire at once. | The log still carries some information that should eventually have richer inline treatment. | None. | Keep log toggle support and move only the most player-critical repeated messages into stronger inline surfaces over time. | `P2` |
| World map | HUD button `#btn-map`, `#map-modal` | Read travel state, discovered locations, and personal route notes | `partial` | Clearer than the old prompt flow, but still functions more like a travel ledger than a strategic map tool. | Route pins are now honest notes, but the surface does not yet explain travel risk, elapsed time, or regional context in depth. | Depends on broader travel-state depth and map art coverage. | Keep the current notes-first model; later add route/time context only when the travel layer needs it mechanically. | `P2` |
| Codex | HUD button `#btn-codex`, `#codex-modal` | Track discovered people and factions | `partial` | Scans better now, but remains sparse and only covers two categories. | Empty states are honest, but there is no lore/article drill-down beyond simple reputation/relationship entries. | Depends on future codex content strategy and spoiler boundaries. | Keep entries light for Act I and add only carefully gated categories when they serve story recall. | `P3` |
| Inventory | HUD button `#btn-inventory`, `#inventory-modal` | Inspect gear, see what is equipped, and act on usable items | `partial` | Much cleaner now, but multi-character pack management is still text-heavy and sorting/filter depth is basic. | There is still no stronger “best upgrade” summary for average players comparing multiple similar items. | Depends on future gear breadth and party growth. | Preserve the current honest detail pane, then add lightweight upgrade markers instead of a full equipment optimizer. | `P1` |
| Quest log | HUD button `#btn-quests`, `#quest-modal` | Track the active thread and practical next steps | `partial` | Suggestions make the opening clearer, but later stages still rely on a single quest thread and simple entry rendering. | It does not yet distinguish “main pressure” from “secondary follow-up” once more threads go live. | Depends on future multi-quest coverage. | Keep backward-compatible stage objects and expand structured suggestions only for active high-value quest beats. | `P1` |
| Game menu | HUD button `#btn-menu`, `#menu-modal` | Reach save/load, options, and help tools | `partial` | It is consistent now, but still reads as a utility list rather than a fully authored pause surface. | The hidden debug toggle is no longer player-facing, but the modal could still better signal what is safe to use mid-scene. | None. | Leave it straightforward for now; if expanded later, add section grouping instead of more flat buttons. | `P3` |
| Help / tutorial | Menu -> `#tutorial-overlay` | Give first-session reminders without over-tutorializing the game | `partial` | The new “Field Notes” copy is much more useful, but it still acts as a static primer rather than adaptive help. | Players cannot yet jump directly from help topics into the related surface or mechanic. | Depends on future context-linking, if desired. | Keep it concise and truthful; only add context-aware links or examples if repeated confusion proves it necessary. | `P2` |
| Shop / supplier panel | Shop scenes -> `#shop-panel` | Read stock, prices, and gear fit, then buy what matters | `partial` | Buy-only is finally explicit, but comparison remains textual and the panel still lacks richer category navigation or stock filters. | Players can now tell selling is absent by design, but not yet compare whole loadouts at a glance. | No selling model in the current build; comparison is intentionally light. | Keep the buy-only model explicit and add only small scanability upgrades before considering sell-back or deeper merchant logic. | `P1` |
| Rest modal | Rest actions -> `#rest-modal` | Trade time for recovery while judging ambush risk | `partial` | Clearer than before, but still generic across many contexts and does not explain resource recovery per class/feature in detail. | A player still has to infer some class-specific recovery nuance from outcomes rather than the surface itself. | Depends on future per-class rest text if needed. | Keep the modal compact and add context-specific warning copy only where danger or story pressure materially changes the decision. | `P2` |
| Level-up modal | Click `#char-level` when `pendingLevelUp` is true | Review gains and confirm level advancement | `unfinished` | The surface is honest now, but feat selection is still not implemented and subclass selection is still basic. | Without the explicit note, players would mistake the missing feat path for a bug; the note is necessary because the system is genuinely incomplete. | Feat-choice UI/logic is not implemented yet. | Keep the explicit note, preserve ASI support, and do not expose fuller feat expectations until the path actually exists. | `P1` |
| Battle UI | Combat scenes -> `#battle-screen` | Read turn state, threats, actions, party status, and battle log | `partial` | The hierarchy is improved, but placeholder art and a few unsupported ability states still remind the player that combat presentation is ahead of some combat feature coverage. | Some class abilities still surface as unavailable instead of offering a full action path. | Battle placeholder background, placeholder portraits, and not-yet-surfaced ability flows. | Keep improving clarity and tactical labels while leaving full visual battlegrid and unsupported ability branches for separate focused work. | `P1` |

## Incomplete Or Placeholder Markers Still Exposed

### Art and scene presentation

- Many scenes in [C:/Users/Rob/Documents/dev/crimson-moon-rpg/data/scenes.js](C:/Users/Rob/Documents/dev/crimson-moon-rpg/data/scenes.js) still reuse `landscapes/silverthorn_market_avenue.png` or similar placeholder comments where bespoke backgrounds are not ready yet.
- Multiple NPC entries and scene portraits still rely on `npc_male_placeholder_portrait.png` or `npc_female_placeholder_portrait.png` in [C:/Users/Rob/Documents/dev/crimson-moon-rpg/data/scenes.js](C:/Users/Rob/Documents/dev/crimson-moon-rpg/data/scenes.js) and [C:/Users/Rob/Documents/dev/crimson-moon-rpg/data/npcs.js](C:/Users/Rob/Documents/dev/crimson-moon-rpg/data/npcs.js).
- Battle scenes still fall back to `landscapes/battle_placeholder.webp` in [C:/Users/Rob/Documents/dev/crimson-moon-rpg/game.js](C:/Users/Rob/Documents/dev/crimson-moon-rpg/game.js).

### Partial system messaging

- Level-up feat choice is still intentionally unavailable, now called out directly in [C:/Users/Rob/Documents/dev/crimson-moon-rpg/index.html](C:/Users/Rob/Documents/dev/crimson-moon-rpg/index.html) and [C:/Users/Rob/Documents/dev/crimson-moon-rpg/game.js](C:/Users/Rob/Documents/dev/crimson-moon-rpg/game.js).
- Some combat abilities can still surface the “not ready in this build yet” message in [C:/Users/Rob/Documents/dev/crimson-moon-rpg/combat.js](C:/Users/Rob/Documents/dev/crimson-moon-rpg/combat.js). This is now honest, but it still marks unfinished combat branches.

### Utility and platform limits

- Start-menu exit depends on `window.close()` in [C:/Users/Rob/Documents/dev/crimson-moon-rpg/game.js](C:/Users/Rob/Documents/dev/crimson-moon-rpg/game.js), which is not guaranteed in a browser tab.
- Shops are intentionally buy-only right now. That is no longer misleading, but it remains a conscious scope limit rather than a full market system.

## Next Review Trigger

Revisit this audit after the next pass that touches one of these areas:

- feat selection or subclass flow
- travel-map depth
- codex category expansion
- combat presentation art or unsupported ability coverage
- Silverthorn or Act I UI surfaces that add new player-facing windows

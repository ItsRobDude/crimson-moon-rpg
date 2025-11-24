# Lore Review Findings

## Missing Content (Major)
*   **Hushbriar Cove Location:** The entire location of Hushbriar Cove (Inn, Shops, Moonwell, Gates) is missing from `locations.js`.
*   **Missing Characters:** Key characters from the lore are absent:
    *   Fionnlagh Ó Faoláin (Lark's father)
    *   Neala Creach & Liobhán Sceith (Thieves Guild)
    *   Aodhan (in his "tossing stone" state at Moonwell)
    *   Elara (Demigod)
*   **Missing Scenes:** The narrative arc described in `lore_Canon_events.docx` is completely absent.
    *   Arrival at Hushbriar Cove behind Silverthorn soldiers.
    *   Gate guard suspicion check.
    *   Briarwood Inn reunion with Fionnlagh.
    *   Nighttime screams and investigation.
    *   Thieves Guild confrontation.
    *   Tracking Choldriths to the Moonwell.
    *   Aodhan encounter at the Moonwell.
    *   Crimson Moon event ("The following morning never arrives").

## Inconsistencies
*   **Starting Point:** The game currently starts with a briefing by Prince Alderic in Silverthorn, sending the player to Whisperwood. The lore describes the player arriving at Hushbriar Cove as the start (or a key early chapter).
*   **Timeline:** The game presents Aodhan as "already lost to the spores" (Briefing Info). The lore depicts the moment Aodhan "unleashes the undark" at the Moonwell. This suggests the game events might be happening *after* the lore events, or there is a timeline conflict.
*   **Mechanics:** Lore mentions "24 hours to escape prison" and disguise mechanics which are not implemented.

## Logic Errors in Current Code
*   **Unreachable Choice:** In `SCENE_BRIEFING_INFO`, the choice "Request extra supplies" requires `relationship: { npcId: "alderic", min: 20 }`. Since the player starts with 0 and can gain at most 10 before this point (and the +10 option skips this scene), this choice is impossible to select.
*   **`firstVisit` Variable:** In `game.js`, the line `const runOnEnter = !scene.onEnter.once || firstVisit;` uses a variable `firstVisit` which appears to be undefined in the scope of `goToScene`. It should likely check a visited state tracker.

## Recommendations
1.  **Implement Hushbriar Cove:** Create the missing location and scenes to align with the lore.
2.  **Fix `firstVisit` Bug:** Update `game.js` to correctly track visited scenes.
3.  **Fix Briefing Logic:** Adjust the relationship requirement or starting relationship so the choice is accessible.
4.  **Reconcile Timeline:** Decide if the game starts at Hushbriar (Lore) or Silverthorn (Current). Given the detailed Lore, shifting the start to Hushbriar seems appropriate, or framing Silverthorn as a prologue.

## Plan for Next Phase
I will focus on fixing the logic errors first, then implementing the missing Hushbriar Cove content as the new starting point (or a travel destination).

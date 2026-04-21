# Campaign Route Status

This note is for contributors and coding agents.

Use it to track which routes are canon, which are aligned alternates, and which are dormant or retired at the event level.

Required statuses:

- `canonical`
- `alternate_aligned`
- `dormant`
- `retired`

If a route is incomplete or not canon-aligned, it must be `dormant` or `retired` before contributors expand it again.

Route-status reminders:

- A known `world` place may still appear on the map and remain traversable if it has a canon-safe ambient hub.
- `dormant` and `retired` govern event payloads, branch promotion, and restoration safety, not whether every named place must be hard-locked off the map forever.
- hidden or secret sublocations still require in-scene discovery and must not become direct map destinations.
- under-authored world places should stay unknown until they have a documented ambient entry beat.

| route_id | parent_canonical_beat | status | completion_percent | canon_class | allowed_cities | named_npcs | entry_point | exit_point | source_basis | conflict_rules | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `silverthorn_sporefall_opening` | `alderic_briefing` | `canonical` | `90` | `canonical` | `Silverthorn, Shadowmire, Sporefall` | `Alderic, Lark, Kieran, Eoin` | `SCENE_BRIEFING` | `SCENE_HUB_SPOREFALL` | `draft + canon notes + live scenes` | Must preserve the canonical briefing opening, Silverthorn prep, party mustering, blackout, and early Eoin order. Early derail through the gate-watch crackdown may close Silverthorn and force the eastern road, but must not replace the default spine. | Current mainline opening now uses Lark and Kieran as the intended early road-party shape. |
| `durnhelm_relic_lead` | `sporefall_investigation` | `canonical` | `80` | `canonical` | `Durnhelm` | `Aodhan, Cathal, Sven` | `SCENE_DURNHELM_GATES` | `SCENE_DURNHELM_CATHAL` | `draft + live scenes` | Must remain the first major northward follow-up to strong Sporefall clues and must not skip straight to Hushbriar. Early Durnhelm travel may stay sandbox-safe, but the Cathal handoff remains the canonical push into the Lament Hill truth route. | Current authored compression folds the perimeter guard, Sven witness beat, and Aodhan road handoff into gates, entry, and Cathal. Durnhelm now has an ambient travel hub while Cathal still owns the main relic lead escalation. |
| `lament_hill_truth` | `durnhelm_relic_lead` | `canonical` | `80` | `canonical` | `Lament Hill` | `Aine` | `SCENE_LAMENT_HILL_APPROACH` | `SCENE_LAMENT_AINE_REVEAL` | `draft + canon notes + live scenes` | Must preserve Aine's grief, the children's graves, and the Stone warning without changing her goals. | Main truth hinge. |
| `archives_truth_branch` | `lament_hill_truth` | `alternate_aligned` | `75` | `alternate_aligned` | `Lament Hill` | `Thalion` | `SCENE_ARCHIVES_APPROACH` | `SCENE_ARCHIVES_TRUTH_CHAMBER` | `draft + live scenes` | May deepen Stone knowledge, but must not override the draft route or frontload direct Ciara or full Alderic-bargain revelations. | Optional truth branch after Aine. |
| `hushbriar_moonwell_spine` | `lament_hill_truth` | `canonical` | `80` | `canonical` | `Hushbriar` | `Fionnlagh, Aodhan` | `SCENE_ARRIVAL_HUSHBRIAR` | `SCENE_AFTERMATH` | `draft + canon notes + live scenes` | Must preserve occupied-town pressure, Fionnlagh, the screams, Moonwell, and Aodhan as the late-town hinge. Ambient Hushbriar travel may exist earlier, but it must not auto-fire this sequence. | Canonical Hushbriar route through Moonwell and the broken-night aftermath. |
| `hushbriar_elara_resolution` | `hushbriar_moonwell_spine` | `canonical` | `70` | `canonical` | `Hushbriar` | `Elara, Neala, Liobhan` | `SCENE_AFTERMATH` | `SCENE_HUSHBRIAR_PROCESSING_REVELATION` | `draft + canon notes + salvaged live scenes` | Must preserve Hushbriar panic, the dock/ledger clue path, Elara's burden, and the Stone choice before processing consequences are revealed. | Canonical post-Moonwell continuation. |
| `hushbriar_hideout_hostile_access` | `hushbriar_elara_resolution` | `alternate_aligned` | `45` | `alternate_aligned` | `Hushbriar` | `Neala, Liobhan, Elara` | `SCENE_THIEVES_HIDEOUT` | `SCENE_ELARA_AODHAN_WARNING` | `salvaged live scenes + canon notes` | May alter trust posture, but must still converge on Elara without becoming a separate guild-first campaign spine. Hostility must now reach Elara through breach or coercive entry rather than cooperative escort. | Aligned alternate access when the guild does not trust the party. See `notes/route_packets/elara_future_branch.md`. |
| `hushbriar_guild_bridge_loop` | `hushbriar_elara_resolution` | `retired` | `0` | `retired` | `Hushbriar` | `Neala, Liobhan` | `none` | `none` | `older live scenes only` | Must not return as a default event route, side hub payload, or bridge-first campaign path. | Deleted from the live mainline. |
| `elara_holdfast_loop` | `hushbriar_elara_resolution` | `retired` | `0` | `retired` | `Hushbriar` | `Elara, Neala, Liobhan` | `none` | `none` | `older live scenes only` | May not return as a management loop, rest-hub payload, or teaser-distribution branch. | Deleted from the live mainline and replaced by a direct Stone-decision route. |
| `solasmor_late_teaser` | `hushbriar_elara_resolution` | `dormant` | `10` | `dormant` | `Solasmor` | `none` | `documentation_only` | `documentation_only` | `draft references + route packet` | Solasmor may be named in-world before it is playable, but it must stay off the map until it has a documented draft-safe role and an authored ambient hub. | Teaser only. See `notes/route_packets/solasmor_route.md`. |
| `soul_mill_processing_route` | `hushbriar_elara_resolution` | `dormant` | `20` | `dormant` | `Hushbriar, Soul Mill` | `Alderic, Elara` | `SCENE_HUSHBRIAR_PROCESSING_REVELATION` | `documentation_only` | `draft references + route packet + processing reveal` | Soul Mill knowledge must not surface before the Alderic-betrayal / processing-reveal window, and the place should remain unknown on the map until it has a canon-safe entry beat and ambient hub. | Future route hook only. See `notes/route_packets/soul_mill_route.md`. |

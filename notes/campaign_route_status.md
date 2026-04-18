# Campaign Route Status

This note is for contributors and coding agents.

Use it to track which routes are canon, which are aligned alternates, and which must stay unreachable until rewritten.

Required statuses:

- `canonical`
- `alternate_aligned`
- `dormant`
- `retired`

If a route is incomplete or not canon-aligned, it must be `dormant` or `retired`, not player-facing.

| route_id | parent_canonical_beat | status | completion_percent | canon_class | allowed_cities | named_npcs | entry_point | exit_point | source_basis | conflict_rules | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `silverthorn_sporefall_opening` | `alderic_briefing` | `canonical` | `90` | `canonical` | `Silverthorn, Shadowmire, Sporefall` | `Alderic, Eoin` | `SCENE_BRIEFING` | `SCENE_HUB_SPOREFALL` | `draft + canon notes + live scenes` | Must preserve canonical opening, Silverthorn prep, blackout, and early Eoin order. | Current mainline opening. |
| `durnhelm_relic_lead` | `sporefall_investigation` | `canonical` | `80` | `canonical` | `Durnhelm` | `Aodhan, Cathal, Sven` | `SCENE_DURNHELM_GATES` | `SCENE_DURNHELM_CATHAL` | `draft + live scenes` | Must remain the first major northward follow-up to strong Sporefall clues and must not skip straight to Hushbriar or Lament Hill. | Current authored compression folds the perimeter guard, Sven witness beat, and Aodhan road handoff into gates, entry, and Cathal. |
| `lament_hill_truth` | `durnhelm_relic_lead` | `canonical` | `80` | `canonical` | `Lament Hill` | `Aine` | `SCENE_LAMENT_HILL_APPROACH` | `SCENE_LAMENT_AINE_REVEAL` | `draft + canon notes + live scenes` | Must preserve Aine's grief, the children's graves, and the Stone warning without changing her goals. | Main truth hinge. |
| `archives_truth_branch` | `lament_hill_truth` | `alternate_aligned` | `75` | `alternate_aligned` | `Lament Hill` | `Thalion` | `SCENE_ARCHIVES_APPROACH` | `SCENE_ARCHIVES_TRUTH_CHAMBER` | `draft + live scenes` | May deepen Stone knowledge, but must not override the draft route or frontload direct Ciara or full Alderic-bargain revelations. | Optional truth branch after Aine. |
| `hushbriar_moonwell_spine` | `lament_hill_truth` | `canonical` | `80` | `canonical` | `Hushbriar` | `Fionnlagh, Aodhan` | `SCENE_ARRIVAL_HUSHBRIAR` | `SCENE_AFTERMATH` | `draft + canon notes + live scenes` | Must preserve occupied-town pressure, Fionnlagh, the screams, Moonwell, and Aodhan as the late-town hinge. | Canonical Hushbriar route through Moonwell and the broken-night aftermath. |
| `hushbriar_elara_resolution` | `hushbriar_moonwell_spine` | `canonical` | `70` | `canonical` | `Hushbriar` | `Elara, Neala, Liobhan` | `SCENE_AFTERMATH` | `SCENE_HUSHBRIAR_PROCESSING_REVELATION` | `draft + canon notes + salvaged live scenes` | Must preserve Hushbriar panic, the dock/ledger clue path, Elara's burden, and the Stone choice before processing consequences are revealed. | Canonical post-Moonwell continuation. |
| `hushbriar_hideout_hostile_access` | `hushbriar_elara_resolution` | `alternate_aligned` | `45` | `alternate_aligned` | `Hushbriar` | `Neala, Liobhan, Elara` | `SCENE_THIEVES_HIDEOUT` | `SCENE_ELARA_AODHAN_WARNING` | `salvaged live scenes + canon notes` | May alter trust posture, but must still converge on Elara without becoming a separate guild-first campaign spine. | Aligned alternate access when the guild does not trust the party. See `notes/route_packets/elara_future_branch.md`. |
| `hushbriar_guild_bridge_loop` | `hushbriar_elara_resolution` | `retired` | `0` | `retired` | `Hushbriar` | `Neala, Liobhan` | `none` | `none` | `older live scenes only` | Must not return as a default route, side hub, or bridge-first campaign path. | Deleted from the live mainline. |
| `elara_holdfast_loop` | `hushbriar_elara_resolution` | `retired` | `0` | `retired` | `Hushbriar` | `Elara, Neala, Liobhan` | `none` | `none` | `older live scenes only` | May not return as a management loop, rest hub, or teaser-distribution branch. | Deleted from the live mainline and replaced by a direct Stone-decision route. |
| `solasmor_late_teaser` | `hushbriar_elara_resolution` | `dormant` | `10` | `dormant` | `Solasmor` | `none` | `documentation_only` | `documentation_only` | `draft references + route packet` | Must stay unreachable until it has a documented draft-safe role and a real entry from the canonical route. | Teaser only. See `notes/route_packets/solasmor_route.md`. |
| `soul_mill_processing_route` | `hushbriar_elara_resolution` | `dormant` | `20` | `dormant` | `Hushbriar, Soul Mill` | `Alderic, Elara` | `SCENE_HUSHBRIAR_PROCESSING_REVELATION` | `documentation_only` | `draft references + route packet + processing reveal` | Knowledge of the Soul Mill may be learned in Hushbriar, but the destination must stay unreachable until it has a canon-safe entry beat. | Future route hook only. See `notes/route_packets/soul_mill_route.md`. |

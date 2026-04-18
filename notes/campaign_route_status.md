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
| `durnhelm_relic_lead` | `sporefall_investigation` | `canonical` | `75` | `canonical` | `Durnhelm` | `Aodhan, Cathal, Sven` | `SCENE_DURNHELM_GATES` | `SCENE_DURNHELM_CATHAL` | `draft + live scenes` | Must remain the first major northward follow-up to strong Sporefall clues. | Uses authored Durnhelm loop and Cathal handoff. |
| `lament_hill_truth` | `durnhelm_relic_lead` | `canonical` | `80` | `canonical` | `Lament Hill` | `Aine` | `SCENE_LAMENT_HILL_APPROACH` | `SCENE_LAMENT_AINE_REVEAL` | `draft + canon notes + live scenes` | Must preserve Aine's grief, the children's graves, and the Stone warning without changing her goals. | Main truth hinge. |
| `archives_truth_branch` | `lament_hill_truth` | `alternate_aligned` | `70` | `alternate_aligned` | `Lament Hill` | `Thalion` | `SCENE_ARCHIVES_APPROACH` | `SCENE_ARCHIVES_TRUTH_CHAMBER` | `draft + live scenes` | May deepen Stone knowledge, but must not override the draft route or frontload unrelated NPC revelations. | Optional truth branch after Aine. |
| `hushbriar_moonwell_spine` | `lament_hill_truth` | `canonical` | `65` | `canonical` | `Hushbriar` | `Fionnlagh, Neala, Liobhan, Aodhan` | `SCENE_ARRIVAL_HUSHBRIAR` | `SCENE_AFTERMATH` | `draft + canon notes + live scenes` | Must preserve occupied-town pressure, Fionnlagh, the screams, Moonwell, and Aodhan as the late-town hinge. | Current late-game canonical Hushbriar route. |
| `hushbriar_guild_bridge_loop` | `hushbriar_moonwell_spine` | `retired` | `25` | `retired` | `Hushbriar` | `Neala, Liobhan` | `SCENE_HUSHBRIAR_GUILD_ROAD` | `SCENE_THIEVES_HIDEOUT` | `live scenes only` | Must not displace the canonical Hushbriar town/inn/Moonwell spine or become a default hub. | Retired until rewritten into draft order. |
| `elara_holdfast_loop` | `hushbriar_moonwell_spine` | `retired` | `20` | `retired` | `Hushbriar, thieves_hideout` | `Elara, Neala, Liobhan` | `SCENE_ELARA_HIDEAWAY` | `SCENE_ELARA_PROTECT_ROUTE` | `live scenes only` | May not redefine Elara, Neala, or Liobhan, and may not become playable again until route order is draft-safe. | Existing holdfast-management branch is retired. |
| `solasmor_late_teaser` | `hushbriar_moonwell_spine` | `dormant` | `10` | `dormant` | `Solasmor` | `none` | `SCENE_SOLASMOR_APPROACH` | `SCENE_SOLASMOR_GATES` | `draft references + live teaser scene` | Must stay unreachable until it has a documented draft-safe role and a real entry from the canonical route. | Teaser only. |
| `soul_mill_processing_route` | `hushbriar_moonwell_spine` | `dormant` | `15` | `dormant` | `Hushbriar, Soul Mill` | `Alderic, Elara` | `SCENE_SOUL_MILL_APPROACH` | `SCENE_SOUL_MILL_APPROACH` | `draft references + live teaser scene` | Must stay unreachable until processing, Elara, and Hushbriar consequences are rewritten into a canon-safe late branch. | Future route hook only. |

# Test Run Tonight Checklist

This machine is not the final verification environment. Use this checklist when Node/Jest/Playwright are available.

## Order

1. Install dependencies if needed.
2. Run unit tests first.
3. Fix or triage mechanics/combat/state failures before touching e2e.
4. Run the narrow bootstrap/creation/load e2e suite after unit coverage is green.
5. Run the broader smoke suite once the milestone path is stable.

## Commands

```powershell
npm install
npm test
npm run test:e2e
npm run test:e2e:full
```

Playwright starts the local static server automatically through `npm run serve`; no separate `python -m http.server` step is required.

If you only need the highest-signal unit suites first:

```powershell
npx jest __tests__/mechanics.test.js __tests__/combat.test.js __tests__/game.test.js __tests__/timeline.test.js __tests__/storyTimeline.test.js
```

## Highest-Signal Watch Areas

- spell attacks, save-based spells, reaction spells, and concentration cleanup
- condition expiry across turns, scenes, time slots, and rests
- save/load round-trips for active effects, concentration, proficiencies, spell prep, and timeline state
- current class feature behaviors for Fighter, Rogue, Wizard, and Cleric
- canonical opening flow from main menu through Silverthorn departure

## Expected Watch Areas By Inspection

- positional combat rules are still foundational rather than fully feature-complete
- some class/subclass features remain `partial` or `data-only` in `notes/implementation_matrix.md`
- broad battlegrid presentation is intentionally deferred for this milestone

## Authoritative Suites For This Milestone

- `__tests__/mechanics.test.js`
- `__tests__/combat.test.js`
- `__tests__/game.test.js`
- `__tests__/timeline.test.js`
- `__tests__/storyTimeline.test.js`
- `e2e/bootstrap_resilience.test.js`
- `e2e/character_creation.test.js`
- `e2e/load_game.test.js`

## Useful Script Aliases

- `npm run serve`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run test:e2e:full`
- `npm run test:verify`

import { gameState } from './data/gameState.js';
import { items } from './data/items.js';
import { spells } from './data/spells.js';
import { rollDiceExpression, rollDie, rollAttack } from './rules.js';
import { logMessage, showBattleEventText } from './logger.js';
import { endPlayerTurn } from './combat.js'; // To end turn
import { enemies } from './data/enemies.js'; // For target lookup if needed
// Circular dependency: performAttack, performCastSpell, checkWinCondition are in combat.js?
// Yes.
// We need to call combat actions.
// I should probably export them from combat.js or move them to a shared actions module.
// For now, I will try to import them from combat.js.
// But combat.js imports ai.js.
// This is a cycle.

// To break the cycle:
// 1. Move actions to `actions.js`?
// 2. Or invoke them via a callback/event system?
// 3. Or duplicate simple logic?

// Let's create a robust `ai.js` that returns an ACTION OBJECT or INTENT, and let `combat.js` execute it?
// That would be cleaner.
// But `companionTurnAI` currently executes logic.

// Alternative: Pass the execute functions AS ARGUMENTS to companionTurnAI.
// But combat.js calls it.

// Let's try importing. ES modules can handle circular refs if we are careful not to use them at top-level execution.
// `performAttack` is a function. It should be fine.

import { performAttack, performCastSpell, updateCombatUI, checkWinCondition } from './combat.js';

export function companionTurnAI(actor) {
    logMessage(`${actor.name} evaluates the battlefield...`, "system");

    // 1. Heal Logic
    // If any ally is below 50% HP and I have a heal spell/potion.
    // Allies: Player + Companions.
    const allies = [gameState.player, ...gameState.party.map(id => gameState.roster[id])];
    const criticalAlly = allies.find(a => a.hp > 0 && a.hp < a.maxHp * 0.5);

    if (criticalAlly) {
        // Check for healing spell
        const healSpellId = actor.knownSpells.find(s => spells[s] && spells[s].type === 'heal');
        // Check slots
        if (healSpellId) {
            const spell = spells[healSpellId];
            if (spell.level === 0 || (actor.currentSlots[spell.level] > 0)) {
                logMessage(`${actor.name} decides to heal ${criticalAlly.name}.`, "system");
                // We need target ID.
                let targetId = 'player';
                if (criticalAlly !== gameState.player) {
                    targetId = Object.keys(gameState.roster).find(key => gameState.roster[key] === criticalAlly);
                }
                // Call cast
                performCastSpell(healSpellId, targetId, actor.id);
                setTimeout(() => endPlayerTurn(), 1000);
                return;
            }
        }
    }

    // 2. Attack Logic
    // Find nearest/weakest enemy.
    // Simple: First alive enemy.
    const targetEnemy = gameState.combat.enemies.find(e => e.hp > 0);

    if (targetEnemy) {
        // Check weapon
        if (actor.equipped.weapon) {
            logMessage(`${actor.name} moves to attack ${targetEnemy.name}.`, "system");
            performAttack(targetEnemy.uniqueId, actor.id);
            setTimeout(() => endPlayerTurn(), 1000);
            return;
        }

        // Check damage spell?
        const dmgSpellId = actor.knownSpells.find(s => spells[s] && spells[s].type === 'attack');
         if (dmgSpellId) {
            const spell = spells[dmgSpellId];
             if (spell.level === 0 || (actor.currentSlots[spell.level] > 0)) {
                 performCastSpell(dmgSpellId, targetEnemy.uniqueId, actor.id);
                 setTimeout(() => endPlayerTurn(), 1000);
                 return;
             }
         }
    }

    // 3. Fallback: Defend?
    // If no action taken (e.g. no target, no weapon), end turn.
    logMessage(`${actor.name} holds their ground.`, "system");
    if (!checkWinCondition()) {
         // We need to manually end turn since we didn't perform an action that does it?
         // performAttack ends turn if manual? No, performAttack in combat.js calls updateCombatUI.
         // In manual mode, user clicks End Turn.
         // In AI mode, we must call endPlayerTurn (which is exported from combat.js).
         // But wait, performAttack updates UI but doesn't auto-end for PLAYER.
         // Does it for companion?
         // The logic in performAttack: `if (!checkWinCondition()) updateCombatUI(actorId);`
         // It does NOT call `endPlayerTurn`.

         // So AI must explicitly end turn.
         // But we can't end turn immediately after attack because we want to see the result (animations/logs)?
         // `performAttack` is instantaneous in logic.

         // We should call endPlayerTurn after a delay?
         // Or chain it.

         // Let's verify if performAttack uses actions.
         // Yes.

         // If we used an action, we are done?
         // Or allow bonus action?

         // Simple AI: One action then end.
         setTimeout(() => {
             endPlayerTurn();
         }, 1000);
         return;
    }
}

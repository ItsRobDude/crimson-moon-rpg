import { items } from './data/items.js';
import { ensureActorMechanics, getAbilityMod as getAbilityModFromMechanics, getDerivedActorState, getEffectModifiers, getProficiencyBonus as getProficiencyBonusFromMechanics, getSkillAbility, getSkillTags } from './data/mechanics.js';

export function rollDie(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

export function rollDiceExpression(expr) {
    const regex = /(\d+)d(\d+)([+-]\d+)?/;
    const match = expr.match(regex);

    if (!match) {
        console.error("Invalid dice expression:", expr);
        return { total: 0, rolls: [], detail: "Error" };
    }

    const count = parseInt(match[1]);
    const sides = parseInt(match[2]);
    const modifier = match[3] ? parseInt(match[3]) : 0;

    let total = 0;
    let rolls = [];

    for (let i = 0; i < count; i++) {
        const r = rollDie(sides);
        rolls.push(r);
        total += r;
    }

    total += modifier;

    const detail = `[${rolls.join('+')}]${modifier !== 0 ? (modifier > 0 ? '+' + modifier : modifier) : ''}`;

    return { total, rolls, detail, modifier };
}

export function getCritDamageExpression(expr) {
    const regex = /(\d+)d(\d+)([+-]\d+)?/;
    const match = expr.match(regex);

    if (!match) return expr; // Fallback

    const count = parseInt(match[1]);
    const sides = parseInt(match[2]);
    const modifier = match[3] ? match[3] : ""; // Keep modifier string "+2"

    // Double the dice count
    return `${count * 2}d${sides}${modifier}`;
}

export function calculateDamageRoll(diceExpr, modifier = 0, isCritical = false) {
    let expr = diceExpr;
    if (isCritical) {
        expr = getCritDamageExpression(diceExpr);
    }
    const result = rollDiceExpression(expr);
    result.total += modifier;
    result.modifier += modifier; // Track total modifier
    return result;
}

export function calculateDamageReduction(damage, damageType, targetStats) {
    let finalDamage = damage;
    let message = "";

    const vulnerabilities = targetStats.vulnerabilities || "";
    const resistances = targetStats.resistances || "";

    if (vulnerabilities.includes(damageType)) {
        finalDamage *= 2;
        message = `${targetStats.name} is vulnerable to ${damageType}! Damage doubled.`;
    } else if (resistances.includes(damageType)) {
        finalDamage = Math.floor(finalDamage / 2);
        message = `${targetStats.name} resists ${damageType}. Damage halved.`;
    }

    return { finalDamage, message };
}

export function getAbilityMod(score) {
    return getAbilityModFromMechanics(score);
}

export function getProficiencyBonus(level) {
    return getProficiencyBonusFromMechanics(level);
}

export function calculateDerivedStats(character) {
    const snapshot = getDerivedActorState(character);
    const weaponId = character.equipped?.weapon;
    const weapon = weaponId && items[weaponId] ? items[weaponId] : null;

    return {
        ac: snapshot.ac,
        toHit: weapon?.modifiers?.toHit || 0,
        speed: snapshot.speed,
        spellSaveDC: snapshot.spellSaveDC
    };
}

export function getSkillBonus(character, skillName) {
    ensureActorMechanics(character);
    const snapshot = getDerivedActorState(character);
    const normalized = skillName.toLowerCase();
    const ability = getSkillAbility(normalized);
    let bonus = snapshot.modifiers[ability] || 0;

    if ((character.skills || []).includes(normalized)) {
        bonus += snapshot.proficiencyBonus;
    }

    const modifiers = getEffectModifiers(character, {
        target: 'skill_check',
        skill: normalized,
        ability,
        tags: getSkillTags(normalized)
    });

    bonus += modifiers.flat;

    return { bonus, ability, snapshot, effectModifiers: modifiers };
}

export function rollSkillCheck(character, skillName, advantage = false) {
    const normalized = skillName.toLowerCase();
    const { bonus, ability, effectModifiers } = getSkillBonus(character, normalized);

    let roll1 = rollDie(20);
    let roll2 = rollDie(20);

    let finalRoll = roll1;
    let note = "";

    const hasDisadvantage = effectModifiers.disadvantage;
    const hasAdvantage = effectModifiers.advantage;

    if ((advantage || hasAdvantage) && !hasDisadvantage) {
        finalRoll = Math.max(roll1, roll2);
        note += " (Advantage)";
    } else if (hasDisadvantage && !(advantage || hasAdvantage)) {
        finalRoll = Math.min(roll1, roll2);
        note += " (Disadvantage)";
    } else if ((advantage || hasAdvantage) && hasDisadvantage) {
        // Cancel out
        finalRoll = roll1;
    }

    let total = finalRoll + bonus;

    effectModifiers.dice.forEach(dice => {
        const dieResult = rollDiceExpression(dice).total;
        total += dieResult;
        note += ` + ${dieResult} (${dice})`;
    });

    return {
        total,
        roll: finalRoll,
        modifier: bonus,
        note: note,
        ability
    };
}

export function rollSavingThrow(character, abilityName) {
    ensureActorMechanics(character);
    const snapshot = getDerivedActorState(character);
    let bonus = snapshot.modifiers[abilityName] || 0;
    if ((character.mechanics?.saveProficiencies || []).includes(abilityName)) {
        bonus += snapshot.proficiencyBonus;
    }
    const effectModifiers = getEffectModifiers(character, {
        target: 'saving_throw',
        ability: abilityName,
        tags: []
    });
    bonus += effectModifiers.flat;

    let roll = rollDie(20);
    let total = roll + bonus;
    let note = "";

    if (effectModifiers.advantage && !effectModifiers.disadvantage) {
        const secondRoll = rollDie(20);
        roll = Math.max(roll, secondRoll);
        total = roll + bonus;
        note += " (Advantage)";
    } else if (effectModifiers.disadvantage && !effectModifiers.advantage) {
        const secondRoll = rollDie(20);
        roll = Math.min(roll, secondRoll);
        total = roll + bonus;
        note += " (Disadvantage)";
    }

    effectModifiers.dice.forEach(dice => {
        const dieResult = rollDiceExpression(dice).total;
        total += dieResult;
        note += ` + ${dieResult} (${dice})`;
    });

    return {
        total,
        roll: roll,
        modifier: bonus,
        note: note
    };
}

export function rollAttack(character, modStat, proficiency, options = {}) {
    ensureActorMechanics(character);
    const snapshot = getDerivedActorState(character);
    const resolvedOptions = typeof options === 'boolean'
        ? { advantage: options, disadvantage: false, tags: [] }
        : { advantage: false, disadvantage: false, tags: [], ...options };
    const mod = snapshot.modifiers[modStat] || 0;
    const effectModifiers = getEffectModifiers(character, {
        target: 'attack_roll',
        ability: modStat,
        tags: resolvedOptions.tags || []
    });
    const totalMod = mod + proficiency + effectModifiers.flat;

    let roll1 = rollDie(20);
    let roll2 = rollDie(20);

    let finalRoll = roll1;
    let note = "";

    const hasDisadvantage = effectModifiers.disadvantage || resolvedOptions.disadvantage;
    const hasAdvantage = effectModifiers.advantage || resolvedOptions.advantage;

    if ((advantage || hasAdvantage) && !hasDisadvantage) {
        finalRoll = Math.max(roll1, roll2);
        note += " (Advantage)";
    } else if (hasDisadvantage && !(advantage || hasAdvantage)) {
        finalRoll = Math.min(roll1, roll2);
        note += " (Disadvantage)";
    } else if ((advantage || hasAdvantage) && hasDisadvantage) {
        finalRoll = roll1; // Cancel
    }

    let total = finalRoll + totalMod;

    effectModifiers.dice.forEach(dice => {
        const dieResult = rollDiceExpression(dice).total;
        total += dieResult;
        note += ` + ${dieResult} (${dice})`;
    });

    return {
        total,
        roll: finalRoll,
        modifier: totalMod,
        note,
        isCritical: (finalRoll === 20),
        advantageState: {
            advantage: hasAdvantage,
            disadvantage: hasDisadvantage
        }
    };
}

export function rollInitiative(character) {
    ensureActorMechanics(character);
    const snapshot = getDerivedActorState(character);
    let roll = rollDie(20);
    let modifier = snapshot.initiativeModifier;

    return {
        total: roll + modifier,
        roll: roll,
        modifier: modifier
    };
}

/**
 * Generates a scaled stat block for an NPC based on a target level.
 * @param {object} template - The combatStats object from an NPC.
 * @param {number} targetLevel - The desired level for the stats.
 * @returns {object} A complete, scaled stat block for combat.
 */
export function generateScaledStats(template, targetLevel) {
    // Deep copy the base stats to avoid modifying the original template
    const stats = JSON.parse(JSON.stringify(template.base));

    const baseLevel = template.base.level;
    if (targetLevel <= baseLevel) {
        return stats; // No scaling needed, return base stats
    }

    const levelDifference = targetLevel - baseLevel;
    stats.level = targetLevel;

    // --- HP Scaling ---
    // Roll HP for each level gained
    for (let i = 0; i < levelDifference; i++) {
        const hpRoll = rollDiceExpression(template.perLevel.hp);
        stats.hp += hpRoll.total;
    }

    // --- To-Hit and Damage Scaling ---
    const totalToHitBonus = Math.floor(levelDifference * (template.perLevel.toHit || 0));
    const totalDamageBonus = Math.floor(levelDifference * (template.perLevel.damage || 0));

    if (stats.actions && (totalToHitBonus > 0 || totalDamageBonus > 0)) {
        stats.actions.forEach(action => {
            if (action.type === 'attack') {
                // Scale To-Hit
                if (action.toHit) {
                    action.toHit += totalToHitBonus;
                }

                // Scale Damage
                if (action.damage) {
                    const regex = /(\d+d\d+)([+-]\d+)?/;
                    const match = action.damage.match(regex);
                    if (match) {
                        const baseDie = match[1];
                        const modifier = match[2] ? parseInt(match[2]) : 0;
                        const newModifier = modifier + totalDamageBonus;

                        if (newModifier > 0) {
                            action.damage = `${baseDie}+${newModifier}`;
                        } else if (newModifier < 0) {
                            action.damage = `${baseDie}${newModifier}`; // e.g., 1d6-1
                        } else {
                            action.damage = baseDie; // No modifier
                        }
                    }
                }
            }
        });
    }

    return stats;
}

export function getPlayerAC(p) {
    ensureActorMechanics(p);
    return getDerivedActorState(p).ac;
}
